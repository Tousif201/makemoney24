import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { updateOrderApi } from "../../../../api/order";

/**
 * Renders a dialog to update the status of a selected order.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls the visibility of the dialog.
 * @param {function} props.onClose - Callback function to close the dialog.
 * @param {object | null} props.order - The order object whose status is to be updated.
 * @param {function} props.onUpdateSuccess - Callback function to execute after a successful status update.
 */
export default function UpdateOrderStatusDialog({
  isOpen,
  onClose,
  order,
  onUpdateSuccess,
}) {
  const [newStatus, setNewStatus] = useState(order?.orderStatus || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateStatusError, setUpdateStatusError] = useState(null);

  // Update newStatus when the order prop changes (e.g., dialog opens with a new order)
  React.useEffect(() => {
    if (order) {
      setNewStatus(order.orderStatus);
      setUpdateStatusError(null); // Clear error when opening for a new order
    }
  }, [order]);

  const handleSaveStatusChange = async () => {
    if (!order || !newStatus) return;

    setIsUpdatingStatus(true);
    setUpdateStatusError(null);

    try {
      await updateOrderApi(order._id, {
        paymentStatus: "completed",
        orderStatus: newStatus,
      });
      onUpdateSuccess(order._id, newStatus); // Notify parent component of success
      onClose(); // Close the dialog
    } catch (err) {
      console.error("Failed to update order status:", err);
      setUpdateStatusError(
        err.message || "Failed to update status. Please try again."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-700">
            Update Order Status
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Change the status for order #{order?._id.substring(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="status"
              className="text-left text-gray-700 font-semibold"
            >
              New Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {updateStatusError && (
            <Alert variant="destructive">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{updateStatusError}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSaveStatusChange}
            disabled={isUpdatingStatus}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-md shadow-sm"
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdatingStatus}
            className="rounded-md shadow-sm"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
