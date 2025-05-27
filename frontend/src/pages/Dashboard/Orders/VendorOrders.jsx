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

const ordersData = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    product: "Wireless Headphones",
    amount: "$99.99",
    status: "New",
    date: "2024-01-15",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    product: "Smart Watch",
    amount: "$199.99",
    status: "In Progress",
    date: "2024-01-14",
  },
  {
    id: "#ORD-003",
    customer: "Mike Johnson",
    product: "Laptop Stand",
    amount: "$49.99",
    status: "Delivered",
    date: "2024-01-13",
  },
];

export default function VendorOrders() {
  return (
    <div className="space-y-6 my-8 mx-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Track and manage your customer orders
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4 ">
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

        <TabsContent value="all" className="space-y-4">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Complete list of your orders</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile View */}
              <div className="block sm:hidden">
                <div className="space-y-4 p-4">
                  {ordersData.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900">
                            {order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.customer}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.product}
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
                            {order.amount}
                          </span>
                        </div>
                        <Badge
                          variant={
                            order.status === "New"
                              ? "default"
                              : order.status === "In Progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">{order.date}</div>
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
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "New"
                                ? "default"
                                : order.status === "In Progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
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
              <p className="text-gray-500 text-center py-8">
                New orders will appear here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>In Progress Orders</CardTitle>
              <CardDescription>
                Orders currently being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                In progress orders will appear here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>Successfully delivered orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Completed orders will appear here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
