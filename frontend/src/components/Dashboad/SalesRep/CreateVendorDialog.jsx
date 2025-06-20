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
import { toast } from "sonner"; // Using sonner
import { uploadFiles } from "../../../../api/upload";
import { Paperclip, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"; // Import new icons
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component from shadcn/ui
import { useMediaQuery } from "../../../hooks/use-media-query";

export function CreateVendorDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Documents

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
      // Append new files to existing ones
      setShopImages((prevImages) => [
        ...prevImages,
        ...Array.from(e.target.files),
      ]);
    }
  };

  const removeShopImage = (indexToRemove) => {
    setShopImages(shopImages.filter((_, index) => index !== indexToRemove));
  };

  const handleNextStep = () => {
    // Basic validation for Step 1 before proceeding
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.pincode ||
      !formData.commissionRate
    ) {
      toast.error("Please fill in all mandatory fields on this step.");
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // --- 1. Validate mandatory files on Step 2 ---
      if (!udyogAadharFile || !panFile || !aadhaarFile) {
        throw new Error("UDYAM, AADHAR, and PAN documents are mandatory.");
      }

      // --- 2. Collect all files for upload ---
      const filesToUpload = [];
      const documentMap = new Map(); // To store original file object to document name mapping

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
        if (uploadResult && uploadResult.length > 0) {
          uploadedDocuments = uploadResult.map((uploadedFile) => {
            // Find the original file object using its name or a unique identifier if uploadFiles provides it
            const originalFile = filesToUpload.find(
              (f) => uploadedFile.key.includes(f.name) || uploadedFile.key === f.name
            );
            return {
              key: uploadedFile.key,
              url: uploadedFile.url,
              documentName:
                documentMap.get(originalFile) ||
                (uploadedFile.key.includes("Shop Image")
                  ? "Shop Image"
                  : "Other Document"), // Fallback in case mapping is tricky
            };
          });
        } else {
          toast.error(
            "Document upload failed or returned empty. Please try again."
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
      window.location.reload(); // Consider using a state update or context refresh instead of full reload
      toast.success("Vendor created successfully!");

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
      setCurrentStep(1); // Reset step
      setOpen(false);
    } catch (err) {
      console.error("Vendor creation error:", err);
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        "Failed to create vendor. Please check details.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-screen overflow-y-auto rounded-xl py-6 px-8 shadow-lg border">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Create New Vendor
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {currentStep === 1
              ? "Enter the vendor's basic and business details."
              : "Upload the necessary KYC and shop documents."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex justify-center items-center mb-6 gap-3">
          <div
            className={`flex items-center gap-2 ${
              currentStep === 1 ? "text-purple-700 font-semibold" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 1
                  ? "border-purple-700 bg-purple-700 text-white"
                  : "border-gray-300 bg-gray-100 text-gray-500"
              }`}
            >
              1
            </div>
            <span className="hidden sm:inline">Vendor Details</span>
          </div>
          <div className="flex-grow border-t border-gray-300 w-8 mx-2"></div>
          <div
            className={`flex items-center gap-2 ${
              currentStep === 2 ? "text-purple-700 font-semibold" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 2
                  ? "border-purple-700 bg-purple-700 text-white"
                  : "border-gray-300 bg-gray-100 text-gray-500"
              }`}
            >
              2
            </div>
            <span className="hidden sm:inline">Document Upload</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="grid gap-6 py-4">
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
                  placeholder="e.g., Sharma General Store"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
                    placeholder="contact@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
                    placeholder="Set a strong password"
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
                    placeholder="e.g., 462021"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="referredByCode">Referral Code (Optional)</Label>
                  <Input
                    id="referredByCode"
                    value={formData.referredByCode}
                    onChange={(e) =>
                      setFormData({ ...formData, referredByCode: e.target.value })
                    }
                    placeholder="Enter referral code if any"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-6 py-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Mandatory Documents
              </h3>
              <div className="grid gap-4">
                {/* UDYAM */}
                <div className="grid gap-2">
                  <Label htmlFor="udyogAadharFile" className="text-base">
                    UDYAM / Udyog Aadhaar <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="udyogAadharFile"
                      type="file"
                      onChange={handleFileChange(setUdyogAadharFile)}
                      accept="image/*,.pdf"
                      required
                      disabled={isSubmitting}
                      className="flex-grow"
                    />
                    {udyogAadharFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUdyogAadharFile(null)}
                        disabled={isSubmitting}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  {udyogAadharFile && (
                    <span className="text-sm text-muted-foreground">
                      <Paperclip className="inline-block h-3 w-3 mr-1" />
                      {udyogAadharFile.name}
                    </span>
                  )}
                </div>

                {/* PAN */}
                <div className="grid gap-2">
                  <Label htmlFor="panFile" className="text-base">
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
                      className="flex-grow"
                    />
                    {panFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPanFile(null)}
                        disabled={isSubmitting}
                        className="flex-shrink-0"
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

                {/* AADHAR */}
                <div className="grid gap-2">
                  <Label htmlFor="aadhaarFile" className="text-base">
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
                      className="flex-grow"
                    />
                    {aadhaarFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAadhaarFile(null)}
                        disabled={isSubmitting}
                        className="flex-shrink-0"
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
              </div>

              <h3 className="text-lg font-semibold mt-4 text-gray-700">
                Optional Documents
              </h3>
              <div className="grid gap-4">
                {/* SHOP Images */}
                <div className="grid gap-2">
                  <Label htmlFor="shopImages" className="text-base">
                    Shop Images (Multiple)
                  </Label>
                  <Input
                    id="shopImages"
                    type="file"
                    multiple
                    onChange={handleShopImagesChange}
                    accept="image/*"
                    disabled={isSubmitting}
                    className="flex-grow"
                  />
                  {shopImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {shopImages.map((file, index) => (
                        <Badge
                          key={file.name + index} // Use name + index as key for potential duplicate names
                          variant="secondary"
                          className="flex items-center gap-1 py-1 px-2 rounded-md text-sm"
                        >
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">
                            {file.name}
                          </span>
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
                  <Label htmlFor="gstCertificateFile" className="text-base">
                    GST Certificate
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="gstCertificateFile"
                      type="file"
                      onChange={handleFileChange(setGstCertificateFile)}
                      accept="image/*,.pdf"
                      disabled={isSubmitting}
                      className="flex-grow"
                    />
                    {gstCertificateFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setGstCertificateFile(null)}
                        disabled={isSubmitting}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  {gstCertificateFile && (
                    <span className="text-sm text-muted-foreground">
                      <Paperclip className="inline-block h-3 w-3 mr-1" />
                      {gstCertificateFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex w-full justify-between items-center mt-8">
            {currentStep === 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setCurrentStep(1); // Reset step if dialog is closed
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 transition-colors duration-200 flex items-center"
                >
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={isSubmitting}
                  className="px-6 py-2 flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Creating Vendor...
                    </>
                  ) : (
                    "Create Vendor"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
