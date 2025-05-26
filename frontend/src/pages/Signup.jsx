import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import shop from "../assets/login/shoping.jpg"

export default function Signup() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: `url(${shop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: " brightness(0.5)"
        }}
      />
      <motion.div
        className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-md p-8 rounded-xl text-white shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6">Signup</h2>
        <form className="space-y-4">
          <input
            type="text" required
            placeholder="Full Name"
            className="w-full p-3 rounded bg-white text-black"
          />
          <input
            type="email" required
            placeholder="Email"
            className="w-full p-3 rounded bg-white text-black"
          />
          <input
            type="phone" required
            placeholder="Phone"
            className="w-full p-3 rounded bg-white text-black"
          />
          <input
            type="password" required
            placeholder="Password"
            className="w-full p-3 rounded bg-white text-black"
          />
          <input
            type="referralcode" required
            placeholder="referralcode(optional)"
            className="w-full p-3 rounded bg-white text-black"
          />
          <button
            type="submit"
            className="w-full p-3 rounded font-semibold bg-[#B641FF] hover:bg-[#B209FF]"
          >
            Signup
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
