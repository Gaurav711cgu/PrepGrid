import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_LINKS = [
  { href: "/interview", label: "Interview", icon: "🎤" },
  { href: "/quiz", label: "Quiz", icon: "⚡" },
  { href: "/practice", label: "Practice", icon: "💻" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
];

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-black text-lg bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            PrepGrid
          </span>
        </Link>

        {/* Desktop Nav */}
        {token && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              {user?.plan === "free" && (
                <Link to="/pricing" className="hidden md:flex items-center gap-1 text-xs px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full hover:bg-yellow-500/20 transition-colors">
                  ✨ Upgrade to Pro
                </Link>
              )}
              <span className="hidden md:block text-gray-500 text-sm">{user?.name?.split(" ")[0]}</span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Sign in</Link>
              <Link to="/register" className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
