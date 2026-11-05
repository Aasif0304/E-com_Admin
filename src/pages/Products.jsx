import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  getProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
} from "../api/products";
import { getCategories } from "../api/categories";
import { getAssetUrl } from "../api/axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCat, setSelectedCat] = useState(() => searchParams.get("cat") || "ALL");

  const [toastMessage, setToastMessage] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Product Form Fields
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([
        getProducts().catch(() => []),
        getCategories().catch(() => []),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError("Failed to load products or categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("cat");
    setSelectedCat(cat || "ALL");
  }, [searchParams]);

  function handleCategoryFilterChange(newCat) {
    setSelectedCat(newCat);
    if (newCat === "ALL") {
      searchParams.delete("cat");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat: newCat });
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  async function handleQuickStock(productId, currentStock, delta) {
    const newStock = Math.max(0, (currentStock || 0) + delta);
    try {
      await updateProductStock(productId, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      showToast(`✅ Stock updated to ${newStock} units!`);
    } catch (err) {
      alert("Failed to update stock.");
    }
  }

  function openCreateModal() {
    setEditingProduct(null);
    setForm({
      name: "",
      price: "",
      stock: "",
      category_id: categories[0]?.id || "",
      description: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(prod) {
    setEditingProduct(prod);
    setForm({
      name: prod.name || "",
      price: prod.price !== undefined ? prod.price : "",
      stock: prod.stock !== undefined ? prod.stock : "",
      category_id: prod.category_id || prod.category?.id || "",
      description: prod.description || "",
    });
    setImageFile(null);
    setImagePreview(prod.image_url ? getAssetUrl(prod.image_url) : null);
    setFormError("");
    setModalOpen(true);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Product title is required.");
      return;
    }
    if (form.price === "" || Number(form.price) < 0) {
      setFormError("Valid positive price is required.");
      return;
    }
    if (form.stock === "" || Number(form.stock) < 0) {
      setFormError("Valid stock quantity is required.");
      return;
    }
    if (!form.category_id) {
      setFormError("Please select a category.");
      return;
    }

    setFormSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("price", Number(form.price));
      formData.append("stock", parseInt(form.stock, 10));
      formData.append("category_id", parseInt(form.category_id, 10));
      if (form.description.trim()) {
        formData.append("description", form.description.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast("Product updated successfully!");
      } else {
        await createProduct(formData);
        showToast("New product created successfully!");
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to save product. Check inputs.";
      setFormError(detail);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(prod) {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}"?`)) return;
    try {
      await deleteProduct(prod.id);
      showToast("Product deleted successfully.");
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete product.");
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCat === "ALL" ||
      (p.category && p.category.id === Number(selectedCat)) ||
      p.category_id === Number(selectedCat);

    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header
        title="Products Management"
        subtitle="Add, edit, manage inventory, and upload product images"
        actions={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span>+</span>
            <span>Add New Product</span>
          </button>
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage("")}
            className="text-white/80 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link
            to="/"
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>← Back to Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-300">Catalog Inventory</span>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shadow-lg">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCat}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-slate-800/90 rounded-xl border border-slate-700/80 shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
              <p>Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No products found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/80">
                  <tr>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock & Quick Restock</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredProducts.map((prod) => {
                    const img = prod.image_url ? getAssetUrl(prod.image_url) : null;
                    const stock = prod.stock || 0;
                    const catName =
                      prod.category?.name ||
                      categories.find(
                        (c) =>
                          String(c.id) ===
                          String(prod.category_id || prod.category?.id)
                      )?.name ||
                      "General";

                    return (
                      <tr key={prod.id} className="hover:bg-slate-700/30 transition-colors">
                        {/* Image & Title */}
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl">📦</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-100">
                              {prod.name}
                            </div>
                            <div className="text-xs text-slate-400 max-w-xs truncate">
                              {prod.description || "No description"}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/80 text-slate-300">
                            {catName}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-semibold text-slate-100 whitespace-nowrap">
                          ₹{Number(prod.price).toLocaleString("en-IN")}
                        </td>

                        {/* Stock & Quick Restock */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 font-mono text-sm">
                              {stock}
                            </span>
                            <span className="text-xs text-slate-500">units</span>
                            <div className="inline-flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleQuickStock(prod.id, stock, 5)}
                                className="px-2 py-0.5 rounded bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-bold transition cursor-pointer"
                                title="Add +5 units"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickStock(prod.id, stock, 10)}
                                className="px-2 py-0.5 rounded bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-bold transition cursor-pointer"
                                title="Add +10 units"
                              >
                                +10
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {stock === 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Out of Stock
                            </span>
                          ) : stock < 5 ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Low Stock ({stock})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? `Edit Product #${editingProduct.id}` : "Add New Product"}
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1999"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Initial Stock *
              </label>
              <input
                type="number"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="25"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Details, specs, and features of the product..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image Upload & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer"
              />
            </div>
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
              {editingProduct ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
