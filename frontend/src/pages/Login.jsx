import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542834369-f10ebf06d3cb')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px) brightness(0.5)"
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-md p-8 rounded-xl text-white shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        <form className="space-y-4">
          <input
            type="email" required
            placeholder="Email"
            className="w-full p-3 rounded bg-white text-black"
          />
          <input
            type="password"required
            placeholder="Password"
            className="w-full p-3 rounded bg-white text-black"
          />
          <button
            type="submit"
            className="w-full p-3 rounded font-semibold bg-[#9b35db] hover:bg-[#B641FF]"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="underline font-medium">
            Signup
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
