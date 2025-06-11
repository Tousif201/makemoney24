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
import { toast } from "react-hot-toast"; // Using react-hot-toast
import { uploadFiles } from "../../../../api/upload";
import { Paperclip, X, Loader2 } from "lucide-react"; // Import icons for files and loading

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

  // States for document files
  const [udyogAadharFile, setUdyogAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [shopImages, setShopImages] = useState([]); // Array for multiple shop images
  const [gstCertificateFile, setGstCertificateFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false); // New loading state for submission

  const { session } = useSession();
  const salesRepId = session?._id;

  const handleFileChange = (setter) => (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  const handleShopImagesChange = (e) => {
    if (e.target.files) {
      setShopImages(Array.from(e.target.files));
    }
  };

  const removeShopImage = (indexToRemove) => {
    setShopImages(shopImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Creating vendor and uploading documents...", {
      id: "createVendorToast",
    });

    try {
      // --- 1. Validate mandatory files ---
      if (!udyogAadharFile || !panFile || !aadhaarFile) {
        throw new Error("UDYAM, AADHAR, and PAN documents are mandatory.");
      }

      // --- 2. Collect all files for upload ---
      const filesToUpload = [];
      const documentMap = new Map(); // To store original document name for payload

      if (udyogAadharFile) {
        filesToUpload.push(udyogAadharFile);
        documentMap.set(udyogAadharFile, "UDYAM");
      }
      if (panFile) {
        filesToUpload.push(panFile);
        documentMap.set(panFile, "PAN");
      }
      if (aadhaarFile) {
        filesToUpload.push(aadhaarFile);
        documentMap.set(aadhaarFile, "AADHAR");
      }
      if (gstCertificateFile) {
        filesToUpload.push(gstCertificateFile);
        documentMap.set(gstCertificateFile, "GST Certificate");
      }
      shopImages.forEach((file, index) => {
        filesToUpload.push(file);
        documentMap.set(file, `Shop Image ${index + 1}`);
      });

      let uploadedDocuments = [];
      if (filesToUpload.length > 0) {
        const uploadResult = await uploadFiles(filesToUpload);
        // Assuming uploadFiles returns an array of { key, url, type }
        if (
          uploadResult &&
          uploadResult.length > 0
        ) {
          uploadedDocuments = uploadResult.map((uploadedFile) => ({
            key: uploadedFile.key,
            url: uploadedFile.url,
            documentName:
              documentMap.get(
                filesToUpload.find(
                  (f) =>
                    f.name === uploadedFile.key ||
                    f.name.includes(uploadedFile.key)
                )
              ) || "Other Document", // Map back to original document name
          }));
        } else {
          toast.error(
            "Document upload failed or returned empty. Please try again.",
            { id: "createVendorToast" }
          );
          setIsSubmitting(false);
          return; // Stop submission if no files are uploaded
        }
      }

      // --- 3. Prepare vendor payload ---
      const payload = {
        ...formData,
        salesRepId,
        kycDocumentImage: uploadedDocuments, // Attach the uploaded documents
      };

      // --- 4. Create the vendor ---
      const result = await createVendor(payload);
      window.location.reload()
      toast.success("Vendor created successfully!", {
        id: "createVendorToast",
      });

      // --- 5. Reset form and close dialog ---
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        pincode: "",
        commissionRate: "",
        referredByCode: "",
      });
      setUdyogAadharFile(null);
      setPanFile(null);
      setAadhaarFile(null);
      setShopImages([]);
      setGstCertificateFile(null);

      setOpen(false);
    } catch (err) {
      console.error("Vendor creation error:", err);
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        "Failed to create vendor. Please check details.";
      toast.error(errorMessage, { id: "createVendorToast" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-[550px] max-h-screen overflow-y-auto rounded-xl py-4 px-6 shadow-lg border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Vendor
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new vendor account to your portfolio. All mandatory fields are
            marked.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@company.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 py-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Password"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pincode">
                  Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pincode"
                  type="number"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  placeholder="Pincode"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="referredByCode">Referral Code</Label>
                <Input
                  id="referredByCode"
                  value={formData.referredByCode}
                  onChange={(e) =>
                    setFormData({ ...formData, referredByCode: e.target.value })
                  }
                  placeholder="Referral Code"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="commissionRate">
                  Commission Rate (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="commissionRate"
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) =>
                    setFormData({ ...formData, commissionRate: e.target.value })
                  }
                  placeholder="e.g., 10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* --- Document Upload Fields --- */}
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Required Documents
          </h3>
          <div className="grid gap-4 py-2">
            {/* UDYAM */}
            <div className="grid gap-2">
              <Label htmlFor="udyogAadharFile">
                UDYAM / Udyog Aadhaar <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="udyogAadharFile"
                  type="file"
                  onChange={handleFileChange(setUdyogAadharFile)}
                  accept="image/*,.pdf"
                  required // Make mandatory
                  disabled={isSubmitting}
                  className="pr-2" // Add some padding to the right for filename visibility
                />
                {udyogAadharFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUdyogAadharFile(null)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {udyogAadharFile && (
                <span className="text-sm text-muted-foreground">
                  {udyogAadharFile.name}
                </span>
              )}
            </div>

            {/* PAN */}
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
                  required // Make mandatory
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
                  {panFile.name}
                </span>
              )}
            </div>

            {/* AADHAR */}
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
                  required // Make mandatory
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
                  {aadhaarFile.name}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Optional Documents
          </h3>
          <div className="grid gap-4 py-2">
            {/* SHOP Images */}
            <div className="grid gap-2">
              <Label htmlFor="shopImages">Shop Images</Label>
              <Input
                id="shopImages"
                type="file"
                multiple
                onChange={handleShopImagesChange}
                accept="image/*"
                disabled={isSubmitting}
                className="pr-2"
              />
              {shopImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {shopImages.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Paperclip className="h-3 w-3" />
                      {file.name}
                      <button
                        type="button"
                        onClick={() => removeShopImage(index)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* GST Certificate */}
            <div className="grid gap-2">
              <Label htmlFor="gstCertificateFile">GST Certificate</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="gstCertificateFile"
                  type="file"
                  onChange={handleFileChange(setGstCertificateFile)}
                  accept="image/*,.pdf"
                  disabled={isSubmitting}
                  className="pr-2"
                />
                {gstCertificateFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setGstCertificateFile(null)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {gstCertificateFile && (
                <span className="text-sm text-muted-foreground">
                  {gstCertificateFile.name}
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="w-full mt-6">
            <div className="flex w-full justify-between items-center">
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
                  "Create Vendor"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
