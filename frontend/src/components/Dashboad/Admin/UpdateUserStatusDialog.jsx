"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pen } from "lucide-react";
import { updateAccountStatus } from "../../../../api/user"; // Ensure this path is correct based on your project structure

export default function UpdateUserStatusDialog({
  userId,
  currentStatus = "active",
  fetchDashboardData,
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State to control dialog open/close

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true

    try {
      // Call the API function to update the user's account status
      const response = await updateAccountStatus(userId, status);
      toast.success(response.message || `User status updated to "${status}"`);
      setIsOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user status."
      );
    } finally {
      setIsLoading(false); // Reset loading state
      fetchDashboardData();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pen className="h-4 w-4" /> {/* Added size for consistency */}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Account Status</DialogTitle>
            <DialogDescription>
              Change the status of this user&apos;s account
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 w-full">
            <div className="grid gap-2">
              <Label htmlFor="status">Account Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val)}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
