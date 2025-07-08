"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateShopNshipDialog({ onSubmit }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    referralcode: "",
    companyName: "",
    email: "",
    pincode: "",
    city: "",
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

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ ...formData, aadharFront, aadharBack });
    }
    setFormData({
      name: "",
      phone: "",
      password: "",
      referralcode: "",
      companyName: "",
      email: "",
      pincode: "",
      city: "",
      address:""
    });
    setAadharFront(null);
    setAadharBack(null);
    setIsDialogOpen(false);
  };

  const FileUploadCard = ({ title, file, onFileChange }) => (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">{title}</p>
            {file ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-600">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileChange(null)}
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
          <Label htmlFor={title.toLowerCase().replace(/ /g, "-")} className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>Choose File</span>
            </Button>
          </Label>
        </div>
      </CardContent>
    </Card>
  );

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
            Fill in the details below to register a new shopnship user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name" value={formData.name} onChange={(v) => handleInputChange("name", v)} />
            <InputField label="Phone" value={formData.phone} onChange={(v) => handleInputChange("phone", v)} />
            <InputField label="Password" type="password" value={formData.password} onChange={(v) => handleInputChange("password", v)} />
            <InputField label="Referral Code" value={formData.referralcode} onChange={(v) => handleInputChange("referralcode", v)} />
            <InputField label="Company Name" value={formData.companyName} onChange={(v) => handleInputChange("companyName", v)} />
            <InputField label="Email" type="email" value={formData.email} onChange={(v) => handleInputChange("email", v)} />
            <InputField label="Pincode" value={formData.pincode} onChange={(v) => handleInputChange("pincode", v)} />
            <InputField label="City" value={formData.city} onChange={(v) => handleInputChange("city", v)} />
            <InputField label="address" value={formData.address} onChange={(v) => handleInputChange("address", v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploadCard title="Upload Aadhar Front" file={aadharFront} onFileChange={(file) => handleFileUpload("front", file)} />
            <FileUploadCard title="Upload Aadhar Back" file={aadharBack} onFileChange={(file) => handleFileUpload("back", file)} />
          </div>

          <div className="flex justify-center gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create User</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
