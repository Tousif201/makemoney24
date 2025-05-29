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
      // Ensure session and vendor ID are available and not still loading
      if (sessionLoading) return;

      const vendorId = session.id;

      if (!vendorId) {
        // If session is loaded but vendorId is missing (e.g., not logged in as vendor)
        setError(
          "Vendor ID not found. Please ensure you are logged in as a vendor."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getVendorDashboardAnalytics(vendorId); // Pass vendorId to the API function
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(
          "Failed to load dashboard analytics. Please check your connection or try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session, sessionLoading]); // Re-run when session or sessionLoading changes

  // Derived state for easier access in JSX
  const stats = analyticsData
    ? [
        {
          title: "Total Orders",
          value: analyticsData.totalOrders.noOfOrders.toLocaleString(),
          change: analyticsData.totalOrders.incrementFromLastMonth,
          icon: ShoppingCart,
          // Trend is 'up' if increment is positive or zero, 'down' if negative
          trend:
            parseFloat(analyticsData.totalOrders.incrementFromLastMonth) >= 0
              ? "up"
              : "down",
        },
        {
          title: "Revenue",
          value: `$${analyticsData.revenue.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          change: analyticsData.revenue.incrementFromLastMonth,
          icon: DollarSign,
          trend:
            parseFloat(analyticsData.revenue.incrementFromLastMonth) >= 0
              ? "up"
              : "down",
        },
        {
          title: "Commission Earned",
          // Calculate commission (e.g., 10% of revenue based on the example in the prompt)
          value: `$${(analyticsData.revenue.amount * 0.1).toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`,
          // Assuming commission trend aligns with revenue trend, or would be a separate analytics field
          change: analyticsData.revenue.incrementFromLastMonth, // Use revenue change for commission change
          icon: TrendingUp,
          trend:
            parseFloat(analyticsData.revenue.incrementFromLastMonth) >= 0
              ? "up"
              : "down",
        },
        {
          title: "Products Sold", // Renamed from Active Products to better reflect 'productsSold' from backend
          value: analyticsData.productsSold.noOfProducts.toLocaleString(),
          change: analyticsData.productsSold.incrementFromLastMonth,
          icon: Package,
          trend:
            parseFloat(analyticsData.productsSold.incrementFromLastMonth) >= 0
              ? "up"
              : "down",
        },
      ]
    : [];

  const recentOrders = analyticsData
    ? analyticsData.recentOrders.map((order) => ({
        id: order.orderId,
        customer: order.userName,
        // Assuming 'items' exists and has a 'name' property for the first item
        product:
          order.items && order.items.length > 0
            ? order.items[0].name
            : "Various Products",
        amount: `$${order.orderAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        status: order.orderStatus,
        date: new Date(order.orderDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }))
    : [];

  // Data for OrdersTrendChart (assuming it expects an array of numbers corresponding to days)
  const ordersTrendChartData = analyticsData
    ? Object.values(analyticsData.ordersTrend)
    : [];

  if (sessionLoading || loading) {
    return (
      <div className="space-y-8 mx-8 my-8 animate-pulse">
        {" "}
        {/* Added animate-pulse for a subtle loading effect */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {" "}
          {/* Increased gap for better spacing */}
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-32 w-full rounded-xl"
            /> /* Taller, rounded skeletons for cards */
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Skeleton className="h-[300px] w-full rounded-xl" />{" "}
            {/* Specific height for chart */}
          </div>
          <div>
            <Skeleton className="h-[300px] w-full rounded-xl" />{" "}
            {/* Specific height for recent orders */}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-8 my-8">
        <Alert
          variant="destructive"
          className="border-red-400 bg-red-50/50 text-red-800"
        >
          <RocketIcon className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">
            Error Loading Dashboard
          </AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
        {/* Optional: Add a retry button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (
    !analyticsData ||
    (analyticsData.totalOrders.noOfOrders === 0 &&
      analyticsData.revenue.amount === 0 &&
      recentOrders.length === 0)
  ) {
    return (
      <div className="mx-8 my-8 flex flex-col items-center justify-center h-[calc(100vh-160px)] bg-gray-50 rounded-lg p-6">
        <Package className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No Sales Data Yet!
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          It looks like there's no activity for your store right now. Start
          adding products and promoting your shop to see your dashboard come
          alive!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-8 my-8">
      {" "}
      {/* Increased overall spacing */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {" "}
          {/* Larger, bolder title */}
          Vendor Dashboard Overview
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back! Here's a quick look at your store's performance.
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {" "}
        {/* Consistent gap */}
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders Trend Chart */}
        <div className="xl:col-span-2">
          <Card className="border-purple-200 shadow-sm transition-all duration-300 hover:shadow-md">
            {" "}
            {/* Enhanced card styling */}
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Orders Trend
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your order volume over the last 7 days. Data resets weekly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                {" "}
                {/* Set a fixed height for the chart container */}
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

        {/* Recent Orders */}
        <div>
          <Card className="border-purple-200 shadow-sm transition-all duration-300 hover:shadow-md">
            {" "}
            {/* Enhanced card styling */}
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
