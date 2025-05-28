"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

const salesData = [
  {
    vendorId: "V001",
    vendorName: "TechMart Solutions",
    franchise: "Digital Hub Franchise",
    ordersPlaced: 45,
    ordersDelivered: 42,
    ordersPending: 2,
    ordersCancelled: 1,
    totalRevenue: "$45,230",
    commission: "$4,523",
    deliveryRate: "93.3%",
    period: "Last 30 days",
  },
  {
    vendorId: "V002",
    vendorName: "Fashion Forward",
    franchise: "Style Central Franchise",
    ordersPlaced: 38,
    ordersDelivered: 35,
    ordersPending: 3,
    ordersCancelled: 0,
    totalRevenue: "$32,150",
    commission: "$3,215",
    deliveryRate: "92.1%",
    period: "Last 30 days",
  },
  {
    vendorId: "V003",
    vendorName: "Home Essentials",
    franchise: "Lifestyle Franchise",
    ordersPlaced: 28,
    ordersDelivered: 25,
    ordersPending: 2,
    ordersCancelled: 1,
    totalRevenue: "$18,900",
    commission: "$1,890",
    deliveryRate: "89.3%",
    period: "Last 30 days",
  },
  {
    vendorId: "V004",
    vendorName: "Sports Galaxy",
    franchise: "Fitness Pro Franchise",
    ordersPlaced: 62,
    ordersDelivered: 58,
    ordersPending: 4,
    ordersCancelled: 0,
    totalRevenue: "$67,800",
    commission: "$6,780",
    deliveryRate: "93.5%",
    period: "Last 30 days",
  },
  {
    vendorId: "V005",
    vendorName: "Beauty Bliss",
    franchise: "Glamour Franchise",
    ordersPlaced: 22,
    ordersDelivered: 18,
    ordersPending: 2,
    ordersCancelled: 2,
    totalRevenue: "$12,450",
    commission: "$1,245",
    deliveryRate: "81.8%",
    period: "Last 30 days",
  },
];

export default function SalesReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      sale.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.franchise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFranchise =
      franchiseFilter === "all" || sale.franchise.includes(franchiseFilter);
    return matchesSearch && matchesFranchise;
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getDeliveryRateBadge = (rate) => {
    const numRate = Number.parseFloat(rate);
    if (numRate >= 95)
      return <Badge className="bg-green-100 text-green-800">{rate}</Badge>;
    if (numRate >= 90)
      return <Badge className="bg-yellow-100 text-yellow-800">{rate}</Badge>;
    return <Badge className="bg-red-100 text-red-800">{rate}</Badge>;
  };

  const totalOrders = filteredSales.reduce(
    (sum, sale) => sum + sale.ordersPlaced,
    0
  );
  const totalDelivered = filteredSales.reduce(
    (sum, sale) => sum + sale.ordersDelivered,
    0
  );
  const totalRevenue = filteredSales.reduce(
    (sum, sale) =>
      sum +
      Number.parseFloat(sale.totalRevenue.replace("$", "").replace(",", "")),
    0
  );
  const totalCommission = filteredSales.reduce(
    (sum, sale) =>
      sum +
      Number.parseFloat(sale.commission.replace("$", "").replace(",", "")),
    0
  );

  return (
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sales Reports</h2>
            <p className="text-muted-foreground">
              Vendor-wise sales performance and order analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DatePickerWithRange />
            <Button variant="outline">
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
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delivered Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDelivered}</div>
              <p className="text-xs text-muted-foreground">
                {((totalDelivered / totalOrders) * 100).toFixed(1)}% delivery
                rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" />
                +8.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commission
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalCommission.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {((totalCommission / totalRevenue) * 100).toFixed(1)}% of
                revenue
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
              <Select
                value={franchiseFilter}
                onValueChange={setFranchiseFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by franchise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Franchises</SelectItem>
                  <SelectItem value="Digital Hub">
                    Digital Hub Franchise
                  </SelectItem>
                  <SelectItem value="Style Central">
                    Style Central Franchise
                  </SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle Franchise</SelectItem>
                  <SelectItem value="Fitness Pro">
                    Fitness Pro Franchise
                  </SelectItem>
                  <SelectItem value="Glamour">Glamour Franchise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Franchise</TableHead>
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
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.vendorId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sale.vendorName}</div>
                          <div className="text-sm text-muted-foreground">
                            {sale.vendorId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{sale.franchise}</TableCell>
                      <TableCell className="font-medium">
                        {sale.ordersPlaced}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {sale.ordersDelivered}
                      </TableCell>
                      <TableCell className="text-yellow-600">
                        {sale.ordersPending}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {sale.ordersCancelled}
                      </TableCell>
                      <TableCell>
                        {getDeliveryRateBadge(sale.deliveryRate)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.totalRevenue}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {sale.commission}
                      </TableCell>
                    </TableRow>
                  ))}
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
