import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, Truck, Package } from "lucide-react";

const STATUS_STEPS = ["PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED"];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PROCESSING: <Clock size={18} />,
  CONFIRMED: <CheckCircle size={18} />,
  SHIPPED: <Truck size={18} />,
  DELIVERED: <Package size={18} />,
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: { include: { product: { select: { name: true, images: true } } } } },
  });

  if (!order) notFound();

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="text-green-500" size={28} />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order Confirmed</h1>
          <p className="text-sm text-gray-500">Order ID: {order.id}</p>
        </div>
      </div>

      {/* Status tracker */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${i <= currentStep ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                {STATUS_ICONS[step]}
              </div>
              <span className={`text-xs font-medium ${i <= currentStep ? "text-indigo-600" : "text-gray-400"}`}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`absolute h-0.5 w-[calc(25%-2.25rem)] mt-4 ${i < currentStep ? "bg-indigo-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Items Ordered</h2>
        <ul className="space-y-3">
          {order.orderItems.map((item: { id: string; quantity: number; price: number; product: { name: string } }) => (
            <li key={item.id} className="flex justify-between text-sm text-gray-700">
              <span>{item.product.name} × {item.quantity}</span>
              <span className="font-medium">LKR {(item.price * item.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>LKR {order.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Delivery Details</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{order.customerName}</dd></div>
          <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{order.customerPhone}</dd></div>
          <div className="col-span-2"><dt className="text-gray-500">Address</dt><dd className="font-medium">{order.shippingAddress}, {order.city} {order.postalCode}</dd></div>
          <div><dt className="text-gray-500">Payment</dt><dd className="font-medium">{order.paymentMethod.replace("_", " ")}</dd></div>
          <div><dt className="text-gray-500">Payment Status</dt>
            <dd className={`font-medium ${order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
              {order.paymentStatus}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
