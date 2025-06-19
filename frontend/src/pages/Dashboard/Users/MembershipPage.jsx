"use client";

import {
  Calendar,
  Check,
  CreditCard,
  QrCode,
  Shield,
  Star,
} from "lucide-react";
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
// i {user} from useSession()

// Import the image assets directly into MembershipPage
import frontImg from "../../../assets/cashback/card11.png";
import backImg from "../../../assets/cashback/card12.png";
import logo from "../../../assets/makemoney.png";
import CashbackCardFront from "../../../components/CashbackCardFront";
import CashbackCardBack from "../../../components/CashbackCardBack";
import { getUserMembershipDetails } from "../../../../api/membership";
import { useEffect, useState } from "react"; // Import useEffect and useState

export default function MembershipPage() {
  const { loading, session, user, refreshSession } = useSession();
  const membershipAmountInPaise = 1200 * 100; // ₹1200 converted to paise for Razorpay
  const [membershipData, setMembershipData] = useState(null); // State to store membership data

  useEffect(() => {
    const fetchMembershipDetails = async () => {
      try {
        const response = await getUserMembershipDetails();
        console.log("Fetched membership data:", response.data); // Log the fetched data
        setMembershipData(response.data); // Store the data in state
      } catch (error) {
        console.error("Error fetching membership details:", error);
      }
    };

    if (user && !loading) { // Fetch only if user is available and not loading
      fetchMembershipDetails();
    }
  }, [user, loading]); // Re-run when user or loading status changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const isMember = user.isMember;
  // const isMember = false;

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

  // Default values for card details (as they are not in user object)
  const defaultCardNumber = "0987 6543 2109 1234";
  const defaultValidFrom = "05/25";
  const defaultExpiryDate = "05/26";
  const defaultNotes = [
    "This card is only valid for people who are registered as members",
    "This membership card can be used in all regions",
  ];

  // This QR code should encode the payment request (e.g., UPI QR code).
  const qrCodeImageUrl = "/scanner.jpeg";
  const whatsappNumber = "+919545827264"; // Replace with your actual WhatsApp number

  if (!isMember) {
    return (
      <div className="flex-1 space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-purple-900 mb-2">
              Become a Member
            </h1>
            <p className="text-lg text-purple-600">
              Unlock exclusive benefits and features
            </p>
          </div>
        </div>

        {/* Membership Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-3xl text-purple-900 font-bold">
                Premium Membership
              </CardTitle>
              <CardDescription className="text-purple-600 text-base">
                Join our exclusive membership program and enjoy premium
                benefits.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-6 pb-6">
              {/* Price */}
              <div className="text-center">
                <div className="text-5xl font-extrabold text-purple-900 mb-2">
                  ₹1,298
                </div>
                {/* <p className="text-purple-600 text-sm">
                  ₹1,100 + 18% GST (198)
                </p> */}
                <p className="text-purple-600 text-base">One-time payment</p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h3 className="font-semibold text-xl text-purple-900">
                  What you'll get:
                </h3>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-purple-700 text-base">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* QR Code Payment Section */}
              <div className="mt-8 p-6 border rounded-lg bg-purple-50 text-center space-y-4">
                <h3 className="text-lg font-semibold text-purple-800 flex items-center justify-center gap-2">
                  <QrCode className="h-6 w-6 text-purple-700" />
                  Auto Membership Enrollment Coming Soon!
                </h3>
                <p className="text-purple-700">
                  For immediate access, make a payment via QR code:
                </p>
                <div className="flex justify-center">
                  <img
                    src={qrCodeImageUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48 border border-gray-300 rounded-lg shadow-sm object-contain"
                  />
                </div>

                <p className="text-sm text-purple-700 mt-2">
                  If the scanner does not detect the QR code,{" "}
                  <Link
                    to={`upi://pay?pa=pooja2jadhav4554@ybl&pn=POOJA%20VIJAY%20JADHAV&mc=0000&mode=02&purpose=00`}
                    className="text-purple-600 underline font-medium"
                  >
                    click here
                  </Link>{" "}
                  to process the payment.
                </p>

                <p className="text-sm font-medium text-purple-800">
                  After payment, please WhatsApp your payment screenshot to:
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-purple-600 hover:underline font-bold text-lg mt-1"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    className="h-5 w-5 mr-2"
                  />
                  {whatsappNumber}
                </a>

                <p className="text-xs text-gray-500">
                  Admin will upgrade your membership shortly after verification.
                </p>
              </div>
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
      {/* Conditionally render the virtual cards directly if user is a member */}
      {isMember && (
        <div className="flex flex-col items-center justify-center gap-10 p-4 sm:p-6">
          <h2 className="text-3xl font-bold text-purple-900 mt-8">
            Your Virtual Membership Cards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Card className="border-2 border-dashed border-blue-200 text-left hover:border-blue-400 transition-colors">
              <CashbackCardFront
                userName={user?.name || "Default User"}
                // date={user?.createdAt || "2023-08-01"}
                  cardNumber={user?.referralCode || "MM24 1234 5678"}
                validDate={membershipData?.purchasedAt || "08/25"}
                expiredDate={membershipData?.expiredAt || "08/26"}
              />
            </Card>

            <Card className="border-2 text-left border-dashed border-green-200 hover:border-green-400 transition-colors">
              <CashbackCardBack />
            </Card>
          </div>
        </div>
      )}
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