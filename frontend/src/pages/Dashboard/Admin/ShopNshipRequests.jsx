import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { getAffiliateRequests, handleAffiliateRequest } from "../../../../api/affiliate";

// ActionCell Component for Dialog
const ActionCell = ({ user, onAction }) => {
  const [open, setOpen] = useState(false);
  const [commission, setCommission] = useState("");

  const handleApprove = async () => {
    try {
      await onAction('approved', user.userId, commission);
      toast.success("Request approved successfully");
    } catch (error) {
      toast.error("Failed to approve request");
    }
    setOpen(false);
  };

  const handleReject = async () => {
    try {
      await onAction('rejected', user.userId);
      toast.success("Request rejected successfully");
    } catch (error) {
      toast.error("Failed to reject request");
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="hover:bg-gray-100"
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage Request - {user.name}</DialogTitle>
          </DialogHeader>
          {/* <div className="space-y-3 mt-4">
            <label htmlFor="commission" className="text-sm font-medium">
              Commission Rate (%)
            </label>
            <Input
              id="commission"
              type="number"
              placeholder="e.g. 5"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full"
            />
          </div> */}
          <DialogFooter className="flex justify-center space-x-2 mt-6">
            <Button onClick={handleReject} variant="outline">
              ❌ Reject
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              ✅ Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main Component
const ShopNshipRequests = () => {
  const [tab, setTab] = useState("approved");
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const fetchAffiliateRequests = async () => {
      try {
        const data = await getAffiliateRequests();
        console.log("Fetched affiliate requests:", data);

        // Assuming the backend response includes an `isAffiliate` field
        const approved = data.filter((user) => user.isAffiliate === "approved");
        const pending = data.filter((user) => user.isAffiliate === "pending");

        setApprovedUsers(approved);
        setPendingUsers(pending);
      } catch (error) {
        toast.error("Failed to fetch affiliate requests");
      }
    };

    fetchAffiliateRequests();
  }, []);

  const handleAction = async (action, userId, commissionRate = null) => {
    try {
      await handleAffiliateRequest(action, userId, commissionRate);

      if (action === 'approved') {
        const approvedUser = pendingUsers.find((user) => user.userId === userId);
        setApprovedUsers([...approvedUsers, { ...approvedUser, isAffiliate: "approved" }]);
      }

      const updatedPendingUsers = pendingUsers.filter((user) => user.userId !== userId);
      setPendingUsers(updatedPendingUsers);
    } catch (error) {
      toast.error("Failed to handle the request");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Total ShopNship Users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{approvedUsers.length}</CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{pendingUsers.length}</CardContent>
        </Card>
      </div>
      {/* Tabs */}
      <Tabs defaultValue="approved" value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 bg-gray-100">
          <TabsTrigger value="approved">✅ Approved Users</TabsTrigger>
          <TabsTrigger value="pending">🕒 Pending Requests</TabsTrigger>
        </TabsList>
        {/* Approved Tab */}
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved ShopNShip Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Total Sale</TableHead>
                    <TableHead>Total Earning</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Address</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedUsers.map((user, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Link
                          to={`/dashboard/admin/shopNship/${user.userId}`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {user.userId}
                        </Link>
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companyName}</TableCell>
                      <TableCell>{user.TotalProductSaled}</TableCell>
                      <TableCell>{user.TotalCommissionEarned}</TableCell>
                      <TableCell>{user.address?.pincode}</TableCell>
                      <TableCell>{user.address?.city}</TableCell>
                      <TableCell>{user.address?.addressLine1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Pending Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending ShopNShip Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companyName}</TableCell>
                      <TableCell>{user.address?.pincode}</TableCell>
                      <TableCell>{user.address?.city}</TableCell>
                      <TableCell>{user.address?.addressLine1}</TableCell>
                      <TableCell>
                        <ActionCell user={user} onAction={handleAction} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShopNshipRequests;
