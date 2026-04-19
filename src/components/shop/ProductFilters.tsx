"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "name_desc", label: "Name: Z → A" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function ProductFilters({
  categories,
  maxProductPrice,
}: {
  categories: { id: string; name: string; slug: string }[];
  maxProductPrice: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const currentCategory = params.get("category") ?? "";
  const currentSort = params.get("sort") ?? "newest";
  const currentMin = params.get("minPrice") ?? "";
  const currentMax = params.get("maxPrice") ?? "";
  const currentSearch = params.get("search") ?? "";

  const [minPrice, setMinPrice] = useState(currentMin);
  const [maxPrice, setMaxPrice] = useState(currentMax);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const next = new URLSearchParams();
      const merged = {
        category: currentCategory,
        sort: currentSort,
        minPrice: currentMin,
        maxPrice: currentMax,
        search: currentSearch,
        ...overrides,
      };
      Object.entries(merged).forEach(([k, v]) => { if (v) next.set(k, v); });
      return `/products?${next.toString()}`;
    },
    [currentCategory, currentSort, currentMin, currentMax, currentSearch]
  );

  function applyPrice() {
    router.push(buildUrl({ minPrice, maxPrice }));
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    router.push(currentSearch ? `/products?search=${currentSearch}` : "/products");
  }

  const hasFilters = currentCategory || currentSort !== "newest" || currentMin || currentMax;

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-4">
      {/* Active filters indicator */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 font-medium"
        >
          <X size={13} /> Clear all filters
        </button>
      )}

      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Categories</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href={buildUrl({ category: "" })}
              className={`block px-2 py-1.5 rounded-lg transition-colors ${!currentCategory ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            >
              All Products
            </a>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <a
                href={buildUrl({ category: cat.slug })}
                className={`block px-2 py-1.5 rounded-lg transition-colors ${currentCategory === cat.slug ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-2">
          <SlidersHorizontal size={14} /> Sort By
        </h3>
        <ul className="space-y-1 text-sm">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <a
                href={buildUrl({ sort: opt.value })}
                className={`block px-2 py-1.5 rounded-lg transition-colors ${currentSort === opt.value ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {opt.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Price Range (LKR)</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            min={0}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder={`Max (up to ${maxProductPrice.toLocaleString()})`}
            value={maxPrice}
            min={0}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={applyPrice}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Apply
          </button>
          {(currentMin || currentMax) && (
            <button
              onClick={() => { setMinPrice(""); setMaxPrice(""); router.push(buildUrl({ minPrice: "", maxPrice: "" })); }}
              className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear price filter
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
