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

const vendorsData = [
  {
    id: 1,
    name: "TechCorp Solutions",
    email: "contact@techcorp.com",
    phone: "+1 234-567-8901",
    status: "Active",
    revenue: "$12,500",
    location: "New York",
  },
  {
    id: 2,
    name: "Global Supplies",
    email: "info@globalsupplies.com",
    phone: "+1 234-567-8902",
    status: "Active",
    revenue: "$8,750",
    location: "California",
  },
  {
    id: 3,
    name: "Metro Industries",
    email: "sales@metro.com",
    phone: "+1 234-567-8903",
    status: "Pending",
    revenue: "$15,200",
    location: "Texas",
  },
  {
    id: 4,
    name: "Prime Logistics",
    email: "hello@primelogistics.com",
    phone: "+1 234-567-8904",
    status: "Active",
    revenue: "$9,800",
    location: "Florida",
  },
  {
    id: 5,
    name: "Alpha Systems",
    email: "contact@alphasystems.com",
    phone: "+1 234-567-8905",
    status: "Inactive",
    revenue: "$5,400",
    location: "Illinois",
  },
  {
    id: 6,
    name: "Beta Corporation",
    email: "info@betacorp.com",
    phone: "+1 234-567-8906",
    status: "Active",
    revenue: "$11,300",
    location: "Washington",
  },
  {
    id: 7,
    name: "Gamma Enterprises",
    email: "sales@gamma.com",
    phone: "+1 234-567-8907",
    status: "Active",
    revenue: "$7,650",
    location: "Oregon",
  },
  {
    id: 8,
    name: "Delta Solutions",
    email: "contact@delta.com",
    phone: "+1 234-567-8908",
    status: "Pending",
    revenue: "$13,900",
    location: "Nevada",
  },
  {
    id: 9,
    name: "Epsilon Tech",
    email: "info@epsilon.com",
    phone: "+1 234-567-8909",
    status: "Active",
    revenue: "$10,200",
    location: "Arizona",
  },
  {
    id: 10,
    name: "Zeta Industries",
    email: "hello@zeta.com",
    phone: "+1 234-567-8910",
    status: "Active",
    revenue: "$6,800",
    location: "Colorado",
  },
  {
    id: 11,
    name: "Eta Corporation",
    email: "contact@eta.com",
    phone: "+1 234-567-8911",
    status: "Inactive",
    revenue: "$4,500",
    location: "Utah",
  },
  {
    id: 12,
    name: "Theta Systems",
    email: "info@theta.com",
    phone: "+1 234-567-8912",
    status: "Active",
    revenue: "$14,700",
    location: "Idaho",
  },
];

export function VendorsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(vendorsData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendors = vendorsData.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Accounts ({vendorsData.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{vendor.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {vendor.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{vendor.location}</TableCell>
                <TableCell>
                  <Badge
                    className={getStatusColor(vendor.status)}
                    variant="secondary"
                  >
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{vendor.revenue}</TableCell>
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
            Showing {startIndex + 1} to {Math.min(endIndex, vendorsData.length)}{" "}
            of {vendorsData.length} entries
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
