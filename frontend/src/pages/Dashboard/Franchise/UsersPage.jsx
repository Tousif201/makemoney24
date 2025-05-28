"use client";

import {
  Filter,
  Search,
  Shield,
  ShieldCheck,
  Users,
  UserX,
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

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const users = [
    {
      id: "USR001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      joinDate: "2024-03-15",
      membershipStatus: "Premium",
      membershipDate: "2024-03-15",
      totalOrders: 12,
      totalSpent: 15600,
      referralCode: "REF123456",
      location: "Mumbai, Maharashtra",
    },
    {
      id: "USR002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 9876543211",
      joinDate: "2024-03-10",
      membershipStatus: "Basic",
      membershipDate: null,
      totalOrders: 8,
      totalSpent: 8900,
      referralCode: "REF789012",
      location: "Delhi, Delhi",
    },
    {
      id: "USR003",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      phone: "+91 9876543212",
      joinDate: "2024-03-05",
      membershipStatus: "Premium",
      membershipDate: "2024-03-08",
      totalOrders: 15,
      totalSpent: 22400,
      referralCode: "REF345678",
      location: "Bangalore, Karnataka",
    },
    {
      id: "USR004",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      phone: "+91 9876543213",
      joinDate: "2024-02-28",
      membershipStatus: "Basic",
      membershipDate: null,
      totalOrders: 5,
      totalSpent: 4200,
      referralCode: "REF901234",
      location: "Chennai, Tamil Nadu",
    },
    {
      id: "USR005",
      name: "David Brown",
      email: "david.brown@example.com",
      phone: "+91 9876543214",
      joinDate: "2024-02-20",
      membershipStatus: "Premium",
      membershipDate: "2024-02-25",
      totalOrders: 18,
      totalSpent: 28900,
      referralCode: "REF567890",
      location: "Pune, Maharashtra",
    },
    {
      id: "USR006",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "+91 9876543215",
      joinDate: "2024-02-15",
      membershipStatus: "Basic",
      membershipDate: null,
      totalOrders: 3,
      totalSpent: 2100,
      referralCode: "REF234567",
      location: "Hyderabad, Telangana",
    },
    {
      id: "USR007",
      name: "Robert Taylor",
      email: "robert.taylor@example.com",
      phone: "+91 9876543216",
      joinDate: "2024-02-10",
      membershipStatus: "Premium",
      membershipDate: "2024-02-12",
      totalOrders: 21,
      totalSpent: 35600,
      referralCode: "REF678901",
      location: "Kolkata, West Bengal",
    },
    {
      id: "USR008",
      name: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      phone: "+91 9876543217",
      joinDate: "2024-02-05",
      membershipStatus: "Basic",
      membershipDate: null,
      totalOrders: 6,
      totalSpent: 5800,
      referralCode: "REF890123",
      location: "Ahmedabad, Gujarat",
    },
    {
      id: "USR009",
      name: "Chris Martinez",
      email: "chris.martinez@example.com",
      phone: "+91 9876543218",
      joinDate: "2024-01-30",
      membershipStatus: "Premium",
      membershipDate: "2024-02-01",
      totalOrders: 14,
      totalSpent: 19800,
      referralCode: "REF012345",
      location: "Jaipur, Rajasthan",
    },
    {
      id: "USR010",
      name: "Amanda Garcia",
      email: "amanda.garcia@example.com",
      phone: "+91 9876543219",
      joinDate: "2024-01-25",
      membershipStatus: "Basic",
      membershipDate: null,
      totalOrders: 4,
      totalSpent: 3400,
      referralCode: "REF456789",
      location: "Surat, Gujarat",
    },
    {
      id: "USR011",
      name: "Kevin Lee",
      email: "kevin.lee@example.com",
      phone: "+91 9876543220",
      joinDate: "2024-01-20",
      membershipStatus: "Premium",
      membershipDate: "2024-01-22",
      totalOrders: 16,
      totalSpent: 24200,
      referralCode: "REF789456",
      location: "Lucknow, Uttar Pradesh",
    },
    {
      id: "USR012",
      name: "Michelle White",
      email: "michelle.white@example.com",
      phone: "+91 9876543221",
      joinDate: "2024-01-15",
      membershipStatus: "Basic",
      membershipDate: null,
      totalOrders: 7,
      totalSpent: 6700,
      referralCode: "REF123789",
      location: "Kanpur, Uttar Pradesh",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMembership =
      membershipFilter === "all" ||
      user.membershipStatus.toLowerCase() === membershipFilter;
    return matchesSearch && matchesMembership;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getMembershipColor = (status) => {
    switch (status) {
      case "Premium":
        return "text-gray-700 border-purple-200 bg-purple-50";
      case "Basic":
        return "text-gray-700 border-gray-200 bg-gray-50";
      default:
        return "text-gray-700 border-gray-200 bg-gray-50";
    }
  };

  const getMembershipIcon = (status) => {
    return status === "Premium" ? ShieldCheck : Shield;
  };

  const totalUsers = users.length;
  const premiumUsers = users.filter(
    (u) => u.membershipStatus === "Premium"
  ).length;
  const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Manage users referred by your franchise
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalUsers}
            </div>
            <p className="text-xs text-gray-600">Referred users</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Premium Members
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {premiumUsers}
            </div>
            <p className="text-xs text-gray-600">
              {((premiumUsers / totalUsers) * 100).toFixed(1)}% conversion
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Basic Users
            </CardTitle>
            <UserX className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalUsers - premiumUsers}
            </div>
            <p className="text-xs text-gray-600">Non-premium users</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Revenue
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">From all users</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">User Management</CardTitle>
          <CardDescription className="text-gray-600">
            Search and filter your referred users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or referral code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={membershipFilter}
              onValueChange={setMembershipFilter}
            >
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Referral Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const MembershipIcon = getMembershipIcon(user.membershipStatus);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          {user.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getMembershipColor(user.membershipStatus)}
                      >
                        <MembershipIcon className="mr-1 h-3 w-3" />
                        {user.membershipStatus}
                      </Badge>
                      {user.membershipDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Since {user.membershipDate}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {user.joinDate}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {user.totalOrders}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      ₹{user.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-purple-50 px-2 py-1 rounded text-gray-700">
                        {user.referralCode}
                      </code>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
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
