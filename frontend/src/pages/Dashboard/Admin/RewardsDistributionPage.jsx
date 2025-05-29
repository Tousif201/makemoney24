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
  Award,
  Gift,
  Target,
  TrendingUp,
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Progress } from "@/components/ui/progress";

const rewardsDistributionData = [
  {
    id: "RWD001",
    recipientType: "User",
    recipientName: "John Smith",
    recipientId: "U001",
    rewardType: "Membership Milestone",
    milestone: "Gold Member Achievement",
    amount: "$100",
    distributionDate: "2024-03-15",
    status: "Distributed",
    category: "Membership",
    description: "Achieved Gold membership level",
  },
  {
    id: "RWD002",
    recipientType: "Franchise",
    recipientName: "Digital Hub Franchise",
    recipientId: "F001",
    rewardType: "Revenue Milestone",
    milestone: "Silver Revenue Achievement",
    amount: "$2,500",
    distributionDate: "2024-03-14",
    status: "Distributed",
    category: "Franchise",
    description: "Reached $100K revenue milestone",
  },
  {
    id: "RWD003",
    recipientType: "User",
    recipientName: "Sarah Johnson",
    recipientId: "U002",
    rewardType: "Cashback",
    milestone: "VIP Cashback",
    amount: "$50",
    distributionDate: "2024-03-13",
    status: "Distributed",
    category: "Cashback",
    description: "VIP spending threshold reached",
  },
  {
    id: "RWD004",
    recipientType: "Franchise",
    recipientName: "Fitness Pro Franchise",
    recipientId: "F004",
    rewardType: "Growth Milestone",
    milestone: "Vendor Recruitment Bonus",
    amount: "$750",
    distributionDate: "2024-03-12",
    status: "Pending",
    category: "Franchise",
    description: "Successfully recruited 10+ vendors",
  },
  {
    id: "RWD005",
    recipientType: "User",
    recipientName: "Mike Davis",
    recipientId: "U003",
    rewardType: "Membership Milestone",
    milestone: "Silver Member Achievement",
    amount: "$50",
    distributionDate: "2024-03-11",
    status: "Distributed",
    category: "Membership",
    description: "Achieved Silver membership level",
  },
  {
    id: "RWD006",
    recipientType: "User",
    recipientName: "Lisa Wilson",
    recipientId: "U004",
    rewardType: "Cashback",
    milestone: "First Purchase Cashback",
    amount: "$5",
    distributionDate: "2024-03-10",
    status: "Distributed",
    category: "Cashback",
    description: "First purchase on platform",
  },
];

export default function RewardsDistributionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRewards = rewardsDistributionData.filter((reward) => {
    const matchesSearch =
      reward.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.milestone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      reward.category.toLowerCase() === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || reward.status.toLowerCase() === statusFilter;
    const matchesRecipient =
      recipientFilter === "all" ||
      reward.recipientType.toLowerCase() === recipientFilter;
    return (
      matchesSearch && matchesCategory && matchesStatus && matchesRecipient
    );
  });

  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRewards = filteredRewards.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Distributed":
        return (
          <Badge className="bg-green-100 text-green-800">Distributed</Badge>
        );
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      Membership: "bg-purple-100 text-purple-800",
      Franchise: "bg-orange-100 text-orange-800",
      Cashback: "bg-blue-100 text-blue-800",
    };
    return <Badge className={colors[colors]}>{category}</Badge>;
  };

  const getRecipientBadge = (type) => {
    switch (type) {
      case "User":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            User
          </Badge>
        );
      case "Franchise":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            Franchise
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const totalRewards = filteredRewards.length;
  const totalDistributed = filteredRewards.filter(
    (r) => r.status === "Distributed"
  ).length;
  const totalAmount = filteredRewards
    .filter((r) => r.status === "Distributed")
    .reduce(
      (sum, reward) =>
        sum +
        Number.parseFloat(reward.amount.replace("$", "").replace(",", "")),
      0
    );
  const pendingAmount = filteredRewards
    .filter((r) => r.status === "Pending")
    .reduce(
      (sum, reward) =>
        sum +
        Number.parseFloat(reward.amount.replace("$", "").replace(",", "")),
      0
    );

  return (
    <div>
      <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Rewards Distribution Reports
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Monitor milestone rewards distributed across users and franchise partners
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <DatePickerWithRange className="w-full sm:w-auto" />
            <Button variant="outline" className="bg-white h-9 sm:h-10 text-xs sm:text-sm">
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
                Total Rewards
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {totalRewards}
              </div>
              <p className="text-sm text-green-700 mt-1">
                {totalDistributed} successfully distributed
              </p>
              <Progress value={85} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Amount Distributed
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Gift className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                ${totalAmount.toLocaleString()}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Total rewards paid out
              </p>
              <Progress value={72} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">
                Pending Rewards
              </CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">
                ${pendingAmount.toLocaleString()}
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Awaiting distribution
              </p>
              <Progress value={78} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                Success Rate
              </CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {((totalDistributed / totalRewards) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Distribution success rate
              </p>
              <Progress value={65} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              Rewards Distribution History
            </CardTitle>
            <CardDescription>
              Complete history of milestone rewards distributed to users and
              franchise partners
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
                <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-10 text-sm">
                  <Filter className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="membership">Membership</SelectItem>
                  <SelectItem value="franchise">Franchise</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={recipientFilter}
                onValueChange={setRecipientFilter}
              >
                <SelectTrigger className=" w-full md:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="franchise">Franchises</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="  w-full  md:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reward ID</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Distribution Date</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-medium">{reward.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecipientBadge(reward.recipientType)}
                          <div>
                            <div className="font-medium">
                              {reward.recipientName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reward.recipientId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reward.milestone}</div>
                          <div className="text-sm text-muted-foreground">
                            {reward.rewardType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(reward.category)}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {reward.amount}
                      </TableCell>
                      <TableCell>{getStatusBadge(reward.status)}</TableCell>
                      <TableCell>{reward.distributionDate}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {reward.description}
                      </TableCell>
                    </TableRow>
                  ))}
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
