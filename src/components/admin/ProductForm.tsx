"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Category { id: string; name: string }
interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; costPrice: number; stock: number; images: string[];
  categoryId: string; isActive: boolean;
}

export default function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter();
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    costPrice: product?.costPrice ?? 0,
    stock: product?.stock ?? 0,
    categoryId: product?.categoryId ?? (categories[0]?.id ?? ""),
    isActive: product?.isActive ?? true,
    images: product?.images?.join("\n") ?? "",
  });

  function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      costPrice: Number(form.costPrice),
      stock: Number(form.stock),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to save product");
    } else {
      toast.success(isEdit ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl space-y-5">
      <Field label="Product Name" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
          required
          className={inputCls}
        />
      </Field>

      <Field label="Slug (URL-friendly)">
        <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputCls} />
      </Field>

      <Field label="Description" required>
        <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} required className={inputCls} />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Selling Price (LKR)" required>
          <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} min={0} required className={inputCls} />
        </Field>
        <Field label="Cost Price (LKR)" required>
          <input type="number" value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: Number(e.target.value) }))} min={0} required className={inputCls} />
        </Field>
        <Field label="Stock">
          <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} min={0} className={inputCls} />
        </Field>
      </div>

      <Field label="Category" required>
        <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} required className={inputCls}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="Image URLs (one per line)">
        <textarea value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} rows={3} placeholder="https://..." className={inputCls} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded" />
        Active (visible in shop)
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
          {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-200 px-6 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
