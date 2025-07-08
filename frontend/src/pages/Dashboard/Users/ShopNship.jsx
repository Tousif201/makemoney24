import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const ShopNship = () => {
  const [formData, setFormData] = useState({
    company: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    isDefault: false,
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Shop & Ship request submitted!");
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start bg-gradient-to-br from-white to-blue-50 px-4 py-10">
      <Card className="w-full max-w-4xl shadow-xl border border-indigo-200 rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-indigo-900">
            🛒 Shop & Ship Request
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Provide your shipping address to place a request.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div> */}
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isDefault: checked }))
                  }
                />
                <Label htmlFor="isDefault">Set as Default Address</Label>
              </div>
            </div>

            {/* Terms & Conditions + Submit */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-center space-x-3 mt-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <Label htmlFor="termsAccepted" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="/terms" className="text-indigo-600 underline">
                    Terms and Conditions
                  </a>
                </Label>
              </div>

              <Button type="submit" className="w-full text-base font-semibold tracking-wide py-2 rounded-md">
                🚀 Submit Shop & Ship Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
