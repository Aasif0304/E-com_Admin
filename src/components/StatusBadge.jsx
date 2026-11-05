export default function StatusBadge({ status }) {
  if (!status) return null;

  const s = String(status).toUpperCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";

  switch (s) {
    case "PENDING":
      styles = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "CONFIRMED":
      styles = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "SHIPPED":
      styles = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    case "DELIVERED":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "CANCELLED":
      styles = "bg-red-50 text-red-700 border-red-200";
      break;
    case "IN_STOCK":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "LOW_STOCK":
      styles = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "OUT_OF_STOCK":
      styles = "bg-red-50 text-red-700 border-red-200";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles}`}
    >
      {s.replace(/_/g, " ")}
    </span>
  );
}

