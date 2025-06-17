import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../../api/auth";
import shop from "../assets/login/shopping.jpg";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { uploadFiles } from "../../api/upload";
import { X } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);

  useEffect(() => {
    const referralFromUrl = searchParams.get("referralCode");
    if (referralFromUrl) {
      setForm((prevForm) => ({ ...prevForm, referralCode: referralFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

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

    if (!aadhaarFrontFile) {
      newErrors.aadhaarFront = "Aadhaar front image is required.";
    }
    if (!aadhaarBackFile) {
      newErrors.aadhaarBack = "Aadhaar back image is required.";
    }

    if (!form.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms & Conditions.";
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

      if (aadhaarFrontFile) {
        filesToUpload.push(aadhaarFrontFile);
        documentMap.set(aadhaarFrontFile, "AADHAR_FRONT");
      }
      if (aadhaarBackFile) {
        filesToUpload.push(aadhaarBackFile);
        documentMap.set(aadhaarBackFile, "AADHAR_BACK");
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
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        referredByCode: form.referralCode,
        kycDocumentImage: uploadedDocuments,
      };

      await registerUser(payload);
      toast.success("Registration successful! Please verify your email.");
      navigate(`/otp/${encodeURIComponent(form.email)}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-5xl border-amber-400 border-2 shadow-lg rounded-xl overflow-hidden">
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
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              className={`w-full p-3 rounded bg-gray-100 text-black ${
                errors.name ? "border-red-500 border" : ""
              }`}
              onChange={handleChange}
              value={form.name}
              disabled={isLoading}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              className={`w-full p-3 rounded bg-gray-100 text-black ${
                errors.email ? "border-red-500 border" : ""
              }`}
              onChange={handleChange}
              value={form.email}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}

            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              className={`w-full p-3 rounded bg-gray-100 text-black ${
                errors.phone ? "border-red-500 border" : ""
              }`}
              onChange={handleChange}
              value={form.phone}
              disabled={isLoading}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}

            <input
              name="password"
              type="password"
              placeholder="Password"
              className={`w-full p-3 rounded bg-gray-100 text-black ${
                errors.password ? "border-red-500 border" : ""
              }`}
              onChange={handleChange}
              value={form.password}
              disabled={isLoading}
              required
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}

            <input
              name="referralCode"
              type="text"
              placeholder="Referral code"
              className="w-full p-3 rounded bg-gray-100 text-black"
              onChange={handleChange}
              value={form.referralCode}
              disabled={isLoading}
              required
            />

            {/* Aadhaar Front */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Upload Aadhaar Front <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={`w-full p-2 rounded bg-gray-100 text-black ${
                    errors.aadhaarFront ? "border-red-500 border" : ""
                  }`}
                  onChange={handleFileChange(setAadhaarFrontFile)}
                  disabled={isLoading}
                  required
                />
                {aadhaarFrontFile && (
                  <button
                    type="button"
                    onClick={() => setAadhaarFrontFile(null)}
                    disabled={isLoading}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
              {aadhaarFrontFile && (
                <span className="text-sm text-muted-foreground">
                  {aadhaarFrontFile.name}
                </span>
              )}
              {errors.aadhaarFront && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.aadhaarFront}
                </p>
              )}
            </div>

            {/* Aadhaar Back */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Upload Aadhaar Back <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={`w-full p-2 rounded bg-gray-100 text-black ${
                    errors.aadhaarBack ? "border-red-500 border" : ""
                  }`}
                  onChange={handleFileChange(setAadhaarBackFile)}
                  disabled={isLoading}
                  required
                />
                {aadhaarBackFile && (
                  <button
                    type="button"
                    onClick={() => setAadhaarBackFile(null)}
                    disabled={isLoading}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
              {aadhaarBackFile && (
                <span className="text-sm text-muted-foreground">
                  {aadhaarBackFile.name}
                </span>
              )}
              {errors.aadhaarBack && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.aadhaarBack}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                By accepting this you are agree to our{" "}
                <Link
                  to="/accept-tnc"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Terms & Conditions
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-500 text-xs mt-1">
                {errors.acceptTerms}
              </p>
            )}

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
