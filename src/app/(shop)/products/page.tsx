import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import ProductFilters from "@/components/shop/ProductFilters";
import { Search } from "lucide-react";
import type { ProductWithCategory } from "@/types";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

function buildOrderBy(sort: string) {
  switch (sort) {
    case "name_asc":   return { name: "asc" as const };
    case "name_desc":  return { name: "desc" as const };
    case "price_asc":  return { price: "asc" as const };
    case "price_desc": return { price: "desc" as const };
    default:           return { createdAt: "desc" as const };
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, search, sort = "newest", minPrice, maxPrice } = await searchParams;

  const [categories, maxPriceResult, products] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.product.aggregate({ _max: { price: true }, where: { isActive: true } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: { slug: category } }),
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...((minPrice || maxPrice) && {
          price: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        }),
      },
      include: { category: true },
      orderBy: buildOrderBy(sort),
    }),
  ]);

  const maxProductPrice = maxPriceResult._max.price ?? 0;

  const pageTitle = category
    ? (categories.find((c: { slug: string; name: string }) => c.slug === category)?.name ?? "Products")
    : "All Products";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{pageTitle}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <Suspense>
          <ProductFilters
            categories={categories}
            maxProductPrice={maxProductPrice}
          />
        </Suspense>

        <div className="flex-1">
          {/* Search bar */}
          <form className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              />
            </div>
          </form>

          {/* Result count */}
          <p className="text-sm text-gray-400 mb-4">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No products match your filters.</div>
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
