import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { errorMessage } from "../api/auth";

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "aasif@example.com",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in with administrator credentials to manage your store.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Portal"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800 pt-4 text-center">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-400 hover:text-white transition"
          >
            ← Back to Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

