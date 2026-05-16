import { useState } from "react";
import { Link } from "react-router-dom";

import authService from "../services/authService.js";
import ErrorMessage from "../components/ErrorMessage.jsx";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      setSubmitting(true);
      const response = await authService.forgotPassword({ email });
      setMessage(response.message);
      setResetUrl(response.resetUrl || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-2xl">
      <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">Forgot password</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Reset your password</h2>
      <p className="mt-2 text-sm text-slate-400">
        Enter your account email and we will send a secure reset link if the account exists.
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
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Sending reset email..." : "Send reset email"}
        </button>
      </form>

      {resetUrl ? (
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <p className="text-sm font-medium text-cyan-100">Development fallback reset link</p>
          <p className="mt-2 text-sm text-slate-200">
            Email delivery is not configured in this environment yet, so the secure link is shown here for local testing.
          </p>
          <p className="mt-2 break-all text-sm text-slate-200">{resetUrl}</p>
          <a
            href={resetUrl}
            className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
          >
            Open reset page
          </a>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-slate-400">
        <Link to="/login" className="text-emerald-300 transition hover:text-emerald-200">
          Back to login
        </Link>
      </p>
    </div>
  );
}
