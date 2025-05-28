
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
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">
              Franchise Dashboard
            </h1>
            <p className="text-purple-600">
              Monitor your franchise performance and growth
            </p>
          </div>
        </div>
      </div>

      {/* Franchise Code Card */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Your Franchise Code</CardTitle>
          <CardDescription className="text-purple-600">
            Share this code to onboard new vendors and users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <code className="text-lg font-mono text-purple-900">
                {franchiseCode}
              </code>
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {stat.value}
              </div>
              <p className="text-xs text-purple-600">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Growth Trends</CardTitle>
            <CardDescription className="text-purple-600">
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
              className="h-[300px]"
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
                    stroke="var(--color-vendors)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-vendors)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-users)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Revenue Breakdown</CardTitle>
            <CardDescription className="text-purple-600">
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
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="commission" fill="var(--color-commission)" />
                  <Bar dataKey="rewards" fill="var(--color-rewards)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">
              Recent Vendor Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "TechMart Solutions",
                  date: "2 days ago",
                  status: "Active",
                },
                { name: "Fashion Hub", date: "5 days ago", status: "Pending" },
                {
                  name: "Electronics World",
                  date: "1 week ago",
                  status: "Active",
                },
              ].map((vendor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900">{vendor.name}</p>
                    <p className="text-sm text-purple-600">{vendor.date}</p>
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
            <CardTitle className="text-purple-900">
              Top Performing Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "TechMart Solutions",
                  revenue: "₹45,000",
                  growth: "+25%",
                },
                { name: "Fashion Hub", revenue: "₹38,000", growth: "+18%" },
                {
                  name: "Electronics World",
                  revenue: "₹32,000",
                  growth: "+12%",
                },
              ].map((vendor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900">{vendor.name}</p>
                    <p className="text-sm text-purple-600">Monthly revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-purple-900">
                      {vendor.revenue}
                    </p>
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
