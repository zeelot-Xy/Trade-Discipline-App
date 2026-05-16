import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import authService from "../services/authService.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { hydrateAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await authService.register(form);
      hydrateAuth(response);
      navigate("/checklist", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-2xl">
      <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">Create account</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Start building better trade discipline</h2>
      <p className="mt-2 text-sm text-slate-400">
        Set up your account to track confluence, journal results, and review performance.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <ErrorMessage message={error} />
        <input
          className={inputClassName}
          placeholder="Full name"
          value={form.fullName}
          onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
        />
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
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-emerald-300 transition hover:text-emerald-200">
          Login
        </Link>
      </p>
    </div>
  );
}
