import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSalesRepDashboardAnalytics } from "../../../../api/analytics";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  IndianRupee,
  Plus,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CreateVendorDialog } from "./CreateVendorDialog";
import { CreateFranchiseDialog } from "./CreateFranchiseDialog";
import { useEffect, useState } from "react";
import { useSession } from "../../../context/SessionContext";
import CreateShopNshipDialog from "./CreateShopnshipDialog";

export default function SalesRepHome() {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession()
  const vendorId = session.id
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSalesRepDashboardAnalytics(vendorId);
        console.log("analytics data", data)

        const computedStats = [
          {
            title: "Total Vendors",
            value: data.totalVendors || 0,
            change: `+${data.vendorGrowthRate?.toFixed(1) || 0}%`,
            icon: Building2,
            color: "text-purple-600",
          },
          {
            title: "Active Franchises",
            value: data.totalFranchises || 0,
            change: `+${data.franchiseGrowthRate?.toFixed(1) || 0}%`,
            icon: Users,
            color: "text-green-600",
          },
          {
            title: "Monthly Revenue",
            value: `₹${data.monthlyRevenue?.toLocaleString() || "0"}`,
            change: `+${data.revenueChange?.toFixed(1) || 0}%`,
            icon: IndianRupee,
            color: "text-blue-600",
          },
          {
            title: "Growth Rate",
            value: `${data.overallGrowthRate?.toFixed(1) || 0}%`,
            change: `+${data.growthChange?.toFixed(1) || 0}%`,
            icon: TrendingUp,
            color: "text-orange-600",
          },
        ];

        setStats(computedStats);

        if (data.recentActivity) {
          setRecentActivity(data.recentActivity);
        }


      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your sales overview.
          </p>
        </div>
        <div className="flex gap-2">
        <CreateShopNshipDialog>
            <Button className="bg-purple-700 hover:bg-purple-400">
              <Plus className="mr-2 h-4 w-4" />
              Create ShopNship User
            </Button>
          </CreateShopNshipDialog>
          <CreateVendorDialog>
            <Button className="bg-purple-700 hover:bg-purple-400">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </CreateVendorDialog>
          <CreateFranchiseDialog>
            <Button className="bg-purple-700 hover:bg-purple-400">
              <Plus className="mr-2 h-4 w-4" />
              Add Franchise
            </Button>
          </CreateFranchiseDialog>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="p-2 rounded-full bg-muted">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/vendors">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Vendors
              </Button>
            </Link>
            <Link to="/franchise">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Franchises
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={activity.type === "vendor" ? "default" : "secondary"}>
                      {activity.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
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
