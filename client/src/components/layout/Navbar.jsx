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
  Sparkles,
  FolderKanban,
  Compass,
  FileText,
  BookOpen,
  Search,
  Users,
  Plus,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const profileRef = useRef(null);
  const featuresRef = useRef(null);
  const aiRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const closeDropdowns = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }

      if (
        featuresRef.current &&
        !featuresRef.current.contains(e.target)
      ) {
        setFeaturesOpen(false);
      }

      if (
        aiRef.current &&
        !aiRef.current.contains(e.target)
      ) {
        setAiOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdowns);

    return () => {
      document.removeEventListener("mousedown", closeDropdowns);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMenuOpen(false);
    setFeaturesOpen(false);
    setAiOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "RN";

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            LOGO
        ====================================================== */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 shadow-lg shadow-violet-500/20 transition-transform duration-200 group-hover:scale-105">
            <span className="text-sm font-black text-white">
              R
            </span>

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <span className="hidden text-[18px] font-extrabold tracking-tight text-slate-900 sm:block">
            Research
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Nest
            </span>
          </span>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <div className="ml-8 hidden items-center gap-1 lg:flex">

          {/* FEATURES DROPDOWN */}
          <div ref={featuresRef} className="relative">
            <button
              onClick={() => {
                setFeaturesOpen(!featuresOpen);
                setAiOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                featuresOpen ||
                isActive("/features") ||
                isActive("/discovery")
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Features
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  featuresOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {featuresOpen && (
              <div className="absolute left-0 top-[calc(100%+10px)] w-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">

                <DropdownHeader title="Research Tools" />

                <DropdownLink
                  to="/features/upload-organize"
                  icon={FileText}
                  title="Upload & Organize"
                  description="Manage your research library"
                  onClick={() => setFeaturesOpen(false)}
                />

                <DropdownLink
                  to="/discovery"
                  icon={Compass}
                  title="Research Discovery"
                  description="Discover papers and research"
                  onClick={() => setFeaturesOpen(false)}
                />

                <DropdownLink
                  to="/reader"
                  icon={BookOpen}
                  title="AI Research Reader"
                  description="Read and understand papers"
                  onClick={() => setFeaturesOpen(false)}
                />

                <div className="my-2 border-t border-slate-100" />

                <DropdownLink
                  to="/projects"
                  icon={FolderKanban}
                  title="Workspaces"
                  description="Organize research projects"
                  onClick={() => setFeaturesOpen(false)}
                />

                <DropdownLink
                  to="/team"
                  icon={Users}
                  title="Team Collaboration"
                  description="Work together with your team"
                  onClick={() => setFeaturesOpen(false)}
                />
              </div>
            )}
          </div>

          {/* WORKSPACE */}
          <Link
            to="/projects"
            className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              isActive("/projects")
                ? "bg-violet-50 text-violet-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Workspace
          </Link>

          {/* AI TOOLS DROPDOWN */}
          <div ref={aiRef} className="relative">
            <button
              onClick={() => {
                setAiOpen(!aiOpen);
                setFeaturesOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                aiOpen || isActive("/research")
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              AI Tools
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  aiOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {aiOpen && (
              <div className="absolute left-0 top-[calc(100%+10px)] w-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">

                <DropdownHeader title="AI Research" />

                <DropdownLink
                  to="/research"
                  icon={Sparkles}
                  title="AI Research Assistant"
                  description="Analyze, compare and write research"
                  highlight
                  onClick={() => setAiOpen(false)}
                />

                <DropdownLink
                  to="/research?tool=literature"
                  icon={BookOpen}
                  title="Literature Review"
                  description="Generate literature insights"
                  onClick={() => setAiOpen(false)}
                />

                <DropdownLink
                  to="/research?tool=gap"
                  icon={Compass}
                  title="Research Gap Finder"
                  description="Identify opportunities in research"
                  onClick={() => setAiOpen(false)}
                />

                <DropdownLink
                  to="/research?tool=writing"
                  icon={FileText}
                  title="Research Writing"
                  description="Create surveys and research papers"
                  onClick={() => setAiOpen(false)}
                />
              </div>
            )}
          </div>

          {/* ABOUT */}
          <Link
            to="/about"
            className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              isActive("/about")
                ? "bg-violet-50 text-violet-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            About
          </Link>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">

          {/* SEARCH */}
          {user && (
            <button
              onClick={() => navigate("/search")}
              className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 md:flex"
            >
              <Search size={16} />

              <span className="text-xs font-medium">
                Search
              </span>

              <kbd className="ml-2 hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 lg:block">
                /
              </kbd>
            </button>
          )}

          {/* MOBILE SEARCH */}
          {user && (
            <button
              onClick={() => navigate("/search")}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-600 md:hidden"
            >
              <Search size={18} />
            </button>
          )}

          {/* NOTIFICATIONS */}
          {user && (
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
              aria-label="Notifications"
            >
              <Bell size={18} />

              <span className="absolute right-[9px] top-[9px] h-1.5 w-1.5 rounded-full bg-violet-600 ring-2 ring-white" />
            </button>
          )}

          {/* =================================================
              USER PROFILE
          ================================================== */}
          {user ? (
            <div ref={profileRef} className="relative">

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white shadow-md shadow-violet-500/20">
                  {initials}
                </div>

                <div className="hidden text-left xl:block">
                  <p className="max-w-[110px] truncate text-xs font-bold text-slate-800">
                    {user?.name}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Researcher
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className={`hidden text-slate-400 transition-transform xl:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[270px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                  {/* Profile header */}
                  <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-sm font-bold backdrop-blur">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {user?.name}
                        </p>

                        <p className="truncate text-xs text-violet-100">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">

                    <ProfileLink
                      to="/dashboard"
                      icon={LayoutDashboard}
                      title="Dashboard"
                      onClick={() => setProfileOpen(false)}
                    />

                    <ProfileLink
                      to="/projects"
                      icon={FolderKanban}
                      title="My Workspaces"
                      onClick={() => setProfileOpen(false)}
                    />

                    <ProfileLink
                      to="/settings"
                      icon={Settings}
                      title="Settings"
                      onClick={() => setProfileOpen(false)}
                    />

                    <div className="my-2 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* =================================================
                LOGGED OUT
            ================================================== */
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-violet-700"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/30"
              >
                Get started
              </Link>
            </div>
          )}

          {/* =================================================
              MOBILE MENU
          ================================================== */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden">

          <div className="mx-auto max-w-2xl space-y-1">

            <MobileLink
              to="/dashboard"
              icon={LayoutDashboard}
              title="Dashboard"
              active={isActive("/dashboard")}
              onClick={() => setMenuOpen(false)}
            />

            <MobileLink
              to="/projects"
              icon={FolderKanban}
              title="Workspace"
              active={isActive("/projects")}
              onClick={() => setMenuOpen(false)}
            />

            <div className="my-3 border-t border-slate-100" />

            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Research
            </p>

            <MobileLink
              to="/features/upload-organize"
              icon={FileText}
              title="Upload & Organize"
              active={isActive("/features/upload-organize")}
              onClick={() => setMenuOpen(false)}
            />

            <MobileLink
              to="/discovery"
              icon={Compass}
              title="Research Discovery"
              active={isActive("/discovery")}
              onClick={() => setMenuOpen(false)}
            />

            <MobileLink
              to="/reader"
              icon={BookOpen}
              title="AI Research Reader"
              active={isActive("/reader")}
              onClick={() => setMenuOpen(false)}
            />

            <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              AI Tools
            </p>

            <MobileLink
              to="/research"
              icon={Sparkles}
              title="AI Research Assistant"
              active={isActive("/research")}
              onClick={() => setMenuOpen(false)}
            />

            <MobileLink
              to="/team"
              icon={Users}
              title="Team Collaboration"
              active={isActive("/team")}
              onClick={() => setMenuOpen(false)}
            />

            <div className="my-3 border-t border-slate-100" />

            <MobileLink
              to="/about"
              icon={User}
              title="About"
              active={isActive("/about")}
              onClick={() => setMenuOpen(false)}
            />

            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-center text-sm font-bold text-white"
                >
                  Get started
                </Link>
              </div>
            )}

            {user && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={17} />
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ============================================================
   DROPDOWN HEADER
============================================================ */

function DropdownHeader({ title }) {
  return (
    <div className="px-3 pb-2 pt-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>
    </div>
  );
}

/* ============================================================
   DROPDOWN LINK
============================================================ */

function DropdownLink({
  to,
  icon: Icon,
  title,
  description,
  highlight = false,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${
        highlight
          ? "hover:bg-violet-50"
          : "hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
          highlight
            ? "bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
            : "bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600"
        }`}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

/* ============================================================
   PROFILE LINK
============================================================ */

function ProfileLink({
  to,
  icon: Icon,
  title,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
    >
      <Icon size={16} className="text-slate-400" />
      {title}
    </Link>
  );
}

/* ============================================================
   MOBILE LINK
============================================================ */

function MobileLink({
  to,
  icon: Icon,
  title,
  active,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        size={18}
        className={
          active
            ? "text-violet-600"
            : "text-slate-400"
        }
      />

      <span>{title}</span>
    </Link>
  );
}