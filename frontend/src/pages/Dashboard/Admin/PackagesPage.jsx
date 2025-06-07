"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import CreatePackageDialog from "../../../../src/components/Dialogs/CreatePackageDialog";
import EditPackageDialog from "../../../../src/components/Dialogs/EditPackageDialog";
import { getMembershipPackage } from "../../../../api/membershipPackage";

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await getMembershipPackage();
        console.log("frontend package console",response)
        if (response.success) {
          setPackages(response.data);
        } else {
          console.error("Failed to fetch packages");
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Packages</h1>
          <p className="text-muted-foreground mt-2">Manage your service packages</p>
        </div>

        <CreatePackageDialog packages={packages} setPackages={setPackages} />
      </div>

      <EditPackageDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        selectedPackage={selectedPackage}
        packages={packages}
        setPackages={setPackages}
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableCaption>A list of your service packages.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Package Name</TableHead>
              <TableHead>Package Amount</TableHead>
              <TableHead>Miscellaneous Amount</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Total Users</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No packages found. Create your first package to get started.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg._id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>₹{pkg.packageAmount}</TableCell>
                  <TableCell>{pkg.miscellaneousAmount} </TableCell>
                  <TableCell>₹{pkg.createdAt}</TableCell>
                  <TableCell>{pkg.validityInDays} days</TableCell>
                  <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{pkg.description}</TableCell>
                  <TableCell>{pkg.totalUsersEnrolled}</TableCell>
                  <TableCell>₹{pkg.totalAmountCollected}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PackagesPage;
