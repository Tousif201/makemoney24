import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  IndianRupee,
  Package,
  Gift,
  Copy,
  Users,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast for notifications
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSession } from "../../../context/SessionContext";
import { Link } from "react-router-dom";
import { getAffiliateDashboardData } from "../../../../api/affiliate2";

// This can remain if you want to keep the static recent activities for now
const recentActivities = [
  { id: 1, action: "New order placed", user: "John Doe", time: "2 minutes ago", type: "order" },
  { id: 3, action: "Commission payout processed", user: "System", time: "1 hour ago", type: "commission" },
  { id: 4, action: "New member joined network", user: "Jane Smith", time: "2 hours ago", type: "network" },
];

export default function AffiliateHome() {
  // const { session } = useSession();

  // 1. State Management for API data, loading, and errors
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
// const token = localStorage.getItem("authToken")
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAffiliateDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  


  const handleCopyClick = () => {
    if (!dashboardData?.productReferralLink) return;
    navigator.clipboard.writeText(dashboardData.productReferralLink);
    toast.success("Referral link copied to clipboard!");
  };

  // 3. Transform API data into the format the UI expects
  const dashboardStats = dashboardData ? [
    {
      title: "Total Commission Earned",
      value: `₹${dashboardData.totalCommissionEarned.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-green-600",
    },
    {
      title: "Total Products Sold",
      value: dashboardData.totalProductSaled,
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Total Affiliate Orders",
      value: dashboardData.totalAffiliateOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
  ] : [];

  // Helper for rendering recent activity icons
  const getActivityIcon = (type) => {
    switch (type) {
      case "order": return <ShoppingCart className="h-4 w-4" />;
      case "commission": return <IndianRupee className="h-4 w-4" />;
      case "network": return <Users className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };
  
  // 4. Conditional Rendering based on state
  if (loading) {
    return <div className="p-5 text-center">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="p-5 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 p-5">
      {/* Welcome Heading */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {dashboardData?.name}! Here's what's happening with your business.
        </p>
      </div>

      {/* Referral Link Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-ivory/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-sage/20">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-sage shrink-0" />
          <span className="font-medium text-earth text-sm sm:text-base">Your Referral Link:</span>
        </div>
        <div className="flex flex-row sm:flex-row sm:items-center gap-1 sm:ml-auto w-full sm:w-auto">
          <Link
            to={dashboardData?.productReferralLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto truncate hover:text-blue-500 text-green-700"
          >
            {dashboardData?.productReferralLink || "Link not available"}
          </Link>
          <Copy
            className="h-4 w-4 text-earth/60 cursor-pointer hover:text-sage transition-colors shrink-0 self-center sm:self-auto"
            onClick={handleCopyClick}
          />
        </div>
      </div>

      {/* Stats Cards - Now driven by API data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* The 'change' from last month is not provided by your backend. It has been removed. */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities - Still using static data */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest updates from your ShopNship account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}