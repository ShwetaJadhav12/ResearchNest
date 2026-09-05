import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FolderKanban,
  FileText,
  Users,
  MessageSquare,
  Highlighter,
  Sparkles,
  Activity as ActivityIcon,
  CheckCircle2,
  Clock,
  Plus,
  UserPlus,
  Upload,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Shield,
  Trash2,
  Send,
  LoaderCircle,
  MoreVertical,
  Compass,
  Check,
  AlertCircle,
  Download,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Active Tab: "papers", "team", "discussions", "notes", "saved_ai", "activity", "progress"
  const [activeTab, setActiveTab] = useState("papers");

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);

  // Discussion state
  const [discussionInput, setDiscussionInput] = useState("");
  const [selectedPaperForDiscussion, setSelectedPaperForDiscussion] = useState("");
  const [postingDiscussion, setPostingDiscussion] = useState(false);

  // Upload Modal
  const [uploading, setUploading] = useState(false);

  // Progress state
  const [progressStatus, setProgressStatus] = useState("reading");
  const [newMilestone, setNewMilestone] = useState("");

  // ----------------------------------------------------
  // FETCH COLLABORATION HUB DATA
  // ----------------------------------------------------
  const fetchHubData = async () => {
    try {
      const { data } = await api.get(`/api/collaboration/${workspaceId}/hub`);
      setHubData(data);
      if (data.workspace?.progress?.status) {
        setProgressStatus(data.workspace.progress.status);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [workspaceId]);

  // ----------------------------------------------------
  // INVITE MEMBER
  // ----------------------------------------------------
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const { data } = await api.post(`/api/collaboration/${workspaceId}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      toast.success(data.message || "Invitation sent!");
      setShowInviteModal(false);
      setInviteEmail("");
      fetchHubData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite member.");
    } finally {
      setInviting(false);
    }
  };

  // ----------------------------------------------------
  // UPDATE MEMBER ROLE
  // ----------------------------------------------------
  const handleRoleChange = async (memberUserId, newRole) => {
    try {
      await api.patch(`/api/collaboration/${workspaceId}/members/${memberUserId}`, {
        role: newRole,
      });
      toast.success("Updated permissions");
      fetchHubData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  // ----------------------------------------------------
  // REMOVE MEMBER
  // ----------------------------------------------------
  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm("Are you sure you want to remove this member from the workspace?")) return;
    try {
      await api.delete(`/api/collaboration/${workspaceId}/members/${memberUserId}`);
      toast.success("Member removed");
      fetchHubData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  // ----------------------------------------------------
  // POST DISCUSSION MESSAGE
  // ----------------------------------------------------
  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!discussionInput.trim()) return;

    setPostingDiscussion(true);
    try {
      await api.post(`/api/collaboration/${workspaceId}/discussions`, {
        message: discussionInput.trim(),
        paperId: selectedPaperForDiscussion || undefined,
      });

      setDiscussionInput("");
      setSelectedPaperForDiscussion("");
      fetchHubData();
      toast.success("Posted to discussions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post message");
    } finally {
      setPostingDiscussion(false);
    }
  };

  // ----------------------------------------------------
  // UPDATE PROGRESS
  // ----------------------------------------------------
  const handleUpdateProgressStatus = async (newStatus) => {
    setProgressStatus(newStatus);
    try {
      await api.patch(`/api/collaboration/${workspaceId}/progress`, {
        status: newStatus,
      });
      toast.success(`Project phase updated to ${newStatus}`);
      fetchHubData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update progress");
    }
  };

  const handleToggleMilestone = async (milestoneIdx) => {
    const currentMilestones = [...(hubData?.workspace?.progress?.milestones || [])];
    if (!currentMilestones[milestoneIdx]) return;

    currentMilestones[milestoneIdx].completed = !currentMilestones[milestoneIdx].completed;

    try {
      await api.patch(`/api/collaboration/${workspaceId}/progress`, {
        milestones: currentMilestones,
      });
      fetchHubData();
    } catch (err) {
      toast.error("Failed to update milestone");
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.trim()) return;

    const currentMilestones = [...(hubData?.workspace?.progress?.milestones || [])];
    currentMilestones.push({ title: newMilestone.trim(), completed: false });

    try {
      await api.patch(`/api/collaboration/${workspaceId}/progress`, {
        milestones: currentMilestones,
      });
      setNewMilestone("");
      fetchHubData();
      toast.success("Added milestone");
    } catch (err) {
      toast.error("Failed to add milestone");
    }
  };

  // ----------------------------------------------------
  // UPLOAD PAPER DIRECTLY INTO THIS WORKSPACE
  // ----------------------------------------------------
  const handleUploadPaper = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceId", workspaceId);

    setUploading(true);
    try {
      await api.post("/api/papers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Paper uploaded directly to this workspace!");
      fetchHubData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Paper upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7FF]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm border border-violet-100">
            <LoaderCircle className="animate-spin text-violet-600" size={24} />
            <span className="font-semibold text-slate-700">Loading Research Workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hubData) {
    return (
      <div className="min-h-screen bg-[#FAF7FF]">
        <Navbar />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <div className="rounded-3xl border border-rose-100 bg-white p-10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Workspace Unavailable</h2>
            <p className="mt-2 text-sm text-slate-500">{error || "Workspace not found."}</p>
            <Link
              to="/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <ArrowLeft size={16} /> Back to Workspaces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { workspace, currentUserRole, isOwner, papers, activities, discussions, savedResearch, stats } =
    hubData;

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------- */}
        {/* WORKSPACE HERO COMMAND CENTER */}
        {/* ---------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-900 via-purple-900 to-slate-950 p-8 text-white shadow-xl md:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          {/* Breadcrumb Back */}
          <Link
            to="/projects"
            className="relative z-10 mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-200 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to All Workspaces
          </Link>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-200">
                  {workspace.topic || "Research Workspace"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    currentUserRole === "admin"
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : currentUserRole === "editor"
                      ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-slate-400/20 text-slate-300"
                  }`}
                >
                  Your Role: {currentUserRole}
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                {workspace.name}
              </h1>

              <p className="mt-2 text-sm text-violet-100/80 max-w-2xl">
                {workspace.description || "Central project workspace for collaborative academic research."}
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              {currentUserRole === "admin" && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur hover:bg-white/20 transition"
                >
                  <UserPlus size={15} /> Invite Member
                </button>
              )}

              <Link
                to="/discovery"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur hover:bg-white/20 transition"
              >
                <Compass size={15} /> Discover Papers
              </Link>

              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-violet-900 shadow-md hover:bg-violet-50 transition"
              >
                <Sparkles size={15} /> AI Assistant
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-2xl font-black">{stats.totalPapers}</p>
              <p className="text-xs text-violet-200">Papers in library</p>
            </div>
            <div>
              <p className="text-2xl font-black">{stats.totalMembers}</p>
              <p className="text-xs text-violet-200">Team members</p>
            </div>
            <div>
              <p className="text-2xl font-black">{stats.totalNotes}</p>
              <p className="text-xs text-violet-200">Highlights & notes</p>
            </div>
            <div>
              <p className="text-2xl font-black capitalize">{progressStatus}</p>
              <p className="text-xs text-violet-200">Project phase</p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* TABS NAVIGATION BAR */}
        {/* ---------------------------------------------------- */}
        <div className="mt-8 border-b border-slate-200">
          <div className="flex flex-wrap gap-1">
            {[
              { id: "papers", label: `Papers (${papers.length})`, icon: FileText },
              { id: "team", label: `Team Members (${stats.totalMembers})`, icon: Users },
              { id: "discussions", label: `Discussions (${discussions.length})`, icon: MessageSquare },
              { id: "saved_ai", label: `Saved AI Research (${savedResearch.length})`, icon: Sparkles },
              { id: "activity", label: `Activity Feed`, icon: ActivityIcon },
              { id: "progress", label: `Milestones & Goals`, icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                    active
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: PAPERS IN WORKSPACE */}
        {/* ---------------------------------------------------- */}
        {activeTab === "papers" && (
          <div className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Workspace Research Library</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploaded PDFs and discovered papers connected to this project.
                </p>
              </div>

              {currentUserRole !== "viewer" && (
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-xs font-bold text-violet-700 hover:bg-violet-50 transition shadow-sm">
                    <Upload size={14} />
                    <span>{uploading ? "Uploading..." : "Upload PDF"}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={uploading}
                      onChange={handleUploadPaper}
                      className="hidden"
                    />
                  </label>

                  <Link
                    to="/discovery"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition shadow-sm"
                  >
                    <Plus size={14} /> Add from Discovery
                  </Link>
                </div>
              )}
            </div>

            {!papers.length ? (
              <div className="rounded-3xl border border-dashed border-violet-200 bg-white p-16 text-center">
                <FileText size={38} className="mx-auto text-violet-300" />
                <h3 className="mt-4 text-lg font-bold text-slate-800">No papers in this workspace yet</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                  Upload PDF research papers or search academic papers in Discovery to populate this workspace.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    to="/discovery"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
                  >
                    <Compass size={15} /> Search Academic Papers
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {papers.map((paper) => (
                  <div
                    key={paper._id}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-semibold text-violet-700">
                          {paper.topic || "Research"}
                        </span>
                        <span className="text-slate-400">{paper.year || "Recent"}</span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-violet-700 transition line-clamp-2">
                        {paper.title || paper.filename}
                      </h3>

                      <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                        {paper.authors?.join(", ") || "Unknown authors"}
                      </p>

                      {paper.abstract && (
                        <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                          {paper.abstract}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <Link
                        to={`/reader/${paper._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800"
                      >
                        <BookOpen size={14} /> Open in Reader
                      </Link>

                      <a
                        href={`/api/papers/${paper._id}/download`}
                        download
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700"
                      >
                        <Download size={13} /> PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: TEAM MEMBERS & ROLES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "team" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Workspace Researchers</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage permissions, invited collaborators, and roles.
                </p>
              </div>

              {currentUserRole === "admin" && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 shadow-sm"
                >
                  <UserPlus size={14} /> Invite Researcher
                </button>
              )}
            </div>

            {/* Members Table */}
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {/* Owner */}
                <div className="flex items-center justify-between p-5 bg-violet-50/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 font-bold text-white text-sm">
                      {workspace.createdBy?.fullName?.charAt(0) || "O"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {workspace.createdBy?.fullName || "Workspace Owner"}
                        </span>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                          Owner (Admin)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{workspace.createdBy?.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Full Access</span>
                </div>

                {/* Team Members */}
                {workspace.members?.map((member) => (
                  <div key={member.user?._id || member._id} className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-700 text-sm">
                        {member.user?.fullName?.charAt(0) || member.email?.charAt(0) || "U"}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900">
                          {member.user?.fullName || member.email}
                        </span>
                        <p className="text-xs text-slate-500">{member.user?.email || member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {currentUserRole === "admin" ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user?._id, e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-violet-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                          {member.role}
                        </span>
                      )}

                      {currentUserRole === "admin" && (
                        <button
                          onClick={() => handleRemoveMember(member.user?._id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 transition"
                          title="Remove member"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invitations */}
            {workspace.invitedEmails?.length > 0 && (
              <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                  Pending Invitations ({workspace.invitedEmails.length})
                </h4>
                <div className="space-y-2">
                  {workspace.invitedEmails.map((inv, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-amber-900">
                      <span>{inv.email}</span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-bold uppercase text-[10px]">
                        Role: {inv.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: TEAM DISCUSSIONS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "discussions" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Discussion Feed */}
            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[600px]">
              <div className="border-b border-slate-100 p-4 bg-slate-50">
                <h3 className="font-bold text-sm text-slate-800">Team Research Discussion Board</h3>
                <p className="text-xs text-slate-500">
                  Discuss methodology, share notes, and debate paper findings.
                </p>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {!discussions.length ? (
                  <div className="py-20 text-center text-xs text-slate-400">
                    <MessageSquare size={30} className="mx-auto mb-2 text-violet-300 opacity-60" />
                    No discussion messages yet. Start the conversation with your team!
                  </div>
                ) : (
                  discussions.map((msg) => (
                    <div key={msg._id} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700 text-xs">
                        {msg.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {msg.user?.fullName || "Researcher"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {msg.paper && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                            <BookOpen size={11} /> Re: {msg.paper.title || msg.paper.filename}
                          </div>
                        )}

                        <p className="mt-1.5 text-xs leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              {currentUserRole !== "viewer" && (
                <form onSubmit={handlePostDiscussion} className="border-t border-slate-100 p-4 bg-white">
                  {papers.length > 0 && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Reference Paper:</span>
                      <select
                        value={selectedPaperForDiscussion}
                        onChange={(e) => setSelectedPaperForDiscussion(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none"
                      >
                        <option value="">General Project Topic</option>
                        {papers.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title?.slice(0, 45) || p.filename}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
                    <input
                      value={discussionInput}
                      onChange={(e) => setDiscussionInput(e.target.value)}
                      placeholder="Share a research query, insight, or note with the team..."
                      className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={postingDiscussion || !discussionInput.trim()}
                      className="rounded-xl bg-violet-600 p-2 text-white hover:bg-violet-700 transition disabled:opacity-40"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Side Research Context */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">
                  Discussion Guidelines
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use this space to synthesize methodologies, debate statistical findings, and coordinate writing sections.
                  You can reference specific papers in your message to contextualize discussion.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Workspace Papers Quick Links
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {papers.map((p) => (
                    <Link
                      key={p._id}
                      to={`/reader/${p._id}`}
                      className="block rounded-xl border border-slate-100 p-2 text-xs font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                    >
                      <p className="truncate">{p.title || p.filename}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: SAVED AI RESEARCH */}
        {/* ---------------------------------------------------- */}
        {activeTab === "saved_ai" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Shared AI Research Outputs</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Literature reviews, academic surveys, and comparisons generated for this workspace.
                </p>
              </div>

              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 shadow-sm"
              >
                <Sparkles size={14} /> Open AI Assistant
              </Link>
            </div>

            {!savedResearch.length ? (
              <div className="rounded-3xl border border-dashed border-violet-200 bg-white p-16 text-center">
                <Sparkles size={38} className="mx-auto text-violet-300" />
                <h3 className="mt-4 text-lg font-bold text-slate-800">No generated research saved yet</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                  Open the AI Research Assistant to synthesize literature reviews or draft academic papers with IEEE/APA citations.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedResearch.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-violet-300 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-violet-700">
                          {item.toolType.replace("_", " ")}
                        </span>
                        {item.citationStyle && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            Style: {item.citationStyle}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-4 text-xs text-slate-700 leading-relaxed max-h-60 overflow-y-auto pr-1">
                      {typeof item.content === "string" ? (
                        <p>{item.content}</p>
                      ) : item.content?.content ? (
                        <div>
                          <p className="whitespace-pre-line">{item.content.content}</p>
                          {item.content.references?.length > 0 && (
                            <div className="mt-4 border-t border-slate-100 pt-3">
                              <p className="font-bold text-slate-900 mb-2">References:</p>
                              {item.content.references.map((r, i) => (
                                <p key={i} className="text-slate-600 mb-1">
                                  [{r.index || i + 1}] {r.text}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <pre className="text-[11px] font-mono">{JSON.stringify(item.content, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: ACTIVITY AUDIT FEED */}
        {/* ---------------------------------------------------- */}
        {activeTab === "activity" && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Project Activity Stream</h2>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {!activities.length ? (
                <p className="text-xs text-slate-400 py-8 text-center">No recorded activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((act) => (
                    <div key={act._id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <ActivityIcon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800">{act.description}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: PROGRESS & MILESTONES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "progress" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Phase Selector */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-1">Research Phase</h3>
              <p className="text-xs text-slate-500 mb-4">
                Update the project status to keep teammates aligned on the current objective.
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {["discovery", "reading", "analyzing", "writing", "completed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateProgressStatus(st)}
                    className={`rounded-2xl border p-4 text-left capitalize transition ${
                      progressStatus === st
                        ? "border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm">{st}</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {st === "discovery"
                        ? "Gathering papers"
                        : st === "reading"
                        ? "Annotation & notes"
                        : st === "analyzing"
                        ? "Cross-paper synthesis"
                        : st === "writing"
                        ? "Drafting publication"
                        : "Research finished"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Milestones Checklist */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-1">Project Milestones</h3>
              <p className="text-xs text-slate-500 mb-4">Track progress goals across team members.</p>

              <div className="space-y-2.5">
                {(workspace.progress?.milestones || []).map((ms, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={ms.completed}
                      onChange={() => handleToggleMilestone(idx)}
                      className="h-4 w-4 rounded text-violet-600 focus:ring-violet-500"
                    />
                    <span
                      className={`text-xs font-medium ${
                        ms.completed ? "line-through text-slate-400" : "text-slate-800"
                      }`}
                    >
                      {ms.title}
                    </span>
                  </label>
                ))}
              </div>

              {/* Add Milestone Input */}
              <form onSubmit={handleAddMilestone} className="mt-4 flex gap-2">
                <input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="New milestone goal..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={!newMilestone.trim()}
                  className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-40 shrink-0"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* INVITE MEMBER MODAL */}
      {/* ---------------------------------------------------- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Invite Team Member</h3>
            <p className="mt-1 text-xs text-slate-500">
              Invite a student or researcher to collaborate on "{workspace.name}".
            </p>

            <form onSubmit={handleInvite} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Collaborator Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="researcher@university.edu"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role & Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-violet-500"
                >
                  <option value="editor">Editor (Can upload papers, write notes, run AI)</option>
                  <option value="viewer">Viewer (Can read papers and view AI outputs)</option>
                  <option value="admin">Admin (Can manage members and settings)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-40 shadow-sm"
                >
                  {inviting ? "Inviting..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
