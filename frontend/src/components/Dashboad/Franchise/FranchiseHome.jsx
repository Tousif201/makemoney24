import { Copy, Package, TrendingUp, Trophy, Users } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function FranchiseHome() {
  const franchiseCode = "FRAN123456";

  const monthlyData = [
    { month: "Jan", vendors: 12, users: 145, revenue: 45000 },
    { month: "Feb", vendors: 18, users: 189, revenue: 52000 },
    { month: "Mar", vendors: 25, users: 234, revenue: 68000 },
    { month: "Apr", vendors: 32, users: 298, revenue: 78000 },
    { month: "May", vendors: 38, users: 356, revenue: 89000 },
    { month: "Jun", vendors: 45, users: 423, revenue: 105000 },
  ];

  const revenueData = [
    { month: "Jan", commission: 13500, rewards: 2000 },
    { month: "Feb", commission: 15600, rewards: 2500 },
    { month: "Mar", commission: 20400, rewards: 3000 },
    { month: "Apr", commission: 23400, rewards: 3500 },
    { month: "May", commission: 26700, rewards: 4000 },
    { month: "Jun", commission: 31500, rewards: 5000 },
  ];

  const stats = [
    {
      title: "Total Vendors",
      value: "45",
      change: "+7 this month",
      icon: Package,
    },
    {
      title: "Total Users",
      value: "423",
      change: "+67 this month",
      icon: Users,
    },
    {
      title: "Monthly Revenue",
      value: "₹1,05,000",
      change: "+18.2%",
      icon: TrendingUp,
    },
    {
      title: "Rewards Earned",
      value: "₹25,000",
      change: "+₹5,000 this month",
      icon: Trophy,
    },
  ];

  const copyFranchiseCode = () => {
    navigator.clipboard.writeText(franchiseCode);
  };

  return (
    <div className="flex-1 space-y-6 px-4 py-6 sm:px-6 md:px-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Franchise Dashboard</h1>
            <p className="text-gray-600">
              Monitor your franchise performance and growth
            </p>
          </div>
        </div>
      </div>

      {/* Franchise Code Card */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle>Your Franchise Code</CardTitle>
          <CardDescription>
            Share this code to onboard new vendors and users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row  sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200 overflow-x-auto">
              <code className="text-lg font-mono break-words">{franchiseCode}</code>
            </div>
            <Button
              onClick={copyFranchiseCode}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth Trends Card */}
        <Card className="border border-purple-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Growth Trends
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Vendors and users growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                vendors: {
                  label: "Vendors",
                  color: "hsl(var(--chart-1))",
                },
                users: {
                  label: "Users",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="vendors"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-vendors)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-users)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown Card */}
        <Card className="border border-purple-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Revenue Breakdown
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Commission and rewards earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                commission: {
                  label: "Commission",
                  color: "hsl(var(--chart-3))",
                },
                rewards: {
                  label: "Rewards",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="commission" fill="#9333ea" />
                  <Bar dataKey="rewards" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Vendors and Top Vendors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Recent Vendor Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "TechMart Solutions", date: "2 days ago", status: "Active" },
                { name: "Fashion Hub", date: "5 days ago", status: "Pending" },
                { name: "Electronics World", date: "1 week ago", status: "Active" },
              ].map((vendor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-sm text-gray-500">{vendor.date}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {vendor.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "TechMart Solutions", revenue: "₹45,000", growth: "+25%" },
                { name: "Fashion Hub", revenue: "₹38,000", growth: "+18%" },
                { name: "Electronics World", revenue: "₹32,000", growth: "+12%" },
              ].map((vendor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-sm text-gray-500">Monthly revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{vendor.revenue}</p>
                    <p className="text-sm text-green-600">{vendor.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
