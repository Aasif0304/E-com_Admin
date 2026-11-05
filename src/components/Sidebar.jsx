import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const menuItems = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/products", label: "Products", icon: "📦", end: false },
  { to: "/categories", label: "Categories", icon: "🏷️", end: false },
  { to: "/orders", label: "Customer Orders", icon: "🚚", end: false },
];

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { user, logout } = useAdminAuth();

  return (
    <aside
      className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 select-none transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } h-screen shrink-0`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white text-xl font-bold shadow-lg shadow-indigo-600/30">
            ⚡
          </span>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              E-Commerce
            </h1>
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
              Admin Portal
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* 4 Sidebar Navigation Menu Items */}
      <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Navigation Menu
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-400">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || "admin@store.com"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}
