import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";

export default function LandingPage() {
  return (
    <div className="bg-[#FAF7FF]">
      <Navbar />

      <Hero />

      <Features />
    </div>
  );
}