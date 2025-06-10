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

// Import the image assets directly into MembershipPage
import frontImg from "../../../assets/cashback/card11.png";
import backImg from "../../../assets/cashback/card12.png";
import logo from "../../../assets/makemoney.png";

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

  const isMember = user.isMember;

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

  // permanent needs cashfree integration
  // if (!isMember) {
  //   return (
  //     <div className="flex-1 space-y-6 p-6">
  //       <div className="flex items-center gap-4">
  //         <div>
  //           <h1 className="text-3xl font-bold text-purple-900">
  //             Become a Member
  //           </h1>
  //           <p className="text-purple-600">
  //             Unlock exclusive benefits and features
  //           </p>
  //         </div>
  //       </div>

  //       <div className="max-w-2xl mx-auto">
  //         <Card className="border-purple-200">
  //           <CardHeader className="text-center">
  //             <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
  //               <Star className="h-8 w-8 text-purple-600" />
  //             </div>
  //             <CardTitle className="text-2xl text-purple-900">
  //               Premium Membership
  //             </CardTitle>
  //             <CardDescription className="text-purple-600">
  //               Join our exclusive membership program and enjoy premium benefits
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent className="space-y-6">
  //             <div className="text-center">
  //               <div className="text-4xl font-bold text-purple-900">₹1,200</div>
  //               <p className="text-purple-600">One-time payment</p>
  //             </div>

  //             <div className="space-y-3">
  //               <h3 className="font-semibold text-purple-900">
  //                 What you'll get:
  //               </h3>
  //               {benefits.map((benefit, index) => (
  //                 <div key={index} className="flex items-center gap-3">
  //                   <Check className="h-5 w-5 text-green-600" />
  //                   <span className="text-purple-700">{benefit}</span>
  //                 </div>
  //               ))}
  //             </div>

  //             {/* === INTEGRATED RAZORPAY PAYMENT BUTTON === */}
  //             {user?._id ? ( // Only show if user is logged in
  //               <RazorpayPaymentButton
  //                 amount={membershipAmountInPaise}
  //                 receiptId={generateReceiptId(user._id)}
  //                 companyName="MakeMoney24"
  //                 description="Premium Membership Purchase"
  //                 logoUrl="https://placehold.co/100x100/8B5CF6/FFFFFF?text=MM24"
  //                 onPaymentSuccess={handlePaymentSuccess}
  //                 onPaymentError={handlePaymentError}
  //                 className="w-full bg-purple-600 hover:bg-purple-700"
  //               >
  //                 <CreditCard className="mr-2 h-5 w-5" />
  //                 Become a Member Now
  //               </RazorpayPaymentButton>
  //             ) : (
  //               <Button
  //                 className="w-full bg-purple-600 hover:bg-purple-700"
  //                 size="lg"
  //                 disabled
  //               >
  //                 Please log in to become a member
  //               </Button>
  //             )}
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }
  // temp fix
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

              {/* === QR CODE PAYMENT SECTION === */}
              <div className="mt-6 p-4 border rounded-lg bg-purple-50 text-center">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center justify-center gap-2">
                  <QrCode className="h-6 w-6 text-purple-700" />
                  Auto Membership Enrollment Coming Soon!
                </h3>
                <p className="text-purple-700 mb-4">
                  For immediate access, make a payment via QR code:
                </p>
                <div className="flex justify-center mb-4">
                  <img
                    src={qrCodeImageUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48 border border-gray-300 rounded-lg shadow-sm object-contain"
                  />
                </div>
                <p className="text-sm font-medium text-purple-800 mb-2">
                  Scan this QR code and pay ₹1,200
                </p>
                <p className="text-sm text-gray-700">
                  Then, WhatsApp a screenshot of your payment to:
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline font-bold text-lg flex items-center justify-center mt-2"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    className="h-5 w-5 mr-2"
                  />
                  {whatsappNumber}
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  Admin will upgrade your membership shortly after verification.
                </p>
              </div>
              {/* === END QR CODE PAYMENT SECTION === */}
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
          <div className="flex md:flex-row flex-col gap-10">
            {/* Front of the Card */}
            <Card className="relative max-w-[500px] w-full aspect-[10/7] sm:aspect-[10/7] rounded-2xl overflow-hidden shadow-xl bg-amber-600 text-white font-semibold">
              <img
                src={frontImg}
                alt="Card Front Background"
                className="absolute inset-0 w-full h-full object-cover z-0 "
              />
              <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 bottom-3">
                <div>
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-12 w-12 sm:h-16 sm:w-16 relative bottom-6"
                  />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
                    CASHBACK CARD
                  </h2>
                  <p className="text-lg sm:text-2xl tracking-widest mb-4 sm:mb-6">
                    {defaultCardNumber}
                  </p>
                  <p className="text-base sm:text-lg">
                    {user?.name || "Member"}
                  </p>
                </div>
                <div className="flex gap-6 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-200">VALID FROM</p>
                    <p>{defaultValidFrom}</p>
                  </div>
                  <div>
                    <p className="text-gray-200">EXPIRY DATE</p>
                    <p>{defaultExpiryDate}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Back of the Card */}
            <Card className="relative max-w-[500px] w-full aspect-[10/7] sm:aspect-[10/7] rounded-2xl overflow-hidden shadow-xl bg-amber-600 text-white font-semibold">
              <img
                src={backImg}
                alt="Card Back Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 bottom-2">
                <div>
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-12 sm:h-15 mb-3 sm:mb-4 "
                  />
                  <h2 className="text-xl sm:text-2xl font-bold">
                    PRODUCT EMI CARD
                  </h2>
                </div>

                <div className="text-sm sm:text-base">
                  <p className="flex items-center gap-2">
                    📞 {user?.phone || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    📧 {user?.email || "N/A"}
                  </p>
                </div>

                <div className="text-xs sm:text-sm mt-2 sm:mt-4 space-y-1 text-gray-100">
                  {defaultNotes.map((note, index) => (
                    <p key={index}>
                      {index + 1}. {note}
                    </p>
                  ))}
                </div>
              </div>
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
