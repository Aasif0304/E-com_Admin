export default function StatCard({ title, value, subtext, icon, color = "brand" }) {
  const colorMap = {
    brand: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const badgeClass = colorMap[color] || colorMap.brand;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg ${badgeClass}`}>
          {icon}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
}

