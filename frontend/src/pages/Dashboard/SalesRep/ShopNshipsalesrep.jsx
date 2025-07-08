"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import CreateShopNshipDialog from "../../../components/Dashboad/SalesRep/CreateShopnshipDialog";
const shopnshipUsers = [
  {
    id: 1,
    name: "Priyanshu",
    phone: "783423523",
    password: "123456",
    referralcode: "REF1234",
    companyName: "Tech Solutions Pvt Ltd",
    email: "contact@techsolutions.com",
    pincode: "110001",
    city: "New Delhi",
    address: "",
    status: "Active",
    registeredDate: "2024-01-15",
  },
];

export default function ShopNshipSalesrep() {
  return (
    <div className="container mx-auto p-6 space-y-6 ">
      <div className="flex items-center  justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopnship Users</h1>
          <p className="text-muted-foreground">
            Manage registered shopnship users and their details
          </p>
        </div>
        <CreateShopNshipDialog onSubmit={(data) => console.log("New user:", data)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>List of all shopnship users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>address</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered Date</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Referral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopnshipUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.companyName}</TableCell>
                    <TableCell>{user.city}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>{user.pincode}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{user.registeredDate}</TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell>{user.referralcode || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
