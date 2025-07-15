// src/pages/AffiliateLogin.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginAffiliate } from "../../api/auth";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAffiliateLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginAffiliate({ email, password });

      // 🔐 OTP Not Verified Flow
      if (res.message?.includes("not verified")) {
        toast.info(res.message); // Inform user
        // Optionally redirect to OTP verification page
        navigate(`/verify-otp?email=${res.email}`);
        return;
      }

      // ✅ Successful Login
      if (res?.authToken) {
        localStorage.setItem("authToken", res.authToken);
        localStorage.setItem("activeRole", res.user.roles); // Save actual role
        toast.success("Logged in successfully as Affiliate!");
        navigate("/dashboard");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/30 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          ShopNship Affiliate Login
        </h2>

        <form onSubmit={handleAffiliateLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-md bg-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 rounded-md bg-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-md shadow-md hover:shadow-xl transition-all duration-300"
          >
            {loading ? "Logging in..." : "Login as ShopNship Affiliate"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
