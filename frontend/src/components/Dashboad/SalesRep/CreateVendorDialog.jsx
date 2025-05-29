import { useState } from "react";
import { useSession } from "../../../context/SessionContext"; // Adjust according to your app
import { createVendor } from "../../../../api/Vendors"; // Your updated API call
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast"; // Optional: For notifications

export function CreateVendorDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    pincode: "",
    commissionRate: "",
    referredByCode: "",
  });

  const { session } = useSession(); // Assuming you have access to session
  const salesRepId = session?.id; // This should be the _id of logged-in user

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData, salesRepId };
      const result = await createVendor(payload);
      // console.log(result)
      toast.success("Vendor created successfully");

      // Optionally: clear and close
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        pincode: "",
        commissionRate: "",
        referredByCode: "",
      });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to create vendor");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-[550px] max-h-screen overflow-y-auto rounded-xl py-4 px-6 shadow-lg border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Vendor</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new vendor account to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 py-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="number"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="referredByCode">Referral Code</Label>
                <Input
                  id="referredByCode"
                  value={formData.referredByCode}
                  onChange={(e) => setFormData({ ...formData, referredByCode: e.target.value })}
                  placeholder="Referral Code"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="e.g., 10"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="w-full mt-4">
            <div className="flex w-full justify-between items-center">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-500">
                Create Vendor
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
