import { Users, DollarSign, Target, TrendingUp, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalesRepCards({ salesReps }) {
  const totalSalesReps = salesReps.length;
  const activeSalesReps = salesReps.filter((rep) => rep.status === "active").length;
  const totalSales = salesReps.reduce((sum, rep) => sum + rep.totalSales, 0);
  const totalActiveDeals = salesReps.reduce((sum, rep) => sum + rep.activeDeals, 0);
  const averageSales = totalSalesReps > 0 ? totalSales / totalSalesReps : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales Reps</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSalesReps}</div>
          <p className="text-xs text-muted-foreground">{activeSalesReps} active reps</p>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all representatives</p>
        </CardContent>
      </Card> */}

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActiveDeals}</div>
          <p className="text-xs text-muted-foreground">Currently in pipeline</p>
        </CardContent>
      </Card> */}

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{Math.round(averageSales).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Per sales representative</p>
        </CardContent>
      </Card> */}
    </div>
  );
}
