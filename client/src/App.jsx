import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landing/LandingPage";
import FeatureDetail from "./pages/landing/FeatureDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/projects/Projects";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features/:slug" element={<FeatureDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;