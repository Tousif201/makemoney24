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
import { ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";

const statsData = [
  {
    title: "Total Orders",
    value: "1,234",
    change: "+12%",
    icon: ShoppingCart,
    trend: "up",
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+8%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Commission Earned",
    value: "$4,523",
    change: "+15%",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "Active Products",
    value: "89",
    change: "+3",
    icon: Package,
    trend: "up",
  },
];

const ordersData = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    product: "Wireless Headphones",
    amount: "$99.99",
    status: "New",
    date: "2024-01-15",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    product: "Smart Watch",
    amount: "$199.99",
    status: "In Progress",
    date: "2024-01-14",
  },
  {
    id: "#ORD-003",
    customer: "Mike Johnson",
    product: "Laptop Stand",
    amount: "$49.99",
    status: "Delivered",
    date: "2024-01-13",
  },
];

export default function VendorHome() {
  return (
    <div className="space-y-6 mx-8 my-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Overview
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders Trend Chart */}
        <div className="xl:col-span-2">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>Orders Trend</CardTitle>
              <CardDescription>
                Your order volume over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="w-full overflow-hidden">

                <OrdersTrendChart />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div>
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersData.map((order) => (
                  <OrderCard key={order.id} {...order} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Commission Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
            <CardDescription>Your earnings this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Base Commission (8%)
                </span>
                <span className="font-medium">$3,618</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Performance Bonus
                </span>
                <span className="font-medium">$905</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total Earnings</span>
                <span className="text-purple-600">$4,523</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Average Order Value
                </span>
                <span className="font-medium">$127.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Customer Rating
                </span>
                <span className="font-medium">4.8/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Response Time
                </span>
                <span className="font-medium">2.3 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
