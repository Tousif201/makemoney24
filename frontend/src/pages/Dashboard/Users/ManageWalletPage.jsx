"use client";

import { CreditCard, Download, Eye, EyeOff, Wallet } from "lucide-react";
import { useState, useEffect } from "react"; // Ensure useEffect is imported

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "../../../context/SessionContext";
import { getUserWalletTransactionsApi } from "../../../../api/wallet";
import WithadrawlDialog from "./WithadrawlDialog";
// Make sure this path is correct based on your project structure and controller name

export default function ManageWalletPage() {
  const [showWithdrawalBalance, setShowWithdrawalBalance] = useState(false);
  const [showDiscountBalance, setShowDiscountBalance] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { user, loading: sessionLoading, refreshSession } = useSession(); // Renamed loading to sessionLoading to avoid conflict
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  // Derive balances from user object, default to 0 if user is null/undefined
  const withdrawalBalance = user?.withdrawableWallet || 0;
  const discountBalance = user?.purchaseWallet || 0;

  // Fetch recent transactions when user session is loaded and user ID is available
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!sessionLoading && user?._id) {
        try {
          setTransactionsLoading(true);
          setTransactionsError(null);
          const response = await getUserWalletTransactionsApi(user._id);
          // Assuming API returns { success: true, data: { transactions: [...] } }
          setRecentTransactions(response.data.transactions);
        } catch (err) {
          console.error("Error fetching recent transactions:", err);
          setTransactionsError("Failed to load recent activity.");
        } finally {
          setTransactionsLoading(false);
        }
      } else if (!sessionLoading && !user?._id) {
        // Handle case where session is loaded but user is not logged in
        setTransactionsLoading(false);
        setTransactionsError("Please log in to view wallet details.");
      }
    };

    fetchTransactions();
  }, [sessionLoading, user?._id]); // Re-run effect when session loading or user ID changes

  // Helper to format date relative to now (e.g., "Yesterday", "2 days ago")
  const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-xl text-gray-700">
        Loading user session...
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Wallet</h1>
          <p className="text-gray-600">
            View balances and manage your wallet funds
          </p>
        </div>
      </div>

      {/* Wallet Balances */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <span>Withdrawal Balance</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWithdrawalBalance(!showWithdrawalBalance)}
              >
                {showWithdrawalBalance ? (
                  <EyeOff className="h-4 w-4 " />
                ) : (
                  <Eye className="h-4 w-4 text-purple-600" />
                )}
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Available for withdrawal to your bank account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-purple-900">
              {showWithdrawalBalance
                ? `₹${withdrawalBalance.toLocaleString()}`
                : "₹••••••"}
            </div>
            <WithadrawlDialog
              user={user}
              onWithdrawalSuccess={refreshSession}
            />
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <span>Discount Balance</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDiscountBalance(!showDiscountBalance)}
              >
                {showDiscountBalance ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4 text-purple-600" />
                )}
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Can be used for discounts on orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-gray-900">
              {showDiscountBalance
                ? `₹${discountBalance.toLocaleString()}`
                : "₹••••••"}
            </div>
            <Button
              variant="outline"
              className="w-full border-purple-200 text-gray-700 hover:bg-purple-50"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Use for Next Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Summary */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-center py-4 text-gray-500">
              Loading recent transactions...
            </div>
          ) : transactionsError ? (
            <div className="text-center py-4 text-red-600">
              {transactionsError}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((transaction) => (
                // Limiting to 5 for "Recent Activity" as per typical design
                <div
                  key={transaction._id} // Use unique _id from fetched data
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {/* Display transaction type (e.g., "credit", "debit") or description */}
                      {transaction.description ||
                        transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getRelativeDate(transaction.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`font-medium ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
