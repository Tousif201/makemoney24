import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Edit, Trash2, Eye } from "lucide-react";
import { getFranchise } from "../../../../api/Franchise";
import { useSession } from "../../../context/SessionContext";

export function FranchiseTable() {
  const [franchiseData, setFranchiseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch franchise data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFranchise(); 
        console.log("response console",res)// expected to return { data: [...] }
        setFranchiseData(res|| []);
       console.log("franchise data",franchiseData) 
      } catch (error) {
        console.error("Failed to fetch franchises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(franchiseData.length / itemsPerPage);
  const currentFranchises = franchiseData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <Card className="rounded-2xl shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Franchise List</CardTitle>
      </CardHeader>

      <CardContent className="overflow-x-auto p-4">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Franchise Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  {/* <TableHead className="text-right">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFranchises.map((franchise) => (
                  <TableRow key={franchise._id}>
                    <TableCell>{franchise.franchiseName}</TableCell>
                    <TableCell>{franchise.ownerId.name}</TableCell>
                    <TableCell>{franchise.ownerId.email}</TableCell>
                    <TableCell>{franchise.ownerId.phone}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(franchise.location)}>
                        {franchise.location}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="text-right space-x-2">
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
