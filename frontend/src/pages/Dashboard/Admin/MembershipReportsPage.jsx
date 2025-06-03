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
  Search,
  Download,
  Users,
  UserPlus,
  Crown,
  DollarSign,
  Loader2,
  IndianRupee,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { adminMembershipReport } from "../../../../api/membership"; // Adjust path as needed

export default function MembershipReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminMembershipReport();
        setReportData(data);
      } catch (err) {
        console.error("Error fetching membership report:", err);
        setError("Failed to load membership report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const allMemberships = reportData?.allMembership || [];

  const filteredReports = allMemberships.filter((report) => {
    // Search by member name or email (if email is part of userDetails)
    const matchesSearch =
      (report.name &&
        report.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.userDetails?.email &&
        report.userDetails.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Dummy logic for membership level based on profileScore
  const getMembershipBadge = (profileScore) => {
    if (profileScore >= 200) {
      return <Badge className="bg-purple-100 text-purple-800">Platinum</Badge>;
    } else if (profileScore >= 100) {
      return <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>;
    } else if (profileScore >= 50) {
      return <Badge className="bg-gray-100 text-gray-800">Silver</Badge>;
    } else if (profileScore > 0) {
      return <Badge className="bg-orange-100 text-orange-800">Bronze</Badge>;
    }
    return <Badge variant="secondary">N/A</Badge>;
  };

  const totalMembershipsAmount = reportData?.totalMembership?.amount || 0;
  const totalMembershipsRate = reportData?.totalMembership?.rate || "0.00%";
  const totalReferralAmount = reportData?.totalReferral?.amount || 0;
  const totalReferralRate = reportData?.totalReferral?.rate || "0.00%";
  const membershipRevenueAmount = reportData?.membershipRevenue?.amount || 0;
  const membershipRevenueRate = reportData?.membershipRevenue?.rate || "0.00%";
  const referralEarningAmount = reportData?.referralEarning?.amount || 0;
  const referralEarningRate = reportData?.referralEarning?.rate || "0.00%";

  // The activeMembershipsCount logic relied on getStatusBadge, so it's simplified.
  // You might need a different way to determine "active" if this is important for your summary cards.
  const activeMembershipsCount = totalMembershipsAmount; // Assuming all fetched memberships are considered 'active' for this summary if no status available.

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        <span className="ml-3 text-xl text-gray-600">
          Loading membership report...
        </span>
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
      <div className="p-4 bg-gradient-to-br">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center md:flex-row sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Membership Reports</h2>
            <p className="text-sm">
              Comprehensive analysis of membership purchases and referral
              activities
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button variant="outline" className="bg-white w-40">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 sm:p-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-purple-500/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-purple-900">
                Total Memberships
              </CardTitle>
              <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
                <Users className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-900">
                {totalMembershipsAmount}
              </div>
              <p className="text-xs sm:text-sm text-purple-700 mt-1">
                {allMemberships.length} current memberships
              </p>
              <Progress value={85} className="mt-2 sm:mt-3 h-1.5 sm:h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                <IndianRupee className="inline h-3 w-3 text-green-500" />
                {totalMembershipsRate} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-green-500/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-900">
                Total Referrals
              </CardTitle>
              <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
                <UserPlus className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-900">
                {totalReferralAmount}
              </div>
              <p className="text-xs sm:text-sm text-green-700 mt-1">
                {(totalMembershipsAmount > 0
                  ? totalReferralAmount / totalMembershipsAmount
                  : 0
                ).toFixed(1)}{" "}
                avg per member
              </p>
              <Progress value={72} className="mt-2 sm:mt-3 h-1.5 sm:h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                <IndianRupee className="inline h-3 w-3 text-green-500" />
                {totalReferralRate} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-blue-500/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-900">
                Membership Revenue
              </CardTitle>
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                <Crown className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                {formatCurrency(membershipRevenueAmount)}
              </div>
              <p className="text-xs sm:text-sm text-blue-700 mt-1">
                From membership sales
              </p>
              <Progress value={78} className="mt-2 sm:mt-3 h-1.5 sm:h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                <IndianRupee className="inline h-3 w-3 text-green-500" />
                {membershipRevenueRate} from last month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-orange-500/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-orange-900">
                Referral Earnings
              </CardTitle>
              <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg">
                <IndianRupee className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-900">
                {formatCurrency(referralEarningAmount)}
              </div>
              <p className="text-xs sm:text-sm text-orange-700 mt-1">
                Total referral commissions
              </p>
              <Progress value={65} className="mt-2 sm:mt-3 h-1.5 sm:h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                <IndianRupee className="inline h-3 w-3 text-green-500" />
                {referralEarningRate} from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">
              Membership Purchase Reports
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Detailed breakdown of membership purchases with referral
              performance and user activity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1 max-w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 sm:h-4 w-3 sm:w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Member</TableHead>
                    <TableHead className="text-xs sm:text-sm sm:table-cell">
                      Membership Level
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm md:table-cell">
                      Purchase Date
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm sm:table-cell">
                      Amount Paid
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm lg:table-cell">
                      Referrals
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm lg:table-cell">
                      Referral Earnings
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.length > 0 ? (
                    paginatedReports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm sm:text-base">
                              {report.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {report.userDetails?.email || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="table-cell">
                          {getMembershipBadge(report.profileScore)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm table-cell">
                          {formatDate(report.purchasedAt)}
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm stable-cell">
                          {formatCurrency(report.amountPaid)}
                        </TableCell>
                        <TableCell className="lg:table-cell">
                          <div className="flex items-center gap-1">
                            <UserPlus className="h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" />
                            <span className="font-medium text-xs sm:text-sm">
                              {report.noOfReferrals}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600 text-xs sm:text-sm lg:table-cell">
                          {formatCurrency(report.referralEarnings)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {" "}
                        {/* colSpan adjusted */}
                        No membership data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredReports.length)} of{" "}
                {filteredReports.length} members
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1 + Math.max(0, currentPage - 3);
                    if (page > totalPages) return null;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-7 sm:w-8 h-7 sm:h-8 p-0 text-xs sm:text-sm"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
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
