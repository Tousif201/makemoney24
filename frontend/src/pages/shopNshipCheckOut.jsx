import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CheckoutPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [products] = useState([
    {
      id: 1,
      name: "Ayurvedic Hair Oil",
      price: 499,
      qty: 1,
      image: "https://via.placeholder.com/80",
    },
    {
      id: 2,
      name: "Organic Face Cream",
      price: 699,
      qty: 2,
      image: "https://via.placeholder.com/80",
    },
  ]);

  const subtotal = products.reduce((total, item) => total + item.price * item.qty, 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* LEFT: Shipping Form */}
        <Card className="md:col-span-2 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
              <Input
                placeholder="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                placeholder="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <Input
                placeholder="City"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <Input
              placeholder="Full Address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
              />
              <Input
                placeholder="State"
                name="state"
                value={form.state}
                onChange={handleChange}
              />
            </div>
            <Button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600">
              Proceed to Payment
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT: Order Summary */}
        <Card className="shadow-lg border-none h-fit">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="text-gray-700 font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    ₹{item.price} × {item.qty}
                  </p>
                </div>
                <div className="text-right text-gray-700 font-semibold">
                  ₹{item.price * item.qty}
                </div>
              </div>
            ))}
            <hr />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
