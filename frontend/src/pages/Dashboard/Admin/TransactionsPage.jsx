import { useState } from "react";
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

const transactionsData = [
  {
    id: "TXN001",
    userId: "U001",
    userName: "John Smith",
    type: "purchase",
    amount: "$245.50",
    status: "Completed",
    date: "2024-03-15",
    time: "14:30",
    description: "Product purchase - TechMart Solutions",
    reference: "ORD-2024-001",
  },
  {
    id: "TXN002",
    userId: "U002",
    userName: "Sarah Johnson",
    type: "withdrawal",
    amount: "$150.00",
    status: "Pending",
    date: "2024-03-15",
    time: "13:45",
    description: "Withdrawal to bank account",
    reference: "WTH-2024-002",
  },
  {
    id: "TXN003",
    userId: "U003",
    userName: "Mike Davis",
    type: "cashback",
    amount: "$12.25",
    status: "Completed",
    date: "2024-03-14",
    time: "16:20",
    description: "Cashback reward - Bronze milestone",
    reference: "CBK-2024-003",
  },
  {
    id: "TXN004",
    userId: "U004",
    userName: "Lisa Wilson",
    type: "deposit",
    amount: "$500.00",
    status: "Completed",
    date: "2024-03-14",
    time: "11:15",
    description: "Wallet deposit via credit card",
    reference: "DEP-2024-004",
  },
  {
    id: "TXN005",
    userId: "U005",
    userName: "Emma Brown",
    type: "payout",
    amount: "$75.00",
    status: "Failed",
    date: "2024-03-13",
    time: "09:30",
    description: "Referral commission payout",
    reference: "PAY-2024-005",
  },
  {
    id: "TXN006",
    userId: "U001",
    userName: "John Smith",
    type: "return",
    amount: "$89.99",
    status: "Processing",
    date: "2024-03-13",
    time: "15:45",
    description: "Product return refund",
    reference: "RET-2024-006",
  },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = transactionsData.filter((transaction) => {
    const matchesSearch =
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      transaction.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
    return (
      <Badge className={colors[colors]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalTransactions = filteredTransactions.length;
  const completedTransactions = filteredTransactions.filter(
    (t) => t.status === "Completed"
  ).length;
  const totalAmount = filteredTransactions
    .filter((t) => t.status === "Completed")
    .reduce(
      (sum, t) =>
        sum + Number.parseFloat(t.amount.replace("$", "").replace(",", "")),
      0
    );

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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                {completedTransactions} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transaction Volume
              </CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed transactions only
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((completedTransactions / totalTransactions) * 100).toFixed(1)}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Transaction success rate
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
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.userName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.userId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          {getTypeBadge(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.amount}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{transaction.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredTransactions.length
                )}{" "}
                of {filteredTransactions.length} transactions
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
