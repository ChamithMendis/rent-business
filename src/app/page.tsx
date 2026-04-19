import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import Navbar from "@/components/shop/Navbar";
import Footer from "@/components/shop/Footer";
import Link from "next/link";
import type { ProductWithCategory } from "@/types";
import { ArrowRight, Truck, ShieldCheck, RefreshCw } from "lucide-react";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Quality Products,<br />Delivered to Your Door
            </h1>
            <p className="text-indigo-200 text-lg mb-8 max-w-xl">
              Handpicked items from Pettah market at the best prices, shipped across Sri Lanka.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-7 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Trust badges */}
        <section className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Truck size={20} className="text-indigo-600" />, title: "Island-wide Delivery", desc: "We deliver across Sri Lanka" },
              { icon: <ShieldCheck size={20} className="text-indigo-600" />, title: "Secure Payments", desc: "Card & Cash on Delivery" },
              { icon: <RefreshCw size={20} className="text-indigo-600" />, title: "Easy Returns", desc: "Hassle-free return policy" },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2.5 rounded-lg">{b.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{b.title}</p>
                  <p className="text-gray-500 text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Shop by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat: { id: string; name: string; slug: string }) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
            <Link href="/products" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="text-gray-400 text-sm">No products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.map((product: ProductWithCategory) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
