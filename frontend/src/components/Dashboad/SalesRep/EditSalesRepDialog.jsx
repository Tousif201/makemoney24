"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EditSalesRepDialog({ salesRep, open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState(salesRep || {});

  useEffect(() => {
    // Only update formData if salesRep changes and it's not null/undefined
    if (salesRep) {
      setFormData(salesRep);
    }
  }, [salesRep]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Pass the updated formData to the parent handler
  };

  // Only render dialog if salesRep is provided and dialog is open
  if (!salesRep || !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sales Representative</DialogTitle>
          <DialogDescription>Update the sales representative information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                required
                disabled // Email is usually not editable after creation
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pincode" className="text-right">
                Pincode
              </Label>
              <Input
                id="edit-pincode"
                value={formData.pincode || ""}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            {/* Password is typically changed via a separate "Change Password" flow, not here */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Password
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="col-span-3"
                placeholder="Leave blank to keep current password"
              />
            </div> */}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-accountStatus" className="text-right">
                Account Status
              </Label>
              <Select
                value={formData.accountStatus || ""}
                onValueChange={(value) => setFormData({ ...formData, accountStatus: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  {/* <SelectItem value="pending">Pending</SelectItem> Removed if not applicable in your enum */}
                </SelectContent>
              </Select>
            </div>
            {/* Referral Code and Roles are typically not directly editable here for a sales rep */}
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="referralCode" className="text-right">
                Referral Code
              </Label>
              <Input
                id="referralCode"
                value={formData.referralCode || ""}
                className="col-span-3"
                disabled // Referral code is auto-generated and shouldn't be editable
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Update Sales Rep</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}