import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Edit, Trash2, Eye } from "lucide-react";

const franchiseData = [
  {
    id: 1,
    name: "Downtown Branch",
    owner: "Sarah Johnson",
    email: "sarah@downtown.com",
    phone: "+1 234-567-9001",
    status: "Active",
    revenue: "$25,400",
    location: "Downtown NYC",
  },
  {
    id: 2,
    name: "Westside Location",
    owner: "Mike Chen",
    email: "mike@westside.com",
    phone: "+1 234-567-9002",
    status: "Active",
    revenue: "$18,750",
    location: "West LA",
  },
  {
    id: 3,
    name: "North Plaza",
    owner: "Emily Davis",
    email: "emily@northplaza.com",
    phone: "+1 234-567-9003",
    status: "Pending",
    revenue: "$22,100",
    location: "North Chicago",
  },
  {
    id: 4,
    name: "South Bay Center",
    owner: "David Wilson",
    email: "david@southbay.com",
    phone: "+1 234-567-9004",
    status: "Active",
    revenue: "$19,800",
    location: "South Bay",
  },
  {
    id: 5,
    name: "East End Store",
    owner: "Lisa Brown",
    email: "lisa@eastend.com",
    phone: "+1 234-567-9005",
    status: "Under Review",
    revenue: "$16,200",
    location: "East Boston",
  },
  {
    id: 6,
    name: "Central Hub",
    owner: "James Miller",
    email: "james@central.com",
    phone: "+1 234-567-9006",
    status: "Active",
    revenue: "$28,900",
    location: "Central Dallas",
  },
  {
    id: 7,
    name: "Riverside Mall",
    owner: "Anna Garcia",
    email: "anna@riverside.com",
    phone: "+1 234-567-9007",
    status: "Active",
    revenue: "$21,650",
    location: "Riverside CA",
  },
  {
    id: 8,
    name: "Uptown Square",
    owner: "Robert Taylor",
    email: "robert@uptown.com",
    phone: "+1 234-567-9008",
    status: "Active",
    revenue: "$24,300",
    location: "Uptown Seattle",
  },
  {
    id: 9,
    name: "Metro Station",
    owner: "Jennifer Lee",
    email: "jennifer@metro.com",
    phone: "+1 234-567-9009",
    status: "Pending",
    revenue: "$17,500",
    location: "Metro Denver",
  },
  {
    id: 10,
    name: "Harbor View",
    owner: "Michael White",
    email: "michael@harbor.com",
    phone: "+1 234-567-9010",
    status: "Active",
    revenue: "$26,800",
    location: "Harbor Miami",
  },
  {
    id: 11,
    name: "Mountain Peak",
    owner: "Susan Clark",
    email: "susan@mountain.com",
    phone: "+1 234-567-9011",
    status: "Under Review",
    revenue: "$15,400",
    location: "Mountain View",
  },
  {
    id: 12,
    name: "Valley Center",
    owner: "Kevin Martinez",
    email: "kevin@valley.com",
    phone: "+1 234-567-9012",
    status: "Active",
    revenue: "$23,700",
    location: "Valley Phoenix",
  },
];

export function FranchiseTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(franchiseData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFranchises = franchiseData.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Franchise Accounts ({franchiseData.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Franchise Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFranchises.map((franchise) => (
              <TableRow key={franchise.id}>
                <TableCell className="font-medium">{franchise.name}</TableCell>
                <TableCell>{franchise.owner}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{franchise.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {franchise.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{franchise.location}</TableCell>
                <TableCell>
                  <Badge
                    className={getStatusColor(franchise.status)}
                    variant="secondary"
                  >
                    {franchise.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {franchise.revenue}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, franchiseData.length)} of {franchiseData.length}{" "}
            entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8"
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
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
