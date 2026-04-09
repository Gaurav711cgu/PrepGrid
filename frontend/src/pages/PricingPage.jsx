import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const FREE_FEATURES = [
  "5 AI interviews per month",
  "10 quiz generations per month",
  "50 coding problems per day",
  "Basic dashboard & streaks",
  "Email OTP auth",
];

const PRO_FEATURES = [
  "Unlimited AI interviews",
  "Unlimited quiz generations",
  "All 2,400+ coding problems",
  "AI weak area detection",
  "Full session history",
  "Priority support",
  "Leaderboard badges",
];

export default function PricingPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!token) { navigate("/register"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "PrepGrid",
        description: "Pro Plan — 1 Month",
        order_id: order.orderId,
        handler: async (response) => {
          const verifyRes = await fetch(`${API}/payments/verify`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) { alert("🎉 Pro activated! Enjoy unlimited access."); navigate("/dashboard"); }
          else alert("Payment verification failed. Contact support.");
        },
        theme: { color: "#06b6d4" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-black mb-4">Simple, honest pricing</h1>
          <p className="text-gray-400">Start free. Upgrade when you're ready to go all-in.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-xl font-bold mb-1">Free</h2>
            <div className="text-4xl font-black mb-1">₹0</div>
            <p className="text-gray-500 text-sm mb-6">Forever free, no credit card</p>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-green-400">✓</span>{f}
                </li>
              ))}
            </ul>
            {user?.plan === "free" || !user ? (
              <div className="w-full py-3 bg-gray-800 rounded-xl text-center text-gray-400 font-medium">Current Plan</div>
            ) : null}
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-b from-cyan-950/50 to-violet-950/50 rounded-2xl p-8 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs bg-yellow-500 text-black font-bold px-3 py-1 rounded-full">POPULAR</div>
            <h2 className="text-xl font-bold mb-1">Pro</h2>
            <div className="text-4xl font-black mb-1">
              ₹499
              <span className="text-lg font-normal text-gray-400">/month</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Billed monthly, cancel anytime</p>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-200 text-sm">
                  <span className="text-cyan-400">✓</span>{f}
                </li>
              ))}
            </ul>
            {user?.plan === "pro" ? (
              <div className="w-full py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center text-green-400 font-medium">
                ✓ Active Pro Member
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Opening checkout..." : "Upgrade to Pro →"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Razorpay sandbox — use card 4111 1111 1111 1111 · CVV: any 3 digits · Expiry: any future date
        </p>
      </div>
    </div>
  );
}
