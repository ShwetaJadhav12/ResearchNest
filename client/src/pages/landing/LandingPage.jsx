import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/landing/Hero";
import Stats from "../../components/landing/Stats";
import Workflow from "../../components/landing/Workflow";
import Features from "../../components/landing/Features";
import Footer from "../../components/landing/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // When user is logged in, immediately route them to the unified dashboard
  useEffect(() => {
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, token, user]);

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-900 flex flex-col justify-between selection:bg-purple-200 selection:text-purple-900">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <Stats />
        <Workflow />
        <Features />
      </main>

      <Footer />
    </div>
  );
}