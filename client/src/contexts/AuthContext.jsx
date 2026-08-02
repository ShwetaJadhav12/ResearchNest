import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

// Default backend URL — update if your server runs on a different host/port
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
        if (parsed.token) axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAuth = ({ user, token }) => {
    try {
      localStorage.setItem("auth", JSON.stringify({ user, token }));
      setUser(user);
      setToken(token);
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      else delete axios.defaults.headers.common["Authorization"];
    } catch (e) {
      // ignore
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("auth");
    } catch {}

    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
