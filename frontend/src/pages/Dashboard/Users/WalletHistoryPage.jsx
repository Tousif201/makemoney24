"use client";

import { ArrowDownLeft, ArrowUpRight, Calendar, Filter } from "lucide-react";
import { useState } from "react";
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

export default function WalletHistoryPage() {
  const [filter, setFilter] = useState("all");

  const transactions = [
    {
      id: "TXN001",
      type: "Credit",
      description: "Referral Commission - Level 1",
      amount: "₹360",
      date: "2024-03-25",
      time: "14:30",
      status: "Completed",
      balance: "₹8,450",
    },
    {
      id: "TXN002",
      type: "Debit",
      description: "Withdrawal to Bank Account",
      amount: "-₹2,000",
      date: "2024-03-24",
      time: "10:15",
      status: "Completed",
      balance: "₹8,090",
    },
    {
      id: "TXN003",
      type: "Credit",
      description: "Milestone Reward",
      amount: "₹500",
      date: "2024-03-20",
      time: "16:45",
      status: "Completed",
      balance: "₹10,090",
    },
    {
      id: "TXN004",
      type: "Credit",
      description: "Referral Commission - Level 2",
      amount: "₹120",
      date: "2024-03-18",
      time: "12:20",
      status: "Completed",
      balance: "₹9,590",
    },
    {
      id: "TXN005",
      type: "Debit",
      description: "Order Payment",
      amount: "-₹1,500",
      date: "2024-03-15",
      time: "09:30",
      status: "Completed",
      balance: "₹9,470",
    },
    {
      id: "TXN006",
      type: "Credit",
      description: "Referral Commission - Level 1",
      amount: "₹360",
      date: "2024-03-12",
      time: "11:45",
      status: "Completed",
      balance: "₹10,970",
    },
    {
      id: "TXN007",
      type: "Debit",
      description: "Withdrawal to Bank Account",
      amount: "-₹3,000",
      date: "2024-03-10",
      time: "15:20",
      status: "Processing",
      balance: "₹10,610",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    if (filter === "credit") return transaction.type === "Credit";
    if (filter === "debit") return transaction.type === "Debit";
    return true;
  });

  const totalCredit = transactions
    .filter((t) => t.type === "Credit")
    .reduce(
      (sum, t) =>
        sum + Number.parseInt(t.amount.replace("₹", "").replace(",", "")),
      0
    );

  const totalDebit = transactions
    .filter((t) => t.type === "Debit")
    .reduce(
      (sum, t) =>
        sum +
        Math.abs(Number.parseInt(t.amount.replace("-₹", "").replace(",", ""))),
      0
    );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Wallet History</h1>
          <p className="text-purple-600">
            Complete transaction history of your wallet
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Total Credits
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalCredit.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600">Money received</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Total Debits
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalDebit.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600">Money spent/withdrawn</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Current Balance
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">₹8,450</div>
            <p className="text-xs text-purple-600">Available balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-900">
                Transaction History
              </CardTitle>
              <CardDescription className="text-purple-600">
                All your wallet transactions in chronological order
              </CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="credit">Credits Only</SelectItem>
                <SelectItem value="debit">Debits Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium text-purple-900">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.type === "Credit" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-purple-700">
                        {transaction.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        transaction.type === "Credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount}
                    </span>
                  </TableCell>
                  <TableCell className="text-purple-700">
                    <div>
                      <div>{transaction.date}</div>
                      <div className="text-sm text-purple-500">
                        {transaction.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.status === "Completed"
                          ? "text-green-700 border-green-200 bg-green-50"
                          : "text-orange-700 border-orange-200 bg-orange-50"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-purple-900">
                    {transaction.balance}
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
