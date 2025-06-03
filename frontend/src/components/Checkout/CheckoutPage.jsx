import { useState, useMemo, useCallback } from "react";
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
import { handleCheckout } from "../../../api/checkout";

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
import { createRazorpayOrderApi,verifyPaymentApi } from "../../../api/razorpay";

// --- START: EMI Feature Related Constants and Helper Functions ---
const MIN_AMOUNT_FOR_EMI = 500;

// Simple EMI calculation (interest-free)
const calculateMonthlyEMI = (principal, tenureInMonths) => {
  if (principal <= 0 || tenureInMonths <= 0) return 0;
  const emi = principal / tenureInMonths;
  return parseFloat(emi.toFixed(2));
};
// --- END: EMI Feature Related Constants and Helper Functions ---

// Helper to load Razorpay script dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { session, user } = useSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // EMI Feature States
  const [showEmiDialog, setShowEmiDialog] = useState(false);
  const [downPayment, setDownPayment] = useState(0); // Down payment percentage (0-100)
  const [emiTenure, setEmiTenure] = useState("3"); // Default EMI tenure in months as a string
  const [isEmiConfirmed, setIsEmiConfirmed] = useState(false); // New state to track if EMI was confirmed

  // Calculate prices using useMemo
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const shippingCost = 0; // Free shipping
  const finalTotal = useMemo(
    () => totalPrice + shippingCost,
    [totalPrice, shippingCost]
  );

  const processingFee = useMemo(() => {
    if (finalTotal < MIN_AMOUNT_FOR_EMI) return 0;
    // Current logic from the component, assumes processing fee is for the entire finalTotal
    if (finalTotal <= 3000) {
      return finalTotal * 0.05;
    } else {
      return finalTotal * 0.1;
    }
  }, [finalTotal]);

  const downPaymentAmount = useMemo(() => {
    // Calculates down payment amount based on the percentage of finalTotal
    return (finalTotal * downPayment) / 100;
  }, [finalTotal, downPayment]);

  const remainingAmountForEmi = useMemo(() => {
    // Amount remaining to be paid via installments
    return finalTotal - downPaymentAmount;
  }, [finalTotal, downPaymentAmount]);

  const totalDownPaymentDue = useMemo(() => {
    // This is the amount the user pays upfront if EMI is selected
    return downPaymentAmount + processingFee;
  }, [downPaymentAmount, processingFee]);

  const monthlyEmi = useMemo(() => {
    // Calculate monthly EMI for the remaining amount
    return calculateMonthlyEMI(remainingAmountForEmi, parseInt(emiTenure));
  }, [remainingAmountForEmi, emiTenure]);

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
    if (sameAsShipping) {
      setBillingInfo((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingChange = (field, value) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }));
  };

  // This will be called by Razorpay's handler after a successful payment
  const handlePaymentSuccess = useCallback(
    async (razorpayResponse) => {
      console.log("--- handlePaymentSuccess initiated (Razorpay callback) ---");
      console.log("Razorpay Response:", razorpayResponse);
      setIsProcessing(true);

      try {
        // Step 1: Verify the payment with your backend API
        console.log("Step 1: Verifying Razorpay payment with backend...");
        const verificationPayload = {
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
        };
        const validatedRazorpayResponse = await verifyPaymentApi(
          verificationPayload
        );

        if (!validatedRazorpayResponse.success) {
          alert(
            `Payment verification failed: ${
              validatedRazorpayResponse.message || "Unknown error"
            }`
          );
          setIsProcessing(false);
          return; // Stop further processing if verification fails
        }
        console.log(
          "Razorpay payment verified successfully:",
          validatedRazorpayResponse
        );

        console.log("Step 2: Grouping cart items by vendor...");
        const itemsByVendor = items.reduce((acc, item) => {
          const vendorId = item.vendor;
          if (!acc[vendorId]) {
            acc[vendorId] = [];
          }
          acc[vendorId].push(item);
          return acc;
        }, {});
        console.log("Items grouped by vendor:", itemsByVendor);

        const createdOrderIds = [];
        let successCount = 0;
        let failureCount = 0;

        console.log("Step 3: Calling handleCheckout for each vendor...");
        for (const vendorId in itemsByVendor) {
          const vendorItems = itemsByVendor[vendorId];
          const vendorOrderSubtotal = vendorItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          // Base checkout payload
          const checkoutPayload = {
            userId: session?.id,
            vendorId: vendorId,
            items: vendorItems.map((item) => ({
              productServiceId: item.id,
              quantity: item.quantity,
              price: item.price,
              variant: item.variant,
            })),
            totalAmount: vendorOrderSubtotal, // This is the total for THIS vendor's order
            address: shippingInfo,
            // Use the original razorpayResponse details, as verification simply confirms their authenticity
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
          };

          // Add EMI specific fields if EMI was confirmed
          if (isEmiConfirmed) {
            // Calculate proportional values for each vendor's order
            // This ensures downPayment, processingFee, and installmentAmount are
            // correctly distributed per vendor order for the EMI plan.
            const proportionalDownPayment =
              (downPaymentAmount * vendorOrderSubtotal) / finalTotal;
            const proportionalProcessingFee =
              (processingFee * vendorOrderSubtotal) / finalTotal;
            // The remainingAmountForEmi is the cart-wide principal for EMIs.
            // proportionalInstallmentAmount calculates this vendor's share of the monthly EMI.
            const proportionalInstallmentAmount =
              (monthlyEmi * vendorOrderSubtotal) /
              (finalTotal - downPaymentAmount);

            checkoutPayload.isEmi = true;
            checkoutPayload.downPayment = parseFloat(
              proportionalDownPayment.toFixed(2)
            );
            checkoutPayload.processingFee = parseFloat(
              proportionalProcessingFee.toFixed(2)
            );
            checkoutPayload.billingCycleInDays = parseInt(emiTenure) * 30; // Assuming 30 days per month
            checkoutPayload.totalInstallments = parseInt(emiTenure);
            checkoutPayload.installmentAmount = parseFloat(
              proportionalInstallmentAmount.toFixed(2)
            );
          }

          console.log(
            `Attempting to call handleCheckout for Vendor ID: ${vendorId} with payload:`,
            checkoutPayload
          );

          try {
            const response = await handleCheckout(checkoutPayload);
            if (response.success) {
              console.log(
                `Order for Vendor ID ${vendorId} successful:`,
                response
              );
              createdOrderIds.push(response.order._id);
              successCount++;
            } else {
              console.error(
                `Order for Vendor ID ${vendorId} failed:`,
                response.message
              );
              failureCount++;
            }
          } catch (error) {
            console.error(
              `Error calling handleCheckout for Vendor ID ${vendorId}:`,
              error
            );
            failureCount++;
          }
        }

        console.log("All handleCheckout calls completed.");
        console.log(
          `Successful orders: ${successCount}, Failed orders: ${failureCount}`
        );

        if (successCount > 0) {
          alert(
            `Orders placed successfully for ${successCount} vendor(s)! ${
              failureCount > 0 ? `(${failureCount} failed)` : ""
            }`
          );
          clearCart();
          console.log("Cart cleared.");
          navigate(`/checkout/success?orderIds=${createdOrderIds.join(",")}`);
        } else {
          alert("All orders failed to place. Please contact support.");
        }
      } catch (error) {
        console.error(
          "An unexpected error occurred during multi-vendor checkout or payment verification:",
          error
        );
        alert(
          "An unexpected error occurred during checkout or payment verification. Please try again."
        );
      } finally {
        console.log("--- handlePaymentSuccess finished ---");
        setIsProcessing(false);
        setIsEmiConfirmed(false); // Reset EMI confirmation after processing
      }
    },
    [
      items,
      session?.id,
      shippingInfo,
      isEmiConfirmed,
      downPaymentAmount,
      processingFee,
      emiTenure,
      monthlyEmi,
      finalTotal,
      clearCart,
      navigate,
    ]
  ); // Dependencies for useCallback

  // This will be called by Razorpay's handler if payment fails
  const handlePaymentError = useCallback((error) => {
    console.error("Payment error (from Razorpay):", error);
    alert(
      `Payment Failed: ${
        error.description || error.message || "Please try again."
      }`
    );
    setIsProcessing(false);
    setIsEmiConfirmed(false); // Reset EMI confirmation on error
  }, []);

  // Function to initiate Razorpay payment
  const openRazorpay = useCallback(async () => {
    setIsProcessing(true);

    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    // Determine the amount to send to your backend for Razorpay order creation
    const amountForRazorpayOrder = isEmiConfirmed
      ? totalDownPaymentDue
      : finalTotal;

    // --- NEW: Create Razorpay Order via Backend API ---
    console.log("Creating Razorpay order on backend...");
    const orderCreationPayload = {
      amount: Math.round(amountForRazorpayOrder * 100), // Amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`, // Unique receipt ID
      payment_capture: 1, // Auto capture payment
      // You can add more notes or data to this payload if your backend API expects it
    };

    let orderResponse;
    try {
      orderResponse = await createRazorpayOrderApi(orderCreationPayload);
      if (!orderResponse.success || !orderResponse.orderId) {
        alert(
          `Failed to create Razorpay order: ${
            orderResponse.message || "Unknown error"
          }`
        );
        setIsProcessing(false);
        return;
      }
      console.log("Razorpay order created:", orderResponse);
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      alert("An error occurred while preparing payment. Please try again.");
      setIsProcessing(false);
      return;
    }
    // --- END NEW ---

    const options = {
      // IMPORTANT: Replace with your actual Razorpay Key ID
      key: "YOUR_RAZORPAY_KEY_ID",
      amount: orderResponse.amount, // Use amount returned by backend (should match what you sent)
      currency: orderResponse.currency, // Use currency returned by backend
      name: "MakeMoney24",
      description: isEmiConfirmed ? "EMI Initial Payment" : "Product Purchase",
      image: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=MM24",
      order_id: orderResponse.orderId, // <--- Use the order_id from your backend here
      handler: (response) => handlePaymentSuccess(response),
      prefill: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
      },
      notes: {
        orderType: isEmiConfirmed ? "EMI" : "Full Payment",
        // Additional notes can be added here
      },
      theme: {
        color: "#8B5CF6", // Purple
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on("payment.failed", (response) =>
      handlePaymentError(response.error)
    );
    paymentObject.open();
  }, [
    isEmiConfirmed,
    totalDownPaymentDue,
    finalTotal,
    shippingInfo,
    session?.id, // Added session.id for receipt
    handlePaymentSuccess,
    handlePaymentError,
    // createRazorpayOrderApi implicitly used by the call
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission initiated (client-side validation check).");

    // Form validation
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
      alert(
        "Please fill in all shipping information before proceeding to payment."
      );
      console.log("Shipping information missing.");
      return;
    }
    if (
      !sameAsShipping &&
      (!billingInfo.firstName ||
        !billingInfo.lastName ||
        !billingInfo.address ||
        !billingInfo.city ||
        !billingInfo.state ||
        !billingInfo.pincode)
    ) {
      alert(
        "Please fill in all billing information before proceeding to payment."
      );
      console.log("Billing information missing.");
      return;
    }

    console.log(
      `Client-side validation passed. ${
        isEmiConfirmed ? "EMI initial payment" : "Full payment"
      } expected to be triggered next.`
    );

    // Trigger Razorpay payment
    openRazorpay();
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
    if (
      remainingAmountForEmi <= 0 &&
      parseInt(emiTenure) > 0 &&
      downPayment < 100
    ) {
      alert(
        "Remaining amount for EMI must be greater than zero for installments, or down payment must be 100%."
      );
      return;
    }
    if (monthlyEmi <= 0 && remainingAmountForEmi > 0) {
      alert(
        "Calculated monthly EMI is zero or less. Adjust down payment or tenure."
      );
      return;
    }

    console.log("--- EMI Conversion Confirmed ---");
    console.log(`Original Total: ₹${finalTotal.toLocaleString()}`);
    console.log(`Down Payment Percentage: ${downPayment}%`);
    console.log(`Down Payment Amount: ₹${downPaymentAmount.toLocaleString()}`);
    console.log(`Processing Fee: ₹${processingFee.toLocaleString()}`);
    console.log(
      `Total Due Now (Down Payment + Fee): ₹${totalDownPaymentDue.toLocaleString()}`
    );
    console.log(
      `Remaining Amount for EMIs: ₹${remainingAmountForEmi.toLocaleString()}`
    );
    console.log(`Selected EMI Tenure: ${emiTenure} months`);
    console.log(`Estimated Monthly EMI: ₹${monthlyEmi.toLocaleString()}`);
    console.log(
      `Overall Total Payable (Down Payment + Monthly EMIs): ₹${(
        totalDownPaymentDue +
        monthlyEmi * parseInt(emiTenure)
      ).toLocaleString()}`
    );

    setIsEmiConfirmed(true); // Mark EMI as confirmed
    setShowEmiDialog(false); // Close the dialog
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
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="mumbai">Mumbai</SelectItem>
                          <SelectItem value="bangalore">Bangalore</SelectItem>
                          <SelectItem value="chennai">Chennai</SelectItem>
                          <SelectItem value="kolkata">Kolkata</SelectItem>
                          {/* Add more states as needed */}
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

              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-yellow-600" />
                    Billing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-as-shipping"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => {
                        setSameAsShipping(checked);
                        if (checked) {
                          setBillingInfo(shippingInfo);
                        }
                      }}
                    />
                    <Label htmlFor="same-as-shipping">
                      Same as shipping address
                    </Label>
                  </div>

                  {!sameAsShipping && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-firstName">First Name</Label>
                          <Input
                            id="billing-firstName"
                            value={billingInfo.firstName}
                            onChange={(e) =>
                              handleBillingChange("firstName", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-lastName">Last Name</Label>
                          <Input
                            id="billing-lastName"
                            value={billingInfo.lastName}
                            onChange={(e) =>
                              handleBillingChange("lastName", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="billing-address">Address</Label>
                        <Textarea
                          id="billing-address"
                          value={billingInfo.address}
                          onChange={(e) =>
                            handleBillingChange("address", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billing-city">City</Label>
                          <Input
                            id="billing-city"
                            value={billingInfo.city}
                            onChange={(e) =>
                              handleBillingChange("city", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-state">State</Label>
                          <Select
                            value={billingInfo.state}
                            onValueChange={(value) =>
                              handleBillingChange("state", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="delhi">Delhi</SelectItem>
                              <SelectItem value="mumbai">Mumbai</SelectItem>
                              <SelectItem value="bangalore">
                                Bangalore
                              </SelectItem>
                              {/* Add more states as needed */}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="billing-pincode">Pincode</Label>
                          <Input
                            id="billing-pincode"
                            value={billingInfo.pincode}
                            onChange={(e) =>
                              handleBillingChange("pincode", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
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
                    <input type="checkbox" className="mr-2 mt-1" required />
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
              onClick={handleEmiConfirmation} // Now calls handleEmiConfirmation
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
