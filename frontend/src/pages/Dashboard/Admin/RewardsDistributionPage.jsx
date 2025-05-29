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
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  Award,
  Gift,
  Target, // Replaced with a more generic icon or removed if not applicable
  Loader2, // For loading spinner
  TrendingUp, // Keeping for progress bars
} from "lucide-react";
// DatePickerWithRange is not used in this iteration
// import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Progress } from "@/components/ui/progress";
import { adminRewardDistributionReport } from "../../../../api/reward"; // Ensure this path is correct

export default function RewardsDistributionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New states for API data, loading, and error
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminRewardDistributionReport();
        setReportData(data);
      } catch (err) {
        console.error("Error fetching reward distribution report:", err);
        setError(
          "Failed to load reward distribution report. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []); // Empty dependency array means this runs once on mount

  // Use the rewardsHistory array from the fetched data, or an empty array if not loaded yet
  const allRewardsHistory = reportData?.rewardsHistory || [];

  const filteredRewards = allRewardsHistory.filter((reward) => {
    const matchesSearch =
      (reward.Name &&
        reward.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reward.category &&
        reward.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reward.referralCode &&
        reward.referralCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || reward.category === categoryFilter; // Direct match from API 'type' field

    const matchesRecipient =
      recipientFilter === "all" || reward.userType === recipientFilter; // Direct match from API 'userType' field

    return matchesSearch && matchesCategory && matchesRecipient;
  });

  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRewards = filteredRewards.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR", // Assuming Indian Rupees, adjust as needed
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case "ReferralRewardMilestone":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Referral Milestone
          </Badge>
        );
      case "FranchiseMilestone":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Franchise Milestone
          </Badge>
        );
      case "CashbackMilestone":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Cashback Milestone
          </Badge>
        );
      case "ReferralLevelReward":
        return (
          <Badge className="bg-green-100 text-green-800">Referral Level</Badge>
        );
      case "ProfileScoreAchievementReward":
        return <Badge className="bg-red-100 text-red-800">Profile Score</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const getRecipientBadge = (type) => {
    switch (type) {
      case "user":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            User
          </Badge>
        );
      case "franchise":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            Franchise
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Data for summary cards from API response
  const noOfTotalRewards = reportData?.noOfTotalRewards || 0;
  const totalAmtDistributed = reportData?.totalAmtDistributed || 0;
  const totalReferralLevelRewardsAmt =
    reportData?.totalReferralLevelRewardsAmt || 0;
  const totalOtherMilestoneRewardsAmt =
    reportData?.totalOtherMilestoneRewardsAmt || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        <span className="ml-3 text-xl text-gray-600">
          Loading rewards report...
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
      <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Rewards Distribution Reports
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Monitor milestone rewards distributed across users and franchise
              partners
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button
              variant="outline"
              className="bg-white h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Download className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Total Rewards Count
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {noOfTotalRewards}
              </div>
              <p className="text-sm text-green-700 mt-1">rewards recorded</p>
              <Progress value={100} className="mt-3 h-2" />{" "}
              {/* Assuming all are counted */}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Total Amount Distributed
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Gift className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(totalAmtDistributed)}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Total rewards paid out
              </p>
              <Progress value={90} className="mt-3 h-2" /> {/* Example value */}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">
                Referral Level Rewards
              </CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">
                {formatCurrency(totalReferralLevelRewardsAmt)}
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Distributed for referral levels
              </p>
              <Progress value={70} className="mt-3 h-2" /> {/* Example value */}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                Other Milestone Rewards
              </CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {formatCurrency(totalOtherMilestoneRewardsAmt)}
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Distributed for various milestones
              </p>
              <Progress value={65} className="mt-3 h-2" /> {/* Example value */}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              Rewards Distribution History
            </CardTitle>
            <CardDescription>
              Complete history of rewards distributed to users and franchise
              partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-col md:flex-row md:items-center md:gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search rewards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 text-sm">
                  <Filter className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ReferralRewardMilestone">
                    Referral Milestone
                  </SelectItem>
                  <SelectItem value="FranchiseMilestone">
                    Franchise Milestone
                  </SelectItem>
                  <SelectItem value="CashbackMilestone">
                    Cashback Milestone
                  </SelectItem>
                  <SelectItem value="ReferralLevelReward">
                    Referral Level
                  </SelectItem>
                  <SelectItem value="ProfileScoreAchievementReward">
                    Profile Score
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={recipientFilter}
                onValueChange={setRecipientFilter}
              >
                <SelectTrigger className="w-full md:w-[160px] h-9 sm:h-10 text-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by Recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="franchise">Franchises</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Distribution Date</TableHead>
                    {/* Description is not directly from API, keeping it if you intend to add it to logs */}
                    {/* <TableHead>Description</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRewards.length > 0 ? (
                    paginatedRewards.map((reward, index) => (
                      <TableRow key={reward.id || index}>
                        {" "}
                        {/* Using index as fallback key if _id is not consistently available */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRecipientBadge(reward.userType)}
                            <div>
                              <div className="font-medium">{reward.Name}</div>
                              <div className="text-sm text-muted-foreground">
                                {reward.referralCode}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCategoryBadge(reward.category)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(reward.amt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(reward.distributionDate)}
                        </TableCell>
                        {/* If you add 'description' to your RewardLog schema and project it in the controller, you can uncomment this */}
                        {/* <TableCell className="max-w-[200px] truncate">
                          {reward.description}
                        </TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {" "}
                        {/* colSpan adjusted */}
                        No reward data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredRewards.length)} of{" "}
                {filteredRewards.length} rewards
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
