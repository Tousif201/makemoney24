// src/pages/Login.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import imglog from "../assets/login/login.jpg";
import { loginUser } from "../../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const session = localStorage.getItem("authToken")
  useEffect(() => {
    if (session) {
      navigate("/dashboard")
    }
  }, [session])

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { email, password };
      const res = await loginUser(payload);

      // Save token or user info in localStorage or context
      localStorage.setItem("authToken", res.authToken);

      alert("✅ Login successful");
      navigate("/"); // Redirect to home or dashboard
    } catch (err) {
      alert(`❌ ${err.message || "Login failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        className="flex w-full max-w-5xl shadow-lg rounded-xl overflow-hidden transition-all duration-300"
        whileHover={{
          boxShadow: "0 0 30px 4px rgba(182, 65, 255, 0.6)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {/* Login Form */}
        <motion.div
          className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80 }}
        >
          <h2 className="text-3xl font-bold text-[#550b80] text-center mb-6">
            Login
          </h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-[#9b35db] focus:shadow-[0_0_10px_#9b35db] transition-all duration-300"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-[#9b35db] focus:shadow-[0_0_10px_#9b35db] transition-all duration-300"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full p-3 rounded font-semibold bg-[#9b35db] hover:bg-[#B641FF] text-white transition duration-300 shadow-md hover:shadow-[0_0_15px_#b641ff]"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-700">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#550b80] underline font-medium"
            >
              Signup
            </Link>
          </p>
        </motion.div>

        {/* Right Side Image */}
        <motion.div
          className="hidden md:block md:w-1/2 relative overflow-hidden"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.img
            src={imglog}
            alt="Login Visual"
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
