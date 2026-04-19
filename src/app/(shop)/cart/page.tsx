"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-gray-500 mb-4">Your cart is empty</h2>
        <Link href="/products" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="h-full bg-gray-100" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-semibold text-gray-800 hover:text-indigo-600">
                  {item.name}
                </Link>
                <p className="text-indigo-600 font-bold mt-1">LKR {item.price.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50">
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="ml-4 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">LKR {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 underline">
            Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>LKR {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>LKR {totalPrice.toLocaleString()}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link href="/products" className="mt-3 block text-center text-sm text-gray-500 hover:text-indigo-600">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
