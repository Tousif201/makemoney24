import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const franchisesData = [
  {
    id: "F001",
    name: "Digital Hub Franchise",
    owner: "John Smith",
    email: "john@digitalhub.com",
    phone: "+1 234-567-8901",
    location: "New York, NY",
    status: "Active",
    joinDate: "2023-06-15",
    vendorsCount: 12,
    totalBusiness: "$245,680",
    commission: "$24,568",
    growth: "+15.2%",
  },
  {
    id: "F002",
    name: "Style Central Franchise",
    owner: "Sarah Johnson",
    email: "sarah@stylecentral.com",
    phone: "+1 234-567-8902",
    location: "Los Angeles, CA",
    status: "Active",
    joinDate: "2023-08-20",
    vendorsCount: 8,
    totalBusiness: "$189,450",
    commission: "$18,945",
    growth: "+8.7%",
  },
  {
    id: "F003",
    name: "Lifestyle Franchise",
    owner: "Mike Davis",
    email: "mike@lifestyle.com",
    phone: "+1 234-567-8903",
    location: "Chicago, IL",
    status: "Pending",
    joinDate: "2024-01-10",
    vendorsCount: 5,
    totalBusiness: "$98,230",
    commission: "$9,823",
    growth: "+22.1%",
  },
  {
    id: "F004",
    name: "Fitness Pro Franchise",
    owner: "Lisa Wilson",
    email: "lisa@fitnesspro.com",
    phone: "+1 234-567-8904",
    location: "Miami, FL",
    status: "Active",
    joinDate: "2023-04-12",
    vendorsCount: 15,
    totalBusiness: "$356,890",
    commission: "$35,689",
    growth: "+12.4%",
  },
  {
    id: "F005",
    name: "Glamour Franchise",
    owner: "Emma Brown",
    email: "emma@glamour.com",
    phone: "+1 234-567-8905",
    location: "Seattle, WA",
    status: "Inactive",
    joinDate: "2023-02-28",
    vendorsCount: 3,
    totalBusiness: "$67,120",
    commission: "$6,712",
    growth: "-5.3%",
  },
];

export default function AdminFranchisePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFranchises = franchisesData.filter((franchise) => {
    const matchesSearch =
      franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || franchise.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredFranchises.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFranchises = filteredFranchises.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGrowthBadge = (growth) => {
    const isPositive = growth.startsWith("+");
    return (
      <div
        className={`flex items-center gap-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        <TrendingUp className={`h-3 w-3 ${!isPositive ? "rotate-180" : ""}`} />
        <span className="text-sm font-medium">{growth}</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Franchises</h2>
            <p className="text-muted-foreground">
              Manage all franchises and track their business performance
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Franchise
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Franchises</CardTitle>
            <CardDescription>
              A comprehensive list of all franchises with their business metrics
              and growth data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search franchises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Franchise ID</TableHead>
                    <TableHead>Name & Owner</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vendors</TableHead>
                    <TableHead>Total Business</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFranchises.map((franchise) => (
                    <TableRow key={franchise.id}>
                      <TableCell className="font-medium">
                        {franchise.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{franchise.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {franchise.owner}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{franchise.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {franchise.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{franchise.location}</TableCell>
                      <TableCell>{getStatusBadge(franchise.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {franchise.vendorsCount} vendors
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {franchise.totalBusiness}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {franchise.commission}
                      </TableCell>
                      <TableCell>{getGrowthBadge(franchise.growth)}</TableCell>
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Franchise
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Franchise
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredFranchises.length)}{" "}
                of {filteredFranchises.length} franchises
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
