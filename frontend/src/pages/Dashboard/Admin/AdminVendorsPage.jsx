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
// Removed Select components as status filter is no longer applicable based on schema
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  Filter, // Keeping Filter icon but removing its functionality without the select
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2, // Added for loading state
} from "lucide-react";
import { CreateVendorDialog } from "../../../components/Dashboad/SalesRep/CreateVendorDialog";
import { getAllVendors } from "../../../../api/Vendors"; // Ensure this path is correct
import { Link } from "react-router-dom";

export default function AdminVendorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  // Removed statusFilter as it's not applicable based on the schema
  // const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New states for API data, loading, and error
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const data = await getAllVendors();
        setVendors(data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Failed to load vendors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []); // Empty dependency array means this runs once on mount

  // Filter vendors based on search term (only name, email, pincode, owner name)
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      (vendor.name &&
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.userId?.email &&
        vendor.userId.email.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by owner email
      (vendor.userId?.name &&
        vendor.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by owner name
      (vendor.pincode &&
        vendor.pincode.toLowerCase().includes(searchTerm.toLowerCase()));
    // Removed status filter logic
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = filteredVendors.slice(
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
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner Contact</TableHead>{" "}
                    {/* Renamed to Owner Contact */}
                    <TableHead>Pincode</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Sales Rep</TableHead> {/* Added Sales Rep */}
                    <TableHead>Join Date</TableHead> {/* Using createdAt */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVendors.length > 0 ? (
                    paginatedVendors.map((vendor) => (
                      <TableRow key={vendor._id}>
                        {" "}
                        {/* Use _id from MongoDB */}
                        <TableCell className="font-medium">
                          <Link to={`${vendor._id}`}>
                            {vendor._id}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          <div className="font-medium truncate">
                            {vendor.name}
                          </div>
                          {/* Displaying owner name under vendor name */}
                          <div className="text-sm text-muted-foreground truncate">
                            Owner: {vendor.userId?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>{vendor.userId?.email || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.userId?.phone || "N/A"}
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
                          {vendor.salesRep?.name ? (
                            <div>
                              <div className="font-medium">
                                {vendor.salesRep.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.salesRep.email || "N/A"}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">None</Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(vendor.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        {" "}
                        {/* Adjusted colspan */}
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
                {Math.min(startIndex + itemsPerPage, filteredVendors.length)} of{" "}
                {filteredVendors.length} vendors
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
