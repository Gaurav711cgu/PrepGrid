import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Navbar from "./components/UI/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./components/Dashboard/Dashboard";
import InterviewModule from "./components/Interview/InterviewModule";
import QuizModule from "./components/Quiz/QuizModule";
import PracticePage from "./pages/PracticePage";
import PricingPage from "./pages/PricingPage";
import AdminPage from "./pages/AdminPage";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-gray-400 animate-pulse">Loading...</div></div>;
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === "admin" ? children : <Navigate to="/dashboard" replace />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/pricing" element={<PricingPage />} />

            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/interview" element={<PrivateRoute><InterviewModule /></PrivateRoute>} />
            <Route path="/quiz" element={<PrivateRoute><QuizModule /></PrivateRoute>} />
            <Route path="/practice" element={<PrivateRoute><PracticePage /></PrivateRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
