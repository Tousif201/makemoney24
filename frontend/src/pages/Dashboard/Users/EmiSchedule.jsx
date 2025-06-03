"use client";

import { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Search,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

// Mock data based on the models
const userData = {
  _id: "user123",
  name: "Priyanshu Sahu",
  email: "priyanshu@example.com",
  phone: "+91 98765 43210",
  purchaseWallet: 5000,
  withdrawableWallet: 2500,
  profileScore: 85,
  isMember: true,
};

const mockEmiData = [
  {
    _id: "emi001",
    userId: "user123",
    orderId: "order001",
    totalAmount: 50000,
    downPayment: 10000,
    processingFee: 500,
    billingCycleInDays: 30,
    totalInstallments: 12,
    installmentAmount: 3500,
    paidInstallments: 4,
    nextDueDate: "2024-02-15",
    status: "ongoing",
    penalty: 0,
    createdAt: "2023-10-15",
    paymentHistory: [
      {
        _id: "pay001",
        transactionId: "txn001",
        date: "2023-11-15",
        amount: 3500,
        status: "paid",
        remarks: "On-time payment",
      },
      {
        _id: "pay002",
        transactionId: "txn002",
        date: "2023-12-15",
        amount: 3500,
        status: "paid",
        remarks: "On-time payment",
      },
      {
        _id: "pay003",
        transactionId: "txn003",
        date: "2024-01-15",
        amount: 3500,
        status: "paid",
        remarks: "On-time payment",
      },
      {
        _id: "pay004",
        transactionId: "txn004",
        date: "2024-01-20",
        amount: 3500,
        status: "paid",
        remarks: "Late payment - 5 days",
      },
    ],
    orderDetails: {
      items: [{ productName: "Premium Laptop", quantity: 1, price: 50000 }],
      vendorName: "TechStore",
    },
  },
  {
    _id: "emi002",
    userId: "user123",
    orderId: "order002",
    totalAmount: 25000,
    downPayment: 5000,
    processingFee: 250,
    billingCycleInDays: 15,
    totalInstallments: 8,
    installmentAmount: 2500,
    paidInstallments: 8,
    nextDueDate: null,
    status: "completed",
    penalty: 0,
    createdAt: "2023-08-01",
    paymentHistory: [
      {
        _id: "pay005",
        transactionId: "txn005",
        date: "2023-08-15",
        amount: 2500,
        status: "paid",
        remarks: "On-time payment",
      },
      {
        _id: "pay006",
        transactionId: "txn006",
        date: "2023-09-01",
        amount: 2500,
        status: "paid",
        remarks: "On-time payment",
      },
      // ... more payment history
    ],
    orderDetails: {
      items: [{ productName: "Smartphone", quantity: 1, price: 25000 }],
      vendorName: "MobileHub",
    },
  },
  {
    _id: "emi003",
    userId: "user123",
    orderId: "order003",
    totalAmount: 75000,
    downPayment: 15000,
    processingFee: 750,
    billingCycleInDays: 30,
    totalInstallments: 18,
    installmentAmount: 3500,
    paidInstallments: 2,
    nextDueDate: "2024-01-10",
    status: "ongoing",
    penalty: 500,
    createdAt: "2023-11-01",
    paymentHistory: [
      {
        _id: "pay007",
        transactionId: "txn007",
        date: "2023-12-01",
        amount: 3500,
        status: "paid",
        remarks: "On-time payment",
      },
      {
        _id: "pay008",
        transactionId: "txn008",
        date: "2024-01-01",
        amount: 3500,
        status: "paid",
        remarks: "On-time payment",
      },
    ],
    orderDetails: {
      items: [{ productName: "Home Appliance Set", quantity: 1, price: 75000 }],
      vendorName: "HomeStore",
    },
  },
];

function EmiSchedule() {
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { variant: "default", icon: Clock, color: "text-blue-600" },
      completed: {
        variant: "outline",
        icon: CheckCircle,
        color: "text-green-600",
      },
      defaulted: {
        variant: "destructive",
        icon: XCircle,
        color: "text-red-600",
      },
    };

    const config = statusConfig[status] || statusConfig.ongoing;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: "outline", icon: CheckCircle, color: "text-green-600" },
      failed: { variant: "destructive", icon: XCircle, color: "text-red-600" },
      pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isOverdue = (nextDueDate) => {
    if (!nextDueDate) return false;
    return new Date(nextDueDate) < new Date();
  };

  const getDaysUntilDue = (nextDueDate) => {
    if (!nextDueDate) return null;
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePayment = () => {
    // Mock payment processing
    console.log("Processing payment:", {
      emiId: selectedEmi._id,
      amount: paymentAmount,
      remarks: paymentRemarks,
    });

    // Reset form and close dialog
    setPaymentAmount("");
    setPaymentRemarks("");
    setPaymentDialog(false);
    setSelectedEmi(null);

    // In real app, you would make API call here
    alert("Payment processed successfully!");
  };

  const filteredEmis = mockEmiData.filter((emi) => {
    const matchesSearch =
      emi.orderDetails.items[0].productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      emi.orderDetails.vendorName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || emi.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActiveEmis = mockEmiData.filter(
    (emi) => emi.status === "ongoing"
  ).length;
  const totalOverdueEmis = mockEmiData.filter(
    (emi) => emi.status === "ongoing" && isOverdue(emi.nextDueDate)
  ).length;
  const totalOutstanding = mockEmiData
    .filter((emi) => emi.status === "ongoing")
    .reduce(
      (sum, emi) =>
        sum +
        (emi.totalInstallments - emi.paidInstallments) * emi.installmentAmount,
      0
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              EMI Schedule
            </h1>
            <p className="text-gray-600">
              Manage your EMI payments and view payment history
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600">Active EMIs</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {totalActiveEmis}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600">Overdue</span>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {totalOverdueEmis}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-600">Outstanding</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                ₹{totalOutstanding.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">Wallet Balance</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                ₹{userData.purchaseWallet.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Your EMI Schedule
                </CardTitle>
                <CardDescription>
                  Track and manage all your EMI payments
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by product or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* EMI Cards */}
            <div className="space-y-4">
              {filteredEmis.map((emi) => {
                const progress =
                  (emi.paidInstallments / emi.totalInstallments) * 100;
                const daysUntilDue = getDaysUntilDue(emi.nextDueDate);
                const overdue = isOverdue(emi.nextDueDate);

                return (
                  <Card
                    key={emi._id}
                    className={`border-l-4 ${
                      overdue
                        ? "border-l-red-500"
                        : emi.status === "completed"
                        ? "border-l-green-500"
                        : "border-l-blue-500"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* EMI Details */}
                        <div className="lg:col-span-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {emi.orderDetails.items[0].productName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Vendor: {emi.orderDetails.vendorName} • EMI ID:{" "}
                                {emi._id}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(emi.status)}
                              {overdue && (
                                <Badge
                                  variant="destructive"
                                  className="flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">
                                Total Amount
                              </p>
                              <p className="font-semibold">
                                ₹{emi.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Monthly EMI
                              </p>
                              <p className="font-semibold">
                                ₹{emi.installmentAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Paid/Total
                              </p>
                              <p className="font-semibold">
                                {emi.paidInstallments}/{emi.totalInstallments}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Next Due</p>
                              <p
                                className={`font-semibold ${
                                  overdue ? "text-red-600" : ""
                                }`}
                              >
                                {emi.nextDueDate
                                  ? new Date(
                                      emi.nextDueDate
                                    ).toLocaleDateString()
                                  : "Completed"}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">
                                Progress
                              </span>
                              <span className="text-sm font-medium">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {emi.penalty > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">
                                  Penalty: ₹{emi.penalty.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                          {emi.status === "ongoing" && (
                            <Dialog
                              open={
                                paymentDialog && selectedEmi?._id === emi._id
                              }
                              onOpenChange={setPaymentDialog}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedEmi(emi);
                                    setPaymentAmount(
                                      emi.installmentAmount.toString()
                                    );
                                  }}
                                >
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Make Payment
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Make EMI Payment</DialogTitle>
                                  <DialogDescription>
                                    Pay your EMI installment for{" "}
                                    {emi.orderDetails.items[0].productName}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600">
                                          EMI Amount
                                        </p>
                                        <p className="font-semibold">
                                          ₹
                                          {emi.installmentAmount.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">
                                          Due Date
                                        </p>
                                        <p className="font-semibold">
                                          {new Date(
                                            emi.nextDueDate
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      {emi.penalty > 0 && (
                                        <>
                                          <div>
                                            <p className="text-gray-600">
                                              Penalty
                                            </p>
                                            <p className="font-semibold text-red-600">
                                              ₹{emi.penalty.toLocaleString()}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              Total Due
                                            </p>
                                            <p className="font-semibold">
                                              ₹
                                              {(
                                                emi.installmentAmount +
                                                emi.penalty
                                              ).toLocaleString()}
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="amount">
                                      Payment Amount
                                    </Label>
                                    <Input
                                      id="amount"
                                      type="number"
                                      value={paymentAmount}
                                      onChange={(e) =>
                                        setPaymentAmount(e.target.value)
                                      }
                                      placeholder="Enter amount"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="remarks">
                                      Remarks (Optional)
                                    </Label>
                                    <Textarea
                                      id="remarks"
                                      value={paymentRemarks}
                                      onChange={(e) =>
                                        setPaymentRemarks(e.target.value)
                                      }
                                      placeholder="Add any remarks..."
                                      rows={3}
                                    />
                                  </div>

                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                      <strong>Available Balance:</strong> ₹
                                      {userData.purchaseWallet.toLocaleString()}
                                    </p>
                                  </div>

                                  <div className="flex gap-3">
                                    <Button
                                      variant="outline"
                                      onClick={() => setPaymentDialog(false)}
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handlePayment}
                                      className="flex-1"
                                    >
                                      Pay Now
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                View History
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Payment History</DialogTitle>
                                <DialogDescription>
                                  Payment history for{" "}
                                  {emi.orderDetails.items[0].productName}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="max-h-96 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Remarks</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {emi.paymentHistory.map((payment) => (
                                      <TableRow key={payment._id}>
                                        <TableCell>
                                          {new Date(
                                            payment.date
                                          ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                          ₹{payment.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                          {getPaymentStatusBadge(
                                            payment.status
                                          )}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                          {payment.remarks}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredEmis.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No EMIs found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmiSchedule;
