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
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const vendorsData = [
  {
    id: "V001",
    name: "TechMart Solutions",
    email: "contact@techmart.com",
    phone: "+1 234-567-8901",
    franchise: "Digital Hub Franchise",
    status: "Active",
    joinDate: "2024-01-15",
    totalSales: "$45,230",
    commission: "$4,523",
  },
  {
    id: "V002",
    name: "Fashion Forward",
    email: "info@fashionforward.com",
    phone: "+1 234-567-8902",
    franchise: "Style Central Franchise",
    status: "Active",
    joinDate: "2024-02-20",
    totalSales: "$32,150",
    commission: "$3,215",
  },
  {
    id: "V003",
    name: "Home Essentials",
    email: "support@homeessentials.com",
    phone: "+1 234-567-8903",
    franchise: "Lifestyle Franchise",
    status: "Pending",
    joinDate: "2024-03-10",
    totalSales: "$18,900",
    commission: "$1,890",
  },
  {
    id: "V004",
    name: "Sports Galaxy",
    email: "hello@sportsgalaxy.com",
    phone: "+1 234-567-8904",
    franchise: "Fitness Pro Franchise",
    status: "Active",
    joinDate: "2024-01-28",
    totalSales: "$67,800",
    commission: "$6,780",
  },
  {
    id: "V005",
    name: "Beauty Bliss",
    email: "care@beautybliss.com",
    phone: "+1 234-567-8905",
    franchise: "Glamour Franchise",
    status: "Inactive",
    joinDate: "2023-12-05",
    totalSales: "$12,450",
    commission: "$1,245",
  },
];

export default function AdminVendorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredVendors = vendorsData.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.franchise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vendor.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredVendors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-hidden px-4 md:px-6 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Vendors</h2>
            <p className="text-muted-foreground">
              Manage all vendors and their franchise relationships
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Vendor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Vendors</CardTitle>
            <CardDescription>
              A list of all vendors in your platform with their franchise
              details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Franchise</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.id}</TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        <div className="font-medium truncate">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {vendor.email}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {vendor.phone}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {vendor.franchise}
                      </TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {vendor.joinDate}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {vendor.totalSales}
                      </TableCell>
                      <TableCell className="font-medium text-green-600 whitespace-nowrap">
                        {vendor.commission}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Vendor
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Vendor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredVendors.length)} of{" "}
                {filteredVendors.length} vendors
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
