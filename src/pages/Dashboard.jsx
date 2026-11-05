import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { getProducts, updateProductStock } from "../api/products";
import { getCategories } from "../api/categories";
import { getAllOrders, updateOrderStatus } from "../api/orders";
import { getAssetUrl } from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    products: [],
    categories: [],
    orders: [],
    loading: true,
    error: "",
  });

  const [restockingId, setRestockingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  async function loadDashboard() {
    setData((d) => ({ ...d, loading: true, error: "" }));
    try {
      const [prodsRes, catsRes, ordersRes] = await Promise.all([
        getProducts().catch(() => []),
        getCategories().catch(() => []),
        getAllOrders().catch(() => []),
      ]);

      setData({
        products: prodsRes,
        categories: catsRes,
        orders: ordersRes,
        loading: false,
        error: "",
      });
    } catch (err) {
      setData((d) => ({
        ...d,
        loading: false,
        error: "Failed to load dashboard data.",
      }));
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // Quick Restock handler: increments stock by delta and saves to backend
  async function handleQuickRestock(productId, currentStock, delta) {
    const newStock = Math.max(0, (currentStock || 0) + delta);
    setRestockingId(productId);
    try {
      await updateProductStock(productId, newStock);
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, stock: newStock } : p
        ),
      }));
      showToast(`✅ Added +${delta} units to stock! (New Stock: ${newStock})`);
    } catch (err) {
      alert("Failed to restock product. Please check connection.");
    } finally {
      setRestockingId(null);
    }
  }

  async function handleQuickStatus(orderId, newStatus) {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadDashboard();
      showToast(`Order #${orderId} marked as ${newStatus}!`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const { products, categories, orders, loading, error } = data;

  // Revenue calculation: Sum total of all orders except CANCELLED
  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Status breakdown counters
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  // Inventory Health: items with stock < 5
  const lowStockProducts = products.filter(
    (p) => (p.stock !== undefined ? p.stock : 0) < 5
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header
        title="Store Executive Dashboard"
        subtitle="Live snapshot of revenue, orders fulfillment, and inventory health"
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

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Top 4 KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
            trend="+8.2% vs last week"
            trendType="up"
            icon="💰"
          />

          <StatCard
            title="Total Orders"
            value={orders.length}
            trend={`${pendingOrders} awaiting fulfillment`}
            trendType={pendingOrders > 0 ? "neutral" : "up"}
            icon="🚚"
          />

          <StatCard
            title="Active Products"
            value={products.length}
            trend={`${categories.length} registered categories`}
            trendType="up"
            icon="📦"
          />

          <div
            className={`p-5 rounded-2xl border shadow-lg transition ${
              lowStockProducts.length > 0
                ? "bg-rose-950/40 border-rose-500/40"
                : "bg-slate-800/90 border-slate-700/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                Low Stock Alerts
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-lg text-rose-400">
                ⚠️
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-rose-400">
                {lowStockProducts.length}
              </span>
              <span className="text-xs text-slate-400">items running low</span>
            </div>
            <p className="text-xs text-rose-300/80 mt-2">
              {lowStockProducts.length > 0
                ? "Immediate restock required"
                : "Inventory is healthy"}
            </p>
          </div>
        </div>

        {/* ⚠️ LOW STOCK INVENTORY ATTENTION & QUICK RESTOCK */}
        {lowStockProducts.length > 0 && (
          <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-xl shadow-lg shadow-rose-600/30">
                  ⚠️
                </span>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Low Stock Inventory Attention
                  </h3>
                  <p className="text-xs text-rose-300/80">
                    {lowStockProducts.length} item(s) are critically low or out of stock. Increase stock quantity directly:
                  </p>
                </div>
              </div>

              <Link
                to="/products"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 self-start sm:self-auto"
              >
                Open Full Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {lowStockProducts.map((p) => {
                const stock = p.stock || 0;
                const isRestocking = restockingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image_url ? (
                          <img
                            src={getAssetUrl(p.image_url)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              stock === 0
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {stock === 0 ? "0 units (Out of Stock)" : `${stock} units left`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Restock Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
                        Add:
                      </span>
                      <button
                        disabled={isRestocking}
                        onClick={() => handleQuickRestock(p.id, stock, 5)}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        title="Add 5 units"
                      >
                        +5
                      </button>
                      <button
                        disabled={isRestocking}
                        onClick={() => handleQuickRestock(p.id, stock, 10)}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                      <button
                        disabled={isRestocking}
                        onClick={() => handleQuickRestock(p.id, stock, 25)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/30"
                        title="Add 25 units"
                      >
                        +25
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Orders Table */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest customer purchases awaiting action
              </p>
            </div>
            <Link
              to="/orders"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              <span>View All Orders ({orders.length})</span>
              <span>→</span>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No customer orders recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/80">
                  <tr>
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Quick Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-medium text-indigo-400">
                        #{ord.id}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-200">
                          {ord.recipient_name || `User #${ord.user_id}`}
                        </div>
                        {ord.phone && (
                          <div className="text-xs text-slate-400">
                            📞 {ord.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-100 whitespace-nowrap">
                        ₹{Number(ord.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate("/orders")}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition cursor-pointer"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
