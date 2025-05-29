import { MoreHorizontal, Eye, Edit } from "lucide-react";
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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { getOrders } from "../../../../api/vendor";
import { useSession } from "../../../context/SessionContext";

export default function VendorOrders() {
  const {  loading: sessionLoading, session } = useSession(); // Use your custom useSession
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // For order fetching
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

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
      if (sessionLoading || !session?.id) { // Assuming your session object has an 'id' property
        setLoading(true); // Keep the main component loading state true
        return; // Don't proceed with fetching orders yet
      }

      const vendorId = session.id; // Get vendor ID from your custom session's session object

      setLoading(true); // Start loading state for orders
      setError(null);    // Clear any previous errors

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

  // Display a full-page loading spinner while the session itself is loading
  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="ml-4 text-lg text-gray-600">Loading session session...</p>
      </div>
    );
  }

  // Display an error or login prompt if the session is not authenticated or vendor ID is missing
  if (!session?.id) { // Check if session object or session.id is missing
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

  return (
    <div className="space-y-6 my-8 mx-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Track and manage your customer orders
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 bg-purple-500">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All Orders
          </TabsTrigger>
          <TabsTrigger value="new" className="text-xs sm:text-sm ">
            New
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Loading and Error States for orders data */}
        {loading && ( // This 'loading' state is specifically for order fetching
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
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>Complete list of your orders</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No orders found for this vendor.
                    </p>
                  ) : (
                    <>
                      {/* Mobile View */}
                      <div className="block sm:hidden">
                        <div className="space-y-4 p-4">
                          {orders.map((order) => (
                            <div
                              key={order._id}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <h3 className="font-medium text-gray-900">
                                    #{order._id.substring(0, 8)}...
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {order.userId?.name || "N/A"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {order.items.map(item => item.productServiceId?.title).join(', ') || 'N/A'}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
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
                                    ${order.totalAmount?.toFixed(2)}
                                  </span>
                                </div>
                                <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                                  {order.orderStatus}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.placedAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden sm:block overflow-x-auto">
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
                            {orders.map((order) => (
                              <TableRow key={order._id}>
                                <TableCell className="font-medium">
                                  #{order._id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>{order.userId?.name || "N/A"}</TableCell>
                                <TableCell>
                                  {order.items.map(item => item.productServiceId?.title).join(', ')}
                                </TableCell>
                                <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
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
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
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
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new">
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>New Orders</CardTitle>
                  <CardDescription>Orders that need your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No new orders found.
                    </p>
                  ) : (
                    <div className="hidden sm:block overflow-x-auto">
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
                          {orders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">
                                #{order._id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>{order.userId?.name || "N/A"}</TableCell>
                              <TableCell>
                                {order.items.map(item => item.productServiceId?.title).join(', ')}
                              </TableCell>
                              <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
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
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>In Progress Orders</CardTitle>
                  <CardDescription>Orders currently being processed</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No orders in progress.
                    </p>
                  ) : (
                    <div className="hidden sm:block overflow-x-auto">
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
                          {orders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">
                                #{order._id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>{order.userId?.name || "N/A"}</TableCell>
                              <TableCell>
                                {order.items.map(item => item.productServiceId?.title).join(', ')}
                              </TableCell>
                              <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
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
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>Completed Orders</CardTitle>
                  <CardDescription>Successfully delivered orders</CardDescription>
                </CardHeader>
                <CardHeader>
                  <CardTitle>Completed Orders</CardTitle>
                  <CardDescription>Successfully delivered orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No completed orders found.
                    </p>
                  ) : (
                    <div className="hidden sm:block overflow-x-auto">
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
                          {orders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">
                                #{order._id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>{order.userId?.name || "N/A"}</TableCell>
                              <TableCell>
                                {order.items.map(item => item.productServiceId?.title).join(', ')}
                              </TableCell>
                              <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
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
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}