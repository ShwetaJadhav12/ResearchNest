import { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  BookOpen,
  Bell,
  Save,
  LoaderCircle,
  KeyRound,
  Sparkles,
  Building,
  Mail,
  CheckCircle2,
  Lock,
  Tag,
  Sliders,
  Palette,
  Eye,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

const CITATION_STYLES = ["IEEE", "APA", "BibTeX", "MLA", "Harvard"];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [researchInterests, setResearchInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");

  // Security Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Preferences Form
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    realTimeAlerts: true,
    defaultCitationStyle: "IEEE",
    readerFontSize: "text-base",
    readerTheme: "light",
    aiModelDetail: "detailed",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/auth/profile");
      if (data.user) {
        setFullName(data.user.fullName || data.user.name || "");
        setEmail(data.user.email || "");
        setAvatar(data.user.avatar || "");
        setBio(data.user.bio || "");
        setInstitution(data.user.institution || "");
        setResearchInterests(data.user.researchInterests || []);
        if (data.user.preferences) {
          setPreferences({
            emailNotifications: data.user.preferences.emailNotifications ?? true,
            realTimeAlerts: data.user.preferences.realTimeAlerts ?? true,
            defaultCitationStyle: data.user.preferences.defaultCitationStyle || "IEEE",
            readerFontSize: data.user.preferences.readerFontSize || "text-base",
            readerTheme: data.user.preferences.readerTheme || "light",
            aiModelDetail: data.user.preferences.aiModelDetail || "detailed",
          });
        }
      }
    } catch (err) {
      console.warn("Error fetching profile, loading local storage:", err);
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      setFullName(localUser.name || localUser.fullName || "");
      setEmail(localUser.email || "");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/api/auth/profile", {
        fullName,
        avatar,
        bio,
        institution,
        researchInterests,
      });

      if (data.user) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.name = data.user.fullName;
        storedUser.fullName = data.user.fullName;
        storedUser.avatar = data.user.avatar;
        localStorage.setItem("user", JSON.stringify(storedUser));
      }

      toast.success("Profile details updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in current and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = async (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    try {
      await api.put("/api/auth/preferences", { preferences: updated });
      toast.success("Preferences updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update preferences");
    }
  };

  const addInterest = (e) => {
    e.preventDefault();
    if (!interestInput.trim()) return;
    if (!researchInterests.includes(interestInput.trim())) {
      setResearchInterests([...researchInterests, interestInput.trim()]);
    }
    setInterestInput("");
  };

  const removeInterest = (tag) => {
    setResearchInterests(researchInterests.filter((t) => t !== tag));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7FF]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm border border-violet-100">
            <LoaderCircle className="animate-spin text-violet-600" size={24} />
            <span className="font-semibold text-slate-700">Loading Account Settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Account & Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal profile, academic information, AI preferences, and notification settings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="flex flex-col gap-1.5 rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "profile"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <User size={18} /> Profile & Details
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "security"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <ShieldCheck size={18} /> Password & Security
              </button>

              <button
                onClick={() => setActiveTab("reader")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "reader"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <BookOpen size={18} /> Reader & AI Options
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "notifications"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <Bell size={18} /> Notifications & Alerts
              </button>
            </nav>
          </aside>

          {/* Content Panel */}
          <div className="lg:col-span-9">
            {/* ---------------- PROFILE TAB ---------------- */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="text-violet-600" size={20} /> Personal & Academic Information
                  </h2>

                  {/* Avatar Banner */}
                  <div className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 border border-violet-100">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl font-black text-white shadow-lg shadow-violet-500/30">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="h-full w-full rounded-2xl object-cover" />
                      ) : (
                        fullName ? fullName.slice(0, 2).toUpperCase() : "RN"
                      )}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-bold text-slate-900">{fullName || "Researcher"}</p>
                      <p className="text-xs text-slate-500">{email}</p>
                      <input
                        type="url"
                        placeholder="Avatar Image URL (https://...)"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Email Address (Read-only)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                        />
                        <Mail className="absolute right-3 top-3 text-slate-400" size={16} />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Institution / University / Company
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. Stanford University / DeepMind / IIT Bombay"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:outline-none pl-10"
                        />
                        <Building className="absolute left-3 top-3 text-slate-400" size={16} />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Bio / Research Focus
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Brief summary of your research domain and goals..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:outline-none"
                      />
                    </div>

                    {/* Research Interests Tags */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Research Interests & Topics
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {researchInterests.map((interest, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700"
                          >
                            <Tag size={12} /> {interest}
                            <button
                              type="button"
                              onClick={() => removeInterest(interest)}
                              className="ml-1 hover:text-rose-600"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add topic (e.g. Transformers, Quantum Computing)"
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={addInterest}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700 disabled:opacity-50"
                    >
                      {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Profile
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ---------------- SECURITY TAB ---------------- */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-violet-600" size={20} /> Password & Security
                  </h2>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:outline-none pl-10"
                        />
                        <KeyRound className="absolute left-3 top-3 text-slate-400" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:outline-none pl-10"
                        />
                        <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:outline-none pl-10"
                        />
                        <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700 disabled:opacity-50"
                    >
                      {changingPassword ? (
                        <LoaderCircle className="animate-spin" size={18} />
                      ) : (
                        <ShieldCheck size={18} />
                      )}
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ---------------- READER & AI TAB ---------------- */}
            {activeTab === "reader" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BookOpen className="text-violet-600" size={20} /> Paper Reader & AI Preferences
                  </h2>

                  <div className="space-y-6">
                    {/* Citation Style */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Default Citation Format
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CITATION_STYLES.map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => handleSavePreferences({ defaultCitationStyle: style })}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                              preferences.defaultCitationStyle === style
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reader Theme */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Default Reader Display Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3 max-w-md">
                        {[
                          { id: "light", name: "Light Mode", bg: "bg-white border-slate-200 text-slate-800" },
                          { id: "sepia", name: "Sepia Comfort", bg: "bg-[#fbf0d9] border-amber-300 text-amber-900" },
                          { id: "night", name: "Night / Dark", bg: "bg-slate-900 border-slate-700 text-white" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSavePreferences({ readerTheme: t.id })}
                            className={`flex flex-col items-center justify-center rounded-2xl p-4 border text-xs font-bold transition ${t.bg} ${
                              preferences.readerTheme === t.id ? "ring-2 ring-violet-600 shadow-md" : ""
                            }`}
                          >
                            <Palette size={18} className="mb-2" />
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reader Font Size */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Reader Font Size
                      </label>
                      <div className="flex gap-3">
                        {[
                          { id: "text-sm", label: "Small" },
                          { id: "text-base", label: "Medium (Standard)" },
                          { id: "text-lg", label: "Large" },
                        ].map((size) => (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => handleSavePreferences({ readerFontSize: size.id })}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                              preferences.readerFontSize === size.id
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Model Depth */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        AI Copilot Insight Detail Level
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: "concise", title: "Concise Summaries", desc: "Short bullet points and quick key findings" },
                          { id: "detailed", title: "Detailed Academic", desc: "Comprehensive breakdown of methods & results" },
                          { id: "academic", title: "Deep Peer Review", desc: "In-depth critique, gaps, and future directions" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSavePreferences({ aiModelDetail: m.id })}
                            className={`rounded-2xl border p-4 text-left transition ${
                              preferences.aiModelDetail === m.id
                                ? "border-violet-600 bg-violet-50/50 shadow-sm"
                                : "border-slate-200 hover:border-violet-200"
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900">{m.title}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{m.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- NOTIFICATIONS TAB ---------------- */}
            {activeTab === "notifications" && (
              <div className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Bell className="text-violet-600" size={20} /> Notification & Real-Time Alerts
                </h2>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Email Invitation Alerts</p>
                      <p className="text-xs text-slate-500">
                        Receive email notifications when a collaborator invites you to join a workspace.
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => handleSavePreferences({ emailNotifications: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  {/* Real-Time Socket Push */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Real-Time In-App Alerts & Toasts</p>
                      <p className="text-xs text-slate-500">
                        Show instant popups when team members upload papers, post discussions, or update progress.
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={preferences.realTimeAlerts}
                        onChange={(e) => handleSavePreferences({ realTimeAlerts: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
