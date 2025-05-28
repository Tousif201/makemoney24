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
  Users,
  UserPlus,
  Crown,
  TrendingUp,
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Progress } from "@/components/ui/progress";

const membershipReportsData = [
  {
    userId: "U001",
    userName: "John Smith",
    email: "john.smith@email.com",
    membershipLevel: "Gold",
    purchaseDate: "2024-01-15",
    amount: "$299",
    referralsCount: 12,
    referralEarnings: "$1,240",
    status: "Active",
    upgradeHistory: ["Bronze → Silver → Gold"],
    totalSpent: "$2,450",
  },
  {
    userId: "U002",
    userName: "Sarah Johnson",
    email: "sarah.j@email.com",
    membershipLevel: "Platinum",
    purchaseDate: "2023-11-20",
    amount: "$599",
    referralsCount: 25,
    referralEarnings: "$3,750",
    status: "Active",
    upgradeHistory: ["Bronze → Silver → Gold → Platinum"],
    totalSpent: "$5,680",
  },
  {
    userId: "U003",
    userName: "Mike Davis",
    email: "mike.davis@email.com",
    membershipLevel: "Silver",
    purchaseDate: "2024-02-10",
    amount: "$149",
    referralsCount: 8,
    referralEarnings: "$720",
    status: "Active",
    upgradeHistory: ["Bronze → Silver"],
    totalSpent: "$1,890",
  },
  {
    userId: "U004",
    userName: "Lisa Wilson",
    email: "lisa.wilson@email.com",
    membershipLevel: "Bronze",
    purchaseDate: "2024-03-01",
    amount: "$49",
    referralsCount: 3,
    referralEarnings: "$180",
    status: "Active",
    upgradeHistory: ["Bronze"],
    totalSpent: "$890",
  },
  {
    userId: "U005",
    userName: "Emma Brown",
    email: "emma.brown@email.com",
    membershipLevel: "Gold",
    purchaseDate: "2023-12-05",
    amount: "$299",
    referralsCount: 15,
    referralEarnings: "$1,875",
    status: "Expired",
    upgradeHistory: ["Bronze → Silver → Gold"],
    totalSpent: "$3,240",
  },
];

export default function MembershipReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredReports = membershipReportsData.filter((report) => {
    const matchesSearch =
      report.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMembership =
      membershipFilter === "all" ||
      report.membershipLevel.toLowerCase() === membershipFilter;
    const matchesStatus =
      statusFilter === "all" || report.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesMembership && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getMembershipBadge = (level) => {
    switch (level) {
      case "Platinum":
        return (
          <Badge className="bg-purple-100 text-purple-800">Platinum</Badge>
        );
      case "Gold":
        return <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>;
      case "Silver":
        return <Badge className="bg-gray-100 text-gray-800">Silver</Badge>;
      case "Bronze":
        return <Badge className="bg-orange-100 text-orange-800">Bronze</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case "Suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalMemberships = filteredReports.length;
  const totalReferrals = filteredReports.reduce(
    (sum, report) => sum + report.referralsCount,
    0
  );
  const totalRevenue = filteredReports.reduce(
    (sum, report) =>
      sum + Number.parseFloat(report.amount.replace("$", "").replace(",", "")),
    0
  );
  const totalReferralEarnings = filteredReports.reduce(
    (sum, report) =>
      sum +
      Number.parseFloat(
        report.referralEarnings.replace("$", "").replace(",", "")
      ),
    0
  );

  return (
    <div>
      <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Membership Reports
            </h2>
            <p className="text-muted-foreground">
              Comprehensive analysis of membership purchases and referral
              activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DatePickerWithRange />
            <Button variant="outline" className="bg-white">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                Total Memberships
              </CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {totalMemberships}
              </div>
              <p className="text-sm text-purple-700 mt-1">
                {filteredReports.filter((r) => r.status === "Active").length}{" "}
                active memberships
              </p>
              <Progress value={85} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Total Referrals
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {totalReferrals}
              </div>
              <p className="text-sm text-green-700 mt-1">
                {(totalReferrals / totalMemberships).toFixed(1)} avg per member
              </p>
              <Progress value={72} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Membership Revenue
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                From membership sales
              </p>
              <Progress value={78} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Referral Earnings
              </CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                ${totalReferralEarnings.toLocaleString()}
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Total referral commissions
              </p>
              <Progress value={65} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              Membership Purchase Reports
            </CardTitle>
            <CardDescription>
              Detailed breakdown of membership purchases with referral
              performance and user activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={membershipFilter}
                onValueChange={setMembershipFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Membership Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Referral Earnings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Upgrade Path</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.map((report) => (
                    <TableRow key={report.userId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {report.userId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getMembershipBadge(report.membershipLevel)}
                      </TableCell>
                      <TableCell>{report.purchaseDate}</TableCell>
                      <TableCell className="font-medium">
                        {report.amount}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {report.referralsCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {report.referralEarnings}
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.totalSpent}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-[150px]">
                          {report.upgradeHistory.join(", ")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredReports.length)} of{" "}
                {filteredReports.length} members
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
