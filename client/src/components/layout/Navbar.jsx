import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      setUser(null);
    }

    const onStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const initials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-violet-100">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-slate-900">Research</span>
          <span className="text-violet-600">Nest</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-slate-600 transition hover:text-violet-600">
            Features
          </a>

          <a href="#how-it-works" className="text-slate-600 transition hover:text-violet-600">
            How it Works
          </a>

          <a href="#ai" className="text-slate-600 transition hover:text-violet-600">
            AI
          </a>

          <a href="#pricing" className="text-slate-600 transition hover:text-violet-600">
            Pricing
          </a>
        </div>

        {/* Buttons / Profile */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-5 py-2 text-slate-700 transition hover:bg-violet-50"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="hidden md:flex items-center gap-3 rounded-full px-3 py-2 hover:bg-violet-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
                  {initials(user.name || user.email)}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-slate-900">{user.name || user.email}</div>
                  <div className="text-xs text-slate-500">View dashboard</div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
