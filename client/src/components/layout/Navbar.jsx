import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const links = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Features",
      path: "/features",
    },
    {
      name: "Research",
      path: "/research",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Pricing",
      path: "/pricing",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/70 bg-white/80 backdrop-blur-2xl">

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

        {/* LOGO */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >

          <div className="flex h-6 w-6 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-300/40">

            R

          </div>

          <div>

            <h1 className="text-lg font-black tracking-tight text-slate-900">
              Research
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                Nest
              </span>

            </h1>

            

          </div>

        </Link>

        {/* NAVIGATION */}

        <div className="hidden lg:flex items-center rounded-2xl bg-slate-50 p-1">

          {links.map((item) => (

            <Link
              key={item.name}
              to={item.path}
              className={`rounded-xl px-5 py-2 text-sm font-medium transition-all duration-300 ${
                location.pathname === item.path
                  ? "bg-white text-violet-600 shadow-md"
                  : "text-slate-500 hover:bg-white hover:text-violet-600"
              }`}
            >
              {item.name}
            </Link>

          ))}

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-4">

          {/* SEARCH */}


         
          {/* NOTIFICATION */}

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 hover:bg-violet-100 transition">

            <Bell
              size={19}
              className="text-slate-700"
            />

            <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-violet-500"></span>

          </button>
                    {/* PROFILE */}

          {user ? (

            <div
              ref={profileRef}
              className="relative"
            >

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm transition-all duration-300 hover:border-violet-300 hover:shadow-lg"
              >

                {/* Avatar */}

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-300/30 transition-transform duration-300 group-hover:scale-105">

                  {initials}

                </div>

                <div className="hidden text-left lg:block">

                  <h3 className="text-sm font-semibold text-slate-800">
                    {user?.name}
                  </h3>

                  <p className="text-xs text-slate-400">
                    Researcher
                  </p>

                </div>

                <ChevronDown
                  size={18}
                  className={`hidden text-slate-400 transition duration-300 lg:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />

              </button>

              {/* Dropdown */}

              {profileOpen && (

                <div className="absolute right-0 mt-4 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

                  {/* Header */}

                  <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 p-6 text-white">

                    <div className="flex items-center gap-4">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold">

                        {initials}

                      </div>

                      <div>

                        <h2 className="font-bold">
                          {user?.name}
                        </h2>

                        <p className="text-sm text-violet-100">
                          {user?.email}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Menu */}

                  <div className="p-3">

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-violet-50"
                    >

                      <LayoutDashboard size={20} />

                      Dashboard

                    </Link>

                    <Link
                      to="/profile"
                      className="mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-violet-50"
                    >

                      <User size={20} />

                      My Profile

                    </Link>

                    <Link
                      to="/settings"
                      className="mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-violet-50"
                    >

                      <Settings size={20} />

                      Settings

                    </Link>

                    <hr className="my-3" />

                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-red-600 transition hover:bg-red-50"
                    >

                      <LogOut size={20} />

                      Logout

                    </button>

                  </div>

                </div>

              )}

            </div>

          ) : (

            <>
              <Link
                to="/login"
                className="rounded-2xl px-5 py-2 font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-300/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get Started
              </Link>
            </>

          )}

          {/* Mobile Menu */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl p-2 transition hover:bg-slate-100 lg:hidden"
          >

            {menuOpen ? <X size={24} /> : <Menu size={24} />}

          </button>

        </div>

      </nav>

      {/* Mobile Navigation */}

      {menuOpen && (

        <div className="border-t border-slate-200 bg-white lg:hidden">

          <div className="flex flex-col p-5">

            {links.map((item) => (

              <Link
                key={item.name}
                to={item.path}
                className="rounded-xl px-4 py-3 text-slate-700 transition hover:bg-violet-50"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>

            ))}

          </div>

        </div>

      )}

    </header>

  );

}
