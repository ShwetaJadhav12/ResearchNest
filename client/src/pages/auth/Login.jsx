import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
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
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        localStorage.setItem("token", response.data.token || "");
        localStorage.setItem("user", JSON.stringify(response.data.user || {}));
        navigate("/");
      } else {
        setErrors({ form: response?.data?.message || "Login failed." });
      }
    } catch (error) {
      setErrors({ form: error?.response?.data?.message || "Login failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_30%),#FAF7FF] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-violet-100 bg-white/90 shadow-2xl shadow-violet-100/60 backdrop-blur-xl lg:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 px-8 py-12 text-white sm:px-12 lg:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-100">
            Welcome back
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Sign in to your research workspace.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-violet-50 sm:text-base">
            Organize papers, capture insights, and keep your team aligned in one calm, intelligent workspace.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-100">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
                Login
              </p>
              <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-600">
                Continue where you left off and pick up your projects.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password}</p> : null}
              </div>

              {errors.form ? <p className="text-sm text-rose-600">{errors.form}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200/50 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              New here?{' '}
              <Link to="/register" className="font-semibold text-violet-600 transition hover:text-violet-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}