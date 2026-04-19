"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCard, Truck } from "lucide-react";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: "CARD" | "CASH_ON_DELIVERY";
  notes: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "CASH_ON_DELIVERY",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, totalAmount: totalPrice }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to place order");

      if (form.paymentMethod === "CARD" && data.payhereUrl) {
        // Redirect to PayHere payment page
        window.location.href = data.payhereUrl;
      } else {
        clearCart();
        toast.success("Order placed! We'll confirm via WhatsApp.");
        router.push(`/orders/${data.orderId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+94 7X XXX XXXX" />
            </div>
          </section>

          {/* Shipping */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Address" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <Input label="City" name="city" value={form.city} onChange={handleChange} required />
              <Input label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} required />
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.paymentMethod === "CARD" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>
                <input type="radio" name="paymentMethod" value="CARD" checked={form.paymentMethod === "CARD"} onChange={handleChange} className="sr-only" />
                <CreditCard size={22} className={form.paymentMethod === "CARD" ? "text-indigo-600" : "text-gray-400"} />
                <div>
                  <p className="font-medium text-sm">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard via PayHere</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.paymentMethod === "CASH_ON_DELIVERY" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>
                <input type="radio" name="paymentMethod" value="CASH_ON_DELIVERY" checked={form.paymentMethod === "CASH_ON_DELIVERY"} onChange={handleChange} className="sr-only" />
                <Truck size={22} className={form.paymentMethod === "CASH_ON_DELIVERY" ? "text-indigo-600" : "text-gray-400"} />
                <div>
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when item arrives</p>
                </div>
              </label>
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any special delivery instructions..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </section>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>
          <ul className="space-y-3 mb-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-gray-600">
                <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                <span className="font-medium shrink-0">LKR {(item.price * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-4 flex justify-between font-bold text-gray-900 mb-6">
            <span>Total</span>
            <span>LKR {totalPrice.toLocaleString()}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Placing Order..." : form.paymentMethod === "CARD" ? "Pay with Card" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
