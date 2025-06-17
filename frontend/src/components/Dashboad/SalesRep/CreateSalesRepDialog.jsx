"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  CreditCard,
  BadgeIcon as IdCard,
  Briefcase,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

// Import your API functions
import { uploadFiles } from "../../../../api/upload"

export function CreateSalesRepDialog({ open, onOpenChange, onSubmit, loading, setError }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    pincode: "",
  })

  const [documents, setDocuments] = useState({
    aadharCard: { file: null, preview: null, uploaded: false, url: null, key: null },
    panCard: { file: null, preview: null, uploaded: false, url: null, key: null },
    photoId: { file: null, preview: null, uploaded: false, url: null, key: null },
    resume: { file: null, preview: null, uploaded: false, url: null, key: null },
    lightBill: { file: null, preview: null, uploaded: false, url: null, key: null },
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [documentUploadLoading, setDocumentUploadLoading] = useState(false)
  const [documentUploadError, setDocumentUploadError] = useState(null)


  const handleFileUpload = async (documentType, file) => {
    setDocumentUploadLoading(true)
    setDocumentUploadError(null)

    try {
      const response = await uploadFiles([file]) // uploadFiles expects an array of files
      if (response && response.length > 0) {
        const uploadedDoc = response[0] // Assuming a single file upload returns an array with one item
        const reader = new FileReader()
        reader.onload = (e) => {
          setDocuments((prev) => ({
            ...prev,
            [documentType]: {
              file,
              preview: e.target?.result,
              uploaded: true,
              url: uploadedDoc.url,
              key: uploadedDoc.key,
            },
          }))
        }
        reader.readAsDataURL(file)
      } else {
        throw new Error("File upload response was empty or malformed.")
      }
    } catch (err) {
      console.error("Error during file upload:", err)
      setDocumentUploadError(err.message || "Failed to upload document.")
      setError(err.message || "Failed to upload document.") // Propagate error to parent
    } finally {
      setDocumentUploadLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const kycDocuments = Object.entries(documents)
      .filter(([, value]) => value.uploaded && value.url && value.key)
      .map(([type, value]) => ({ // Changed here: destructure type from the entry
        documentName: type, // Add the documentType
        url: value.url,
        key: value.key,
      }))

    console.log("Documents being sent to backend:", kycDocuments);

    const requiredDocs = documentConfigs.filter(doc => doc.required);
    const allRequiredDocsUploadedAndProcessed = requiredDocs.every(doc => {
        const uploadedDoc = documents[doc.key];
        return uploadedDoc.uploaded && uploadedDoc.url && uploadedDoc.key;
    });

    if (!allRequiredDocsUploadedAndProcessed) {
        setError("Please upload all required documents before creating the sales representative.");
        return;
    }

    // Call the onSubmit prop, which is handled by the parent SalesRepsPage
    onSubmit({
      ...formData,
      kycDocuments: kycDocuments,
    })
    
    // Reset form and documents after submission (consider doing this only on successful submission in parent)
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      pincode: "",
    })
    setDocuments({
      aadharCard: { file: null, preview: null, uploaded: false, url: null, key: null },
      panCard: { file: null, preview: null, uploaded: false, url: null, key: null },
      photoId: { file: null, preview: null, uploaded: false, url: null, key: null },
      resume: { file: null, preview: null, uploaded: false, url: null, key: null },
      lightBill: { file: null, preview: null, uploaded: false, url: null, key: null },
    })
    setCurrentStep(1)
  }

  const documentConfigs = [
    { key: "aadharCard", title: "Aadhar Card", icon: IdCard, required: true, accept: ".jpg,.jpeg,.png,.pdf" },
    { key: "panCard", title: "PAN Card", icon: CreditCard, required: true, accept: ".jpg,.jpeg,.png,.pdf" },
    { key: "photoId", title: "Photo ID", icon: User, required: true, accept: ".jpg,.jpeg,.png,.pdf" },
    { key: "resume", title: "Resume", icon: Briefcase, required: true, accept: ".jpg,jpeg,.doc,.docx" },
    { key: "lightBill", title: "Electricity Bill", icon: Zap, required: false, accept: ".jpg,.jpeg,.png,.pdf" },
  ]

  const isStep1Valid = formData.name && formData.email && formData.phone && formData.password && formData.pincode
  const requiredDocsUploaded = documentConfigs
    .filter(doc => doc.required)
    .every(doc => documents[doc.key].uploaded && documents[doc.key].url && documents[doc.key].key)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[100vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-blue-600" /> Create Sales Representative
          </DialogTitle>
          <DialogDescription>Add a new sales representative with full documentation.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center space-x-4 py-4">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <span className="text-sm font-medium">Basic Info</span>
          </div>
          <div className={`w-8 h-1 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <span className="text-sm font-medium">Documents</span>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Enter details of the sales rep</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Full Name" type= "text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  <Input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  <Input placeholder="Phone" type ="number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                  <Input placeholder="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                  <Input placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} required />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  {documentUploadError && (
                    <p className="text-red-500 text-sm mt-2">{documentUploadError}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {documentConfigs.map((doc) => (
                    <div key={doc.key} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <doc.icon className="h-5 w-5 text-blue-600" />
                        <span>{doc.title} {doc.required ? "*" : "(optional)"}</span>
                        {documents[doc.key].uploaded && documents[doc.key].url && documents[doc.key].key ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          doc.required && <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <Input
                        type="file"
                        accept={doc.accept}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(doc.key, file)
                        }}
                      />
                      {documentUploadLoading && <p className="text-sm text-gray-500">Uploading {doc.title}...</p>}
                    </div>
                  ))}
                  {!requiredDocsUploaded && (
                    <div className="text-sm text-amber-700 bg-amber-100 p-2 rounded">
                      <AlertCircle className="inline-block w-4 h-4 mr-1" /> Please upload all required documents and wait for them to process.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center gap-10">
              {currentStep === 2 && (
                <Button variant="outline" onClick={() => setCurrentStep(1)} disabled={loading || documentUploadLoading}>Previous</Button>
              )}
              <div className="flex gap-2 ">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || documentUploadLoading}>Cancel</Button>
                {currentStep === 1 && (
                  <Button onClick={() => setCurrentStep(2)} disabled={!isStep1Valid || loading || documentUploadLoading} className="bg-blue-600 hover:bg-blue-700">Next: Documents</Button>
                )}
                {currentStep === 2 && (
                  <Button type="submit" disabled={!requiredDocsUploaded || loading || documentUploadLoading} className="bg-green-600 hover:bg-green-700">
                    {loading || documentUploadLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      "Create Sales Rep"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>
        <Separator />
      </DialogContent>
    </Dialog>
  )
}