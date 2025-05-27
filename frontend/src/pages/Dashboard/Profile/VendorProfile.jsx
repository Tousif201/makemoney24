import { Plus, Trash2, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function VendorProfile() {
  return (
    <div className="space-y-6 my-8 mx-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Profile & Settings
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your vendor profile and account settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            Vendor Info
          </TabsTrigger>
          <TabsTrigger value="commission" className="text-xs sm:text-sm">
            Commission
          </TabsTrigger>
          <TabsTrigger value="pincode" className="text-xs sm:text-sm">
            Pincode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>Edit Vendor Information</CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" defaultValue="Tech Store Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input id="contact-person" defaultValue="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john@techstore.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  defaultValue="123 Tech Street, Silicon Valley, CA 94000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  defaultValue="Leading provider of consumer electronics and tech accessories."
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>Commission Information</CardTitle>
              <CardDescription>
                View your commission structure and earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-sm sm:text-base">
                      Base Commission
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    8%
                  </p>
                  <p className="text-sm text-gray-600">On all sales</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-sm sm:text-base">
                      Performance Bonus
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    2%
                  </p>
                  <p className="text-sm text-gray-600">Above $10k monthly</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-sm sm:text-base">
                      Payment Cycle
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    Monthly
                  </p>
                  <p className="text-sm text-gray-600">15th of each month</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Commission History</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm sm:text-base">January 2024</span>
                    <span className="font-medium">$4,523</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm sm:text-base">December 2023</span>
                    <span className="font-medium">$3,892</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm sm:text-base">November 2023</span>
                    <span className="font-medium">$4,156</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pincode">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>Pincode Management</CardTitle>
              <CardDescription>
                Manage delivery areas and shipping zones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter pincode (e.g., 110001)"
                  className="flex-1"
                />
                <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pincode
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Serviceable Pincodes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {[
                    "110001",
                    "110002",
                    "110003",
                    "110004",
                    "110005",
                    "110006",
                    "110007",
                    "110008",
                  ].map((pincode) => (
                    <div
                      key={pincode}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border"
                    >
                      <span className="text-sm">{pincode}</span>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Delivery Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor="same-day"
                        className="text-sm sm:text-base"
                      >
                        Same Day Delivery
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Enable same day delivery for nearby areas
                      </p>
                    </div>
                    <Switch id="same-day" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="cod" className="text-sm sm:text-base">
                        Cash on Delivery
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Accept cash payments on delivery
                      </p>
                    </div>
                    <Switch id="cod" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor="free-shipping"
                        className="text-sm sm:text-base"
                      >
                        Free Shipping
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Offer free shipping above certain amount
                      </p>
                    </div>
                    <Switch id="free-shipping" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
