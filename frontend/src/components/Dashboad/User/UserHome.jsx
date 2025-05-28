import { BarChart3, Gift, ShieldCheck, ShoppingCart, TrendingUp, UserPlus, Users, Wallet } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserHome() {
  const stats = [
    {
      title: "Total Earnings",
      value: "₹45,230",
      change: "+12.5%",
      icon: TrendingUp,
    },
    {
      title: "Active Referrals",
      value: "24",
      change: "+3 this month",
      icon: Users,
    },
    {
      title: "Wallet Balance",
      value: "₹8,450",
      change: "Available",
      icon: Wallet,
    },
    {
      title: "Total Orders",
      value: "156",
      change: "+8 this month",
      icon: ShoppingCart,
    },
  ]

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
      href: "/dashboard/income/level",
      icon: BarChart3,
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold ">Welcome back, John!</h1>
            <p className="text-gray-500">Here's what's happening with your business today.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ">{stat.title}</CardTitle>
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
          <CardDescription className="">Access your most used features quickly</CardDescription>
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
                        <p className="text-sm text-gray-500">{action.description}</p>
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
            <div className="space-y-3">
              {[
                { name: "Alice Johnson", date: "2 days ago", commission: "₹360" },
                { name: "Bob Smith", date: "5 days ago", commission: "₹360" },
                { name: "Carol Davis", date: "1 week ago", commission: "₹120" },
              ].map((referral) => (
                <div key={referral.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium ">{referral.name}</p>
                    <p className="text-sm ">{referral.date}</p>
                  </div>
                  <span className="font-medium text-green-600">{referral.commission}</span>
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              <Link to="/dashboard/referrals">View All Referrals</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "Commission", amount: "₹360", date: "Today" },
                { type: "Withdrawal", amount: "-₹2,000", date: "Yesterday" },
                { type: "Reward", amount: "₹500", date: "3 days ago" },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium ">{transaction.type}</p>
                    <p className="text-sm ">{transaction.date}</p>
                  </div>
                  <span
                    className={`font-medium ${transaction.amount.startsWith("-") ? "text-red-600" : "text-green-600"}`}
                  >
                    {transaction.amount}
                  </span>
                </div>
              ))}
            </div>
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
  )
}
