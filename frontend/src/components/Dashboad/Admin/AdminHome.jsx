"use client";

import { useState, useEffect } from "react"; // Import useState and useEffect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  TrendingUp,
  Users,
  DollarSign,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShoppingBag,
  UserPlus,
  Target,
  Loader2,
  IndianRupee, // Added for loading state
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAdminDashboardAnalytics } from "../../../../api/analytics"; // Correct import path

export default function AdminHome() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminDashboardAnalytics();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching admin dashboard analytics:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []); // Empty dependency array means this runs once on mount

  // Helper function to determine trend arrow and color
  const getTrendIndicator = (increment) => {
    const value = parseFloat(increment);
    if (isNaN(value))
      return { icon: null, color: "text-muted-foreground", text: "N/A" };
    if (value > 0) {
      return {
        icon: ArrowUpRight,
        color: "text-green-600",
        text: `+${value}%`,
      };
    } else if (value < 0) {
      return { icon: ArrowDownRight, color: "text-red-600", text: `${value}%` };
    } else {
      return { icon: null, color: "text-muted-foreground", text: "0%" };
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
        <p className="mt-4 text-xl text-gray-700">Loading dashboard data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 text-red-600 text-lg p-4">
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-500">
          Please check your network connection or try refreshing the page.
        </p>
      </div>
    );
  }

  // Fallback for when data is null after loading (shouldn't happen with error handling)
  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <p className="text-lg text-gray-700">No dashboard data available.</p>
      </div>
    );
  }

  // Destructure data for easier access
  const {
    totalRevenue,
    memberShipUser,
    totalOrders,
    rewardsDistributed,
    salesOverviewData,
    membershipData, // This will be the actual pie chart data
    growthMatrices, // This will have users, vendors, franchises arrays
    topPerformingVendors,
    recentActivity, // This will be the actual recent activity data
  } = dashboardData;

  // Prepare membership data for PieChart (mock data had value and count, API has just numbers)
  // We need to calculate percentages and assign colors.
  const totalUsers =
    (membershipData[0]?.value || 0) + (membershipData[1]?.value || 0);
  const formattedMembershipData = [
    {
      name: membershipData[0]?.name || "Members",
      value:
        totalUsers > 0
          ? parseFloat(
              ((membershipData[0]?.value || 0) / totalUsers) * 100
            ).toFixed(2)
          : 0,
      count: membershipData[0]?.value || 0,
      color: "#4CAF50", // Green for members
    },
    {
      name: membershipData[1]?.name || "Non-Members",
      value:
        totalUsers > 0
          ? parseFloat(
              ((membershipData[1]?.value || 0) / totalUsers) * 100
            ).toFixed(2)
          : 0,
      count: membershipData[1]?.value || 0,
      color: "#FF9800", // Orange for non-members
    },
  ];

  // Colors for Growth Metrics lines
  const growthConfig = {
    users: { label: "Users", color: "hsl(217, 91%, 60%)" }, // Blue
    vendors: { label: "Vendors", color: "hsl(142, 76%, 36%)" }, // Green
    franchises: { label: "Franchises", color: "hsl(38, 92%, 50%)" }, // Orange
  };

  return (
    <div>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between h-auto sm:h-16 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <h1 className="text-lg font-semibold">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 w-fit text-sm"
        >
          <Activity className="w-3 h-3 mr-1" />
          All Systems Operational
        </Badge>
      </header>

      <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Total Revenue
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <IndianRupee className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
              ₹{parseFloat(totalRevenue.amt).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {(() => {
                  // Destructure the icon, color, and text from a single call to getTrendIndicator
                  const {
                    icon: RevenueTrendIcon,
                    color: revenueTrendColor,
                    text: revenueTrendText,
                  } = getTrendIndicator(totalRevenue.incrementFromLastMonth);
                  return (
                    <>
                      {RevenueTrendIcon && ( // Render the icon component if it exists
                        <RevenueTrendIcon
                          className={`h-3 w-3 ${revenueTrendColor}`}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${revenueTrendColor}`}
                      >
                        {revenueTrendText}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        from last month
                      </span>
                    </>
                  );
                })()}
              </div>
              {/* Progress bar logic could be more dynamic, e.g., based on target or previous period's performance */}
              <Progress
                value={Math.min(
                  100,
                  parseFloat(totalRevenue.incrementFromLastMonth) + 100
                )}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Membership Users
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {memberShipUser.amount.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {(() => {
                  const {
                    icon: MembershipTrendIcon,
                    color: membershipTrendColor,
                    text: membershipTrendText,
                  } = getTrendIndicator(memberShipUser.incrementFromLastMonth);
                  return (
                    <>
                      {MembershipTrendIcon && (
                        <MembershipTrendIcon
                          className={`h-3 w-3 ${membershipTrendColor}`}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${membershipTrendColor}`}
                      >
                        {membershipTrendText}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        from last month
                      </span>
                    </>
                  );
                })()}
              </div>
              <Progress
                value={Math.min(
                  100,
                  parseFloat(memberShipUser.incrementFromLastMonth) + 100
                )}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                Total Orders
              </CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {totalOrders.amt.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {(() => {
                  // Using an immediately invoked function expression (IIFE)
                  const TrendIcon = getTrendIndicator(
                    totalOrders.incrementFromLastMonth
                  ).icon;
                  const trendData = getTrendIndicator(
                    totalOrders.incrementFromLastMonth
                  );
                  return (
                    <>
                      {TrendIcon && (
                        <TrendIcon className={`h-3 w-3 ${trendData.color}`} />
                      )}
                      <span
                        className={`text-sm font-medium ${trendData.color}`}
                      >
                        {trendData.text}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        from last month
                      </span>
                    </>
                  );
                })()}
              </div>

              <Progress
                value={Math.min(
                  100,
                  parseFloat(totalOrders.incrementFromLastMonth) + 100
                )}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Rewards Distributed
              </CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
              ₹{parseFloat(rewardsDistributed.amt).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {(() => {
                  const {
                    icon: RewardsTrendIcon,
                    color: rewardsTrendColor,
                    text: rewardsTrendText,
                  } = getTrendIndicator(
                    rewardsDistributed.incrementFromLastMonth
                  );
                  return (
                    <>
                      {RewardsTrendIcon && (
                        <RewardsTrendIcon
                          className={`h-3 w-3 ${rewardsTrendColor}`}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${rewardsTrendColor}`}
                      >
                        {rewardsTrendText}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        from last month
                      </span>
                    </>
                  );
                })()}
              </div>
              <Progress
                value={Math.min(
                  100,
                  parseFloat(rewardsDistributed.incrementFromLastMonth) + 100
                )}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Sales Overview */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Sales Overview</CardTitle>
                  <CardDescription>
                    Monthly sales performance and trends
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {
                    getTrendIndicator(totalRevenue.incrementFromLastMonth).text
                  }{" "}
                  Growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(217, 91%, 60%)",
                  },
                }}
                className="aspect-[4/3] min-h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesOverviewData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(217, 91%, 60%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(217, 91%, 60%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(1)}k`
                      }
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(217, 91%, 60%)"
                      fill="url(#revenueGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Membership Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Membership Tiers</CardTitle>
              <CardDescription>
                Current user distribution across membership levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  // Dynamically build config based on formattedMembershipData names
                  ...formattedMembershipData.reduce((acc, item) => {
                    acc[item.name.toLowerCase().replace(/\s/g, "")] = {
                      label: item.name,
                      color: item.color,
                    };
                    return acc;
                  }, {}),
                }}
                className="aspect-[4/3] min-h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formattedMembershipData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count" // Use count for the pie chart value
                    >
                      {formattedMembershipData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                {data.value}% ({data.count} users)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2">
                {formattedMembershipData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.value}%</span>
                      <span className="text-muted-foreground">
                        ({item.count})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Growth Metrics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Growth Metrics</CardTitle>
              <CardDescription>
                Monthly growth across key entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={growthConfig}
                className="aspect-[4/3] min-h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthMatrices.users.map((u, i) => ({
                      month: u.month,
                      users: u.count,
                      vendors: growthMatrices.vendors[i]?.count || 0,
                      franchises: growthMatrices.franchises[i]?.count || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke={growthConfig.users.color}
                      strokeWidth={2}
                      dot={{
                        fill: growthConfig.users.color,
                        strokeWidth: 2,
                        r: 4,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="vendors"
                      stroke={growthConfig.vendors.color}
                      strokeWidth={2}
                      dot={{
                        fill: growthConfig.vendors.color,
                        strokeWidth: 2,
                        r: 4,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="franchises"
                      stroke={growthConfig.franchises.color}
                      strokeWidth={2}
                      dot={{
                        fill: growthConfig.franchises.color,
                        strokeWidth: 2,
                        r: 4,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Vendors */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Top Performing Vendors</CardTitle>
              <CardDescription>
                Highest revenue generating vendors this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingVendors.length > 0 ? (
                  topPerformingVendors.map((vendor, index) => (
                    <div
                      key={vendor.vendorName || index} // Use vendorName or index as key
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {vendor.vendorName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vendor.noOfOrders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                        ₹{parseFloat(vendor.revenue.amt).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          {getTrendIndicator(vendor.revenue.rateofGrowth).text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No top performing vendors this month.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>
                Latest platform activities and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div
                      key={activity._id || index} // Use activity ID or index as key
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          activity.activityType.includes("Order")
                            ? "bg-green-100 text-green-600"
                            : activity.activityType.includes("User")
                            ? "bg-blue-100 text-blue-600"
                            : activity.activityType.includes("Vendor")
                            ? "bg-purple-100 text-purple-600"
                            : activity.activityType.includes("Franchise")
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {activity.activityType.includes("Order") ? (
                          <ShoppingBag className="w-3 h-3" />
                        ) : activity.activityType.includes("User") ? (
                          <UserPlus className="w-3 h-3" />
                        ) : activity.activityType.includes("Vendor") ? (
                          <Target className="w-3 h-3" />
                        ) : activity.activityType.includes("Franchise") ? (
                          <IndianRupee className="w-3 h-3" /> // Using dollar sign for franchise creation (can change icon)
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.activityDate}
                        </p>
                      </div>
                      {/* You might want to display amount for orders/rewards here */}
                      {/* <div className="text-sm font-semibold text-green-600">
                        {activity.amount}
                      </div> */}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No recent activity.
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
