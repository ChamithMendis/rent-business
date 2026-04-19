import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import { Search } from "lucide-react";
import type { ProductWithCategory } from "@/types";

type CategoryRow = { id: string; name: string; slug: string };

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, search } = await searchParams;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {category ? categories.find((c: CategoryRow) => c.slug === category)?.name ?? "Products" : "All Products"}
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/products"
                  className={`block px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${!category ? "text-indigo-600 font-medium" : "text-gray-600"}`}
                >
                  All Products
                </a>
              </li>
              {categories.map((cat: CategoryRow) => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.slug}`}
                    className={`block px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${category === cat.slug ? "text-indigo-600 font-medium" : "text-gray-600"}`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <form className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </form>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product: ProductWithCategory) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
