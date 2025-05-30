"use client";

import { ArrowDownLeft, ArrowUpRight, Calendar, Filter } from "lucide-react";
import { useState, useEffect } from "react"; // Import useEffect
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
// Make sure this path is correct based on your project structure
import { useSession } from "../../../context/SessionContext"; // Correct path for your session context
import { getUserWalletHistoryApi } from "../../../../api/wallet";

export default function WalletHistoryPage() {
  const [filter, setFilter] = useState("all");
  const { session, loading: sessionLoading } = useSession(); // Destructure session and sessionLoading
  const [walletData, setWalletData] = useState(null); // State to store fetched data
  const [dataLoading, setDataLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state

  // Use useEffect to fetch data when the component mounts or session.id becomes available
  useEffect(() => {
    const fetchWalletData = async () => {
      // Only fetch if session is loaded and userId is available
      if (!sessionLoading && session?.id) {
        try {
          setDataLoading(true); // Start loading for data fetch
          setError(null); // Clear previous errors
          const data = await getUserWalletHistoryApi(session.id);
          // Assuming the API returns { success: true, data: { ... } }
          setWalletData(data.data);
        } catch (err) {
          console.error("Failed to fetch wallet history:", err);
          setError("Failed to load wallet history. Please try again.");
        } finally {
          setDataLoading(false); // End loading
        }
      } else if (!sessionLoading && !session?.id) {
        // If session is loaded but no userId (e.g., not logged in)
        setDataLoading(false);
        setError("Please log in to view your wallet history.");
      }
    };

    fetchWalletData();
  }, [sessionLoading, session?.id]); // Dependencies: re-run when session loading status or userId changes

  // Derive filtered transactions and totals from fetched data
  // Use optional chaining and default to empty array/0 for safety
  const transactions = walletData?.transactions || [];
  const currentBalance = walletData?.currentBalance || 0;
  const totalCredit = walletData?.totalCredits || 0;
  const totalDebit = walletData?.totalDebits || 0;

  const filteredTransactions = transactions.filter((transaction) => {
    // Map backend transactionType to frontend 'Credit'/'Debit' for filtering
    const isCredit = ["deposit", "cashback", "return"].includes(
      transaction.transactionType
    );
    const isDebit = ["withdrawal", "payout", "purchase"].includes(
      transaction.transactionType
    );

    if (filter === "all") return true;
    if (filter === "credit") return isCredit;
    if (filter === "debit") return isDebit;
    return true;
  });

  // Helper function to format date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: "N/A", time: "N/A" };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // --- Loading and Error States ---
  if (sessionLoading || dataLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-xl text-gray-700">
        Loading wallet history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-xl text-red-600">
        {error}
      </div>
    );
  }

  // Handle case where no wallet data is returned after loading
  if (!walletData || !walletData.transactions) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-xl text-gray-700">
        No wallet data available for this user.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet History</h1>
          <p className="text-gray-600">
            Complete transaction history of your wallet
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Credits
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalCredit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Money received</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Debits
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalDebit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Money spent/withdrawn</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Current Balance
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{currentBalance.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Available balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">
                Transaction History
              </CardTitle>
              <CardDescription className="text-gray-600">
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
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found for the selected filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>{" "}
                  {/* This column is tricky to maintain client-side with server-side data */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const { date, time } = formatDateTime(transaction.createdAt);
                  // Determine if it's a credit based on backend transactionType
                  const isCredit = ["deposit", "cashback", "return"].includes(
                    transaction.transactionType
                  );

                  return (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium text-gray-900">
                        {transaction.txnId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isCredit ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-gray-700">
                            {/* Prioritize description if available, otherwise use transactionType */}
                            {transaction.description ||
                              transaction.transactionType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            isCredit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isCredit ? "₹" : "-₹"}
                          {transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div>
                          <div>{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === "success"
                              ? "text-green-700 border-green-200 bg-green-50"
                              : transaction.status === "pending"
                              ? "text-orange-700 border-orange-200 bg-orange-50"
                              : "text-red-700 border-red-200 bg-red-50"
                          }
                        >
                          {/* Capitalize first letter of status */}
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {/* As discussed, current balance per transaction isn't provided by the API.
                          You might consider removing this column or calculating it on the backend.
                        */}
                        N/A
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
