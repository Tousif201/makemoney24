"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2, // Added for loading state
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateFranchiseDialog } from "../../../components/Dashboad/SalesRep/CreateFranchiseDialog";
import { getAllFranchise } from "../../../../api/Franchise"; // Correct import path

export default function AdminFranchisePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for API data
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchFranchises = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const data = await getAllFranchise();
        setFranchises(data);
      } catch (err) {
        console.error("Error fetching franchises:", err);
        setError("Failed to load franchises. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFranchises();
  }, []); // Empty dependency array means this runs once on mount

  // Filter franchises based on search term
  const filteredFranchises = franchises.filter((franchise) => {
    const matchesSearch =
      (franchise.franchiseName &&
        franchise.franchiseName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (franchise.ownerId?.name &&
        franchise.ownerId.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (franchise.location &&
        franchise.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredFranchises.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFranchises = filteredFranchises.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Helper to format date (e.g., createdAt)
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
        <span className="ml-3 text-xl text-gray-600">
          Loading franchises...
        </span>
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
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Franchises</h2>
            <p className="text-muted-foreground">
              Manage all franchises registered on the platform
            </p>
          </div>
          <CreateFranchiseDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Franchise
            </Button>
          </CreateFranchiseDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Franchises</CardTitle>
            <CardDescription>
              A comprehensive list of all franchises with their key details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search franchises by name, owner, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Removed status filter as it's not directly available in the API response */}
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Franchise ID</TableHead>
                    <TableHead>Name & Owner</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Sales Rep</TableHead> {/* Added Sales Rep */}
                    <TableHead>Join Date</TableHead> {/* Using createdAt */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFranchises.length > 0 ? (
                    paginatedFranchises.map((franchise) => (
                      <TableRow key={franchise._id}>
                        <TableCell className="font-medium">
                          {franchise._id} {/* Using MongoDB _id */}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {franchise.franchiseName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {franchise.ownerId?.name || "N/A"}{" "}
                              {/* Access owner name */}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              {franchise.ownerId?.email || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {franchise.ownerId?.phone || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{franchise.location}</TableCell>
                        <TableCell>
                          {franchise.salesRep?.name ? (
                            <div>
                              <div className="font-medium">
                                {franchise.salesRep.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {franchise.salesRep.email}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline">None</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(franchise.createdAt)}</TableCell>{" "}
                        {/* Using createdAt */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No franchises found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredFranchises.length)}{" "}
                of {filteredFranchises.length} franchises
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
