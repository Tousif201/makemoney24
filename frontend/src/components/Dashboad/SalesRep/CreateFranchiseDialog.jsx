import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateFranchise } from "../../../../api/Franchise";
import { useSession } from "../../../context/SessionContext";
import { toast } from "react-hot-toast";
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
// import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateFranchiseDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
   
  });

  const { session } = useSession();
  const salesRepId = session?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, salesRepId };
      const result = await CreateFranchise(payload);
      toast.success("Franchise created successfully");

      // Reset form fields
      setFormData({
        franchiseName: "",
        location: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        ownerPassword: "",
        ownerPincode: "",
        referredByCode: ""
      });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to create franchise");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[80vw] md:max-w-[550px] max-h-screen overflow-y-auto rounded-xl py-4 px-6 shadow-lg border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Franchise</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new franchise account to your portfolio. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="franchise-name">Franchise Name</Label>
                <Input
                  id="franchiseName"
                  value={formData.franchiseName}
                  onChange={(e) => setFormData({ ...formData, franchiseName: e.target.value })}
                  placeholder="Enter franchise name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner">Owner Name</Label>
                <Input
                  id="owner"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Enter owner's full name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="franchise-email">Email</Label>
                <Input
                  id="franchise-email"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="owner@franchise.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownerPhone">Phone</Label>
                <Input
                  id="franchise-phone"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="+1 234-567-8900"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="franchise-location">Location</Label>
              <Input
                id="franchise-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2 w-full">
                <Label htmlFor="franchise-status">Status</Label>
                {/* <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownerPincode">OwnerPincode</Label>
                <Input
                  id="investment"
                  value={formData.ownerPincode}
                  onChange={(e) => setFormData({ ...formData, ownerPincode: e.target.value })}
                  placeholder="$50,000"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownerpassword">OwnerPassword</Label>
              <input type="password"
                id="ownerPassword"
                value={formData.ownerPassword}
                onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                placeholder="Brief description of the franchise..."
              
              />
            </div>
          </div>

          <DialogFooter className="w-full px-0">
            <div className="flex w-full justify-between">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-700 hover:bg-purple-400">
                Create Franchise
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
