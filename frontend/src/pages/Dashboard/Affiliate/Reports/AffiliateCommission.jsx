import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Download, AlertCircle } from "lucide-react";
import { getAffiliateCommissionData } from "../../../../../api/affiliate2";// Adjust the import path to your api function

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Helper to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Stats Section
function CommissionStats({ totalEarnings }) {
  return (
    // Updated grid to have 2 columns since one card was removed
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {/* Displaying dynamic data */}
          <div className="text-2xl font-bold">
            {formatCurrency(totalEarnings)}
          </div>
          <p className="text-xs text-muted-foreground">
            All-time commission earned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Commission Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {/* This remains static as per the model, but you could calculate an average if needed */}
          <div className="text-2xl font-bold">2-50%</div>
          <p className="text-xs text-muted-foreground">
            Based on product category
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Commission Table - Updated for the new data structure
function CommissionTable({ commissions }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Order Total</TableHead>
          <TableHead>Commission Earned</TableHead>
          <TableHead className="text-right">Order ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commissions.length > 0 ? (
          commissions.map((commission) => (
            <TableRow key={commission.orderId}>
              <TableCell className="font-medium">
                {formatDate(commission.orderDate)}
              </TableCell>
              <TableCell>{commission.customerName}</TableCell>
              <TableCell>{formatCurrency(commission.orderTotal)}</TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatCurrency(commission.commissionEarned)}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {commission.orderId}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan="5" className="text-center">
              No recent commission records found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// Main Page - Now dynamic
export default function AffiliateCommission() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAffiliateCommissionData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p>Loading your commission data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-destructive bg-red-50 p-5 text-destructive">
        <AlertCircle className="mb-2 h-8 w-8" />
        <h3 className="text-lg font-semibold">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Commissions</h2>
        <p className="text-muted-foreground">
          Track your earnings and recent commission transactions.
        </p>
      </div>

      {/* Stats - Pass dynamic data */}
      {dashboardData && (
        <CommissionStats totalEarnings={dashboardData.totalCommissionEarned} />
      )}

      {/* Table - Pass dynamic data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Commission Transactions</CardTitle>
              <CardDescription>
                Your 10 most recent commission-generating sales.
              </CardDescription>
            </div>
             <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
            </Button>
        </CardHeader>
        <CardContent>
          {dashboardData && (
            <CommissionTable commissions={dashboardData.recentCommissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}