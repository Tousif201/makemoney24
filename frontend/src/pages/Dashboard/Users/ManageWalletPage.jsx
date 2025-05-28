import { CreditCard, Download, Eye, EyeOff, Wallet } from "lucide-react";
import { useState } from "react";

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

export default function ManageWalletPage() {
  const [showWithdrawalBalance, setShowWithdrawalBalance] = useState(false);
  const [showDiscountBalance, setShowDiscountBalance] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const withdrawalBalance = 8450;
  const discountBalance = 2300;
  const walletAddress = "0x1234567890abcdef1234567890abcdef12345678";

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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Download className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw to your bank account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className ="mt-3"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Available: ₹{withdrawalBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="bank">Bank Account</Label>
                    <Input id="bank" value="HDFC Bank - ****1234" disabled />
                  </div>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600">
                    Confirm Withdrawal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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

      {/* Wallet Address */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Wallet Address</CardTitle>
          <CardDescription className="text-gray-600">
            Your unique wallet identifier for transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <code className="text-sm font-mono text-gray-900 break-all">
                {walletAddress}
              </code>
            </div>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => navigator.clipboard.writeText(walletAddress)}
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          <CardDescription className="text-gray-600">
            Common wallet operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-20 flex-col border-purple-200 text-gray-700 hover:bg-purple-50"
            >
              <Wallet className="h-6 w-6 mb-2" />
              Add Funds
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col border-purple-200 text-gray-700 hover:bg-purple-50"
            >
              <Download className="h-6 w-6 mb-2" />
              Withdraw All
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col border-purple-200 text-gray-700 hover:bg-purple-50"
            >
              <CreditCard className="h-6 w-6 mb-2" />
              Transfer Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Summary */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: "Withdrawal", amount: "-₹2,000", date: "Yesterday" },
              { type: "Commission", amount: "+₹360", date: "2 days ago" },
              { type: "Reward", amount: "+₹500", date: "5 days ago" },
            ].map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.type}
                  </p>
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </div>
                <span
                  className={`font-medium ${
                    transaction.amount.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
