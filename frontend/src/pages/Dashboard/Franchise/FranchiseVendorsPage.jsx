import {
  Building2,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

export default function FranchiseVendorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const vendors = [
    {
      id: "VEN001",
      name: "TechMart Solutions",
      email: "contact@techmart.com",
      phone: "+91 9876543210",
      category: "Electronics",
      joinDate: "2024-03-15",
      status: "Active",
      monthlyRevenue: 45000,
      totalOrders: 156,
      rating: 4.8,
      location: "Mumbai, Maharashtra",
    },
    {
      id: "VEN002",
      name: "Fashion Hub",
      email: "info@fashionhub.com",
      phone: "+91 9876543211",
      category: "Fashion",
      joinDate: "2024-03-10",
      status: "Pending",
      monthlyRevenue: 38000,
      totalOrders: 134,
      rating: 4.6,
      location: "Delhi, Delhi",
    },
    {
      id: "VEN003",
      name: "Electronics World",
      email: "support@electronicsworld.com",
      phone: "+91 9876543212",
      category: "Electronics",
      joinDate: "2024-03-05",
      status: "Active",
      monthlyRevenue: 32000,
      totalOrders: 98,
      rating: 4.7,
      location: "Bangalore, Karnataka",
    },
    {
      id: "VEN004",
      name: "Home Essentials",
      email: "hello@homeessentials.com",
      phone: "+91 9876543213",
      category: "Home & Garden",
      joinDate: "2024-02-28",
      status: "Active",
      monthlyRevenue: 28000,
      totalOrders: 87,
      rating: 4.5,
      location: "Chennai, Tamil Nadu",
    },
    {
      id: "VEN005",
      name: "Sports Zone",
      email: "contact@sportszone.com",
      phone: "+91 9876543214",
      category: "Sports",
      joinDate: "2024-02-20",
      status: "Inactive",
      monthlyRevenue: 15000,
      totalOrders: 45,
      rating: 4.2,
      location: "Pune, Maharashtra",
    },
  ];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-700 border-green-200 bg-green-50";
      case "Pending":
        return "text-orange-700 border-orange-200 bg-orange-50";
      case "Inactive":
        return "text-red-700 border-red-200 bg-red-50";
      default:
        return "text-gray-700 border-gray-200 bg-gray-50";
    }
  };

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === "Active").length;
  const totalRevenue = vendors.reduce(
    (sum, vendor) => sum + vendor.monthlyRevenue,
    0
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Vendors</h1>
            <p className="text-purple-600">
              Manage your franchise vendor network
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Vendor Account</DialogTitle>
              <DialogDescription>
                Add a new vendor to your franchise network
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Business Name</Label>
                  <Input id="vendorName" placeholder="Enter business name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City, State" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the business"
                  rows={3}
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Create Vendor Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Total Vendors
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {totalVendors}
            </div>
            <p className="text-xs text-purple-600">
              {activeVendors} active vendors
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600">From all vendors</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Average Rating
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {(
                vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length
              ).toFixed(1)}
            </div>
            <p className="text-xs text-purple-600">Vendor performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Vendor Management</CardTitle>
          <CardDescription className="text-purple-600">
            Search, filter, and manage your vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
                <Input
                  placeholder="Search vendors by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-purple-900">
                        {vendor.name}
                      </p>
                      <p className="text-sm text-purple-600">{vendor.email}</p>
                      <p className="text-sm text-purple-500">
                        {vendor.location}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-purple-700">
                    {vendor.category}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(vendor.status)}
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-purple-900">
                    ₹{vendor.monthlyRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-purple-700">
                    {vendor.totalOrders}
                  </TableCell>
                  <TableCell className="text-purple-700">
                    {vendor.rating}/5
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
                        <DropdownMenuItem>View Orders</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-purple-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredVendors.length)} of{" "}
              {filteredVendors.length} vendors
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
