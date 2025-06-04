import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Lock, CreditCard } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useSession } from "../../context/SessionContext";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Slider } from "@/components/ui/slider";
// We need this back to initiate the Cashfree payment!
import { createCashfreeOrder } from "../../../api/cashfree"; // Assuming this is your API call to create Cashfree order
import { load } from "@cashfreepayments/cashfree-js";
// These are for backend processing AFTER Cashfree payment is done/redirected
import { handleEmiCheckout, handleOnlinePaymentCheckout } from "../../../api/checkout";

// --- START: EMI Feature Related Constants and Helper Functions ---
const MIN_AMOUNT_FOR_EMI = 500;

// Simple EMI calculation (interest-free)
const calculateMonthlyEMI = (principal, tenureInMonths) => {
  if (principal <= 0 || tenureInMonths <= 0) return 0;
  const emi = principal / tenureInMonths;
  return parseFloat(emi.toFixed(2));
};
// --- END: EMI Feature Related Constants and Helper Functions ---

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { session, user } = useSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // EMI Feature States
  const [showEmiDialog, setShowEmiDialog] = useState(false);
  const [downPayment, setDownPayment] = useState(0); // Down payment percentage (0-100)
  const [emiTenure, setEmiTenure] = useState("3"); // Default EMI tenure in months as a string
  const [isEmiConfirmed, setIsEmiConfirmed] = useState(false); // New state to track if EMI was confirmed

  // State to temporarily store transaction details for post-payment processing
  const [pendingTransactionDetails, setPendingTransactionDetails] = useState(null);

  // Calculate prices using useMemo
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const shippingCost = 0; // Free shipping
  const finalTotal = useMemo(
    () => totalPrice + shippingCost,
    [totalPrice, shippingCost]
  );

  const processingFee = useMemo(() => {
    if (finalTotal < MIN_AMOUNT_FOR_EMI) return 0;
    if (finalTotal <= 3000) {
      return finalTotal * 0.05;
    } else {
      return finalTotal * 0.1;
    }
  }, [finalTotal]);

  const downPaymentAmount = useMemo(() => {
    return (finalTotal * downPayment) / 100;
  }, [finalTotal, downPayment]);

  const remainingAmountForEmi = useMemo(() => {
    return finalTotal - downPaymentAmount;
  }, [finalTotal, downPaymentAmount]);

  const totalDownPaymentDue = useMemo(() => {
    return downPaymentAmount + processingFee;
  }, [downPaymentAmount, processingFee]);

  const monthlyEmi = useMemo(() => {
    return calculateMonthlyEMI(remainingAmountForEmi, parseInt(emiTenure));
  }, [remainingAmountForEmi, emiTenure]);

   // useEffect to handle Cashfree redirects and backend processing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cashfreeOrderId = urlParams.get("order_id"); // This is Cashfree's order_id from the redirect

    // Retrieve pending transaction details from session storage
    const storedPendingDetails = JSON.parse(sessionStorage.getItem('pendingCheckoutDetails'));

    // Check if we have Cashfree redirect parameters AND stored checkout details
    if (cashfreeOrderId && storedPendingDetails) {
      console.log(
        `[useEffect] Redirect detected for Cashfree Order ID: ${cashfreeOrderId}.`
      );
      console.log("[useEffect] Stored pending details:", storedPendingDetails);

      // Prevent duplicate processing on refresh
      if (sessionStorage.getItem('processingRedirect') === 'true') {
        console.log('[useEffect] Already processing redirect, exiting.');
        return;
      }
      sessionStorage.setItem('processingRedirect', 'true'); // Set flag

      const processPaymentResponse = async () => {
        console.log("process payment response triggered for backend verification.");
        setIsProcessing(true); // Show loading state

        try {
          const commonPayload = {
            userId: storedPendingDetails.userId,
            vendorId: storedPendingDetails.vendorId,
            items: storedPendingDetails.items,
            totalAmount: storedPendingDetails.totalAmount, // This is the total order value
            address: storedPendingDetails.address,
            cashfreeOrderId: cashfreeOrderId, // Pass Cashfree's orderId
          };

          let backendCheckoutResult;
          if (storedPendingDetails.isEmi) {
            const emiSpecificPayload = {
              ...commonPayload,
              downPayment: storedPendingDetails.downPayment,
              processingFee: storedPendingDetails.processingFee,
              billingCycleInDays: storedPendingDetails.billingCycleInDays,
              totalInstallments: storedPendingDetails.totalInstallments,
              installmentAmount: storedPendingDetails.installmentAmount,
            };
            console.log("Calling handleEmiCheckout with:", emiSpecificPayload);
            backendCheckoutResult = await handleEmiCheckout(emiSpecificPayload);
          } else {
            console.log("Calling handleOnlinePaymentCheckout with:", commonPayload);
            backendCheckoutResult = await handleOnlinePaymentCheckout(commonPayload);
          }

          if (backendCheckoutResult.success) {
            alert("Order placed successfully! Check your order history.");
            clearCart();
            // Navigate to success page with order details
            navigate("/checkout/success", { state: { order: backendCheckoutResult.order, type: storedPendingDetails.isEmi ? 'emi' : 'online' } });
          } else {
            // Backend indicated failure after its own verification
            alert(`Order processing failed: ${backendCheckoutResult.message || "Unknown error"}`);
            console.error("Backend checkout failed:", backendCheckoutResult.error || backendCheckoutResult.message);
            // Navigate to failure page
            navigate("/payment-failed");
          }
        } catch (error) {
          alert("An unexpected error occurred during order processing. Please check your order status.");
          console.error("Error during post-payment verification:", error);
          navigate("/payment-failed");
        } finally {
          setIsProcessing(false); // Hide loading state
          sessionStorage.removeItem('pendingCheckoutDetails'); // Clear stored details
          sessionStorage.removeItem('processingRedirect'); // Clear processing flag
          // Always clean up URL parameters after processing
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      // Trigger the backend processing function immediately if Cashfree Order ID is present
      // Your backend will handle the actual verification with Cashfree.
      processPaymentResponse();

    } else if (urlParams.toString() !== '' && !cashfreeOrderId && !storedPendingDetails) {
        // This 'else if' block catches cases where URL parameters are present but
        // it's not a Cashfree redirect (missing order_id) OR
        // storedPendingDetails were lost/never set for a valid redirect.
        console.log("[useEffect] Detected URL parameters but not a valid Cashfree redirect with stored details. Cleaning URL.");
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.log("[useEffect] No Cashfree payment parameters or stored details found in URL/session.");
    }
  }, [navigate, clearCart]); // Add dependencies for useEffect

  // --- CONDITIONAL RENDERING AFTER ALL HOOKS ARE DECLARED ---
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            You need to log in to place an order
          </h1>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some items to proceed with checkout
          </p>
          <Button onClick={() => navigate("/browse")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }
  // --- END CONDITIONAL RENDERING ---

  const handleShippingChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateShippingInfo = () => {
    if (
      !shippingInfo.firstName ||
      !shippingInfo.lastName ||
      !shippingInfo.email ||
      !shippingInfo.phone ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.pincode
    ) {
      alert("Please fill in all shipping information before proceeding.");
      return false;
    }
    if (!agreedToTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!validateShippingInfo()) {
      setIsProcessing(false);
      return;
    }

    // Map cart items to the expected backend format (productServiceId, quantity, price)
    const formattedItems = items.map(item => ({
      productServiceId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const paymentAmount = isEmiConfirmed ? totalDownPaymentDue : finalTotal;
    const vendorIdFromItems = items[0]?.vendor; // Assuming single vendor for simplicity

    // Prepare data to store for post-payment processing
    const pendingDetails = {
      userId: user._id,
      vendorId: vendorIdFromItems,
      items: formattedItems,
      totalAmount: finalTotal, // Store full order total, not just initial payment amount
      address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}, ${shippingInfo.country}`,
      isEmi: isEmiConfirmed,
      // EMI specific details if applicable
      downPayment: isEmiConfirmed ? downPaymentAmount : undefined,
      processingFee: isEmiConfirmed ? processingFee : undefined,
      billingCycleInDays: isEmiConfirmed ? 30 : undefined, // Assuming a monthly billing cycle
      totalInstallments: isEmiConfirmed ? parseInt(emiTenure) : undefined,
      installmentAmount: isEmiConfirmed ? monthlyEmi : undefined,
    };
    // Store these details in sessionStorage before redirecting to Cashfree
    sessionStorage.setItem('pendingCheckoutDetails', JSON.stringify(pendingDetails));

    try {
      // Step 1: Create Cashfree Order on YOUR backend to get payment_session_id
      const cashfreeOrderRes = await createCashfreeOrder({
        order_amount: paymentAmount,
        customer_details: {
          customer_id: user._id,
          customer_phone: shippingInfo.phone,
          customer_email: shippingInfo.email,
        },
        order_note: isEmiConfirmed ? "EMI Initial Payment" : "Full Payment",
        // The redirectPath should be the current checkout page, where the useEffect will pick up parameters
        redirectPath: "checkout",
      });

      if (cashfreeOrderRes.success && cashfreeOrderRes.payment_session_id) {
        const paymentSessionId = cashfreeOrderRes.payment_session_id;
        console.log(
          `[Client] Received payment_session_id: ${paymentSessionId}. Loading Cashfree SDK...`
        );

        const cashfree = await load({
          mode: "sandbox", // "sandbox" for testing, "production" for live
        });

        console.log(
          "[Client] Cashfree SDK loaded. Initiating checkout with redirect..."
        );
        let checkoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self", // Redirect to same tab
          onScriptLoad: () =>
            console.log(
              "[Cashfree SDK] script loaded successfully for redirect."
            ),
          onScriptError: (error) =>
            console.error("[Cashfree SDK] script load error:", error),
        };

        // This will redirect the user to Cashfree's payment page
        cashfree.checkout(checkoutOptions);

      } else {
        alert(cashfreeOrderRes.message || "Failed to initiate payment with Cashfree. Please try again.");
        console.error("Failed to create Cashfree order:", cashfreeOrderRes.error || cashfreeOrderRes.message);
        sessionStorage.removeItem('pendingCheckoutDetails'); // Clear if initiation fails
      }
    } catch (error) {
      alert("An error occurred during payment initiation. Please try again.");
      console.error("Error during Cashfree order creation:", error);
      sessionStorage.removeItem('pendingCheckoutDetails'); // Clear if initiation fails
    } finally {
      setIsProcessing(false); // Only set to false here, as actual order processing is handled by useEffect on redirect
    }
  };

  const handleEmiConfirmation = () => {
    if (finalTotal < MIN_AMOUNT_FOR_EMI) {
      alert(`Minimum amount to convert to EMI is ₹${MIN_AMOUNT_FOR_EMI}.`);
      return;
    }
    if (!emiTenure) {
      alert("Please select an EMI tenure.");
      return;
    }
    if (remainingAmountForEmi <= 0 && downPayment < 100) {
        alert("The remaining amount for EMI is zero, but down payment is not 100%. Please adjust.");
        return;
    }
    if (remainingAmountForEmi > 0 && monthlyEmi <= 0) {
      alert(
        "Calculated monthly EMI is zero or less. Adjust down payment or tenure."
      );
      return;
    }

    setIsEmiConfirmed(true);
    setShowEmiDialog(false);
    alert(
      "EMI plan configured. Proceed to place order to complete the initial payment."
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-2">CHECKOUT</h1>
          <p className="text-gray-600">Complete Your Order Please</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-400" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-firstName">First Name</Label>
                      <Input
                        id="shipping-firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          handleShippingChange("firstName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-lastName">Last Name</Label>
                      <Input
                        id="shipping-lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          handleShippingChange("lastName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-email">Email</Label>
                      <Input
                        id="shipping-email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          handleShippingChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-phone">Phone</Label>
                      <Input
                        id="shipping-phone"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          handleShippingChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-address">Address</Label>
                    <Textarea
                      id="shipping-address"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleShippingChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-city">City</Label>
                      <Input
                        id="shipping-city"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          handleShippingChange("city", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-state">State</Label>
                      <Select
                        value={shippingInfo.state}
                        onValueChange={(value) =>
                          handleShippingChange("state", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="Karnataka">Karnataka</SelectItem>
                          <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                           {/* Add more states as needed (e.g., from a comprehensive list) */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-pincode">Pincode</Label>
                      <Input
                        id="shipping-pincode"
                        value={shippingInfo.pincode}
                        onChange={(e) =>
                          handleShippingChange("pincode", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.variant?.color}-${item.variant?.size}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500">{item.vendor}</p>
                          {item.variant && (
                            <div className="flex gap-1 mt-1">
                              {item.variant.color && (
                                <Badge variant="outline" className="text-xs">
                                  {item.variant.color}
                                </Badge>
                              )}
                              {item.variant.size && (
                                <Badge variant="outline" className="text-xs">
                                  {item.variant.size}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm font-medium">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>

                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>₹{finalTotal.toLocaleString()}</span>
                    </div>

                    {isEmiConfirmed && (
                      <div className="space-y-2">
                        <Separator />
                        <div className="flex justify-between text-sm font-medium text-purple-700">
                          <span>EMI Initial Payment Due</span>
                          <span>₹{totalDownPaymentDue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-purple-700">
                          <span>Remaining Amount for EMI</span>
                          <span>₹{remainingAmountForEmi.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-purple-700">
                          <span>Monthly EMI ({emiTenure} months)</span>
                          <span>₹{monthlyEmi.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                          Includes ₹{processingFee.toLocaleString()} processing
                          fee
                        </p>
                      </div>
                    )}
                  </div>
                  {user?.isMember &&
                    finalTotal >= MIN_AMOUNT_FOR_EMI &&
                    !isEmiConfirmed && (
                      <Button
                        onClick={() => setShowEmiDialog(true)}
                        className="w-full"
                        variant="outline"
                        type="button" // Important: Prevent form submission
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Convert to EMI
                      </Button>
                    )}
                  {user?.isMember && isEmiConfirmed && (
                    <Button
                      onClick={() => {
                        setIsEmiConfirmed(false); // Allow user to revert EMI choice
                        setDownPayment(0);
                        setEmiTenure("3");
                        alert(
                          "EMI plan reverted. You can choose full payment or reconfigure EMI."
                        );
                      }}
                      className="w-full"
                      variant="destructive"
                      type="button" // Important: Prevent form submission
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Reset EMI Plan
                    </Button>
                  )}

                  <Button
                    type="submit" // This button now triggers handleSubmit
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4 text-green-400" />
                        {isEmiConfirmed
                          ? `Pay ₹${totalDownPaymentDue.toLocaleString()} Now (EMI)`
                          : `Pay ₹${finalTotal.toLocaleString()} Now`}
                      </>
                    )}
                  </Button>

                  <label className="flex items-start text-xs text-gray-500">
                    <input
                      type="checkbox"
                      className="mr-2 mt-1"
                      required
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <span>
                      By placing your order, you agree to our{" "}
                      <span className="underline">Terms of Service</span> and{" "}
                      <span className="underline">Privacy Policy</span>.
                    </span>
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {/* EMI Conversion Dialog */}
      <Dialog open={showEmiDialog} onOpenChange={setShowEmiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Convert to EMI
            </DialogTitle>
            <DialogDescription>
              Split your payment into easy monthly installments (Interest-Free).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-lg font-medium">
              <span>Total Cart Value:</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="down-payment-slider">
                Down Payment: {downPayment}% (₹
                {downPaymentAmount.toLocaleString()})
              </Label>
              <Slider
                id="down-payment-slider"
                min={0}
                max={100}
                step={5}
                value={[downPayment]}
                onValueChange={(val) => setDownPayment(val[0])}
                className="w-full"
              />
              <p className="text-sm text-gray-600">
                Adjust the slider to choose your down payment percentage.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-medium text-red-600">
                  ₹{processingFee.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {finalTotal <= 3000
                  ? "5% processing fee for orders up to ₹3000."
                  : "10% processing fee for orders above ₹3000."}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between font-medium text-base">
                <span>Amount to pay now (Down Payment + Fee):</span>
                <span>₹{totalDownPaymentDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-base">
                <span>Remaining Amount for EMI:</span>
                <span>₹{remainingAmountForEmi.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emi-tenure">EMI Tenure</Label>
              <Select value={emiTenure} onValueChange={setEmiTenure}>
                <SelectTrigger id="emi-tenure">
                  <SelectValue placeholder="Select tenure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="9">9 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="18">18 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {emiTenure && monthlyEmi > 0 && (
              <div className="flex justify-between font-bold text-md mt-4">
                <span>Monthly EMI:</span>
                <span>₹{monthlyEmi.toLocaleString()}</span>
              </div>
            )}
            {emiTenure && monthlyEmi === 0 && remainingAmountForEmi > 0 && (
              <p className="text-sm text-red-500">
                Please select a valid tenure or adjust down payment.
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleEmiConfirmation}
              disabled={
                finalTotal < MIN_AMOUNT_FOR_EMI ||
                !emiTenure ||
                remainingAmountForEmi < 0 ||
                (remainingAmountForEmi > 0 && monthlyEmi <= 0)
              }
            >
              Confirm EMI Conversion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
