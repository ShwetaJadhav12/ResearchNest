import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  LoaderCircle,
  FileText,
  ArrowRight,
  Plus,
  Users,
  Sparkles,
  BookOpen,
  X,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Projects() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Workspace Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchWorkspaces = () => {
    setLoading(true);
    api
      .get("/api/workspaces")
      .then(({ data }) => setWorkspaces(data.workspaces || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load workspaces."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const { data } = await api.post("/api/workspaces", {
        name: name.trim(),
        description: description.trim(),
        topic: topic.trim() || "Research",
      });

      toast.success("Workspace created!");
      setShowCreateModal(false);
      setName("");
      setDescription("");
      setTopic("");
      navigate(`/projects/${data.workspace._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create workspace.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              Feature 1 & 5 Connected
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900 md:text-4xl">
              Research Workspaces
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Centralized project spaces connecting your papers, AI summaries, reading notes, and collaborative team research.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus size={18} />
            <span>New Workspace</span>
          </button>
        </div>

        {/* Workspaces List */}
        {loading ? (
          <div className="flex justify-center py-24 text-violet-600">
            <LoaderCircle className="animate-spin" size={32} />
          </div>
        ) : error ? (
          <p className="mt-8 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
        ) : workspaces.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                className="group flex flex-col justify-between rounded-3xl border border-violet-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
                      {workspace.topic || "Research"}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        workspace.isOwner
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {workspace.isOwner ? "Owner" : workspace.userRole || "Member"}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-violet-700 transition">
                    {workspace.name}
                  </h2>

                  <p className="mt-2 min-h-12 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {workspace.description || "Research project collection"}
                  </p>

                  <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} className="text-violet-500" />
                      {workspace.papersCount || 0} papers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-fuchsia-500" />
                      {workspace.membersCount || 1} members
                    </span>
                  </div>
                </div>

                <Link
                  to={`/projects/${workspace._id}`}
                  className="mt-6 inline-flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-bold text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white"
                >
                  <span>Open Workspace</span>
                  <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-violet-200 bg-white p-16 text-center">
            <FolderKanban className="mx-auto text-violet-300" size={42} />
            <h2 className="mt-4 text-xl font-bold text-slate-800">No workspaces yet</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Create your first research project workspace to start uploading and discovering papers.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
            >
              <Plus size={16} /> Create Workspace
            </button>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* CREATE WORKSPACE MODAL */}
      {/* ---------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Create Research Workspace</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Workspace Title
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Graph Neural Networks Research"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Research Topic / Discipline
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Computer Science / Bioinformatics"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of research questions and goals..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-2.5 text-xs outline-none focus:border-violet-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-40 shadow-sm"
                >
                  {creating ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
