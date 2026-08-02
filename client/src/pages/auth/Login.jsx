import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    // Simple client-side login: persist user to localStorage
    const user = { name: email.split("@")[0], email };
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      // ignore storage errors
    }

    // Navigate to landing page as requested
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_30%),#FAF7FF] px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 rounded-[2rem] border border-violet-100 bg-white/95 px-8 py-10 shadow-2xl shadow-violet-100/50 backdrop-blur-xl md:px-14 md:py-14">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
            Welcome back
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Sign in to ResearchNest
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Access your workspace, manage research projects, and collaborate with your team.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-invalid={errors.email ? "true" : "false"}
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
              {errors.email ? (
                <p className="text-sm text-rose-600">{errors.email}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                aria-invalid={errors.password ? "true" : "false"}
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
              {errors.password ? (
                <p className="text-sm text-rose-600">{errors.password}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200/50 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          New to ResearchNest?{' '}
          <Link
            to="/register"
            className="font-semibold text-violet-600 transition hover:text-violet-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
