import { prisma } from "@/lib/prisma";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { orderItems: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="space-y-4">
        {orders.map((order: { id: string; customerName: string; customerEmail: string; customerPhone: string; shippingAddress: string; city: string; totalAmount: number; createdAt: Date; paymentMethod: string; paymentStatus: string; orderStatus: string; notes: string | null; orderItems: { id: string; quantity: number; product: { name: string } }[] }) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 font-mono mb-1">{order.id}</p>
                <p className="font-semibold text-gray-800">{order.customerName}</p>
                <p className="text-sm text-gray-500">{order.customerEmail} · {order.customerPhone}</p>
                <p className="text-sm text-gray-500 mt-1">{order.shippingAddress}, {order.city}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">LKR {order.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-xs font-medium mt-1">{order.paymentMethod.replace("_", " ")}</p>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Items: </span>
              {order.orderItems.map((i: { id: string; quantity: number; product: { name: string } }) => `${i.product.name} ×${i.quantity}`).join(", ")}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : order.paymentStatus === "FAILED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {order.paymentStatus}
              </span>
              <OrderStatusUpdater orderId={order.id} currentStatus={order.orderStatus} />
            </div>

            {order.notes && <p className="mt-3 text-sm text-gray-500 italic">Note: {order.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
