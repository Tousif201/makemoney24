import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../../api/auth"; // Adjust path as needed
import shop from "../assets/login/shopping.jpg";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { uploadFiles } from "../../api/upload";
import { X } from "lucide-react"; // Import X icon for removing file

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
  const [isLoading, setIsLoading] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState(null); // State for Aadhaar file

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

  // file
  const handleFileChange = (setter) => (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Full Name is required.";
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
      newErrors.password = "Password must be at least 6 characters.";
    }
    // Updated Aadhaar validation: check aadhaarFile state instead of form.aadhar
    if (!aadhaarFile) {
      newErrors.aadhaar = "Aadhaar upload is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      const filesToUpload = [];
      const documentMap = new Map();

      if (aadhaarFile) {
        filesToUpload.push(aadhaarFile);
        documentMap.set(aadhaarFile, "AADHAR");
      }

      let uploadedDocuments = [];
      if (filesToUpload.length > 0) {
        const uploadResult = await uploadFiles(filesToUpload);
        if (uploadResult && uploadResult.length > 0) {
          uploadedDocuments = uploadResult.map((uploadedFile) => ({
            key: uploadedFile.key,
            url: uploadedFile.url,
            documentName:
              documentMap.get(
                filesToUpload.find(
                  (f) =>
                    f.name === uploadedFile.key ||
                    f.name.includes(uploadedFile.key)
                )
              ) || "Other Document",
          }));
        } else {
          toast.error(
            "Document upload failed or returned empty. Please try again."
          );
          setIsLoading(false); // Changed from setIsSubmitting to setIsLoading
          return;
        }
      }
      
      // Construct the payload for registration
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        referredByCode: form.referralCode,
        kycDocumentImage: uploadedDocuments, // Attach the uploaded documents
      };
      
      console.log(payload, "payload for frontend")

      await registerUser(payload);
      toast.success("Registration successful! Please verify your email.");
      navigate(`/otp/${encodeURIComponent(form.email)}`);
    } catch (err) {
      console.error(err); // Changed from error to err for consistency
      toast.error(err.message || "Something went wrong during registration.");
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <input
                name="referralCode"
                type="text"
                placeholder="Referral code"
                className="w-full p-3 rounded bg-gray-100 text-black"
                onChange={handleChange}
                value={form.referralCode}
                disabled={isLoading}
              />
            </div>

            {/* Aadhar file upload field - Updated */}
            <div>
              <label htmlFor="aadhaarFile" className="block text-sm mb-1 text-gray-700">
                Upload Aadhaar <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="aadhaarFile"
                  type="file"
                  name="aadhar"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={`w-full p-2 rounded bg-gray-100 text-black ${
                    errors.aadhaar ? "border-red-500 border" : ""
                  }`}
                  onChange={handleFileChange(setAadhaarFile)}
                  disabled={isLoading}
                  required
                />
                {aadhaarFile && (
                  <button
                    type="button"
                    onClick={() => setAadhaarFile(null)}
                    disabled={isLoading}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
              {aadhaarFile && (
                <span className="text-sm text-muted-foreground">
                  {aadhaarFile.name}
                </span>
              )}
              {errors.aadhaar && (
                <p className="text-red-500 text-xs mt-1">{errors.aadhaar}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-[#B641FF] hover:bg-[#B209FF] text-white rounded flex items-center justify-center"
              disabled={isLoading}
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