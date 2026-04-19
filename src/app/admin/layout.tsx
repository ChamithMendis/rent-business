import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Store, Tag, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col">
        <div className="px-6 py-5 flex items-center gap-2 text-white font-bold text-lg border-b border-gray-800">
          <Store size={20} /> Admin
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: "/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
            { href: "/admin/categories", icon: <Tag size={18} />, label: "Categories" },
            { href: "/admin/products", icon: <Package size={18} />, label: "Products" },
            { href: "/admin/orders", icon: <ShoppingBag size={18} />, label: "Orders" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <Link href="/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            ← Back to Shop
          </Link>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
