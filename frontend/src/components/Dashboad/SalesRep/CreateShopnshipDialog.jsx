"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Plus, Loader2 } from "lucide-react";

// Assume these API functions are imported from your API file (e.g., src/api/affiliateApi.js)
import { createAffiliate } from "../../../../api/salesrep";
import { uploadFiles } from "../../../../api/upload";

export default function CreateShopNshipDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    referralcode: "",
    companyName: "",
    email: "",
    pincode: "",
    city: "",
    address: "",
    state: "",
  });

  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type, file) => {
    if (type === "front") setAadharFront(file);
    else setAadharBack(file);
  };

  const resetForm = () => {
    setFormData({
      name: "", phone: "", password: "", referralcode: "",
      companyName: "", email: "", pincode: "", city: "",
      address: "", state: "",
    });
    setAadharFront(null);
    setAadharBack(null);
  };

  const handleSubmit = async () => {
    if (!aadharFront || !aadharBack) {
      alert("Please upload both Aadhar front and back documents.");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Upload the document files first.
      const filesToUpload = [aadharFront, aadharBack];
      const uploadedFiles = await uploadFiles(filesToUpload);

      // Step 2: Prepare the 'kycDocumentImages' array using the response from the upload.
      // The backend model expects: [{ url, key, documentName }]
      const kycDocumentImages = [
        {
          url: uploadedFiles[0].url,
          key: uploadedFiles[0].key,
          documentName: "Aadhar Front",
        },
        {
          url: uploadedFiles[1].url,
          key: uploadedFiles[1].key,
          documentName: "Aadhar Back",
        },
      ];

      // Step 3: Prepare the final payload with form data and the uploaded document info.
      const finalPayload = {
        ...formData,
        referralCode: formData.referralcode, // Ensure field name matches backend
        kycDocumentImages: kycDocumentImages,
      };

      // Step 4: Call the API to create the affiliate with the complete payload.
      await createAffiliate(finalPayload);

      alert("✅ Affiliate created successfully!");
      resetForm();
      setIsDialogOpen(false);

    } catch (error) {
      // Display a specific error message from either upload or create affiliate calls.
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-purple-700">
          <Plus className="h-4 w-4" />
          Create Shopnship User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shopnship User</DialogTitle>
          <DialogDescription>
            Fill in the details below to register a new shopnship user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Form Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name" value={formData.name} onChange={(v) => handleInputChange("name", v)} />
            <InputField label="Phone" value={formData.phone} onChange={(v) => handleInputChange("phone", v)} />
            <InputField label="Password" type="password" value={formData.password} onChange={(v) => handleInputChange("password", v)} />
            <InputField label="Referral Code (Optional)" value={formData.referralcode} onChange={(v) => handleInputChange("referralcode", v)} />
            <InputField label="Company Name" value={formData.companyName} onChange={(v) => handleInputChange("companyName", v)} />
            <InputField label="Email" type="email" value={formData.email} onChange={(v) => handleInputChange("email", v)} />
            <InputField label="Pincode" value={formData.pincode} onChange={(v) => handleInputChange("pincode", v)} />
            <InputField label="City" value={formData.city} onChange={(v) => handleInputChange("city", v)} />
            <InputField label="Address" value={formData.address} onChange={(v) => handleInputChange("address", v)} />
            <InputField label="State" value={formData.state} onChange={(v) => handleInputChange("state", v)} />
          </div>

          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploadCard title="Upload Aadhar Front" file={aadharFront} onFileChange={(file) => handleFileUpload("front", file)} />
            <FileUploadCard title="Upload Aadhar Back" file={aadharBack} onFileChange={(file) => handleFileUpload("back", file)} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reusable Input Field Component
function InputField({ label, type = "text", value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

// Reusable File Upload Card Component
function FileUploadCard({ title, file, onFileChange }) {
  return (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <label htmlFor={title.toLowerCase().replace(/ /g, "-")} className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">{title}</p>
            {file ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-600">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onFileChange(null); }} // stop propagation
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Click to upload or drag and drop
              </p>
            )}
          </div>
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="hidden"
            id={title.toLowerCase().replace(/ /g, "-")}
          />
        </label>
      </CardContent>
    </Card>
  );
}