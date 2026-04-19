"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Store } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Store size={24} />
            ShopLK
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
            <Link href="/products?category=electronics" className="hover:text-indigo-600 transition-colors">Electronics</Link>
            <Link href="/products?category=clothing" className="hover:text-indigo-600 transition-colors">Clothing</Link>
            <Link href="/products?category=home" className="hover:text-indigo-600 transition-colors">Home</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-indigo-600">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link href="/login" className="p-2 text-gray-700 hover:text-indigo-600">
              <User size={22} />
            </Link>
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700">
          <Link href="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link href="/products?category=electronics" onClick={() => setMenuOpen(false)}>Electronics</Link>
          <Link href="/products?category=clothing" onClick={() => setMenuOpen(false)}>Clothing</Link>
          <Link href="/products?category=home" onClick={() => setMenuOpen(false)}>Home</Link>
        </div>
      )}
    </nav>
  );
}
