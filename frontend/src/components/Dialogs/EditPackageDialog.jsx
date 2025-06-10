import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { updatePackage } from "../../../api/membershipPackage"; // Import the API function

const EditPackageDialog = ({ isOpen, setIsOpen, selectedPackage, packages, setPackages }) => {
  const [formData, setFormData] = useState({
    name: "",
    packageAmount: "",
    miscellaneousAmount: "",
    description: "",
    validityInDays: "",
  });

  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    if (selectedPackage) {
      setFormData({
        name: selectedPackage.name || "",
        packageAmount: selectedPackage.packageAmount || "",
        miscellaneousAmount: selectedPackage.miscellaneousAmount || "",
        description: selectedPackage.description || "",
        validityInDays: selectedPackage.validityInDays || "",
      });
    }
  }, [selectedPackage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const packageId = selectedPackage._id; // Assuming selectedPackage has an 'id' field

    // Prepare data to send to backend, matching backend's expected fields
    const dataToSend = {
      name: formData.name,
      packageAmount: parseFloat(formData.packageAmount), // Ensure it's a number
      miscellaneousAmount: parseFloat(formData.miscellaneousAmount), // Ensure it's a number
      description: formData.description,
      validityInDays: formData.validityInDays, // Backend expects this as a string or number, keep as is for now
    };

    try {
      const response = await updatePackage(packageId, dataToSend);
      console.log("update frontend ",response);
      // Update the frontend state with the updated package from the backend response
      const updatedPackages = packages.map((pkg) =>
        pkg._id === selectedPackage._id ? response.data : pkg // Use response.data which is the updated package from backend
      );
      setPackages(updatedPackages);
      setIsOpen(false); // Close the dialog on success
    } catch (err) {
      setError("Failed to update package. Please try again.");
      console.error("Error updating package:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPackage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
          <DialogDescription>Update the package details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="packageAmount">Package Amount (INR)</Label>
              <Input
                id="packageAmount"
                type="number"
                value={formData.packageAmount}
                onChange={(e) => setFormData({ ...formData, packageAmount: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="miscellaneousAmount">Miscellaneous Amount (INR)</Label>
              <Input
                id="miscellaneousAmount"
                type="number"
                value={formData.miscellaneousAmount}
                onChange={(e) => setFormData({ ...formData, miscellaneousAmount: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validityInDays">Validity (in Days)</Label>
              <Input
                id="validityInDays"
                type="text" // Keep as text, as your backend seems to accept it this way, or change to number if needed
                value={formData.validityInDays}
                onChange={(e) => setFormData({ ...formData, validityInDays: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="bg-gray-800 text-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600" disabled={loading}>
              {loading ? "Updating..." : "Update Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackageDialog;