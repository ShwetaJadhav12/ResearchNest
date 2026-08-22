import { motion } from "framer-motion";
import {
  FolderOpen,
  Bot,
  Share2,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="rounded-[32px] border border-violet-100 bg-white p-7 shadow-[0_20px_60px_rgba(124,58,237,0.12)]">

        {/* Header */}
        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Research Workspace
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your intelligent research companion
            </p>
          </div>

          <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            ● AI Active
          </div>

        </div>

    

        {/* Modules */}

        <div className="mt-6 space-y-3">

          <DashboardItem
            icon={<FolderOpen size={22} />}
            color="text-blue-600"
            title="My Papers"
            value="42 Papers"
          />

          <DashboardItem
            icon={<Bot size={22} />}
            color="text-pink-600"
            title="AI Assistant"
            value="Ready"
          />

          <DashboardItem
            icon={<Share2 size={22} />}
            color="text-emerald-600"
            title="Knowledge Graph"
            value="312 Concepts"
          />

          <DashboardItem
            icon={<BarChart3 size={22} />}
            color="text-orange-500"
            title="Research Insights"
            value="+7 This Week"
          />

        </div>

        {/* Activity */}

        <div className="mt-8">

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Recent Activity
          </h3>

          <div className="space-y-3">

            <Activity text="Uploaded Attention Is All You Need.pdf" />

            <Activity text="AI generated research summary" />

            <Activity text="Literature review completed" />

          </div>

        </div>


      </div>
    </motion.div>
  );
}

function DashboardItem({ icon, title, value, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition-all duration-300 hover:border-violet-200 hover:shadow-md">

      <div className="flex items-center gap-4">

        <div className={`rounded-xl bg-slate-50 p-3 ${color}`}>
          {icon}
        </div>

        <span className="font-medium text-slate-700">
          {title}
        </span>

      </div>

      <span className="text-sm font-medium text-slate-500">
        {value}
      </span>

    </div>
  );
}

function Activity({ text }) {
  return (
    <div className="flex items-center gap-3">

      <CheckCircle2
        size={16}
        className="text-emerald-500"
      />

      <span className="text-sm text-slate-600">
        {text}
      </span>

    </div>
  );
}
