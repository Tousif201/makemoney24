// src/pages/Login.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import imglog from "../assets/login/login.jpg";
import { loginUser } from "../../api/auth";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; // Import toast from sonner

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const session = localStorage.getItem("authToken");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]); // Added navigate to dependency array for useEffect

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true before API call

    // Basic client-side validation for empty fields
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      setLoading(false); // Reset loading state
      return;
    }

    try {
      const payload = { email, password };
      const res = await loginUser(payload);

      // Check if the response indicates OTP verification is needed
      if (
        res.message &&
        res.message.includes("Your email is not verified") &&
        res.email
      ) {
          console.log("OTP verification message received, redirecting...");

        toast.info(res.message); // Show informative toast
        navigate(`/otp/${res.email}`); // Redirect to OTP verification page with email
          console.log("Navigation call made.");

        return; // Stop further execution
      }

      localStorage.setItem("authToken", res.authToken);

      toast.success("Login successful!"); // Sonner toast for success
      navigate("/"); // Redirect to home or dashboard
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed. Please try again.";
      toast.error(errorMessage); // Sonner toast for API errors
    } finally {
      setLoading(false); // Set loading to false after API call (success or failure)
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
              disabled={loading} // Disable input when loading
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-[#9b35db] focus:shadow-[0_0_10px_#9b35db] transition-all duration-300 pr-10"
                disabled={loading} // Disable input when loading
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none"
                disabled={loading} // Disable button when loading
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading} // Disable button when loading
              className="w-full p-3 rounded font-semibold bg-[#9b35db] hover:bg-[#B641FF] text-white transition duration-300 shadow-md hover:shadow-[0_0_15px_#b641ff] flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Login"
              )}
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
