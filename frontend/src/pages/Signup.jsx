import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../../api/auth"; // Adjust path as needed
import shop from "../assets/login/shopping.jpg";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      navigate(`/otp/${encodeURIComponent(form.email)}`);
    } catch (err) {
      
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-5xl border-amber-400 border-2 shadow-lg rounded-xl overflow-hidden">
        {/* Form */}
        <motion.div
          className="w-full md:w-1/2 bg-white p-10"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80 }}
        >
          <h2 className="text-3xl font-bold text-[#550b80] text-center mb-6">Signup</h2>
          <form className="space-y-4" onSubmit={handleSignup}>
            <input name="name" type="text" required placeholder="Full Name" className="w-full p-3 rounded bg-gray-100 text-black" onChange={handleChange} />
            <input name="email" type="email" required placeholder="Email" className="w-full p-3 rounded bg-gray-100 text-black" onChange={handleChange} />
            <input name="phone" type="tel" required placeholder="Phone" className="w-full p-3 rounded bg-gray-100 text-black" onChange={handleChange} />
            <input name="password" type="password" required placeholder="Password" className="w-full p-3 rounded bg-gray-100 text-black" onChange={handleChange} />
            <input name="referralCode" type="text" placeholder="Referral code" className="w-full p-3 rounded bg-gray-100 text-black" onChange={handleChange} />
            <button type="submit" className="w-full p-3 bg-[#B641FF] hover:bg-[#B209FF] text-white rounded">Register</button>
          </form>
        </motion.div>

        {/* Image */}
        <motion.div className="hidden md:block md:w-1/2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}>
          <img src={shop} alt="Signup visual" className="w-full h-full object-cover brightness-75" />
        </motion.div>
      </div>
    </div>
  );
}
