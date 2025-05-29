import { useEffect, useState, useCallback } from "react"; // Import useCallback
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
import { Search, Users, UserPlus, DollarSign } from "lucide-react"; // Removed Filter, Ban
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAdminDashboard } from "../../../../api/user"; // Adjust this path if necessary

export default function UsersPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Managed by API limit, but good to have a local state for consistency or UI controls

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboard(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm
      );
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch admin dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Re-fetch when fetchDashboardData changes (due to dependencies like page, limit, search)

  // Helper for debouncing (you'll need to define this somewhere, e.g., a custom hook or directly in this file)
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  const getStatusBadge = (isMember) => {
    return isMember ? (
      <Badge className="bg-green-100 text-green-800">Member</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Non-Member</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Destructure data safely after checking for loading/error
  const { globalMetrics, pagination, users } = dashboardData;

  const totalUsers = globalMetrics.totalUsers;
  const totalReferrals = globalMetrics.totalReferrals;
  const totalReferralEarnings = globalMetrics.totalReferralEarnings;

  const totalFilteredUsers = pagination.totalResults;
  const totalPages = pagination.totalPages;

  return (
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">
              Manage all users, their referrals, and earnings
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {/* Active user count is not directly available from global metrics without further API call or client-side filtering */}
                {/* You might want to get this from backend if needed */}
                Overall users registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Referrals
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {/* Avg per user calculation might not be accurate for totalReferrals */}
                Overall referred users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Referral Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalReferralEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total earnings disbursed via referrals
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Complete list of users with their referral statistics and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-col md:flex-row md:items-center md:gap-4 mb-6">
              {/* Search Input */}
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, phone, or referral code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              {/* Removed Membership and Status filters as they are not supported by the current API for server-side filtering */}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Membership Status</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Referral Earnings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Join Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No users found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg" />{" "}
                              {/* Consider using actual user profile images if available */}
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.referralCode}
                              </div>{" "}
                              {/* Display referralCode here */}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{user.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {getStatusBadge(user.membershipStatus === "Member")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {user.totalReferrals}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${user.totalReferralEarnings.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${user.totalSpent.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(user.joiningDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {totalFilteredUsers > 0
                  ? pagination.currentPage * pagination.limit -
                    pagination.limit +
                    1
                  : 0}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  totalFilteredUsers
                )}{" "}
                of {totalFilteredUsers} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {/* Render page buttons dynamically based on totalPages */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
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
