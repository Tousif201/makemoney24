"use client"

import { useState, useEffect, useMemo } from "react"
import {
  CheckCircle, Clock, FileText, Filter, Package, TrendingUp, TrendingDown,
  Shield, Check, X, Eye, Loader2, AlertCircle,
} from "lucide-react"

// Assuming you have a way to get the vendorId, e.g., from URL params
// import { useParams } from "next/navigation"; 

// NEW: Import API functions
import { getVendorAnalytics, processSettlement, updateProductStatus } from "../../../../api/vendordetailpage" 

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useParams } from "react-router-dom"

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount || 0);
};

export default function VendorDetailsPage({  }) { // Accept vendorId as a prop
  const params = useParams();
  console.log(params); // Or get it from URL like this in Next.js 13+ App Router
  const vendorId = params.vendorId;

  // NEW: State for API data, loading, and errors
  const [vendorData, setVendorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Existing state
  const [orderFilter, setOrderFilter] = useState("total");
  const [productFilter, setProductFilter] = useState("all"); // NEW state for product table filter
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");

  // NEW: Data fetching with useEffect
  useEffect(() => {
    if (!vendorId) {
      setError("Vendor ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getVendorAnalytics(vendorId, orderFilter, productFilter);
        setVendorData(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch vendor details.");
        setVendorData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [vendorId, orderFilter, productFilter]); // Refetch when filters change

  // NEW: Memoized chart data to prevent recalculation on every render
  const formattedChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sales = vendorData?.graphs?.salesByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      sales: item.totalSales,
    })) || [];
    const returns = vendorData?.graphs?.replacementsByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      returns: item.totalReplacements,
    })) || [];
    return { sales, returns };
  }, [vendorData]);
  
  // NEW: Handler to update product status
  const handleProductStatusUpdate = async (productId, status) => {
    toast.promise(updateProductStatus(productId, status), {
        loading: `Updating product status to ${status}...`,
        success: (data) => {
            // Refetch data to update the UI
            const refetchData = async () => {
                const data = await getVendorAnalytics(vendorId, orderFilter, productFilter);
                setVendorData(data);
            };
            refetchData();
            return `Product has been ${status}.`;
        },
        error: (err) => `Failed to update: ${err.message || 'Unknown error'}`,
    });
  };

  // UPDATED: Settlement handler to use API
  const handleSettlement = async () => {
    if (!settlementAmount || Number.parseFloat(settlementAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    toast.promise(processSettlement(vendorId, Number.parseFloat(settlementAmount)), {
      loading: "Processing settlement...",
      success: (data) => {
        setSettlementDialogOpen(false);
        setSettlementAmount("");
         // Refetch data to show updated settlement stats
        const refetchData = async () => {
            const data = await getVendorAnalytics(vendorId, orderFilter, productFilter);
            setVendorData(data);
        };
        refetchData();
        return `Settlement of ${formatCurrency(settlementAmount)} processed!`;
      },
      error: (err) => `Settlement failed: ${err.message || 'Unknown error'}`,
    });
  };
  
  // NEW: Loading and Error UI states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600">An Error Occurred</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{vendorData?.vendorDetails?.name || 'Vendor Details'}</h1>
          <div className="flex items-center gap-4">
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders ({vendorData?.analytics.ordersCount.filter.replace('_', ' ')})</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorData?.analytics.ordersCount.count.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Products</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorData?.analytics.approvedProductsCount.count.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorData?.pendingApprovalProducts.count || 0}</div>
               <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorData?.analytics.totalReplacedProducts || 0}</div>
              <p className="text-xs text-muted-foreground">All time returns</p>
            </CardContent>
          </Card>
        </div>

        {/* KYC Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              KYC Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vendorData?.kycDocuments.length > 0 ? (
                vendorData.kycDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.docType || "Document"}</p>
                      <p className="text-xs text-muted-foreground">Status: {doc.status}</p>
                    </div>
                    <Badge className={doc.status === "verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {doc.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-full">No KYC documents uploaded.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Returned Products (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ returns: { label: "Returns", color: "#ef4444" } }} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedChartData.returns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="returns" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Total Sales (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ sales: { label: "Sales", color: "#22c55e" } }} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedChartData.sales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value)}/>} />
                    <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Management Tabbed Section */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Vendor Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="orders">
              <div className="border-b px-6">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
              </div>

              {/* Orders Tab */}
              <TabsContent value="orders" className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorData?.filteredData?.orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderId}</TableCell>
                        <TableCell>{order.userId?.name || 'N/A'}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell><Badge>{order.orderStatus}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> View</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Product Listings</h3>
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Listed On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorData?.productsByStatus?.products.map((product) => (
                        <TableRow key={product._id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={product.images?.[0] || "/placeholder.svg"} />
                                        <AvatarFallback>{product.title?.[0] || 'P'}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{product.title}</div>
                                </div>
                            </TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>{formatDate(product.createdAt)}</TableCell>
                            <TableCell>
                                <Badge className={
                                    product.isAdminApproved === "approved" ? "bg-green-100 text-green-800"
                                    : product.isAdminApproved === "pending" ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }>{product.isAdminApproved}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {product.isAdminApproved === "pending" && (
                                    <>
                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleProductStatusUpdate(product._id, 'approved')}>
                                            <Check className="h-3 w-3 mr-1" />Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleProductStatusUpdate(product._id, 'rejected')}>
                                            <X className="h-3 w-3 mr-1" />Reject
                                        </Button>
                                    </>
                                    )}
                                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="p-6">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">Settlement Reports</h3>
                            <p className="text-sm text-muted-foreground">View and manage vendor settlements</p>
                        </div>
                        <Dialog open={settlementDialogOpen} onOpenChange={setSettlementDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Process Settlement</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /> Process Settlement</DialogTitle>
                                    <DialogDescription>Enter the amount to transfer to the vendor's account.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Label htmlFor="amount">Settlement Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                        <Input id="amount" type="number" placeholder="0.00" value={settlementAmount} onChange={(e) => setSettlementAmount(e.target.value)} className="pl-8" min="0" step="0.01"/>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Recommended amount (This Week): {formatCurrency(vendorData?.weeklySettlement.netPayableAmount)}
                                    </p>
                                </div>
                                <DialogFooter className="flex gap-2">
                                    <Button variant="outline" onClick={() => setSettlementDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSettlement} className="bg-green-600 hover:bg-green-700 text-white" disabled={!settlementAmount}>Submit Settlement</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">This Week's Net Settlement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(vendorData?.weeklySettlement.netPayableAmount)}</div>
                        <p className="text-xs text-muted-foreground">Based on last 7 days sales</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Last Settlement Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(vendorData?.analytics.lastSettlement.amount)}</div>
                        <p className="text-xs text-muted-foreground">Paid on {formatDate(vendorData?.analytics.lastSettlement.date)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Settlements (All Time)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(vendorData?.analytics.totalSettledAmount)}</div>
                        <p className="text-xs text-muted-foreground">Total amount paid to vendor</p>
                      </CardContent>
                    </Card>
                  </div>
                  {/* NOTE: The detailed daily settlement breakdown table from the original UI was removed, 
                      as the provided backend controller does not supply this specific data. 
                      You would need a separate endpoint to fetch a paginated history of settlements. */}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}