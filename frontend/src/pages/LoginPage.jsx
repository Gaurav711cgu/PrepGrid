import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL;

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">PrepGrid</h1>
          <p className="text-gray-500 mt-2">Welcome back — let's keep the streak going 🔥</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Email</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Password</label>
              <input
                type="password" required value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-cyan-400 hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">PrepGrid</h1>
          <p className="text-gray-500 mt-2">Create your free account and start preparing 🚀</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: "Full Name", type: "text", placeholder: "Arjun Sharma" },
              { key: "email", label: "Email", type: "email", placeholder: "arjun@example.com" },
              { key: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-gray-400 text-sm block mb-1.5">{label}</label>
                <input
                  type={type} required value={form[key]} placeholder={placeholder}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            ))}
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
            >
              {loading ? "Creating account..." : "Create Free Account →"}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
