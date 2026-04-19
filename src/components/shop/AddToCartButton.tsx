"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

interface Props {
  product: { id: string; name: string; price: number; image: string; stock: number; slug: string };
}

export default function AddToCartButton({ product }: Props) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  function handleAdd() {
    addItem({ ...product, quantity: qty });
    toast.success(`${product.name} added to cart!`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-semibold">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100"
        >
          <Plus size={16} />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </button>
    </div>
  );
}
