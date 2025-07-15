import React from "react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Users,
  TrendingUp,
  Plus,
  Eye,
  MoreHorizontal,
} from "lucide-react";

// Dummy data
const networkMembers = [
  { id: 1, name: "Sarah Connor", level: "Level 1", joined: "2024-01-10", sales: "₹2,340", status: "Active" },
  { id: 2, name: "Mike Johnson", level: "Level 1", joined: "2024-01-08", sales: "₹1,890", status: "Active" },
  { id: 3, name: "Lisa Wang", level: "Level 2", joined: "2024-01-05", sales: "₹3,120", status: "Active" },
  { id: 4, name: "Tom Brown", level: "Level 1", joined: "2024-01-03", sales: "₹890", status: "Inactive" },
  { id: 5, name: "Anna Lee", level: "Level 2", joined: "2024-01-01", sales: "₹4,560", status: "Active" },
];

// Stats Component
function NetworkStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">47</div>
          <p className="text-xs text-muted-foreground">Across all levels</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">34</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">72%</span> activity rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Joins This Week</CardTitle>
          <Plus className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+25%</span> from last week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Table Component
function NetworkTable({ members }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Total Sales</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell>{member.level}</TableCell>
            <TableCell>{member.joined}</TableCell>
            <TableCell>{member.sales}</TableCell>
            <TableCell>
              <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                {member.status}
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
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    View Downline
                  </DropdownMenuItem>
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
  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Network</h2>
        <p className="text-muted-foreground">Manage your downline network and team</p>
      </div>

      <NetworkStats />

      <Card>
        <CardHeader>
          <CardTitle>Network Members</CardTitle>
          <CardDescription>Your downline network overview</CardDescription>
        </CardHeader>
        <CardContent>
          <NetworkTable members={networkMembers} />
        </CardContent>
      </Card>
    </div>
  );
}
