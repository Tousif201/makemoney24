"use client";

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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const salesData = [
  { month: "Jan", sales: 45000, orders: 120, profit: 12000 },
  { month: "Feb", sales: 52000, orders: 145, profit: 15600 },
  { month: "Mar", sales: 48000, orders: 135, profit: 13200 },
  { month: "Apr", sales: 61000, orders: 180, profit: 18300 },
  { month: "May", sales: 55000, orders: 165, profit: 16500 },
  { month: "Jun", sales: 67000, orders: 195, profit: 20100 },
];

const membershipData = [
  { name: "Bronze", value: 45, color: "#CD7F32", count: 2250 },
  { name: "Silver", value: 30, color: "#C0C0C0", count: 1500 },
  { name: "Gold", value: 20, color: "#FFD700", count: 1000 },
  { name: "Platinum", value: 5, color: "#E5E4E2", count: 250 },
];

const recentActivity = [
  {
    type: "sale",
    message: "New order #ORD-2024-195 placed",
    amount: "$245.50",
    time: "2 min ago",
  },
  {
    type: "user",
    message: "New user registration",
    amount: "+1",
    time: "5 min ago",
  },
  {
    type: "payout",
    message: "Commission payout processed",
    amount: "$1,250.00",
    time: "12 min ago",
  },
  {
    type: "milestone",
    message: "Gold milestone achieved",
    amount: "+$100",
    time: "18 min ago",
  },
  {
    type: "sale",
    message: "Order #ORD-2024-194 delivered",
    amount: "$189.99",
    time: "25 min ago",
  },
];

const topVendors = [
  {
    name: "TechMart Solutions",
    sales: "$67,800",
    growth: "+15.2%",
    orders: 195,
  },
  { name: "Fashion Forward", sales: "$45,230", growth: "+12.8%", orders: 142 },
  { name: "Sports Galaxy", sales: "$32,150", growth: "+8.9%", orders: 98 },
  { name: "Home Essentials", sales: "$28,900", growth: "+6.4%", orders: 87 },
];

const monthlyGrowth = [
  { month: "Jan", users: 1200, vendors: 45, franchises: 8 },
  { month: "Feb", users: 1350, vendors: 52, franchises: 9 },
  { month: "Mar", users: 1480, vendors: 58, franchises: 11 },
  { month: "Apr", users: 1620, vendors: 65, franchises: 12 },
  { month: "May", users: 1780, vendors: 71, franchises: 14 },
  { month: "Jun", users: 1950, vendors: 78, franchises: 15 },
];

export default function AdminHome() {
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Activity className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
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
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">$328,000</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +12.5%
                </span>
                <span className="text-sm text-muted-foreground">
                  from last month
                </span>
              </div>
              <Progress value={75} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Active Users
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">12,543</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +8.2%
                </span>
                <span className="text-sm text-muted-foreground">
                  from last month
                </span>
              </div>
              <Progress value={82} className="mt-3 h-2" />
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
              <div className="text-3xl font-bold text-purple-900">1,940</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowDownRight className="h-3 w-3 text-red-600" />
                <span className="text-sm font-medium text-red-600">-2.1%</span>
                <span className="text-sm text-muted-foreground">
                  from last month
                </span>
              </div>
              <Progress value={68} className="mt-3 h-2" />
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
              <div className="text-3xl font-bold text-orange-900">$45,230</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +15.3%
                </span>
                <span className="text-sm text-muted-foreground">
                  from last month
                </span>
              </div>
              <Progress value={91} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
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
                  +12.5% Growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Sales",
                    color: "hsl(217, 91%, 60%)",
                  },
                  profit: {
                    label: "Profit",
                    color: "hsl(142, 76%, 36%)",
                  },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="salesGradient"
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
                      <linearGradient
                        id="profitGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(142, 76%, 36%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(142, 76%, 36%)"
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
                      tickFormatter={(value) => `$${value / 1000}k`}
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
                      dataKey="sales"
                      stroke="hsl(217, 91%, 60%)"
                      fill="url(#salesGradient)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(142, 76%, 36%)"
                      fill="url(#profitGradient)"
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
                  bronze: { label: "Bronze", color: "#CD7F32" },
                  silver: { label: "Silver", color: "#C0C0C0" },
                  gold: { label: "Gold", color: "#FFD700" },
                  platinum: { label: "Platinum", color: "#E5E4E2" },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={membershipData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {membershipData.map((entry, index) => (
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
                {membershipData.map((item) => (
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Growth Metrics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Growth Metrics</CardTitle>
              <CardDescription>
                Monthly growth across key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: { label: "Users", color: "hsl(217, 91%, 60%)" },
                  vendors: { label: "Vendors", color: "hsl(142, 76%, 36%)" },
                  franchises: {
                    label: "Franchises",
                    color: "hsl(38, 92%, 50%)",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyGrowth}>
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
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="vendors"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="franchises"
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(38, 92%, 50%)", strokeWidth: 2, r: 4 }}
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
                {topVendors.map((vendor, index) => (
                  <div
                    key={vendor.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{vendor.sales}</p>
                      <p className="text-xs text-green-600 font-medium">
                        {vendor.growth}
                      </p>
                    </div>
                  </div>
                ))}
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
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "sale"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "user"
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "payout"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {activity.type === "sale" ? (
                        <ShoppingBag className="w-3 h-3" />
                      ) : activity.type === "user" ? (
                        <UserPlus className="w-3 h-3" />
                      ) : activity.type === "payout" ? (
                        <DollarSign className="w-3 h-3" />
                      ) : (
                        <Target className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {activity.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
