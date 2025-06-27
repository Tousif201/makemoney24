// src/pages/VerifyOTP.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp } from "../../api/auth";

export default function ForgotPassOTP() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyOtp({ email, otp });
      toast.success("OTP verified!");
      navigate(`/reset-password/${email}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleVerify} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-3 mb-4 border rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}
