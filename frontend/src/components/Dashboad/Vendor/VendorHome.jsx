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
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  RocketIcon,
  IndianRupee,
} from "lucide-react";
import { useSession } from "../../../context/SessionContext";
import { getVendorDashboardAnalytics } from "../../../../api/analytics";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorHome() {
  const { session, loading: sessionLoading } = useSession();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
