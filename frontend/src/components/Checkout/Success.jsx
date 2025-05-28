import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link from react-router-dom
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, Mail, Package, Truck } from "lucide-react";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate(); // Use useNavigate from react-router-dom
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("lastOrder");
    if (savedOrder) {
      try {
        setOrderData(JSON.parse(savedOrder));
      } catch (error) {
        console.error("Error loading order data:", error);
        navigate("/"); // Use navigate for redirection
      }
    } else {
      navigate("/"); // Use navigate for redirection
    }
  }, [navigate]);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully
            placed.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
            <span className="font-medium">Order ID: {orderData.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div
                      key={`${item.id}-${item.variant?.color}-${item.variant?.size}`}
                      className="flex gap-4"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {/* Replaced Next.js Image with standard <img> */}
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.vendor}</p>
                        {item.variant && (
                          <div className="flex gap-2 mt-1">
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
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {orderData.shippingInfo.firstName}{" "}
                    {orderData.shippingInfo.lastName}
                  </p>
                  <p className="text-gray-600">
                    {orderData.shippingInfo.address}
                  </p>
                  <p className="text-gray-600">
                    {orderData.shippingInfo.city},{" "}
                    {orderData.shippingInfo.state}{" "}
                    {orderData.shippingInfo.pincode}
                  </p>
                  <p className="text-gray-600">
                    {orderData.shippingInfo.phone}
                  </p>
                  <p className="text-gray-600">
                    {orderData.shippingInfo.email}
                  </p>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">Estimated Delivery</span>
                  </div>
                  <p className="text-blue-600 mt-1">
                    {estimatedDelivery.toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        1
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">Order Confirmation</h4>
                      <p className="text-sm text-gray-600">
                        You'll receive an email confirmation with your order
                        details shortly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">Order Processing</h4>
                      <p className="text-sm text-gray-600">
                        Our vendors will prepare your items for shipment within
                        1-2 business days.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">Shipping & Tracking</h4>
                      <p className="text-sm text-gray-600">
                        You'll receive tracking information once your order
                        ships.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{orderData.totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (GST)</span>
                    <span>₹{orderData.totals.tax.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total Paid</span>
                    <span>₹{orderData.totals.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Receipt
                  </Button>
                  {/* Use React Router DOM Link */}
                  <Link to="/browse">
                    <Button className="w-full">Continue Shopping</Button>
                  </Link>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <Link
                      to="/support"
                      className="block text-blue-600 hover:underline"
                    >
                      Contact Customer Support
                    </Link>
                    <Link
                      to="/track-order"
                      className="block text-blue-600 hover:underline"
                    >
                      Track Your Order
                    </Link>
                    <Link
                      to="/returns"
                      className="block text-blue-600 hover:underline"
                    >
                      Return Policy
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
