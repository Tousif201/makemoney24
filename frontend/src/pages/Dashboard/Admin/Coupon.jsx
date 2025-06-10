"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

// NEW IMPORTS FOR ALERT DIALOG
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// Import your API functions. Double-check this path!
import {
  CreateCouponCode,
  GetAllCoupons,
  UpdateCoupon,
  DeleteCoupon,
} from "../../../../api/couponcode";

export default function CouponPage() {
  const [coupons, setCoupons] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    couponCode: "",
    discountPercent: "",
    expiryDate: "",
    isActive: "active", // Default to 'active' for new coupons
  });
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW STATE FOR ALERT DIALOG
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDeleteId, setCouponToDeleteId] = useState(null);


  // --- Fetch Coupons on component mount ---
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      const response = await GetAllCoupons();
      setCoupons(response.coupons); // Assuming backend returns { success: true, coupons: [...] }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      // Improve error message extraction
      setError(err.response?.data?.message || err.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- Handle Create/Update Submission ---
  const handleSubmit = async () => {
    setError(null); // Clear any previous errors
    if (!formData.name || !formData.couponCode || !formData.discountPercent || !formData.expiryDate) {
      setError("Please fill in all required fields.");
      return; // Stop the submission process
    }
    // Optional: Add more specific validation, e.g., discountPercent must be a number > 0
    if (isNaN(formData.discountPercent) || parseFloat(formData.discountPercent) <= 0) {
        setError("Discount percentage must be a positive number.");
        return;
    }
    try {
      if (editingCouponId) {
        // Update existing coupon
        await UpdateCoupon(editingCouponId, formData);
        console.log("Coupon updated successfully!");
      } else {
        // Create new coupon
        await CreateCouponCode(formData);
        console.log("Coupon created successfully!");
      }
      await fetchCoupons(); // Refresh the list after create/update
      setDialogOpen(false);
      // Reset form data and editing ID
      setFormData({ name: "", couponCode: "", discountPercent: "", expiryDate: "", isActive: "active" }); // Reset isActive to default
      setEditingCouponId(null);
    } catch (err) {
      console.error("Submission error:", err);
      // Improve error message extraction
      setError(err.response?.data?.message || err.message || "Failed to save coupon.");
    }
  };
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayDate = getTodayDate();
  // --- Handle Edit Button Click ---
  const handleEdit = (coupon) => {
    setFormData({
      name: coupon.name,
      couponCode: coupon.couponCode,
      discountPercent: coupon.discountPercent,
      // Format expiryDate for input type="date" (YYYY-MM-DD)
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "",
      isActive: coupon.isActive || "active", // Populate isActive from coupon data, default to "active" if null/undefined
    });
    setEditingCouponId(coupon._id); // Assuming your coupon object has an _id
    setDialogOpen(true);
  };

  // --- Handle Delete Button Click (Open Confirmation Dialog) ---
  const handleDeleteClick = (id) => {
    setCouponToDeleteId(id); // Store the ID of the coupon to be deleted
    setDeleteConfirmOpen(true); // Open the AlertDialog
  };

  // --- Handle Actual Deletion after Confirmation ---
  const handleConfirmDelete = async () => {
    if (!couponToDeleteId) return; // Should not happen if flow is correct

    setError(null); // Clear any previous errors
    try {
      await DeleteCoupon(couponToDeleteId);
      console.log("Coupon deleted successfully!");
      await fetchCoupons(); // Refresh the list after deletion
    } catch (err) {
      console.error("Deletion error:", err);
      // Improve error message extraction
      setError(err.response?.data?.message || err.message || "Failed to delete coupon.");
    } finally {
      setDeleteConfirmOpen(false); // Close the AlertDialog
      setCouponToDeleteId(null); // Clear the stored ID
    }
  };

  // --- Handle Dialog Close (reset form) ---
  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes, ensuring isActive defaults to 'active'
      setFormData({ name: "", couponCode: "", discountPercent: "", expiryDate: "", isActive: "active" });
      setEditingCouponId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCouponId ? "Edit Coupon" : "Create Coupon"}
              </DialogTitle>
              <DialogDescription>Fill in the details below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="couponCode" className="text-right">
                  Coupon Code
                </Label>
                <Input
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountPercent" className="text-right">
                  Discount (%)
                </Label>
                <Input
                  type="number"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiryDate" className="text-right">
                  Expiry Date
                </Label>
                <Input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                  min = {todayDate} 
                />
              </div>
              {/* Corrected: Dropdown for Status (isActive) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Status
                </Label>
                <select
                  name="isActive"
                  value={formData.isActive}
                  required
                  onChange={handleChange}
                  className="  col-span-1 p-2 md:col-span-3 md:p-2 border rounded-md "
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {editingCouponId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <div className="text-center">Loading coupons...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      <Card>
        <CardContent className="p-0">
          {!loading && !error && coupons.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Discount (%)</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>{coupon.couponCode}</TableCell>
                    <TableCell>{coupon.discountPercent}</TableCell>
                    <TableCell>
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {coupon.isActive === "active" ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {/* Changed: Now triggers the AlertDialog */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(coupon._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !loading && !error && (
              <div className="p-6 text-center text-gray-500">
                No coupons available
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* NEW: AlertDialog for Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coupon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive-hover">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}