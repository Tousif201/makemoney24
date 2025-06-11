"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react"; // Import Loader2 for loading spinner
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import {
  Select, // Import Select component
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Import Label for form fields

import { upgradeUser } from "../../../../api/user"; // Assuming this path is correct
import { getMembershipPackagesWithStats } from "../../../../api/membershipPackages"; // Ensure this path is correct

/**
 * Dialog component for upgrading a user to a member.
 *
 * @param {object} props - Component props.
 * @param {string} props.userId - The ID of the user to be upgraded.
 * @param {string} props.name - The name of the user to be displayed in the dialog.
 * @param {function} [props.onUpgradeSuccess] - Optional callback function to be called on successful upgrade.
 */
export default function UpgradeUserDialog({ userId, name, onUpgradeSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog open/close
  const [membershipPackages, setMembershipPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(""); // State for selected package ID
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState(null);

  // Fetch membership packages when the dialog is opened
  useEffect(() => {
    if (isDialogOpen) {
      const fetchPackages = async () => {
        setIsLoadingPackages(true);
        setPackagesError(null);
        try {
          const packages = await getMembershipPackagesWithStats();
          setMembershipPackages(packages);
          // Optionally pre-select the first package if available
          if (packages.length > 0) {
            setSelectedPackageId(packages[0]._id);
          }
        } catch (err) {
          console.error("Error fetching membership packages:", err);
          setPackagesError("Failed to load membership packages.");
        } finally {
          setIsLoadingPackages(false);
        }
      };
      fetchPackages();
    } else {
      // Reset states when dialog closes
      setError(null);
      setSuccess(false);
      setSelectedPackageId(""); // Clear selected package when dialog closes
    }
  }, [isDialogOpen]);
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!selectedPackageId) {
      setError("Please select a membership package.");
      return;
    }

    setIsSubmitting(true);
    setError(null); // Clear previous errors
    setSuccess(false); // Clear previous success message

    try {
      // Find the selected package to get its amount
      const selectedPackage = membershipPackages.find(
        (pkg) => pkg._id === selectedPackageId
      );

      if (!selectedPackage) {
        setError("Selected package details not found.");
        setIsSubmitting(false);
        return;
      }

      // Generate a unique random CashFree Order ID for manual enrollment
      // A simple timestamp-based approach combined with a random string can be used for uniqueness.
      const generateUniqueCashFreeOrderId = () => {
        return `CF_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      };

      const uniqueCashFreeOrderId = generateUniqueCashFreeOrderId();

      // Call the upgradeUser API function
      const response = await upgradeUser(userId, {
        membershipPackageId: selectedPackageId,
        membershipAmount: selectedPackage.packageAmount + selectedPackage.miscellaneousAmount, // Pass the amount from the selected package
        cashFreeOrderId: uniqueCashFreeOrderId // Send the generated unique random key
      });

      if (response.success) {
        setSuccess(true);
        if (onUpgradeSuccess) {
          onUpgradeSuccess(userId); // Notify parent component
        }
        // Optionally close the dialog after a short delay to show success message
        setTimeout(() => {
          setIsDialogOpen(false);
          setSuccess(false); // Reset success state for next open
        }, 1500);
      } else {
        // Handle cases where API call is successful but backend logic indicates failure
        setError(response.message || "Failed to upgrade user.");
      }
    } catch (err) {
      console.error("Error upgrading user:", err);
      // Check if the error has a response and data for more specific messages
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred during upgrade."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Upgrade User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Upgrade {name} to Member?
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to upgrade user {name} to a membership user?
            Please select a package below. Note: This action is not reversible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="membershipPackage">Membership Package</Label>
            {isLoadingPackages ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                packages...
              </div>
            ) : packagesError ? (
              <Alert variant="destructive">
                <AlertTitle>Package Load Error!</AlertTitle>
                <AlertDescription>{packagesError}</AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedPackageId}
                onValueChange={setSelectedPackageId}
                disabled={
                  isSubmitting || success || membershipPackages.length === 0
                }
              >
                <SelectTrigger id="membershipPackage" className="w-full">
                  <SelectValue placeholder="Select a membership package" />
                </SelectTrigger>
                <SelectContent>
                  {membershipPackages.length === 0 ? (
                    <SelectItem value="" disabled>
                      No packages available
                    </SelectItem>
                  ) : (
                    membershipPackages.map((pkg) => (
                      <SelectItem key={pkg._id} value={pkg._id}>
                        {pkg.name} - ₹{pkg.packageAmount} ({pkg.validityInDays} days)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {selectedPackageId && (
              <p className="text-sm text-gray-500">
                Selected:{" "}
                {
                  membershipPackages.find((p) => p._id === selectedPackageId)
                    ?.name
                }{" "}
                (₹
                {
                  membershipPackages.find((p) => p._id === selectedPackageId)
                    ?.amount
                }
                )
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert
              variant="success"
              className="bg-green-50 border-green-200 text-green-700"
            >
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                User {name} has been successfully upgraded!
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="rounded-md"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                success ||
                !selectedPackageId ||
                membershipPackages.length === 0
              }
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upgrading...
                </>
              ) : (
                "Confirm Upgrade"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
