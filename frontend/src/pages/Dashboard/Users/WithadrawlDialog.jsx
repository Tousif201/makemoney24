import React, { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Download, Banknote, CreditCard, AlertCircle } from "lucide-react";
import { sendCashfreePayout } from "../../../../api/cashfree";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Global-like constants for fee and minimum withdrawal ---
const PROCESSING_FEE_PERCENTAGE = 0.1; // 10%
const MINIMUM_WITHDRAWAL_AMOUNT = 100; // Minimum withdrawal amount in rupees
// ---

function WithadrawlDialog({ user, onWithdrawalSuccess }) {
  const [withdrawalMode, setWithdrawalMode] = useState("bank"); // Default to bank transfer
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate fee and net amount using useMemo for efficient re-renders
  const { processingFee, netWithdrawalAmount } = useMemo(() => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      return { processingFee: 0, netWithdrawalAmount: 0 };
    }
    const fee = amount * PROCESSING_FEE_PERCENTAGE;
    const netAmount = amount - fee;
    return { processingFee: fee, netWithdrawalAmount: netAmount };
  }, [withdrawalAmount]);

  const handleWithdrawal = async () => {
    setIsLoading(true);
    try {
      const uniqueIdWithoutHyphens = uuidv4().replace(/-/g, "");
      const transferId = `payout_${uniqueIdWithoutHyphens}`; // Will be 39 characters

      const payload = {
        beneficiary_id: user._id,
        beneficiary_name: user.name,
        beneficiary_email: user.email,
        beneficiary_phone: user.phone,
        beneficiary_country_code: "+91",
        beneficiary_address: "N/A", // Placeholder - consider actual input
        beneficiary_city: "N/A", // Placeholder - consider actual input
        beneficiary_state: "N/A", // Placeholder - consider actual input
        beneficiary_postal_code: "000000", // Placeholder - consider actual input
        transfer_amount: parseFloat(withdrawalAmount),
        transfer_id: transferId,
        processing_fee_rate: PROCESSING_FEE_PERCENTAGE * 100, // Send as percentage (e.g., 10 for 10%)
        // Always include both bank and UPI details in the payload as requested
        bank_account_number: bankAccountNumber,
        bank_ifsc: ifscCode,
        vpa: upiId,
        // Add transfer_mode based on selected withdrawal method
        transfer_mode: withdrawalMode === "bank" ? "banktransfer" : "upi",
      };

      console.log("Sending Payout Payload:", payload);

      const response = await sendCashfreePayout(payload);
      console.log("Cashfree Payout Response:", response);

      if (
        response.success ||
        (response.transfer &&
          (response.transfer.transfer_status === "PENDING" ||
            response.transfer.transfer_status === "SUCCESS"))
      ) {
        toast.success("Withdrawal request submitted successfully!");
        // Clear only the withdrawal amount, keep bank/UPI details if user might reuse them
        setWithdrawalAmount("");
        // Optionally clear bank/UPI details as well:
        // setUpiId("");
        // setBankAccountNumber("");
        // setIfscCode("");
        setIsDialogOpen(false);
        if (onWithdrawalSuccess) {
          onWithdrawalSuccess();
        }
      } else {
        toast.error(response.message || "Failed to submit withdrawal request.");
      }
    } catch (error) {
      console.error("Error during withdrawal:", error);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "An unexpected error occurred during withdrawal.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Validation Logic ---
  const isWithdrawalAmountValid =
    parseFloat(withdrawalAmount) >= MINIMUM_WITHDRAWAL_AMOUNT &&
    parseFloat(withdrawalAmount) <= user?.withdrawableWallet;

  // Now, both bank and UPI fields must be complete for the form to be considered ready
  const isFormComplete =
    bankAccountNumber.trim() !== "" &&
    ifscCode.trim() !== "" &&
    upiId.trim() !== "";

  const canConfirmWithdrawal =
    isWithdrawalAmountValid && isFormComplete && !isLoading;
  // ---

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={
            !user.isMember ||
            user?.withdrawableWallet < MINIMUM_WITHDRAWAL_AMOUNT
          }
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Withdraw Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Please enter your bank and UPI details, then select your preferred
            withdrawal method for this transaction.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-72">
          <div className="space-y-6 py-4">
            {/* Available Balance */}
            <div>
              <p className="text-sm text-gray-600">
                Available Balance:{" "}
                <span className="font-semibold text-lg text-green-700">
                  ₹{user?.withdrawableWallet.toLocaleString()}
                </span>
              </p>
            </div>

            {/* Amount to Withdraw Input */}
            <div>
              <Label htmlFor="withdrawalAmount">Amount to Withdraw</Label>
              <Input
                id="withdrawalAmount"
                type="number"
                placeholder={`Enter amount (Min: ₹${MINIMUM_WITHDRAWAL_AMOUNT})`}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="mt-1"
                min={MINIMUM_WITHDRAWAL_AMOUNT}
                max={user?.withdrawableWallet}
              />
              {/* Conditional error message for amount */}
              {withdrawalAmount &&
                parseFloat(withdrawalAmount) > 0 &&
                !isWithdrawalAmountValid && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Amount must be between ₹{MINIMUM_WITHDRAWAL_AMOUNT} and ₹
                    {user?.withdrawableWallet.toLocaleString()}.
                  </p>
                )}
              {/* Message if balance is less than minimum withdrawal */}
              {user?.withdrawableWallet < MINIMUM_WITHDRAWAL_AMOUNT && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Minimum withdrawal amount is ₹{MINIMUM_WITHDRAWAL_AMOUNT}.
                  Your current balance is insufficient.
                </p>
              )}
            </div>

            {/* Processing Fee and Net Amount Message */}
            {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    A{" "}
                    <span className="font-semibold">
                      {PROCESSING_FEE_PERCENTAGE * 100}% processing fee
                    </span>{" "}
                    will be charged on your withdrawal.
                  </p>
                  <p className="text-sm mt-1">
                    Requested amount:{" "}
                    <span className="font-semibold">
                      ₹{parseFloat(withdrawalAmount).toLocaleString()}
                    </span>
                    <br />
                    Processing fee:{" "}
                    <span className="font-semibold text-red-600">
                      ₹{processingFee.toLocaleString()}
                    </span>
                    <br />
                    <strong className="text-base text-purple-700">
                      You will receive: ₹{netWithdrawalAmount.toLocaleString()}
                    </strong>
                  </p>
                </div>
              </div>
            )}

            {/* Bank Account Details (Always Rendered) */}
            <div className="space-y-4 border p-4 rounded-md">
              <h4 className="font-semibold text-gray-800">
                Bank Account Details
              </h4>
              <div>
                <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  type="text"
                  placeholder="Enter your bank account number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  type="text"
                  placeholder="Enter your IFSC code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* UPI Details (Always Rendered) */}
            <div className="space-y-4 border p-4 rounded-md">
              <h4 className="font-semibold text-gray-800">UPI Details</h4>
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  type="text"
                  placeholder="Enter your UPI ID (e.g., yourname@bank)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Withdrawal Mode Selection - Now for choice, not conditional rendering */}
            <div className="flex items-center space-x-4">
              <Label htmlFor="mode-selection" className="text-base font-medium">
                Choose Withdrawal Method:
              </Label>
              <div className="flex bg-gray-100 rounded-md p-1 flex-grow">
                <Button
                  variant={withdrawalMode === "bank" ? "default" : "ghost"}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 ${
                    withdrawalMode === "bank"
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setWithdrawalMode("bank")}
                >
                  <Banknote className="h-5 w-5" />
                  <span>Bank Transfer</span>
                </Button>
                <Button
                  variant={withdrawalMode === "upi" ? "default" : "ghost"}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 ${
                    withdrawalMode === "upi"
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setWithdrawalMode("upi")}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>UPI</span>
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 py-2 text-lg"
              onClick={handleWithdrawal}
              disabled={!canConfirmWithdrawal}
            >
              {isLoading ? "Processing..." : "Confirm Withdrawal"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default WithadrawlDialog;
