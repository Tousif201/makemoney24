import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateFranchise } from "../../../../api/Franchise"; // Your API call for franchise
import { useSession } from "../../../context/SessionContext";
import { toast } from "react-hot-toast"; // For notifications
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
import {
  Paperclip,
  X,
  Loader2,
  Eye, // Import Eye icon
  EyeOff, // Import EyeOff icon
} from "lucide-react"; // Icons for files, loading, and password visibility
import { uploadFiles } from "../../../../api/upload"; // Import your file upload API

export function CreateFranchiseDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [formData, setFormData] = useState({
    franchiseName: "",
    location: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerPassword: "",
    ownerPincode: "",
    ownerAddress: "",
    referredByCode: "",
  });

  // States for document files
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false); // New loading state

  const { session } = useSession();
  const salesRepId = session?.id;

  // Generic handler for single file inputs
  const handleFileChange = (setter) => (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Creating franchise and uploading documents...", {
      id: "createFranchiseToast",
    });

    try {
      // --- 1. Validate mandatory fields and files ---
      if (!aadhaarFile || !panFile) {
        throw new Error("Aadhaar and PAN documents are mandatory.");
      }
      if (!formData.ownerAddress.trim()) {
        throw new Error("Owner Address is mandatory.");
      }
      if (
        !formData.franchiseName ||
        !formData.location ||
        !formData.ownerName ||
        !formData.ownerEmail ||
        !formData.ownerPhone ||
        !formData.ownerPassword ||
        !formData.ownerPincode
      ) {
        throw new Error("Please fill in all mandatory details.");
      }

      // --- 2. Collect all files for upload ---
      const filesToUpload = [];
      const documentMap = new Map(); // To associate uploaded file with its documentName

      if (aadhaarFile) {
        filesToUpload.push(aadhaarFile);
        documentMap.set(aadhaarFile, "AADHAR");
      }
      if (panFile) {
        filesToUpload.push(panFile);
        documentMap.set(panFile, "PAN");
      }

      let uploadedDocuments = [];
      if (filesToUpload.length > 0) {
        const uploadResult = await uploadFiles(filesToUpload);
        // Assuming uploadFiles returns an array of { key, url, type }
        if (uploadResult && uploadResult.length > 0) {
          uploadedDocuments = uploadResult.map((uploadedFile) => ({
            key: uploadedFile.key,
            url: uploadedFile.url,
            // Find the original file to get its documentName
            documentName:
              documentMap.get(
                filesToUpload.find(
                  (f) =>
                    f.name === uploadedFile.key ||
                    (uploadedFile.key && uploadedFile.key.includes(f.name))
                )
              ) || "Other Document", // Fallback if exact name match isn't found
          }));
        } else {
          toast.error(
            "Document upload failed or returned empty. Please try again.",
            { id: "createFranchiseToast" }
          );
          setIsSubmitting(false);
          return; // Stop submission if documents failed to upload
        }
      }

      // --- 3. Prepare franchise payload ---
      const payload = {
        ...formData,
        salesRepId,
        kycDocuments: uploadedDocuments,
        address: formData.ownerAddress,
        franchisePincode: formData.ownerPincode, // Attach the uploaded documents
      };

      // --- 4. Create the franchise ---
      const result = await CreateFranchise(payload);
      window.location.reload(); // Consider using a state update or context refresh instead of full reload
      toast.success("Franchise created successfully!", {
        id: "createFranchiseToast",
      });

      // --- 5. Reset form fields and close dialog ---
      setFormData({
        franchiseName: "",
        location: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        ownerPassword: "",
        ownerPincode: "",
        ownerAddress: "",
        referredByCode: "",
      });
      setAadhaarFile(null);
      setPanFile(null);
      setOpen(false);
    } catch (err) {
      console.error("Franchise creation error:", err);
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        "Failed to create franchise. Please check details and try again.";
      toast.error(errorMessage, { id: "createFranchiseToast" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[80vw] md:max-w-[550px] max-h-screen overflow-y-auto rounded-xl py-4 px-6 shadow-lg border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Franchise
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new franchise account to your portfolio. All mandatory fields
            are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="franchise-name">
                  Franchise Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="franchiseName"
                  value={formData.franchiseName}
                  onChange={(e) =>
                    setFormData({ ...formData, franchiseName: e.target.value })
                  }
                  placeholder="Enter franchise name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner">
                  Owner Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="owner"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  placeholder="Enter owner's full name"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="franchise-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="franchise-email"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerEmail: e.target.value })
                  }
                  placeholder="owner@franchise.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownerPhone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="franchise-phone"
                  value={formData.ownerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerPhone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ownerPassword">
                  Owner Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  {" "}
                  {/* Added relative positioning */}
                  <Input
                    id="ownerPassword"
                    type={showPassword ? "text" : "password"} // Toggle type based on state
                    value={formData.ownerPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ownerPassword: e.target.value,
                      })
                    }
                    placeholder="password"
                    required
                    disabled={isSubmitting}
                    className="pr-10" // Add padding to the right for the icon
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent" // Position the button
                    onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownerPincode">
                  Owner Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerPincode"
                  type="number"
                  value={formData.ownerPincode}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerPincode: e.target.value })
                  }
                  placeholder="e.g., 452001"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownerAddress">
                Owner Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ownerAddress"
                value={formData.ownerAddress}
                onChange={(e) =>
                  setFormData({ ...formData, ownerAddress: e.target.value })
                }
                placeholder="Enter full address"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="franchise-location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="franchise-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, State"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referredByCode">Referred By Code</Label>
              <Input
                id="referredByCode"
                value={formData.referredByCode}
                onChange={(e) =>
                  setFormData({ ...formData, referredByCode: e.target.value })
                }
                placeholder="Optional referral code"
                disabled={isSubmitting}
              />
            </div>
          </div>
          ---
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Required Documents
          </h3>
          <div className="grid gap-4 py-2">
            {/* Aadhaar Card */}
            <div className="grid gap-2">
              <Label htmlFor="aadhaarFile">
                Aadhaar Card <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="aadhaarFile"
                  type="file"
                  onChange={handleFileChange(setAadhaarFile)}
                  accept="image/*,.pdf"
                  required
                  disabled={isSubmitting}
                  className="pr-2"
                />
                {aadhaarFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAadhaarFile(null)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {aadhaarFile && (
                <span className="text-sm text-muted-foreground">
                  <Paperclip className="inline-block h-3 w-3 mr-1" />
                  {aadhaarFile.name}
                </span>
              )}
            </div>

            {/* PAN Card */}
            <div className="grid gap-2">
              <Label htmlFor="panFile">
                PAN Card <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="panFile"
                  type="file"
                  onChange={handleFileChange(setPanFile)}
                  accept="image/*,.pdf"
                  required
                  disabled={isSubmitting}
                  className="pr-2"
                />
                {panFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPanFile(null)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {panFile && (
                <span className="text-sm text-muted-foreground">
                  <Paperclip className="inline-block h-3 w-3 mr-1" />
                  {panFile.name}
                </span>
              )}
            </div>
          </div>
          <DialogFooter className="w-full px-0 mt-6">
            <div className="flex w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-700 hover:bg-purple-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Franchise"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
