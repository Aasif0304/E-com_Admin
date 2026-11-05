import { useAdminAuth } from "../context/AdminAuthContext";

export default function Header({ title, subtitle, actions }) {
  const { user, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-8 py-4 backdrop-blur-sm text-slate-100">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Backend
          </span>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
