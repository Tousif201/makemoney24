import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Users, TrendingUp, Eye, MoreHorizontal, AlertCircle } from "lucide-react"; // 'Plus' icon removed
import { getAffiliateNetworkData } from "../../../../../api/affiliate2"; // Adjust the import path to your API function

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Helper to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Stats Component - Now receives dynamic props
function NetworkStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2"> {/* Changed grid-cols-3 to grid-cols-2 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
          <p className="text-xs text-muted-foreground">Across Level 1 & 2</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeMembers}</div>
          <p className="text-xs text-muted-foreground">Members with sales &gt; 0</p>
        </CardContent>
      </Card>
      {/* The "New Joins This Week" card has been removed */}
    </div>
  );
}

// Table Component - Updated for the new data structure
function NetworkTable({ members }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Total Sales</TableHead>
          <TableHead>Commission For You</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.userId}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell>
              <Badge variant={member.level === "Level 1" ? "default" : "outline"}>
                {member.level}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(member.joinedAt)}</TableCell>
            <TableCell>{formatCurrency(member.totalSales)}</TableCell>
            <TableCell className="font-semibold text-green-600">
              {formatCurrency(member.commissionEarnedForYou)}
            </TableCell>
            <TableCell>
              <Badge variant={member.totalSales > 0 ? "success" : "secondary"}>
                {member.totalSales > 0 ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  {member.level === "Level 1" && (
                      <DropdownMenuItem>
                         <Users className="mr-2 h-4 w-4" />
                         <span>Downline ({member.totalDirectReferrals})</span>
                     </DropdownMenuItem>
                   )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Main Page Component
export default function AffiliateNetwork() {
  const [networkData, setNetworkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useMemo will prevent re-calculation on every render
  const stats = useMemo(() => {
    if (!networkData.length) {
      return { totalMembers: 0, activeMembers: 0, newJoinsThisWeek: 0 };
    }
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return {
      totalMembers: networkData.length,
      activeMembers: networkData.filter(m => m.totalSales > 0).length,
      newJoinsThisWeek: networkData.filter(m => new Date(m.joinedAt) > oneWeekAgo).length,
    };
  }, [networkData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAffiliateNetworkData();
        const level1Network = result.level1Network || [];

        // Flatten the hierarchical data into a single array for the table
        const flattenedData = [];
        level1Network.forEach(l1 => {
          flattenedData.push({ ...l1, level: "Level 1" });
          l1.level2Network.forEach(l2 => {
            flattenedData.push({ ...l2, level: "Level 2" });
          });
        });

        setNetworkData(flattenedData);
      } catch (err) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once

  if (loading) {
    return <div className="p-5 text-center">Loading your network data...</div>;
  }

  if (error) {
    return (
      <div className="m-5 flex flex-col items-center justify-center rounded-lg border border-destructive bg-red-50 p-6 text-destructive">
        <AlertCircle className="mb-2 h-8 w-8" />
        <h3 className="text-lg font-semibold">Failed to Load Network</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Network</h2>
        <p className="text-muted-foreground">
          Manage your downline and track their performance.
        </p>
      </div>

      <NetworkStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Network Members</CardTitle>
          <CardDescription>
            An overview of all affiliates in your Level 1 and Level 2 downline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NetworkTable members={networkData} />
        </CardContent>
      </Card>
    </div>
  );
}