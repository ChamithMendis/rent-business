"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

interface Category { id: string; name: string; slug: string; isActive: boolean }

export default function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initial);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), slug: slugify(newName.trim()) }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create category");
    } else {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      toast.success(`"${data.name}" created!`);
      router.refresh();
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update");
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: data.name, slug: data.slug } : c))
      );
      setEditingId(null);
      toast.success("Category updated!");
      router.refresh();
    }
  }

  async function toggleActive(cat: Category) {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Toggle failed:", data);
      toast.error(data.error ?? "Failed to update");
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: data.isActive } : c))
      );
      toast.success(data.isActive ? "Category activated" : "Category deactivated");
      router.refresh();
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Products in this category will need to be reassigned.`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
      router.refresh();
    } else {
      toast.error("Cannot delete — products are assigned to this category");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Add New Category</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Electronics, Clothing, Home..."
            required
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
        {newName && (
          <p className="mt-2 text-xs text-gray-400">Slug: <span className="font-mono">{slugify(newName)}</span></p>
        )}
      </form>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center">No categories yet. Add one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    {editingId === cat.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(cat.id); if (e.key === "Escape") setEditingId(null); }}
                        autoFocus
                        className="border border-indigo-300 rounded-lg px-2 py-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-400 text-xs">{cat.slug}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        cat.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === cat.id ? (
                        <>
                          <button onClick={() => saveEdit(cat.id)} className="text-green-600 hover:text-green-800">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)} className="text-indigo-400 hover:text-indigo-600">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
