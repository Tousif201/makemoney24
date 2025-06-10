import {
  BarChart3,
  Gift,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  BadgeIndianRupee,
  BanknoteArrowDown,
  ReceiptIndianRupee,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Assuming these are available from a UI library like Shadcn UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Assuming these are custom contexts/APIs
import { useSession } from "../../../context/SessionContext";
import { getUserHomeAnalytics } from "../../../../api/analytics";

export default function UserHome() {
  // Destructure session, sessionLoading (renamed from loading for clarity), and user from useSession hook
  const { session, loading: sessionLoading, user } = useSession();

  // State to store fetched analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  // State to manage loading status of the API call
  const [dataLoading, setDataLoading] = useState(true);
  // State to store any error messages from the API call
  const [error, setError] = useState(null);

  // useEffect hook to fetch analytics data when session or user ID changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch data only if session is loaded and user._id is available
      if (!sessionLoading && user?._id) {
        try {
          setDataLoading(true); // Set loading to true before fetching
          setError(null); // Clear any previous errors
          const response = await getUserHomeAnalytics(user._id); // Call the API
          setAnalyticsData(response); // Set the fetched data
        } catch (err) {
          console.error("Error fetching user home analytics:", err);
          setError("Failed to load dashboard data. Please try again."); // Set error message
        } finally {
          setDataLoading(false); // Stop loading regardless of success or failure
        }
      } else if (!sessionLoading && !user?._id) {
        // If session is loaded but no user ID (e.g., not logged in), stop loading and set error
        setDataLoading(false);
        setError("Please log in to view your dashboard.");
      }
    };

    fetchAnalytics(); // Execute the fetch function
  }, [sessionLoading, user?._id]); // Dependencies: re-run when session loading or user ID changes

  // Define default stats. These will display "Loading..." until analyticsData is fetched.
  // They also handle cases where analyticsData might be null or specific properties are undefined.
  const defaultStats = [
    {
      title: "Total Earnings",
      value:
        analyticsData?.totalEarning != null // Check for both null and undefined
          ? `₹${analyticsData.totalEarning.toLocaleString()}`
          : "Loading...",
      change: "From Referral Levels",
      icon: TrendingUp,
    },
    {
      title: "Active Referrals",
      value:
        analyticsData?.referralJoins.total != null // Check for both null and undefined
          ? analyticsData.referralJoins.total.toLocaleString()
          : "Loading...",
      change: "Active Members",
      icon: Users,
    },
    {
      title: "Available Balance",
      value:
        analyticsData?.withdrawableWallet != null // Check for both null and undefined
          ? `₹${analyticsData.withdrawableWallet.toLocaleString()}`
          : "Loading...",
      change: "Withdrawable",
      icon: Wallet,
    },
    {
      title: "Total Withdrawal",
      value:
        analyticsData?.totalWithdrawal != null // Check for both null and undefined
          ? `₹${analyticsData.totalWithdrawal.toLocaleString()}`
          : "Loading...",
      icon: BanknoteArrowDown,
    },
    {
      title: "Today Earning",
      value:
        analyticsData?.todayEarning != null // Check for both null and undefined
          ? `₹${analyticsData.todayEarning.toLocaleString()}`
          : "Loading...",
      icon: ReceiptIndianRupee,
    },
    {
      title: "Monthly Earning",
      value:
        analyticsData?.monthlyEarning != null // Check for both null and undefined
          ? `₹${analyticsData.monthlyEarning.toLocaleString()}`
          : "Loading...",
      icon: ReceiptIndianRupee,
    },
    {
      title: "Weekly Earning",
      value:
        analyticsData?.weeklyEarning != null // Check for both null and undefined
          ? `₹${analyticsData.weeklyEarning.toLocaleString()}`
          : "Loading...",
      icon: ReceiptIndianRupee,
    },
    {
      title: "Total Orders",
      value:
        analyticsData?.totalOrders != null // Check for both null and undefined
          ? analyticsData.totalOrders.toLocaleString()
          : "Loading...",
      change: "Lifetime",
      icon: ShoppingCart,
    },
  ];
  console.log(analyticsData);
  // Quick actions array for easy navigation
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
      title: "Emi Repayment",
      description: "Track your Emi repayment schedule",
      href: "/dashboard/emi-schedule",
      icon: BarChart3,
    },
  ];

  // Conditional Rendering for Loading/Error states
  // This block prevents rendering the main content until session and data are loaded
  if (sessionLoading || dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-gray-700">
        Loading dashboard data...
      </div>
    );
  }

  // If there's an error, display it centrally
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-red-600">
        {error}
      </div>
    );
  }

  // Get user display name, defaulting to "User" if not available
  const userDisplayName = user?.name || "User";

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold ">
              Welcome back, {userDisplayName}!
            </h1>
            <p className="text-gray-500">
              Here's what's happening with your business today.
            </p>
          </div>
        </div>
        {/* Updated Profile Score Section */}
        <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-gradient-to-r from-yellow-100 via-white to-yellow-50 border border-yellow-200 backdrop-blur-md transition-transform duration-300 hover:scale-105 group">
          <BadgeIndianRupee className="h-6 w-6 text-yellow-600 animate-bounce group-hover:animate-none" />

          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-800 tracking-wide">
              Salary Score
            </p>
            <span className="text-2xl font-extrabold text-yellow-700">
              {user.profileScore !== undefined ? user.profileScore : "N/A"}
            </span>
          </div>

          {/* Optional Tooltip for clarity */}
          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
            New!
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-1 md:gap-4 grid-cols-3 md:grid-cols-2 lg:grid-cols-4">
        {defaultStats.map(
          (stat) => (
            <Card key={stat.title} className="border-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium ">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold ">{stat.value}</div>
                {stat.change && ( // Conditionally render change text if it exists
                  <p className="text-xs text-green-600">{stat.change}</p>
                )}
              </CardContent>
            </Card>
          )
        )}
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
              <Link
                key={action.title}
                to={action.href}
                // Apply animate-pulse directly to the Emi Repayment card
                className={
                  action.title === "Emi Repayment" ? "animate-pulse" : ""
                }
              >
                <Card className="cursor-pointer transition-colors hover:bg-purple-50 border-purple-100 relative">
                  {" "}
                  {/* Added relative positioning */}
                  {action.title === "Emi Repayment" && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> // Red dot
                  )}
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
            {/* Check if recentReffrals exists and has items before mapping */}
            {analyticsData?.recentReffrals &&
              analyticsData.recentReffrals.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.recentReffrals.map((referral, index) => (
                  <div
                    key={referral.name || index} // Use name or index as key for stability
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium ">{referral.name}</p>
                      <p className="text-sm ">
                        {referral.joinDate || "N/A"}
                      </p>{" "}
                      {/* Use joinDate, provide fallback */}
                    </div>
                    <span className="text-sm text-gray-500">New Referral</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent referrals.
              </p>
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
            {/* Check if recentTransaction exists and has items before mapping */}
            {analyticsData?.recentTransaction &&
              analyticsData.recentTransaction.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.recentTransaction.map((transaction, index) => (
                  <div
                    key={transaction.txnId || index} // Use txnId as key, or index if not available
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium ">
                        {transaction.type || "N/A"}
                      </p>
                      <p className="text-sm ">
                        {transaction.date || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`font-medium ${transaction.amount < 0 // Check if amount is negative
                        ? "text-red-600"
                        : "text-green-600"
                        }`}
                    >
                      {transaction.amount !== undefined
                        ? transaction.amount < 0
                          ? `-₹${Math.abs(transaction.amount).toLocaleString()}`
                          : `₹${transaction.amount.toLocaleString()}`
                        : "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent transactions.
              </p>
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