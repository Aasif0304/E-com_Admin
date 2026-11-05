import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load categories. Please check connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateModal() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(cat) {
    setEditingCategory(cat);
    setName(cat.name || "");
    setDescription(cat.description || "");
    setFormError("");
    setModalOpen(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to save category. Please try again.";
      setFormError(detail);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deleteCategory(id);
      setDeleteConfirmId(null);
      await loadCategories();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Could not delete category. It might be linked to existing products."
      );
    } finally {
      setDeleting(false);
    }
  }

  const filteredCategories = categories.filter((cat) => {
    const term = search.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term) ||
      cat.id?.toString().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header
        title="Category Management"
        subtitle="Organize product catalog categories and departments"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link
            to="/"
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>← Back to Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-300">Category Catalog</span>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Category
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-slate-800/90 rounded-xl border border-slate-700/80 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/80">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
                      <p>Loading categories...</p>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500">
                      No categories found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        #{cat.id}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-900/40 border border-indigo-700/40 flex items-center justify-center text-indigo-400 font-bold text-xs">
                          {cat.name.slice(0, 2).toUpperCase()}
                        </div>
                        {cat.name}
                      </td>
                      <td className="py-4 px-6 text-slate-400 max-w-md truncate">
                        {cat.description || (
                          <span className="italic text-slate-500">
                            No description provided
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {deleteConfirmId === cat.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(cat.id)}
                              disabled={deleting}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              {deleting ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(cat.id)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create New Category"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics, Footwear, Fashion"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category and its products..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              {formSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

