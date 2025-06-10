"use client";

import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  Hand,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // Import toast for notifications

import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { getOrdersApi } from "../../../../api/order";
import { useSession } from "../../../context/SessionContext";
import { CreateTicketDialog } from "../../../components/Tickets/CreateTicketDialog";

export default function UserOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session, loading: sessionLoading } = useSession();

  // New states for Create Ticket Dialog
  const [isCreateTicketDialogOpen, setIsCreateTicketDialogOpen] =
    useState(false);
  const [createTicketForOrder, setCreateTicketForOrder] = useState(null); // Stores the order object for ticket creation

  // --- Fetch Orders on Component Mount or Session ID Change ---
  useEffect(() => {
    const fetchOrders = async () => {
      if (sessionLoading || !session?.id) {
        if (!sessionLoading && !session?.id) {
          setIsLoading(false);
          setError("User not logged in or session expired.");
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedOrders = await getOrdersApi({ userId: session.id });
        setUserOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session, sessionLoading]);

  // --- Mapping Backend Status to Display Names ---
  const mapOrderStatusToDisplay = (status) => {
    switch (status) {
      case "placed":
        return "Placed";
      case "confirmed":
        return "Confirmed";
      case "in-progress":
        return "In Progress";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const filteredOrders = userOrders.filter((order) => {
    if (statusFilter === "all") return true;
    return (
      mapOrderStatusToDisplay(order.orderStatus).toLowerCase() === statusFilter
    );
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "confirmed":
      case "in-progress":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "placed":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-700 border-green-200 bg-green-50";
      case "confirmed":
      case "in-progress":
        return "text-blue-700 border-blue-200 bg-blue-50";
      case "placed":
        return "text-orange-700 border-orange-200 bg-orange-50";
      case "cancelled":
        return "text-red-700 border-red-200 bg-red-50";
      default:
        return "text-gray-700 border-gray-200 bg-gray-50";
    }
  };

  const totalOrders = userOrders.length;
  const deliveredOrders = userOrders.filter(
    (o) => o.orderStatus === "delivered"
  ).length;
  const totalSpent = userOrders
    .filter((o) => o.orderStatus !== "cancelled")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // --- Handler for Raising a Replacement Ticket ---
  const handleRaiseReplacementTicket = (order) => {
    // IMPORTANT: Ensure order.vendorId is populated and has a 'userId' field.
    // If order.vendorId is just an ID, you need to adjust your backend to populate it,
    // or fetch the vendor's user ID separately.
    const assignedToUserId = order.vendorId?.userId;

    if (!assignedToUserId) {
      toast.error(
        "Vendor user information not available to assign ticket. Cannot raise ticket."
      );
      return;
    }

    setCreateTicketForOrder({
      title: `Replacement/Return Request for Order #${order._id
        .slice(-6)
        .toUpperCase()}`,
      description: `This ticket is for a replacement/return request for Order ID: ${order._id
        .slice(-6)
        .toUpperCase()}.

Product(s) affected: ${order.items
        .map((item) => item.productServiceId?.title || "Unknown Product")
        .join(", ")}.

`,
      category: "item_replacement", // Consider adding this category in your Ticket model
      assignedTo: assignedToUserId, // Pre-assign to the vendor's user ID
      priority: "high", // Default to high priority for such requests
      status: "open", // New tickets should typically be open
    });
    setIsCreateTicketDialogOpen(true);
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-gray-600">
        <Clock className="mr-2 h-5 w-5 animate-spin" /> Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">View and manage all your orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Orders
            </CardTitle>
            <Package className="h-4 w-4 text-purple-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalOrders}
            </div>
            <p className="text-xs text-gray-600">All time orders</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Delivered Orders
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {deliveredOrders}
            </div>
            <p className="text-xs text-gray-600">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Spent
            </CardTitle>
            <Truck className="h-4 w-4 text-purple-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹
              {totalSpent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-600">Excluding cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Order History</CardTitle>
              <CardDescription className="text-gray-600">
                Complete details of all your orders
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No orders found for the selected filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium text-gray-900">
                      {order._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {order.vendorId?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48">
                        <p className="text-gray-700 truncate">
                          {order.items
                            .map(
                              (item) =>
                                `${
                                  item.productServiceId?.title || "Unknown Item"
                                } (x${item.quantity})`
                            )
                            .join(", ")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      ₹
                      {order.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-gray-700 capitalize">
                      {order.paymentStatus}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(order.orderStatus)}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.orderStatus)}
                          {mapOrderStatusToDisplay(order.orderStatus)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {" "}
                      {/* Use flex to space out buttons */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-200 text-gray-700 hover:bg-purple-50"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Order Details -{" "}
                              {order._id.slice(-6).toUpperCase()}
                            </DialogTitle>
                            <DialogDescription>
                              Complete information about your order
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Items Ordered
                              </h4>
                              <ul className="list-disc list-inside text-gray-700 text-sm">
                                {order.items.map((item) => (
                                  <li
                                    key={
                                      item.productServiceId?._id ||
                                      Math.random()
                                    }
                                  >
                                    {item.productServiceId?.title ||
                                      "Unknown Item"}{" "}
                                    (x{item.quantity}) - ₹
                                    {item.price.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{" "}
                                    each
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">
                                  Order Date:
                                </span>
                                <p className="font-medium text-gray-900">
                                  {new Date(order.placedAt).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Total Amount:
                                </span>
                                <p className="font-medium text-gray-900">
                                  ₹
                                  {order.totalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Vendor:</span>
                                <p className="font-medium text-gray-900">
                                  {order.vendorId?.name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Payment Status:
                                </span>
                                <p className="font-medium text-gray-900 capitalize">
                                  {order.paymentStatus}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Order Status:
                                </span>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(order.orderStatus)}
                                >
                                  {mapOrderStatusToDisplay(order.orderStatus)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* New "Raise Ticket" Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        onClick={() => handleRaiseReplacementTicket(order)}
                        // Example: Disable for cancelled or delivered orders
                        disabled={
                          order.orderStatus === "cancelled" ||
                          order.orderStatus === "delivered"
                        }
                      >
                        <Hand className="mr-1 h-3 w-3" />
                        Raise Ticket
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog (for replacement requests) */}
      <CreateTicketDialog
        open={isCreateTicketDialogOpen}
        onOpenChange={(open) => {
          setIsCreateTicketDialogOpen(open);
          if (!open) {
            setCreateTicketForOrder(null); // Clear data when dialog closes
          }
        }}
        initialValues={createTicketForOrder} // Pass the pre-filled data
        onTicketCreated={() => {
          toast.success("Replacement ticket raised successfully!");
          setIsCreateTicketDialogOpen(false); // Close dialog on success
          setCreateTicketForOrder(null); // Clear data
          // Optionally, you might want to refresh orders here if ticket creation
          // somehow impacts order status on the frontend.
          // fetchOrders(); // If you want to re-fetch orders
        }}
      />
    </div>
  );
}
