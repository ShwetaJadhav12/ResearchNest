import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.fullName || user.name || user.email || "User";
  }, [user]);

  const initials = useMemo(() => {
    if (!displayName) return "U";
    return displayName
      .split(" ")
      .map((part) => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  }, [displayName]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-slate-900">Research</span>
          <span className="text-violet-600">Nest</span>
        </Link>

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

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-violet-100 bg-violet-50 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500">Signed in</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 rounded-full px-3 py-1 text-sm font-medium text-violet-700 transition hover:bg-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-5 py-2 text-slate-700 transition hover:bg-violet-50">
                Login
              </Link>

              <Link to="/register" className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}