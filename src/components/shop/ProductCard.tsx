"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { ProductWithCategory } from "@/types";

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  const { addItem } = useCart();

  function handleAddToCart() {
    if (product.stock === 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "/placeholder.jpg",
      quantity: 1,
      stock: product.stock,
      slug: product.slug,
    });
    toast.success("Added to cart!");
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-52 bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">No image</div>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of stock</span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-indigo-500 font-medium mb-1">{product.category.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">LKR {product.price.toLocaleString()}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart size={15} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
