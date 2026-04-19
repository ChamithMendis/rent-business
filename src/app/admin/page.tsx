import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, DollarSign, Users } from "lucide-react";

export default async function AdminDashboard() {
  const [totalOrders, totalProducts, totalRevenue, totalUsers] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.user.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { orderItems: true },
  });

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: <ShoppingBag size={22} />, color: "bg-blue-50 text-blue-600" },
    { label: "Products", value: totalProducts, icon: <Package size={22} />, color: "bg-purple-50 text-purple-600" },
    { label: "Revenue (LKR)", value: (totalRevenue._sum.totalAmount ?? 0).toLocaleString(), icon: <DollarSign size={22} />, color: "bg-green-50 text-green-600" },
    { label: "Customers", value: totalUsers, icon: <Users size={22} />, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-6">
            <div className={`inline-flex p-2.5 rounded-lg ${stat.color} mb-3`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order: { id: string; customerName: string; totalAmount: number; paymentStatus: string; orderStatus: string }) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}…</td>
                  <td className="py-3 pr-4 font-medium">{order.customerName}</td>
                  <td className="py-3 pr-4">LKR {order.totalAmount.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : order.paymentStatus === "FAILED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
