import { MoreHorizontal, Eye, Edit, Loader2, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Added Popover imports
import { Calendar } from "@/components/ui/calendar"; // Added Calendar import
import { format } from "date-fns"; // Added format for date formatting
import { cn } from "@/lib/utils"; // Assuming you have this utility for conditional class names

import { getOrders } from "../../../../api/vendor";
import { useSession } from "../../../context/SessionContext";
import ViewOrderDetailsDialog from "../../../components/Dashboad/Vendor/ViewOrderDetailsDialog";
import UpdateOrderStatusDialog from "../../../components/Dashboad/Vendor/UpdateOrderStatusDialog";

export default function VendorOrders() {
  const { loading: sessionLoading, session } = useSession(); // Use your custom useSession
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // For order fetching
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // State for dialogs
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State for export functionality
  const [exportDate, setExportDate] = useState(new Date()); // Default to today
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Helper to determine badge variant based on order status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "placed":
      case "new":
        return "default";
      case "confirmed":
      case "in-progress":
        return "secondary";
      case "delivered":
      case "completed":
        return "outline";
      case "cancelled":
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      // If session data is still loading OR if session (vendor) is not available in the session
      if (sessionLoading || !session?.id) {
        // Assuming your session object has an 'id' property
        setLoading(true); // Keep the main component loading state true
        return; // Don't proceed with fetching orders yet
      }

      const vendorId = session.id; // Get vendor ID from your custom session's session object

      setLoading(true); // Start loading state for orders
      setError(null); // Clear any previous errors

      try {
        let params = { vendorId };

        // Add orderStatus filter based on active tab
        if (activeTab === "new") {
          params.orderStatus = "placed";
        } else if (activeTab === "progress") {
          params.orderStatus = "in-progress";
        } else if (activeTab === "completed") {
          params.orderStatus = "delivered";
        }

        const fetchedOrders = await getOrders(params);
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false); // End loading state for orders
      }
    };

    fetchOrders();
  }, [activeTab, session, sessionLoading]); // Dependencies: activeTab, session, and sessionLoading

  // Function to handle viewing order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewDialog(true);
  };

  // Function to handle opening the status update dialog
  const handleUpdateStatusClick = (order) => {
    setSelectedOrder(order);
    setShowStatusDialog(true);
  };

  // Callback for when the status is successfully updated in the child dialog
  const handleOrderStatusUpdated = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      )
    );
  };

  // Function to handle exporting orders
  const handleExportOrders = async () => {
    if (!exportDate) {
      setExportError("Please select a date to export orders.");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      // Set start and end of the selected day
      const startOfDay = new Date(exportDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(exportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const params = {
        vendorId: session.id,
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      };

      const ordersToExport = await getOrders(params);

      if (ordersToExport.length === 0) {
        setExportError("No orders found for the selected date.");
        setIsExporting(false);
        return;
      }

      // Define CSV headers
      const headers = [
        "Order ID",
        "Customer Name",
        "Vendor Name",
        "Products",
        "Total Amount",
        "Payment Status",
        "Order Status",
        "Placed On",
        "Delivery Address",
        "Notes",
        "Contact Phone",
      ];

      // Format data for CSV
      const csvRows = ordersToExport.map((order) => {
        const products = order.items
          .map((item) => item.productServiceId?.title)
          .join("; ");
        const address = order.address
          ? `${order.address.street || ""}, ${order.address.city || ""}, ${
              order.address.zip || ""
            }`
              .replace(/^, | ,|, $/g, "")
              .trim()
          : "";
        const placedAtFormatted = new Date(order.placedAt).toLocaleDateString(
          "en-IN",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );

        return [
          `"${order._id}"`, // Enclose ID in quotes to prevent Excel issues
          `"${order.userId?.name || "N/A"}"`,
          `"${order.vendorId?.name || "N/A"}"`,
          `"${products}"`,
          order.totalAmount?.toFixed(2),
          `"${order.paymentStatus || "N/A"}"`,
          `"${order.orderStatus}"`,
          `"${placedAtFormatted}"`,
          `"${address}"`,
          `"${order.notes || "N/A"}"`,
          `"${order.userId.phone || "N/A"}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...csvRows].join("\n");

      // Create a Blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `orders_${format(exportDate, "yyyy-MM-dd")}.csv`
      );
      link.click();

      URL.revokeObjectURL(url); // Clean up the URL object
    } catch (err) {
      console.error("Error exporting orders:", err);
      setExportError("Failed to export orders. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Display a full-page loading spinner while the session itself is loading
  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="ml-4 text-lg text-gray-600">Loading session...</p>
      </div>
    );
  }

  // Display an error or login prompt if the session is not authenticated or vendor ID is missing
  if (!session?.id) {
    // Check if session object or session.id is missing
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <Alert variant="destructive">
          <AlertTitle>Authentication Required!</AlertTitle>
          <AlertDescription>
            Please log in as a vendor to view your orders.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderOrderTable = (currentOrders) => (
    <>
      {/* Mobile View */}
      <div className="block sm:hidden">
        <div className="space-y-4 p-4">
          {currentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No orders found for this tab.
            </p>
          ) : (
            currentOrders.map((order) => (
              <div
                key={order._id}
                className="border rounded-lg p-4 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">
                      #{order._id.substring(0, 8)}...
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customer: {order.userId?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Products:{" "}
                      {order.items
                        .map((item) => item.productServiceId?.title)
                        .join(", ") || "N/A"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatusClick(order)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-1 font-medium">
                      ₹{order.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Placed On: {new Date(order.placedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        {currentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No orders found for this tab.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    #{order._id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{order.userId?.name || "N/A"}</TableCell>
                  <TableCell>
                    {order.items
                      .map((item) => item.productServiceId?.title)
                      .join(", ")}
                  </TableCell>
                  <TableCell>₹{order.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.placedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatusClick(order)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-6 my-8 mx-8 font-sans">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Track and manage your customer orders
        </p>
      </div>

      {/* Export Orders Section */}
      <Card className="border-purple-100 shadow-md p-4">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl font-semibold">Export Orders</CardTitle>
          <CardDescription>
            Select a date to export all orders for that day.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !exportDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {exportDate ? (
                  format(exportDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={exportDate}
                onSelect={setExportDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleExportOrders}
            disabled={isExporting || !exportDate}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-md shadow-sm w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export Orders"
            )}
          </Button>
        </CardContent>
        {exportError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Export Error!</AlertTitle>
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}
      </Card>

      <Tabs
        defaultValue="all"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 bg-purple-500 text-white rounded-lg shadow-md">
          <TabsTrigger
            value="all"
            className="text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-purple-100 rounded-lg"
          >
            All Orders
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-purple-100 rounded-lg"
          >
            New
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-purple-100 rounded-lg"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-purple-100 rounded-lg"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Loading and Error States for orders data */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="ml-2 text-gray-600">Loading orders...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Display orders only if not loading and no error (and session is authenticated) */}
        {!loading && !error && (
          <>
            <TabsContent value="all" className="space-y-4">
              <Card className="border-purple-100 shadow-md">
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    Complete list of your orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {renderOrderTable(orders)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new">
              <Card className="border-purple-100 shadow-md">
                <CardHeader>
                  <CardTitle>New Orders</CardTitle>
                  <CardDescription>
                    Orders that need your attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {renderOrderTable(orders)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <Card className="border-purple-100 shadow-md">
                <CardHeader>
                  <CardTitle>In Progress Orders</CardTitle>
                  <CardDescription>
                    Orders currently being processed
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {renderOrderTable(orders)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card className="border-purple-100 shadow-md">
                <CardHeader>
                  <CardTitle>Completed Orders</CardTitle>
                  <CardDescription>
                    Successfully delivered orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {renderOrderTable(orders)}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Render the View Order Details Dialog */}
      <ViewOrderDetailsDialog
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        order={selectedOrder}
        getStatusBadgeVariant={getStatusBadgeVariant}
      />

      {/* Render the Update Order Status Dialog */}
      <UpdateOrderStatusDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        order={selectedOrder}
        onUpdateSuccess={handleOrderStatusUpdated}
      />
    </div>
  );
}
