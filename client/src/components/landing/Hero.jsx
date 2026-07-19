import { motion } from "framer-motion";
import Button from "../ui/Button";
import HeroPreview from "./HeroPreview";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl"></div>
      <div className="absolute top-32 right-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl"></div>

      <div className="relative mx-auto grid min-h-[90vh] max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
            ✨ AI-Powered Research Workspace
          </span>

          <h1 className="mt-8 text-6xl font-bold leading-tight text-slate-900">
            Research
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              {" "}Smarter.
            </span>

            <br />

            Organize Everything.
          </h1>

          <p className="mt-8 text-lg leading-8 text-slate-600">
            Upload research papers, generate AI summaries,
            chat with documents, create literature reviews,
            and manage all your research in one workspace.
          </p>

          <div className="mt-10 flex gap-5">
            <Button>
              Get Started
            </Button>

            <Button variant="secondary">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Right Side */}
        <HeroPreview />

      </div>
    </section>
  );
}