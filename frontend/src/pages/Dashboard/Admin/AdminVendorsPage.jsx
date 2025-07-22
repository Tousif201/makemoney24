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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { CreateVendorDialog } from "../../../components/Dashboad/SalesRep/CreateVendorDialog";
// **MODIFIED**: Import approveVendor
import { getAllVendors, approveVendor } from "../../../../api/Vendors";
import { Link } from "react-router-dom";

export default function AdminVendorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("revenue-high-low");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null);
      try {
        const sortParam = sortBy === "revenue-low-high" ? "lowToHigh" : "highToLow";
        const data = await getAllVendors(sortParam);
        setVendors(data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Failed to load vendors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [sortBy]);

  // **MODIFIED**: New handler to call the approval API
  const handleApproveClick = async (vendorId) => {
    try {
      // Call the new API function
      const result = await approveVendor(vendorId);
      console.log(result.message); // Log success message from backend

      // Optimistically update the UI to reflect the new approval status
      setVendors((currentVendors) =>
        currentVendors.map((vendor) =>
          vendor._id === vendorId
            ? { ...vendor, isAdminApproved: true } // Update the specific vendor
            : vendor
        )
      );
      // Optional: Show a success toast notification to the user
    } catch (apiError) {
      console.error("Failed to approve vendor:", apiError);
      // Optional: Show an error toast notification to the user
      setError(apiError.message || "An error occurred during approval.");
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      (vendor.name &&
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.userEmail &&
        vendor.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.userName &&
        vendor.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.pincode &&
        vendor.pincode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const sortedVendors = filteredVendors;
  const totalPages = Math.ceil(sortedVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = sortedVendors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return <Badge className="bg-white text-xl">🥇</Badge>;
      case 2: return <Badge className="bg-white text-xl">🥈</Badge>;
      case 3: return <Badge className="bg-white text-xl">🥉</Badge>;
      default: return <span className="font-medium">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        <span className="ml-3 text-xl text-gray-600">Loading vendors...</span>
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
    <div className="overflow-x-hidden px-4 md:px-6 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Vendors</h2>
            <p className="text-muted-foreground">
              Manage all vendors registered on the platform
            </p>
          </div>
          <CreateVendorDialog>
            <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Vendor
            </Button>
          </CreateVendorDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Vendors</CardTitle>
            <CardDescription>
              A list of all vendors with their contact and association details.
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

              <div className="w-full md:w-auto md:min-w-[200px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue-high-low">Revenue: High to Low</SelectItem>
                    <SelectItem value="revenue-low-high">Revenue: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Owner Contact</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Sales Rep</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVendors.length > 0 ? (
                    paginatedVendors.map((vendor, index) => (
                      <TableRow key={vendor._id}>
                        <TableCell className="font-medium">
                          {getRankBadge(startIndex + index + 1)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link to={`${vendor._id}`}>{vendor._id}</Link>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          <div className="font-medium truncate">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            Owner: {vendor.userName || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vendor.totalOrders || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>{vendor.userEmail || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.userPhone || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {formatCurrency(vendor.totalRevenue)}
                          </div>
                        </TableCell>
                        <TableCell>{vendor.pincode}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{vendor.commissionRate}%</Badge>
                        </TableCell>
                        <TableCell>
                          {vendor.salesRepName ? (
                            <div>
                              <div className="font-medium">{vendor.salesRepName}</div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.salesRepEmail || "N/A"}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">None</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(vendor.createdAt)}</TableCell>

                        {/* **MODIFIED**: Action column with integrated API call */}
                        <TableCell className="whitespace-nowrap text-center">
                          {vendor.isAdminApproved ? (
                            <Badge className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 text-sm">
                              Approved
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveClick(vendor._id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        No vendor data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, sortedVendors.length)} of{" "}
                {sortedVendors.length} vendors
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
                <span>Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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