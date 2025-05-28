import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SalesRepHome() {
  const stats = [
    {
      title: "Total Vendors",
      value: "24",
      change: "+12%",
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Active Franchises",
      value: "18",
      change: "+8%",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: "$45,231",
      change: "+23%",
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      title: "Growth Rate",
      value: "12.5%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  const recentActivity = [
    {
      action: "New vendor created",
      name: "TechCorp Solutions",
      time: "2 hours ago",
      type: "vendor",
    },
    {
      action: "Franchise approved",
      name: "Downtown Branch",
      time: "4 hours ago",
      type: "franchise",
    },
    {
      action: "Vendor updated",
      name: "Global Supplies",
      time: "1 day ago",
      type: "vendor",
    },
    {
      action: "New franchise created",
      name: "Westside Location",
      time: "2 days ago",
      type: "franchise",
    },
  ];

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
          <Link to="/vendors">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </Link>
          <Link to="/franchise">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Franchise
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
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
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
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
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        activity.type === "vendor" ? "default" : "secondary"
                      }
                    >
                      {activity.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
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
