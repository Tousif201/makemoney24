import React, { useState, useEffect } from "react";
import axios from 'axios';
import { AddVendorAddress } from "../../../../api/Vendors";
import { StatCard } from "@/components/ui/stat-card";
import { OrderCard } from "@/components/ui/order-card";
import { OrdersTrendChart } from "@/components/charts/orders-trend-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  RocketIcon,
  IndianRupee,
  Plus,
} from "lucide-react";
import { useSession } from "../../../context/SessionContext";
import { getVendorDashboardAnalytics } from "../../../../api/analytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorHome() {
  const { session, loading: sessionLoading } = useSession();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (sessionLoading) return;
      const vendorId = session.id;
      if (!vendorId) {
        setError("Vendor ID not found. Please ensure you are logged in as a vendor.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getVendorDashboardAnalytics(vendorId);
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load dashboard analytics. Please check your connection or try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [session, sessionLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const addressData = {
        address,
        city,
        state,
        country,
        pincode,
        isDefault,
      };
      const response = await AddVendorAddress(addressData);
      console.log("Address created successfully:", response);
      // Optionally, you can close the dialog or show a success message here
    } catch (error) {
      console.error("Failed to create address:", error);
      // Optionally, you can show an error message here
    }
  };

  const stats = [
    {
      title: "Total Orders",
      value: analyticsData ? analyticsData.totalOrders.noOfOrders.toLocaleString() : "0",
      change: analyticsData ? analyticsData.totalOrders.incrementFromLastMonth : "0",
      icon: ShoppingCart,
      trend: analyticsData ? (parseFloat(analyticsData.totalOrders.incrementFromLastMonth) >= 0 ? "up" : "down") : "up",
    },
    {
      title: "Revenue",
      value: analyticsData ? `₹${analyticsData.revenue.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00",
      change: analyticsData ? analyticsData.revenue.incrementFromLastMonth : "0",
      icon: IndianRupee,
      trend: analyticsData ? (parseFloat(analyticsData.revenue.incrementFromLastMonth) >= 0 ? "up" : "down") : "up",
    },
    {
      title: "Commission Earned",
      value: analyticsData ? `₹${(analyticsData.revenue.amount * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00",
      change: analyticsData ? analyticsData.revenue.incrementFromLastMonth : "0",
      icon: TrendingUp,
      trend: analyticsData ? (parseFloat(analyticsData.revenue.incrementFromLastMonth) >= 0 ? "up" : "down") : "up",
    },
    {
      title: "Products Sold",
      value: analyticsData ? analyticsData.productsSold.noOfProducts.toLocaleString() : "0",
      change: analyticsData ? analyticsData.productsSold.incrementFromLastMonth : "0",
      icon: Package,
      trend: analyticsData ? (parseFloat(analyticsData.productsSold.incrementFromLastMonth) >= 0 ? "up" : "down") : "up",
    },
  ];

  const recentOrders = analyticsData && analyticsData.recentOrders
    ? analyticsData.recentOrders.map((order) => ({
        id: order.orderId,
        customer: order.userName,
        product: order.items && order.items.length > 0 ? order.items[0].name : "Various Products",
        amount: `₹${order.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: order.orderStatus,
        date: new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      }))
    : [];

  const ordersTrendChartData = analyticsData ? Object.values(analyticsData.ordersTrend) : [];

  if (sessionLoading || loading) {
    return (
      <div className="space-y-8 mx-8 my-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-8 my-8">
        <Alert variant="destructive" className="border-red-400 bg-red-50/50 text-red-800">
          <RocketIcon className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Error Loading Dashboard</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-8 my-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Vendor Dashboard Overview
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back! Here's a quick look at your store's performance.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex justify-end mr-3">
              <button className="flex rounded-sm bg-teal-600 text-amber-50 px-3 py-1 font-semibold border-blue-700 border">
                <Plus className="h-5 mt-0.5" /> Add address
              </button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label>Address</Label>
                <Input placeholder="Enter your address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <Label>State</Label>
                  <Input placeholder="Enter state" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input placeholder="Enter country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input placeholder="Enter pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox id="terms" checked={isDefault} onCheckedChange={setIsDefault} />
                <Label htmlFor="terms">Is This Your Default Address</Label>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={agreed}>
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="border-purple-200 shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Orders Trend
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your order volume over the last 7 days. Data resets weekly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-full">
                {ordersTrendChartData.length > 0 ? (
                  <OrdersTrendChart chartData={ordersTrendChartData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No order trend data available for this week.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="border-purple-200 shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Recent Orders
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your latest customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <OrderCard key={order.id} {...order} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent orders found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
