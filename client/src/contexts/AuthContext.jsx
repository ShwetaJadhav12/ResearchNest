import React, {
  createContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

// Vite environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Configure Axios
axios.defaults.baseURL = API_BASE_URL;

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  void React;
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // LOAD SAVED AUTHENTICATION
  // -----------------------------------------

  useEffect(() => {
    try {
      // First check the new auth storage
      const authData = localStorage.getItem("auth");

      if (authData) {
        const parsed = JSON.parse(authData);

        if (parsed?.user) {
          setUser(parsed.user);
        }

        if (parsed?.token) {
          setToken(parsed.token);

          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${parsed.token}`;
        }
      } else {
        /*
         * Backward compatibility with your
         * existing Login.jsx
         */
        const oldToken =
          localStorage.getItem("token");

        const oldUser =
          localStorage.getItem("user");

        if (oldToken) {
          setToken(oldToken);

          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${oldToken}`;
        }

        if (oldUser) {
          try {
            setUser(JSON.parse(oldUser));
          } catch {
            console.log(
              "Invalid stored user data"
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Failed to restore authentication:",
        error
      );

      localStorage.removeItem("auth");
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------
  // SAVE LOGIN
  // -----------------------------------------

  const saveAuth = ({
    user,
    token,
  }) => {
    try {
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user,
          token,
        })
      );

      // Also keep your existing storage
      // working with Navbar/Login
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "token",
        token
      );

      setUser(user);
      setToken(token);

      if (token) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error(
        "Failed to save authentication:",
        error
      );
    }
  };

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);

    delete axios.defaults.headers.common[
      "Authorization"
    ];
  };

  // -----------------------------------------
  // CONTEXT
  // -----------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        saveAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
