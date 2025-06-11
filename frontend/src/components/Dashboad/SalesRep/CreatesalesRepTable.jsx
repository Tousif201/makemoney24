"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Mail, Phone, Loader2 } from "lucide-react"; // Added Loader2
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditSalesRepDialog } from "./EditSalesRepDialog";

export function SalesRepTable({ salesReps, onDelete }) {
  const [editingSalesRep, setEditingSalesRep] = useState(null);

//   const handleEdit = (salesRep) => {
//     setEditingSalesRep(salesRep);
//   };

//   const handleUpdate = (updatedSalesRep) => {
//     onUpdate(updatedSalesRep);
//     setEditingSalesRep(null);
//   };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sales Representatives</CardTitle>
          <CardDescription>A list of all sales representatives and their details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Join Date</TableHead> {/* Added Join Date from model */}
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesReps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No sales representatives found.
                  </TableCell>
                </TableRow>
              ) : (
                salesReps.map((salesRep) => (
                  <TableRow key={salesRep._id}> {/* Use _id as the primary key from MongoDB */}
                    <TableCell className="font-medium">{salesRep.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{salesRep.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{salesRep.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{salesRep.pincode}</TableCell>
                    <TableCell>{salesRep.referralCode}</TableCell>
                    <TableCell>
                      <Badge variant={salesRep.accountStatus === "active" ? "default" : "secondary"}>
                        {salesRep.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{salesRep.roles?.join(", ") || "N/A"}</TableCell> {/* Display roles */}
                    <TableCell>{new Date(salesRep.joinedAt).toLocaleDateString()}</TableCell> {/* Format date */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {/* <DropdownMenuItem onClick={() => handleEdit(salesRep)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem> */}
                          <DropdownMenuItem onClick={() => onDelete(salesRep._id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* {editingSalesRep && (
        <EditSalesRepDialog
          salesRep={editingSalesRep}
          open={!!editingSalesRep}
        //   onOpenChange={(open) => {
        //     if (!open) setEditingSalesRep(null);
        //   }}
        //   onSubmit={handleUpdate}
        />
      )} */}
    </>
  );
}