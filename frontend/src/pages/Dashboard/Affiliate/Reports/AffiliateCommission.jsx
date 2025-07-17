import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Clock,
  TrendingUp,
  Download,
} from "lucide-react";

// Dummy commission data
const commissionData = [
  { period: "January 2024", sales: "₹12,450", commission: "₹1,245", status: "Paid" },
  { period: "December 2023", sales: "₹10,230", commission: "₹1,023", status: "Paid" },
  { period: "November 2023", sales: "₹8,760", commission: "₹876", status: "Pending" },
  { period: "October 2023", sales: "₹9,340", commission: "₹934", status: "Paid" },
];

// Stats Section
function CommissionStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹4,078</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+15.2%</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹876</div>
          <p className="text-xs text-muted-foreground">To be paid next cycle</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2 - 50%</div>
          <p className="text-xs text-muted-foreground">Current tier rate</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Commission Table
function CommissionTable({ commissions }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Total Sales</TableHead>
          <TableHead>Commission Earned</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commissions.map((commission, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{commission.period}</TableCell>
            <TableCell>{commission.sales}</TableCell>
            <TableCell>{commission.commission}</TableCell>
            <TableCell>
              <Badge variant={commission.status === "Paid" ? "default" : "secondary"}>
                {commission.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Main Page
export default function AffiliateCommission() {
  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Commission</h2>
        <p className="text-muted-foreground">
          Track your earnings and commission breakdown
        </p>
      </div>

      {/* Stats */}
      <CommissionStats />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>Your commission breakdown by period</CardDescription>
        </CardHeader>
        <CardContent>
          <CommissionTable commissions={commissionData} />
        </CardContent>
      </Card>
    </div>
  );
}
