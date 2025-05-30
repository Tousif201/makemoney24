import { Calendar, Check, CreditCard, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "../../../context/SessionContext";
import RazorpayPaymentButton from "../../../components/RazorpayPaymentButton"; // Ensure this path is correct
import { upgradeUser } from "../../../../api/user";
import { Link } from "react-router-dom";
export default function MembershipPage() {
  const { loading, session, user, refreshSession } = useSession();
  const membershipAmountInPaise = 1200 * 100; // ₹1200 converted to paise for Razorpay

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const isMember = user?.isMember;

  const benefits = [
    "PayLater options on orders above ₹500",
    "No cost EMI on PayLater purchases",
    "Priority customer support",
    "Exclusive member-only deals",
    "Higher commission rates on referrals",
    "Early access to new products",
  ];

  // ======================================
  // Handlers for RazorpayPaymentButton
  // ======================================
  const handlePaymentSuccess = async (
    razorpayResponse,
    backendVerificationResponse
  ) => {
    console.log("Payment successful!", razorpayResponse);
    console.log("Backend verification:", backendVerificationResponse);

    if (!user?._id) {
      console.error("User ID not available for upgrade.");
      alert("Error: User not identified for membership upgrade.");
      return;
    }

    try {
      const upgradeResponse = await upgradeUser(user._id, {
        membershipAmount: membershipAmountInPaise / 100, // Convert back to rupees for the backend
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      });

      console.log("User upgrade successful:", upgradeResponse);
      alert("🎉 Payment Successful! Welcome to the premium club.");

      if (refreshSession) {
        await refreshSession();
      }
    } catch (error) {
      console.error("Failed to upgrade user membership:", error);
      alert(
        `Failed to activate membership: ${
          error.response?.data?.message || error.message
        }. Please contact support.`
      );
    }
  };

  // Function to generate a shorter unique receipt ID
  const generateReceiptId = (userId) => {
    const timestampSuffix = Date.now().toString().slice(-10);
    return `MM_${userId}_${timestampSuffix}`;
  };
  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    alert(
      `Payment Failed: ${
        error.description || error.message || "Please try again."
      }`
    );
  };

  if (!isMember) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">
              Become a Member
            </h1>
            <p className="text-purple-600">
              Unlock exclusive benefits and features
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-purple-200">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-purple-900">
                Premium Membership
              </CardTitle>
              <CardDescription className="text-purple-600">
                Join our exclusive membership program and enjoy premium benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-900">₹1,200</div>
                <p className="text-purple-600">One-time payment</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-purple-900">
                  What you'll get:
                </h3>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-purple-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* === INTEGRATED RAZORPAY PAYMENT BUTTON === */}
              {user?._id ? ( // Only show if user is logged in
                <RazorpayPaymentButton
                  amount={membershipAmountInPaise}
                  receiptId={generateReceiptId(user._id)}
                  companyName="MakeMoney24"
                  description="Premium Membership Purchase"
                  logoUrl="https://placehold.co/100x100/8B5CF6/FFFFFF?text=MM24"
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Become a Member Now
                </RazorpayPaymentButton>
              ) : (
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  disabled
                >
                  Please log in to become a member
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 text-center flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      {" "}
      {/* Adjusted min-h for better centering */}
      <div className="relative">
        <Star className="h-32 w-32 text-yellow-400 fill-yellow-400 animate-pulse-once" />{" "}
        {/* Large star icon */}
        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-white" />{" "}
        {/* Checkmark inside star */}
      </div>
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 leading-tight">
        Congratulations, {user?.name || "Member"}!
      </h1>
      <p className="text-xl text-gray-700 max-w-2xl">
        You are now a Premium Member of MakeMoney24. Get ready to unlock
        exclusive perks, higher earnings, and a truly enhanced experience!
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
        <Card className="border-purple-200 bg-purple-50 text-purple-800">
          <CardContent className="p-4 flex flex-col items-center">
            <Shield className="h-10 w-10 mb-2" />
            <h3 className="font-semibold text-lg">Exclusive Perks</h3>
            <p className="text-sm">Access to member-only deals & features.</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50 text-purple-800">
          <CardContent className="p-4 flex flex-col items-center">
            <CreditCard className="h-10 w-10 mb-2" />
            <h3 className="font-semibold text-lg">Enhanced Earnings</h3>
            <p className="text-sm">Higher commission rates on referrals.</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50 text-purple-800">
          <CardContent className="p-4 flex flex-col items-center">
            <Calendar className="h-10 w-10 mb-2" />
            <h3 className="font-semibold text-lg">Priority Support</h3>
            <p className="text-sm">Get quick assistance when you need it.</p>
          </CardContent>
        </Card>
      </div>
      <Link to="/dashboard/referrals">
        <Button
          className="mt-10 bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105"
          size="lg"
          onClick={() => console.log("Navigate to dashboard or features")} // Replace with actual navigation
        >
          Start Enjoying Your Benefits!
        </Button>
      </Link>
    </div>
  );
}
