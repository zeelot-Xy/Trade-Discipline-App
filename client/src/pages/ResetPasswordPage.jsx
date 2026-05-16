import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import authService from "../services/authService.js";
import AuthTextLink from "../components/AuthTextLink.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This reset link is missing its token. Request a new password reset link.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await authService.resetPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setMessage(response.message);
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(160deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_20%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">Reset password</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Choose a new password</h2>
          <p className="mt-2 text-sm text-slate-400">
            Set a new password for your account. This reset link will expire automatically.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <ErrorMessage message={error} />
            {message ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            ) : null}
            <input
              className={inputClassName}
              type="password"
              placeholder="New password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <input
              className={inputClassName}
              type="password"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Resetting password..." : "Reset password"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            <AuthTextLink to="/login">Back to login</AuthTextLink>
          </p>
        </div>
      </div>
    </div>
  );
}
