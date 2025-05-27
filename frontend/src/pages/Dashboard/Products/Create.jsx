"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Package, Settings, ImageIcon, DollarSign } from "lucide-react"

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    vendorId: "",
    category: "",
    type: "",
    title: "",
    description: "",
    price: "",
    variants: "",
    pincode: "",
    media: [],
    mediaPreviews: [],
    isBookable: false,
    isInStock: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitch = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleMediaChange = (e) => {
    const newFiles = Array.from(e.target.files)
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...newFiles],
      mediaPreviews: [...prev.mediaPreviews, ...newPreviews],
    }))
  }

  const removeMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
      mediaPreviews: prev.mediaPreviews.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Add New Product</h1>
          <p className="text-slate-600 text-lg">Create a new product or service listing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vendorId" className="text-sm font-medium text-slate-700">Vendor ID</Label>
                  <Input id="vendorId" name="vendorId" value={formData.vendorId} onChange={handleChange} placeholder="Enter vendor ID" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-slate-700">Type</Label>
                  <Select onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700">Category</Label>
                  <Select onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-sm font-medium text-slate-700">Pincode</Label>
                  <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Enter pincode" className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">Product Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter product title" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter product description" className="min-h-[120px] resize-none" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing & Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-slate-700">Price (₹)</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="0.00" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variants" className="text-sm font-medium text-slate-700">Variants</Label>
                  <Input id="variants" name="variants" value={formData.variants} onChange={handleChange} placeholder="Size S, Size M, Size L" className="h-11" />
                  <p className="text-xs text-slate-500">Separate variants with commas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                Media Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-slate-700">Upload Images/Videos</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors relative">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-slate-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500">PNG, JPG, GIF, MP4 up to 10MB each</p>
                  </div>
                  <Input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                {formData.mediaPreviews.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Preview ({formData.mediaPreviews.length} files)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {formData.mediaPreviews.map((src, index) => (
                        <div key={index} className="relative group aspect-square border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          {formData.media[index]?.type.startsWith("video") ? (
                            <video src={src} className="w-full h-full object-cover" controls={false} />
                          ) : (
                            <img src={src || "/placeholder.svg"} alt={`preview-${index}`} className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1">
                            <Badge variant="secondary" className="text-xs">
                              {formData.media[index]?.type.startsWith("video") ? "Video" : "Image"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="h-5 w-5 text-gray-600" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Bookable</Label>
                <Switch checked={formData.isBookable} onCheckedChange={(checked) => handleSwitch("isBookable", checked)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">In Stock</Label>
                <Switch checked={formData.isInStock} onCheckedChange={(checked) => handleSwitch("isInStock", checked)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
            >
              Publish Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
