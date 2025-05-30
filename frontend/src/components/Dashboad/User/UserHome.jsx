"use client";

import {
  BarChart3,
  Gift,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react"; // Import useState and useEffect

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "../../../context/SessionContext";
import { getUserHomeAnalytics } from "../../../../api/analytics"; // Correct import for our new API function

export default function UserHome() {
  const { session, loading: sessionLoading, user } = useSession(); // Renamed loading to sessionLoading
  const [analyticsData, setAnalyticsData] = useState(null); // State for fetched analytics data
  const [dataLoading, setDataLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch data only if session is loaded and user._id is available
      if (!sessionLoading && user?._id) {
        try {
          setDataLoading(true);
          setError(null); // Clear any previous errors
          const response = await getUserHomeAnalytics(user._id);
          setAnalyticsData(response); // Set the fetched data
        } catch (err) {
          console.error("Error fetching user home analytics:", err);
          setError("Failed to load dashboard data. Please try again.");
        } finally {
          setDataLoading(false); // Stop loading
        }
      } else if (!sessionLoading && !user?._id) {
        // If session is loaded but no user ID (e.g., not logged in)
        setDataLoading(false);
        setError("Please log in to view your dashboard.");
      }
    };

    fetchAnalytics();
  }, [sessionLoading, user?._id]); // Dependencies: re-run when session or user ID changes

  // Default stats for loading/error states or if data isn't fully loaded yet
  const defaultStats = [
    {
      title: "Total Earnings",
      value: analyticsData?.totalLevelEarning !== undefined ? `₹${analyticsData.totalLevelEarning.toLocaleString()}` : "Loading...",
      change: "From Referral Levels",
      icon: TrendingUp,
    },
    {
      title: "Active Referrals",
      value: analyticsData?.activeReffrals !== undefined ? analyticsData.activeReffrals.toLocaleString() : "Loading...",
      change: "Active Members",
      icon: Users,
    },
    {
      title: "Available Balance", // More specific title
      value: analyticsData?.walletBalance !== undefined ? `₹${analyticsData.walletBalance.toLocaleString()}` : "Loading...",
      change: "Withdrawable",
      icon: Wallet,
    },
    {
      title: "Total Orders",
      value: analyticsData?.totalOrders !== undefined ? analyticsData.totalOrders.toLocaleString() : "Loading...",
      change: "Lifetime",
      icon: ShoppingCart,
    },
  ];

  const quickActions = [
    {
      title: "View Membership",
      description: "Check your membership status and benefits",
      href: "/dashboard/membership",
      icon: ShieldCheck,
    },
    {
      title: "Refer Friends",
      description: "Share your referral code and earn commissions",
      href: "/dashboard/referrals",
      icon: UserPlus,
    },
    {
      title: "Check Rewards",
      description: "View your milestone rewards and achievements",
      href: "/dashboard/income/rewards",
      icon: Gift,
    },
    {
      title: "Manage Wallet",
      description: "Deposit, withdraw, and manage your funds",
      href: "/dashboard/wallet/manage",
      icon: Wallet,
    },
    {
      title: "Order History",
      description: "View all your past orders and transactions",
      href: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Income Reports",
      description: "Track your level-wise income and commissions",
      href: "/dashboard/referrals", // Assuming this links to a page showing income reports
      icon: BarChart3,
    },
  ];

  // Conditional Rendering for Loading/Error states
  if (sessionLoading || dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-gray-700">
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-red-600">
        {error}
      </div>
    );
  }

  const userDisplayName = user?.name || "User"; // Display user's name

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold ">Welcome back, {userDisplayName}!</h1>
            <p className="text-gray-500">
              Here's what's happening with your business today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {defaultStats.map((stat) => ( // Use defaultStats which now contains dynamic data
          <Card key={stat.title} className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{stat.value}</div>
              <p className="text-xs text-green-600">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="">Quick Actions</CardTitle>
          <CardDescription className="">
            Access your most used features quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className="cursor-pointer transition-colors hover:bg-purple-50 border-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <action.icon className="h-6 w-6  text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-medium ">{action.title}</h3>
                        <p className="text-sm text-gray-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.recentReffrals && analyticsData.recentReffrals.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.recentReffrals.map((referral) => (
                  <div
                    key={referral.name} // Assuming name is unique enough for key, or add an id from backend
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium ">{referral.name}</p>
                      <p className="text-sm ">{referral.joinDate}</p> {/* Use joinDate */}
                    </div>
                    {/* Commission is not directly in recentReffrals from controller, you might need to add it */}
                    {/* <span className="font-medium text-green-600">
                      ₹{referral.commission}
                    </span> */}
                    <span className="text-sm text-gray-500">New Referral</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent referrals.</p>
            )}
            <Button
              asChild
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            >
              <Link to="/dashboard/referrals">View All Referrals</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.recentTransaction && analyticsData.recentTransaction.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.recentTransaction.map((transaction, index) => (
                  <div key={transaction.txnId || index} className="flex items-center justify-between"> {/* Use txnId as key */}
                    <div>
                      <p className="font-medium ">{transaction.type}</p>
                      <p className="text-sm ">{transaction.date}</p>
                    </div>
                    <span
                      className={`font-medium ${
                        transaction.amount < 0 // Check if amount is negative
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.amount < 0 ? `-₹${Math.abs(transaction.amount).toLocaleString()}` : `₹${transaction.amount.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent transactions.</p>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full mt-4 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Link to="/dashboard/wallet/history">View All Transactions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
