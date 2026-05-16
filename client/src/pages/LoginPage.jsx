import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import authService from "../services/authService.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { hydrateAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/checklist";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await authService.login(form);
      hydrateAuth(response);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-2xl">
      <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">Welcome back</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Log into your trading workspace</h2>
      <p className="mt-2 text-sm text-slate-400">
        Stay consistent. Validate every setup before it becomes a trade.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <ErrorMessage message={error} />
        <input
          className={inputClassName}
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className={inputClassName}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm">
        <Link to="/forgot-password" className="text-slate-400 transition hover:text-emerald-300">
          Forgot password?
        </Link>
        <Link to="/register" className="text-emerald-300 transition hover:text-emerald-200">
          Create account
        </Link>
      </div>
    </div>
  );
}
