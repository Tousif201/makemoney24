import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Banknote,
  ShoppingCart,
  RotateCcw,
} from "lucide-react";
import { getAllTransactions } from "../../../../api/transaction";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // You can make this configurable if needed
  const [totalTransactions, setTotalTransactions] = useState(0); // From API response
  const [totalPages, setTotalPages] = useState(1); // From API response
  const [isExporting, setIsExporting] = useState(false); // New state for export loading

  // State for filters and sorting
  const [filters, setFilters] = useState({
    searchTerm: "", // For general search across relevant fields
    transactionType: "all",
    status: "all",
    userId: "", // Added for explicit user search if desired
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [sortBy, setSortBy] = useState("createdAt"); // Default sort by createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort order

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiParams = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy,
          sortOrder,
          // Conditionally add filters to API params
          // Note: If your backend's `getAllTransactions` doesn't support a 'search' parameter
          // for global search across fields, you might need to implement this client-side
          // or add backend support. For now, assuming `searchTerm` directly maps to `search`
          // if your API controller implements it, otherwise it will be ignored by API.
          ...(filters.searchTerm && { search: filters.searchTerm }),
          ...(filters.transactionType !== "all" && {
            transactionType: filters.transactionType,
          }),
          ...(filters.status !== "all" && { status: filters.status }),
          ...(filters.userId && { userId: filters.userId }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(filters.minAmount && { minAmount: filters.minAmount }),
          ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
        };

        const response = await getAllTransactions(apiParams);
        setTransactions(response.data);
        setTotalTransactions(response.total);
        setTotalPages(response.pages);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, itemsPerPage, filters, sortBy, sortOrder]); // Dependencies for re-fetching

  const getTypeIcon = (type) => {
    switch (type) {
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "payout":
        return <Banknote className="h-4 w-4 text-blue-500" />;
      case "cashback":
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-orange-500" />;
      case "return":
        return <RotateCcw className="h-4 w-4 text-gray-500" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      withdrawal: "bg-red-100 text-red-800",
      deposit: "bg-green-100 text-green-800",
      payout: "bg-blue-100 text-blue-800",
      cashback: "bg-purple-100 text-purple-800",
      purchase: "bg-orange-100 text-orange-800",
      return: "bg-gray-100 text-gray-800",
    };
    const colorClass = colors[type] || "bg-gray-100 text-gray-800";
    return (
      <Badge className={colorClass}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Helper for summary cards (based on currently loaded data)
  const completedTransactionsCount = transactions.filter(
    (t) => t.status === "success"
  ).length;
  const totalAmountCompleted = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

  // =====================================================================================
  // NEW: Export to CSV Functionality
  // =====================================================================================
  const exportToCsv = async () => {
    setIsExporting(true);
    try {
      // Fetch ALL transactions matching current filters (disable pagination for export)
      const exportParams = {
        page: 1, // Start from page 1
        limit: totalTransactions, // Request all items found by totalTransactions count
        sortBy,
        sortOrder,
        ...(filters.searchTerm && { search: filters.searchTerm }),
        ...(filters.transactionType !== "all" && {
          transactionType: filters.transactionType,
        }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      };

      const response = await getAllTransactions(exportParams);
      const dataToExport = response.data;

      if (!dataToExport || dataToExport.length === 0) {
        alert("No data to export based on current filters.");
        setIsExporting(false);
        return;
      }

      // Define CSV headers
      const headers = [
        "Transaction ID",
        "User Name",
        "User Email",
        "Type",
        "Amount",
        "Status",
        "Date",
        "Time",
        "Description",
        "Reference ID (Order/Booking)",
      ];

      // Map data to CSV rows
      const csvRows = dataToExport.map((txn) => {
        const transactionDate = new Date(txn.createdAt);
        return [
          `"${txn.txnId}"`, // Wrap in quotes to handle potential commas in ID
          `"${txn.userId ? txn.userId.name : "N/A"}"`,
          `"${txn.userId ? txn.userId.email : "N/A"}"`,
          `"${
            txn.transactionType.charAt(0).toUpperCase() +
            txn.transactionType.slice(1)
          }"`,
          `${txn.amount.toFixed(2)}`,
          `"${txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}"`,
          `"${transactionDate.toLocaleDateString()}"`,
          `"${transactionDate.toLocaleTimeString()}"`,
          `"${txn.description ? txn.description.replace(/"/g, '""') : "N/A"}"`, // Handle quotes in description
          `"${txn.orderId || txn.bookingId || "N/A"}"`,
        ].join(","); // Join fields with comma
      });

      // Combine headers and rows
      const csvContent = [headers.join(","), ...csvRows].join("\n");

      // Create a Blob and download it
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.click();

      URL.revokeObjectURL(url); // Clean up the URL object
    } catch (err) {
      console.error("Error exporting transactions:", err);
      alert("Failed to export transactions. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  // =====================================================================================

  return (
    <div>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
            <p className="text-muted-foreground">
              Monitor all financial transactions across the platform
            </p>
          </div>
          <Button
            onClick={exportToCsv}
            disabled={isExporting || loading}
            variant="outline"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions (All)
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Total matching filters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transaction Volume (Loaded)
              </CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalAmountCompleted.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed transactions (on current page)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate (Loaded)
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTransactions > 0
                  ? (
                      (completedTransactionsCount / transactions.length) * // Use transactions.length for current page
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Transaction success rate (on current page)
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Complete transaction history with detailed information and status
              tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center flex-col w-full md:flex-row gap-4 mb-6">
              <div className="relative flex-1 w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.transactionType}
                onValueChange={(value) =>
                  setFilters({ ...filters, transactionType: value })
                }
              >
                <SelectTrigger className="w-full md:max-w-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Sorting Controls */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="transactionType">Type</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-medium">
                          {transaction.txnId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transaction.userId
                                ? transaction.userId.name
                                : "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.userId
                                ? transaction.userId.email
                                : "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.transactionType)}
                            {getTypeBadge(transaction.transactionType)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.description || "N/A"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.orderId ||
                            transaction.bookingId ||
                            "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {transactions.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to {Math.min(currentPage * itemsPerPage, totalTransactions)} of{" "}
                {totalTransactions} transactions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {/* Render page buttons dynamically */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
