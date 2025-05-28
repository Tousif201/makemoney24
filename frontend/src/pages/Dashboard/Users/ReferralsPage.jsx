"use client";

import { Copy, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ReferralsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const referralCode = "REF123456";

  const levelData = {
    level1: {
      commission: "30%",
      users: [
        {
          name: "Alice Johnson",
          joinDate: "2024-03-15",
          revenue: "₹360",
          status: "Active",
        },
        {
          name: "Bob Smith",
          joinDate: "2024-03-10",
          revenue: "₹360",
          status: "Active",
        },
        {
          name: "Carol Davis",
          joinDate: "2024-03-05",
          revenue: "₹360",
          status: "Active",
        },
        {
          name: "David Wilson",
          joinDate: "2024-02-28",
          revenue: "₹360",
          status: "Active",
        },
        {
          name: "Eva Brown",
          joinDate: "2024-02-20",
          revenue: "₹360",
          status: "Active",
        },
      ],
    },
    level2: {
      commission: "10%",
      users: [
        {
          name: "Frank Miller",
          joinDate: "2024-03-18",
          revenue: "₹120",
          status: "Active",
        },
        {
          name: "Grace Lee",
          joinDate: "2024-03-12",
          revenue: "₹120",
          status: "Active",
        },
        {
          name: "Henry Taylor",
          joinDate: "2024-03-08",
          revenue: "₹120",
          status: "Active",
        },
      ],
    },
    level3: {
      commission: "5%",
      users: [
        {
          name: "Ivy Chen",
          joinDate: "2024-03-20",
          revenue: "₹60",
          status: "Active",
        },
        {
          name: "Jack Robinson",
          joinDate: "2024-03-14",
          revenue: "₹60",
          status: "Active",
        },
      ],
    },
    level4: {
      commission: "2%",
      users: [
        {
          name: "Kate Anderson",
          joinDate: "2024-03-22",
          revenue: "₹24",
          status: "Active",
        },
      ],
    },
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
  };

  const renderUserTable = (users) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Revenue Generated</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.joinDate}</TableCell>
            <TableCell className="text-green-600 font-medium">
              {user.revenue}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className="text-green-700 border-green-200"
              >
                {user.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Referrals</h1>
          <p className="text-purple-600">
            Track your referral network and earnings
          </p>
        </div>
      </div>

      {/* Referral Code Card */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Your Referral Code</CardTitle>
          <CardDescription className="text-purple-600">
            Share this code with friends to earn commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <code className="text-lg font-mono text-purple-900">
                {referralCode}
              </code>
            </div>
            <Button
              onClick={copyReferralCode}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(levelData).map(([level, data], index) => (
          <Card key={level} className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Level {index + 1} ({data.commission})
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {data.users.length}
              </div>
              <p className="text-xs text-purple-600">Active referrals</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Levels Tabs */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Referral Network</CardTitle>
          <CardDescription className="text-purple-600">
            View your multi-level referral structure and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="level1" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="level1">Level 1 (30%)</TabsTrigger>
              <TabsTrigger value="level2">Level 2 (10%)</TabsTrigger>
              <TabsTrigger value="level3">Level 3 (5%)</TabsTrigger>
              <TabsTrigger value="level4">Level 4 (2%)</TabsTrigger>
            </TabsList>

            <TabsContent value="level1" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-900">
                  Direct Referrals
                </h3>
                <Badge className="bg-purple-100 text-purple-800">
                  30% Commission
                </Badge>
              </div>
              {renderUserTable(levelData.level1.users)}
            </TabsContent>

            <TabsContent value="level2" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-900">
                  Level 2 Referrals
                </h3>
                <Badge className="bg-purple-100 text-purple-800">
                  10% Commission
                </Badge>
              </div>
              {renderUserTable(levelData.level2.users)}
            </TabsContent>

            <TabsContent value="level3" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-900">
                  Level 3 Referrals
                </h3>
                <Badge className="bg-purple-100 text-purple-800">
                  5% Commission
                </Badge>
              </div>
              {renderUserTable(levelData.level3.users)}
            </TabsContent>

            <TabsContent value="level4" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-900">
                  Level 4 Referrals
                </h3>
                <Badge className="bg-purple-100 text-purple-800">
                  2% Commission
                </Badge>
              </div>
              {renderUserTable(levelData.level4.users)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
