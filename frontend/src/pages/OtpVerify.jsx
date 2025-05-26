import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { verifyOtp } from "../../api/auth";

export default function OtpVerify() {
    const { email } = useParams();
    const navigate = useNavigate();
    const [otpInput, setOtpInput] = useState("");
    const [resendMessage, setResendMessage] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await verifyOtp({ email: decodeURIComponent(email), otp: otpInput });
            // Save token or user info in localStorage or context
            localStorage.setItem("authToken", res.authToken);


            alert("✅ OTP Verified Successfully!");
            navigate("/");
        } catch (err) {
            alert(err.message || "❌ Invalid OTP");
        }
    };

    const handleResendOtp = () => {
        // Optional: implement POST /resend-otp
        setResendMessage("📩 OTP resend not implemented yet.");
        setTimeout(() => setResendMessage(""), 5000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <motion.div
                className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
            >
                <h2 className="text-2xl font-bold mb-2 text-center">Enter OTP</h2>
                <p className="text-center text-gray-700 mb-4">OTP sent to: <strong>{decodeURIComponent(email)}</strong></p>
                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        placeholder="6-digit OTP"
                        maxLength={6}
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full p-3 rounded border text-black"
                    />
                    <button type="submit" className="w-full p-3 rounded font-semibold bg-green-600 text-white hover:bg-green-700">
                        Verify OTP
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Didn't receive the OTP?</p>
                    <button onClick={handleResendOtp} className="text-blue-600 hover:underline font-medium">
                        Resend OTP
                    </button>
                    {resendMessage && <p className="text-green-600 mt-2 text-sm">{resendMessage}</p>}
                </div>
            </motion.div>
        </div>
    );
}
