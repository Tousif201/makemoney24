"use client";

import React from "react";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const dashboardStats = [
  {
    title: "Total Orders",
    value: "2,847",
    change: "+12.5%",
    icon: ShoppingCart,
    color: "text-blue-600",
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+8.2%",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Active Products",
    value: "156",
    change: "+3.1%",
    icon: Package,
    color: "text-purple-600",
  },
  {
    title: "Pending Requests",
    value: "23",
    change: "-2.4%",
    icon: Clock,
    color: "text-orange-600",
  },
];

const recentActivities = [
  { id: 1, action: "New order placed", user: "John Doe", time: "2 minutes ago", type: "order" },
  { id: 2, action: "Product added to inventory", user: "Admin", time: "15 minutes ago", type: "product" },
  { id: 3, action: "Commission payout processed", user: "System", time: "1 hour ago", type: "commission" },
  { id: 4, action: "New member joined network", user: "Jane Smith", time: "2 hours ago", type: "network" },
  { id: 5, action: "Order shipped", user: "Fulfillment", time: "3 hours ago", type: "order" },
];

export default function AffiliateHome() {
  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      case "commission":
        return <DollarSign className="h-4 w-4" />;
      case "network":
        return <Users className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
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
              <div
                key={activity.id}
                className="flex items-center space-x-4"
              >
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
