"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// Select is not used currently due to franchise filter removal
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import {
  Search,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  Loader2,
  IndianRupee, // Added for loading spinner
} from "lucide-react";
// DatePickerWithRange is not used in this basic integration
// import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { getAdminSalesReportApi } from "../../../../api/order";

export default function SalesReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  // Franchise filter removed as it's not directly in API response
  // const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New state for API data and loading status
  const [salesReportData, setSalesReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminSalesReportApi();
        console.log("frontend page sales rep",data)
        setSalesReportData(data);
      } catch (err) {
        console.error("Failed to fetch sales report:", err);
        setError("Failed to load sales report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, []); // Empty dependency array means this runs once on mount

  // Use the allOrders array from the fetched data, or an empty array if not loaded yet
  const allOrders = salesReportData?.allOrders || [];

  const filteredSales = allOrders.filter((sale) => {
    // Assuming vendor name is available and 'vendor' is the name field in the API response
    const matchesSearch =
      sale.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    // Franchise filter removed
    // const matchesFranchise =
    //   franchiseFilter === "all" || sale.franchise.includes(franchiseFilter);
    return matchesSearch; // && matchesFranchise;
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getDeliveryRateBadge = (rate) => {
    const numRate = Number.parseFloat(rate); // Rate from API is already a number
    if (numRate >= 95)
      return (
        <Badge className="bg-green-100 text-green-800">
          {numRate.toFixed(2)}%
        </Badge>
      );
    if (numRate >= 90)
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          {numRate.toFixed(2)}%
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-800">
        {numRate.toFixed(2)}%
      </Badge>
    );
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR", // Assuming Indian Rupees, adjust as needed
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals from the filtered/all data
  // These will reflect the total of the *displayed* data if filtering is active,
  // or the overall totals if no filtering is applied.
  // For overall totals, use salesReportData.totalOrders.noOfOrders etc.
  const overallTotalOrders = salesReportData?.totalOrders?.noOfOrders || 0;
  const overallDeliveredOrders = salesReportData?.deliveredOrders?.noOfOrders || 0;
  const overallTotalRevenue = salesReportData?.totalRevenue?.revenue || 0;

  // Assuming a default commission rate if not available per vendor in the API response
  // Or, if the backend returns commissionRate per vendor, use that.
  // For demonstration, I'll calculate total commission as 10% of overall delivered revenue.
  // Ideally, the backend should return this or the commission rate per vendor.
  const overallTotalCommission = overallTotalRevenue * 0.10; // Example: 10% commission

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-600">Loading sales report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sales Reports</h2>
            <p className="text-muted-foreground">
              Vendor-wise sales performance and order analytics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4  text-purple-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallTotalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" />
                {salesReportData?.totalOrders?.rate} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delivered Orders
              </CardTitle>
              <Package className="h-4 w-4  text-purple-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallDeliveredOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" />
                {salesReportData?.deliveredOrders?.rate} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-purple-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overallTotalRevenue)}
              </div>
              <p className="text-xs text-purple-700">
                <TrendingUp className="inline h-3 w-3 text-green-500" />
                {salesReportData?.totalRevenue?.rate} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commission
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-purple-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overallTotalCommission)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(overallTotalRevenue > 0
                  ? (overallTotalCommission / overallTotalRevenue) * 100
                  : 0
                ).toFixed(1)}
                % of revenue (Estimate)
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Sales Performance</CardTitle>
            <CardDescription>
              Detailed breakdown of orders placed, delivered, and revenue by
              vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Franchise filter section removed */}
              {/* <Select
                value={franchiseFilter}
                onValueChange={setFranchiseFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Franchise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Franchises</SelectItem>
                  <SelectItem value="Digital Hub Franchise">
                    Digital Hub Franchise
                  </SelectItem>
                  <SelectItem value="Retail Zone">Retail Zone</SelectItem>
                </SelectContent>
              </Select> */}
              {/* DateRangePicker is not used in this basic integration */}
              {/* <DatePickerWithRange /> */}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    {/* <TableHead>Franchise</TableHead> - Removed */}
                    <TableHead>Orders Placed</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Cancelled</TableHead>
                    <TableHead>Delivery Rate</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.length > 0 ? (
                    paginatedSales.map((sale) => {
                      // Assuming vendor name is 'vendor' in API response
                      const commission = sale.revenue * 0.10; // Example: 10% commission on vendor's delivered revenue
                      return (
                        <TableRow key={sale._id}> {/* Use _id from aggregation as key */}
                          <TableCell>
                            <div>
                              <div className="font-medium">{sale.vendor}</div>
                              {/* Vendor ID might not be directly available or needed here */}
                              {/* <div className="text-sm text-muted-foreground">{sale.vendorId}</div> */}
                            </div>
                          </TableCell>
                          {/* <TableCell>{sale.franchise}</TableCell> - Removed */}
                          <TableCell className="font-medium">
                            {sale.ordersPlaced}
                          </TableCell>
                          <TableCell className="text-green-600">
                            {sale.ordersDelivered}
                          </TableCell>
                          <TableCell className="text-yellow-600">
                            {sale.pending}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {sale.cancelled}
                          </TableCell>
                          <TableCell>
                            {getDeliveryRateBadge(sale.deliveryRate)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(sale.revenue)}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(commission)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredSales.length)} of{" "}
                {filteredSales.length} vendors
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}