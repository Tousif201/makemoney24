import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getVendor } from "../../../../api/Vendors"; 
import { useSession } from "../../../context/SessionContext"; 

export function VendorsTable() {
  const { user } = useSession(); 
  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(vendors.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendors = vendors.slice(startIndex, endIndex);

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

  useEffect(() => {
    if (user?._id) {
      console.log(user._id);
      getVendor(user._id)
        .then((data) => setVendors(data))
        .catch((err) => console.error("Vendor fetch error:", err.message));
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Accounts ({vendors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Pincode</TableHead>
              <TableHead>CreatesAt</TableHead>
              <TableHead>Commissionrate</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell className="font-medium">
                  {vendor.userId?.name}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{vendor.userId?.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {vendor.userId?.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{vendor.pincode || "-"}</TableCell>
                
                   
                <TableCell className="font-medium">
                  {vendor.createdAt|| "-"}
                </TableCell>
                   
                  
              
                <TableCell className="font-medium">
                  {vendor.commissionRate || "-"}
                </TableCell>
                {/* <TableCell className="text-right">
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
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, vendors.length)} of{" "}
            {vendors.length} entries
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
