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
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { CreateVendorDialog } from "../../../components/Dashboad/SalesRep/CreateVendorDialog";
import { getAllVendors } from "../../../../api/Vendors"; // Ensure this path is correct
import { Link } from "react-router-dom";

export default function AdminVendorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("revenue-high-low"); // Default high to low
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New states for API data, loading, and error
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when component mounts or sort changes
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        // Map frontend sort values to backend expected values
        const sortParam = sortBy === "revenue-low-high" ? "lowToHigh" : "highToLow";
        const data = await getAllVendors(sortParam);
        console.log("frontend data console of vendors", data);
        setVendors(data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Failed to load vendors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [sortBy]); // Re-fetch when sort changes

  // Filter vendors based on search term (only name, email, pincode, owner name)
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      (vendor.name &&
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.userEmail &&
        vendor.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by owner email (flattened)
      (vendor.userName &&
        vendor.userName.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by owner name (flattened)
      (vendor.pincode &&
        vendor.pincode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Since sorting is now handled by backend, we don't need to sort here
  const sortedVendors = filteredVendors;

  const totalPages = Math.ceil(sortedVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = sortedVendors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Helper to format date (using createdAt from timestamps)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleApproval = async (vendorId, isApproved) => {
    try {
      // Optional: call API here if needed
      console.log(`${isApproved ? "Approving" : "Rejecting"} vendor ${vendorId}`);
      // You can call an API like:
      // await updateVendorStatus(vendorId, isApproved);
      // Then optionally refresh data
    } catch (error) {
      console.error("Failed to update vendor status:", error);
    }
  };


  // Helper to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Helper to get rank badge
  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center">
            <Badge className=" bg-white text-xl">
              🥇
            </Badge>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center ">
            <Badge className=" bg-white text-white text-xl">
              🥈
            </Badge>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center ">
            <Badge className=" bg-white text-white text-xl">
              🥉
            </Badge>
          </div>
        );
      default:
        return <span className="font-medium">{rank}</span>;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        <span className="ml-3 text-xl text-gray-600">Loading vendors...</span>
      </div>
    );
  }

  // Render error state
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
                  placeholder="Search vendors by name, email, or pincode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Dropdown */}
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
                    <TableHead className="flex justify-center  items-center">Action</TableHead>

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
                          <Link to={`${vendor._id}`}>
                            {vendor._id}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          <div className="font-medium truncate">
                            {vendor.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            Owner: {vendor.userName || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline">
                            {vendor.totalOrders || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>{vendor.userEmail || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.userPhone || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium text-green-600">
                            {formatCurrency(vendor.totalRevenue)}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {vendor.pincode}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline">
                            {vendor.commissionRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {vendor.salesRepName ? (
                            <div>
                              <div className="font-medium">
                                {vendor.salesRepName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.salesRepEmail || "N/A"}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">None</Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(vendor.createdAt)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="flex gap-2 ">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproval(vendor._id, true)}
                              className="bg-green-500 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApproval(vendor._id, false)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>


                      </TableRow>


                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
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