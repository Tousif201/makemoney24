import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { topUpProfileScore } from "../../../api/user"; // Your API call
import { toast } from "sonner";
export function TopUpUserProfileScore({
  triggerClass,
  variant,
  icon,
  triggerText,
  userId,
  userName,
  email,
  onTopUpSuccess, // Optional callback for parent component
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and ensure it's a positive value
    if (/^\d*$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const addShortcutAmount = (valueToAdd) => {
    setAmount((prevAmount) => {
      const current = parseInt(prevAmount || "0");
      return String(current + valueToAdd);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      // Use toast.error for invalid input
      toast.error("Please enter a positive number for the score.");
      return;
    }

    setLoading(true);
    try {
      const response = await topUpProfileScore(userId, parsedAmount);
      if (response.success) {
        // Use toast.success for successful API call
        toast.success(response.message);
        setAmount(""); // Clear input on success
        if (onTopUpSuccess) {
          onTopUpSuccess(response.user.profileScore);
        }
      } else {
        // Use toast.error for API call success: false
        toast.error(response.message || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error topping up profile score:", error);
      // Use toast.error for API call failure
      toast.error(
        error.response?.data?.message || "Failed to top up profile score."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={`${triggerClass}`} variant={variant}>
          {icon}
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up User Profile Score</DialogTitle>
          <DialogDescription>
            Add points to {userName}'s profile score.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* User Info - Read-only */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userName" className="text-right">
                User Name
              </Label>
              <Input
                id="userName"
                name="userName"
                defaultValue={userName}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                defaultValue={email}
                readOnly
                className="col-span-3"
              />
            </div>

            {/* Shortcut Buttons */}
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label htmlFor="amount" className="text-right">
                Add Points
              </Label>
              <div className="col-span-3 flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addShortcutAmount(10)}
                >
                  +10
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addShortcutAmount(20)}
                >
                  +20
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addShortcutAmount(30)}
                >
                  +30
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addShortcutAmount(50)}
                >
                  +50
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addShortcutAmount(100)}
                >
                  +100
                </Button>
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Custom Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number" // Use type="number" for numeric input
                value={amount}
                onChange={handleAmountChange}
                placeholder="e.g., 25, 75"
                className="col-span-3"
                min="1" // Minimum value allowed
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding Points..." : "Add Points"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
