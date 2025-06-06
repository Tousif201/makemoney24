import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../../api/auth"; // Adjust path as needed
import shop from "../assets/login/shopping.jpg";
import { Link } from "react-router-dom";
import { toast } from "sonner"; // Import toast from sonner

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // New loading state

  // Effect to read referralCode from URL search params on component mount
  useEffect(() => {
    const referralFromUrl = searchParams.get("referralCode");
    if (referralFromUrl) {
      setForm((prevForm) => ({ ...prevForm, referralCode: referralFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full Name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be 10 digits.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form."); // Sonner toast for form validation errors
      return;
    }

    setIsLoading(true); // Set loading to true before API call
    try {
      await registerUser({ ...form, referredByCode: form.referralCode });
      toast.success("Registration successful! Please verify your email."); // Sonner toast for success
      navigate(`/otp/${encodeURIComponent(form.email)}`);
    } catch (err) {
      const errorMessage =
        err.message || "Something went wrong during registration.";
      toast.error(errorMessage); // Sonner toast for API errors
    } finally {
      setIsLoading(false); // Set loading to false after API call (success or failure)
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
          <h2 className="text-3xl font-bold text-[#550b80] text-center mb-6">
            Signup
          </h2>
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <input
                name="name"
                type="text"
                required
                placeholder="Full Name"
                className={`w-full p-3 rounded bg-gray-100 text-black ${
                  errors.name ? "border-red-500 border" : ""
                }`}
                onChange={handleChange}
                value={form.name}
                disabled={isLoading} // Disable input when loading
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className={`w-full p-3 rounded bg-gray-100 text-black ${
                  errors.email ? "border-red-500 border" : ""
                }`}
                onChange={handleChange}
                value={form.email}
                disabled={isLoading} // Disable input when loading
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                name="phone"
                type="tel"
                required
                placeholder="Phone"
                className={`w-full p-3 rounded bg-gray-100 text-black ${
                  errors.phone ? "border-red-500 border" : ""
                }`}
                onChange={handleChange}
                value={form.phone}
                disabled={isLoading} // Disable input when loading
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className={`w-full p-3 rounded bg-gray-100 text-black ${
                  errors.password ? "border-red-500 border" : ""
                }`}
                onChange={handleChange}
                value={form.password}
                disabled={isLoading} // Disable input when loading
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <input
                name="referralCode"
                type="text"
                placeholder="Referral code (Optional)"
                className="w-full p-3 rounded bg-gray-100 text-black"
                onChange={handleChange}
                value={form.referralCode}
                disabled={isLoading} // Disable input when loading
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-[#B641FF] hover:bg-[#B209FF] text-white rounded flex items-center justify-center"
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? (
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
                "Register"
              )}
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-[#550b80] underline font-medium">
              Login
            </Link>
          </p>
        </motion.div>

        {/* Image */}
        <motion.div
          className="hidden md:block md:w-1/2"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img
            src={shop}
            alt="Signup visual"
            className="w-full h-full object-cover brightness-75"
          />
        </motion.div>
      </div>
    </div>
  );
}
