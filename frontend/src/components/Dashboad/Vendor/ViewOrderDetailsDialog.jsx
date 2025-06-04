import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Renders a dialog to display detailed information about a selected order.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls the visibility of the dialog.
 * @param {function} props.onClose - Callback function to close the dialog.
 * @param {object | null} props.order - The order object to display details for.
 * @param {function} props.getStatusBadgeVariant - Helper function to get badge variant based on status.
 */
export default function ViewOrderDetailsDialog({
  isOpen,
  onClose,
  order,
  getStatusBadgeVariant,
}) {
  if (!order) return null; // Don't render if no order is selected

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-700">
            Order Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Detailed information about the selected order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-gray-700 h-96 overflow-scroll ">
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Order ID:</Label>
            <span className="truncate">#{order._id}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Customer Name:</Label>
            <span>{order.userId?.name || "N/A"}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Vendor Name:</Label>
            <span>{order.vendorId?.name || "N/A"}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Products:</Label>
            <span>
              {order.items
                .map((item) => item.productServiceId?.title)
                .join(", ") || "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Total Amount:</Label>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Payment Status:</Label>
            <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
              {order.paymentStatus || "N/A"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Order Status:</Label>
            <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
              {order.orderStatus}
            </Badge>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label className="font-semibold text-right">Placed On:</Label>
            <span>
              {new Date(order.placedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
          <div className="grid grid-cols-2 items-start gap-2">
            <Label className="font-semibold text-right">
              Delivery Address:
            </Label>
            <span>
              {order.address
                ? `${order.address.address || ""},${order.address || ""}, ${
                    order.address.city || ""
                  }, ${order.address.pincode || ""}`
                    .replace(/^, | ,|, $/g, "")
                    .trim() || "N/A"
                : "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-2 items-start gap-2">
            <Label className="font-semibold text-right">Notes:</Label>
            <span>{order.notes || "N/A"}</span>
          </div>
          <div className="grid grid-cols-2 items-start gap-2">
            <Label className="font-semibold text-right">Contact Phone:</Label>
            <span>{order.userId.phone || "N/A"}</span>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-md shadow-sm"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
