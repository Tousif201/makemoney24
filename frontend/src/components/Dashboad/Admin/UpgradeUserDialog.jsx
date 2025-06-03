"use client";

import { useState } from "react";
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
import { upgradeUser } from "../../../../api/user"; // Assuming this path is correct

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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    setIsSubmitting(true);
    setError(null); // Clear previous errors
    setSuccess(false); // Clear previous success message

    try {
      // Call the upgradeUser API function
      const response = await upgradeUser(userId, {
        membershipAmount: 1200,
        razorpayPaymentId: "temp_payment_id_" + Date.now(), // Use a unique temp ID
        razorpayOrderId: "temp_order_id_" + Date.now(),     // Use a unique temp ID
        razorpaySignature: "temp_signature_" + Date.now(),  // Use a unique temp ID
      });

      if (response.success) { // Assuming your API returns a success boolean
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
      setError(err.response?.data?.message || err.message || "An unexpected error occurred during upgrade.");
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
          <DialogTitle className="text-xl font-bold text-gray-900">Upgrade {name} to Member?</DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to upgrade user {name} to a membership user?
            Note: This action is not reversible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="bg-green-50 border-green-200 text-green-700">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>User {name} has been successfully upgraded!</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button" // Important to set type="button" to prevent form submission
                variant="outline"
                disabled={isSubmitting}
                className="rounded-md"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || success} // Disable if submitting or already successful
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
