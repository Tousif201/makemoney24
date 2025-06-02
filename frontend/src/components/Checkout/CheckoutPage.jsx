import { useState } from "react";
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
import { MapPin, User, Lock } from "lucide-react";
import { useCart } from "../../context/CartContext";
import RazorpayPaymentButton from "../RazorpayPaymentButton";
import { useSession } from "../../context/SessionContext";
import { handleCheckout } from "../../../api/checkout"; // Your integrated checkout API

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const { session } = useSession();
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

  const totalPrice = getTotalPrice();
  const shippingCost = 0; // Free shipping
  const finalTotal = totalPrice + shippingCost;

  const handleShippingChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    if (sameAsShipping) {
      setBillingInfo((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingChange = (field, value) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * handlePaymentSuccess now filters items by vendor and calls the backend's
   * handleCheckout API for each vendor, after a successful Razorpay payment.
   * @param {Object} razorpayResponse - The response object from a successful Razorpay payment.
   */
  const handlePaymentSuccess = async (razorpayResponse) => {
    console.log("--- handlePaymentSuccess initiated (Razorpay callback) ---");
    console.log("Razorpay Response:", razorpayResponse);
    setIsProcessing(true); // Start processing after successful payment

    try {
      // 1. Group cart items by vendor
      console.log("Step 1: Grouping cart items by vendor...");
      const itemsByVendor = items.reduce((acc, item) => {
        const vendorId = item.vendor; // Assuming 'vendor' property holds the vendor ID
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

      // 2. Iterate through each vendor group and call handleCheckout
      console.log("Step 2: Calling handleCheckout for each vendor...");
      for (const vendorId in itemsByVendor) {
        const vendorItems = itemsByVendor[vendorId];
        const vendorOrderSubtotal = vendorItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const checkoutPayload = {
          userId: session?.id,
          vendorId: vendorId, // Specific vendor ID for this order
          items: vendorItems.map((item) => ({
            productServiceId: item.id,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant, // Include variant if applicable
          })),
          totalAmount: vendorOrderSubtotal, // Total for this specific vendor's order
          address: shippingInfo, // Using shipping info as the primary address for the order
          // Pass Razorpay details for the first order, or adapt if your backend needs them for each.
          // For simplicity, we'll pass them to the first successful order.
          razorpayPaymentId: razorpayResponse.razorpay_payment_id,
          razorpayOrderId: razorpayResponse.razorpay_order_id,
          razorpaySignature: razorpayResponse.razorpay_signature,
        };

        console.log(`Attempting to call handleCheckout for Vendor ID: ${vendorId} with payload:`, checkoutPayload);

        try {
          const response = await handleCheckout(checkoutPayload);
          if (response.success) {
            console.log(`Order for Vendor ID ${vendorId} successful:`, response);
            createdOrderIds.push(response.order._id);
            successCount++;
          } else {
            console.error(`Order for Vendor ID ${vendorId} failed:`, response.message);
            failureCount++;
            // Optionally, accumulate messages for a final alert
          }
        } catch (error) {
          console.error(`Error calling handleCheckout for Vendor ID ${vendorId}:`, error);
          failureCount++;
        }
      }

      console.log("All handleCheckout calls completed.");
      console.log(`Successful orders: ${successCount}, Failed orders: ${failureCount}`);

      if (successCount > 0) {
        alert(`Orders placed successfully for ${successCount} vendor(s)! ${failureCount > 0 ? `(${failureCount} failed)` : ''}`);
        clearCart(); // Clear the entire cart after all orders are processed
        console.log("Cart cleared.");
        navigate(`/checkout/success?orderIds=${createdOrderIds.join(',')}`); // Navigate to a success page
      } else {
        alert("All orders failed to place. Please contact support.");
      }

    } catch (error) {
      console.error("An unexpected error occurred during multi-vendor checkout:", error);
      alert("An unexpected error occurred during checkout. Please try again.");
    } finally {
      console.log("--- handlePaymentSuccess finished ---");
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment error (from Razorpay):", error);
    alert(
      `Payment Failed: ${
        error.description || error.message || "Please try again."
      }`
    );
    setIsProcessing(false); // Stop processing on payment error
  };

  const generateReceiptId = (userId) => {
    const timestampSuffix = Date.now().toString().slice(-10);
    return `MM_${userId}_${timestampSuffix}`;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission initiated (client-side validation check).");
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
      "Client-side validation passed. Razorpay payment expected to be triggered next."
    );
    // The RazorpayPaymentButton will handle the payment initiation
    // and then call handlePaymentSuccess on success.
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
                  </div>
                  <RazorpayPaymentButton
                    amount={finalTotal * 100} // Razorpay expects amount in paisa
                    receiptId={generateReceiptId(session.id)}
                    companyName="MakeMoney24"
                    description="Product Purchase"
                    logoUrl="https://placehold.co/100x100/8B5CF6/FFFFFF?text=MM24"
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isProcessing}
                  >
                    <Button
                      type="submit" // Changed to submit to trigger form validation
                      className="w-full"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4 text-green-400" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </RazorpayPaymentButton>

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
    </div>
  );
}
