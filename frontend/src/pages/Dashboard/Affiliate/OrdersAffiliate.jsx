import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Download,
} from "lucide-react";

const orders = [
  {
    id: "#ORD-001",
    customer: "Alice Johnson",
    product: "Wireless Headphones",
    amount: "$99.99",
    status: "New",
    date: "2024-01-15",
  },
  {
    id: "#ORD-002",
    customer: "Bob Smith",
    product: "Smart Watch",
    amount: "$199.99",
    status: "In Progress",
    date: "2024-01-14",
  },
  {
    id: "#ORD-003",
    customer: "Carol Brown",
    product: "Yoga Mat",
    amount: "$29.99",
    status: "Complete",
    date: "2024-01-13",
  },
  {
    id: "#ORD-004",
    customer: "David Wilson",
    product: "Coffee Maker",
    amount: "$79.99",
    status: "New",
    date: "2024-01-12",
  },
  {
    id: "#ORD-005",
    customer: "Eva Davis",
    product: "Bluetooth Speaker",
    amount: "$49.99",
    status: "In Progress",
    date: "2024-01-11",
  },
];

function OrderTable({ orders }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case "Complete":
        return "default";
      case "In Progress":
        return "secondary";
      case "New":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.product}</TableCell>
            <TableCell>{order.amount}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>{order.date}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Status
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function OrdersAffiliate() {
  const filterOrdersByStatus = (status) => {
    if (status === "all") return orders;
    return orders.filter(
      (order) => order.status.toLowerCase() === status.toLowerCase()
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">
          Manage and track all your orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage orders by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="in progress">In Progress</TabsTrigger>
              <TabsTrigger value="complete">Complete</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <OrderTable orders={filterOrdersByStatus("all")} />
            </TabsContent>
            <TabsContent value="new" className="space-y-4">
              <OrderTable orders={filterOrdersByStatus("new")} />
            </TabsContent>
            <TabsContent value="in progress" className="space-y-4">
              <OrderTable orders={filterOrdersByStatus("in progress")} />
            </TabsContent>
            <TabsContent value="complete" className="space-y-4">
              <OrderTable orders={filterOrdersByStatus("complete")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
