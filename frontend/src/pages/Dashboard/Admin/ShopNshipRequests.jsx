import React, { useState } from "react";
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

// Dummy Data
const dummyApprovedUsers = [
  {
    name: "Ravi Sharma",
    companyname: "Priyanshu Pvt Ltd",
    email: "ravi@example.com",
    city: "Jabalpur",
    pincode: "110001",
    address: "Connaught Place, Delhi",
  },
  {
    name: "Sneha Reddy",
    companyname: "SR Group",
    email: "sneha@example.com",
    city: "Bangalore",
    pincode: "560001",
    address: "MG Road",
  },
];

const dummyPendingUsers = [
  {
    name: "Aman Gupta",
    companyname: "Manish Corp",
    email: "aman@example.com",
    city: "Mumbai",
    pincode: "400001",
    address: "Fort",
  },
  {
    name: "Priya Das",
    companyname: "PD Solutions",
    email: "priya@example.com",
    city: "Kolkata",
    pincode: "700001",
    address: "Salt Lake",
  },
];

// ActionCell Component for Dialog
const ActionCell = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [commission, setCommission] = useState("");

  const handleApprove = () => {
    console.log("✅ Approved with commission:", commission, "for user:", user.name);
    // TODO: Send to backend
    setOpen(false);
  };

  const handleReject = () => {
    console.log("❌ Rejected request for:", user.name);
    // TODO: Send to backend
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

          <div className="space-y-3 mt-4">
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
          </div>

          <DialogFooter className="flex justify-end space-x-2 mt-6">
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Total ShopNship Users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">124</CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">8</CardContent>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Address</TableHead>
                    {/* <TableHead>Action</TableHead> */}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyApprovedUsers.map((user, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companyname}</TableCell>
                      <TableCell>{user.pincode}</TableCell>
                      <TableCell>{user.city}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      {/* <TableCell>
                        <ActionCell user={user} />
                      </TableCell> */}
                      <TableCell>
                        <span className="text-green-600 font-medium">Approved</span>
                      </TableCell>
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
                  {dummyPendingUsers.map((user, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companyname}</TableCell>
                      <TableCell>{user.pincode}</TableCell>
                      <TableCell>{user.city}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>
                        <ActionCell user={user} />
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
