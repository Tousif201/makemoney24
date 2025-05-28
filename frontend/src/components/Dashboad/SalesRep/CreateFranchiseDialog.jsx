import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
    name: "",
    owner: "",
    email: "",
    phone: "",
    location: "",
    status: "",
    investment: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Creating franchise:", formData);
    setOpen(false);
    // Reset form
    setFormData({
      name: "",
      owner: "",
      email: "",
      phone: "",
      location: "",
      status: "",
      investment: "",
      description: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Franchise</DialogTitle>
          <DialogDescription>
            Add a new franchise account to your portfolio. Fill in the details
            below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="franchise-name">Franchise Name</Label>
              <Input
                id="franchise-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter franchise name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner">Owner Name</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                placeholder="Enter owner's full name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="franchise-email">Email</Label>
              <Input
                id="franchise-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="owner@franchise.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="franchise-phone">Phone</Label>
              <Input
                id="franchise-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 234-567-8900"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="franchise-location">Location</Label>
              <Input
                id="franchise-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, State"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="franchise-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="investment">Initial Investment</Label>
              <Input
                id="investment"
                value={formData.investment}
                onChange={(e) =>
                  setFormData({ ...formData, investment: e.target.value })
                }
                placeholder="$50,000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="franchise-description">Description</Label>
              <Textarea
                id="franchise-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the franchise..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Franchise</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
