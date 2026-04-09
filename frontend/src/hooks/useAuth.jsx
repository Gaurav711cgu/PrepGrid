import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pg_token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pg_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) { setUser(data); localStorage.setItem("pg_user", JSON.stringify(data)); }
        else logout();
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, [token]);

  const login = ({ token: t, user: u }) => {
    localStorage.setItem("pg_token", t);
    localStorage.setItem("pg_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("pg_token");
    localStorage.removeItem("pg_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
