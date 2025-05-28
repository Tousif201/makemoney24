"use client";

import { Package, Truck, CheckCircle, Clock, Eye } from "lucide-react";
import { useState } from "react";

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

export default function UserOrders() {
  const [statusFilter, setStatusFilter] = useState("all");

  const orders = [
    {
      id: "ORD001",
      date: "2024-03-25",
      items: ["Wireless Headphones", "Phone Case"],
      total: "₹3,499",
      status: "Delivered",
      paymentMethod: "Wallet",
      trackingId: "TRK123456789",
      deliveryDate: "2024-03-27",
    },
    {
      id: "ORD002",
      date: "2024-03-20",
      items: ["Laptop Stand", "USB Cable"],
      total: "₹1,299",
      status: "Shipped",
      paymentMethod: "PayLater",
      trackingId: "TRK987654321",
      deliveryDate: "2024-03-28",
    },
    {
      id: "ORD003",
      date: "2024-03-15",
      items: ["Bluetooth Speaker"],
      total: "₹2,999",
      status: "Processing",
      paymentMethod: "UPI",
      trackingId: "-",
      deliveryDate: "2024-03-30",
    },
    {
      id: "ORD004",
      date: "2024-03-10",
      items: ["Smart Watch", "Charging Cable"],
      total: "₹8,999",
      status: "Delivered",
      paymentMethod: "Credit Card",
      trackingId: "TRK456789123",
      deliveryDate: "2024-03-12",
    },
    {
      id: "ORD005",
      date: "2024-03-05",
      items: ["Keyboard", "Mouse"],
      total: "₹2,499",
      status: "Cancelled",
      paymentMethod: "Wallet",
      trackingId: "-",
      deliveryDate: "-",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status.toLowerCase() === statusFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Shipped":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "Processing":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "Cancelled":
        return <Package className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-700 border-green-200 bg-green-50";
      case "Shipped":
        return "text-blue-700 border-blue-200 bg-blue-50";
      case "Processing":
        return "text-orange-700 border-orange-200 bg-orange-50";
      case "Cancelled":
        return "text-red-700 border-red-200 bg-red-50";
      default:
        return "text-gray-700 border-gray-200 bg-gray-50";
    }
  };

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const totalSpent = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce(
      (sum, order) =>
        sum + Number.parseInt(order.total.replace("₹", "").replace(",", "")),
      0
    );

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
              ₹{totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              Excluding cancelled orders
            </p>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-gray-900">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {order.date}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      <p className="text-gray-700 truncate">
                        {order.items.join(", ")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} item(s)
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {order.total}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {order.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(order.status)}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                          <DialogTitle>Order Details - {order.id}</DialogTitle>
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
                              {order.items.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Order Date:
                              </span>
                              <p className="font-medium text-gray-900">
                                {order.date}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Total Amount:
                              </span>
                              <p className="font-medium text-gray-900">
                                {order.total}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Payment Method:
                              </span>
                              <p className="font-medium text-gray-900">
                                {order.paymentMethod}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <Badge
                                variant="outline"
                                className={getStatusColor(order.status)}
                              >
                                {order.status}
                              </Badge>
                            </div>
                            {order.trackingId !== "-" && (
                              <div className="col-span-2">
                                <span className="text-gray-600">
                                  Tracking ID:
                                </span>
                                <p className="font-medium text-gray-900">
                                  {order.trackingId}
                                </p>
                              </div>
                            )}
                            {order.deliveryDate !== "-" && (
                              <div className="col-span-2">
                                <span className="text-gray-600">
                                  Delivery Date:
                                </span>
                                <p className="font-medium text-gray-900">
                                  {order.deliveryDate}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
