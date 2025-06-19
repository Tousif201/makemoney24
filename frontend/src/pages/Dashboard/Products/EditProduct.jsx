// src/pages/EditProduct.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Package,
  Settings,
  ImageIcon,
  DollarSign,
  Loader2,
  PlusCircle,
  XCircle,
  IndianRupee, // Ensure XCircle is imported for variant removal
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner"; // Assuming sonner is used for toasts

// Import your API functions
import {
  getProductServiceById,
  updateProductService,
} from "../../../../api/vendor";
import { deleteFiles, uploadFiles } from "../../../../api/upload"; // Make sure deleteFiles is imported
import {
  getCategories,
  getAllCategoriesFlat,
} from "../../../../api/categories";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    type: "", // 'product' or 'service'
    description: "",
    price: "",
    originalPrice: "", // Optional, for discounts
    weight: "", // For products
    length: "", // For products
    width: "", // For products
    height: "", // For products
    availableRegions: [], // For services
    timeRequired: "", // For services
    inclusions: [], // For services
    exclusions: [], // For services
    startDate: "", // For services
    endDate: "", // For services
    capacity: "", // For services
    // Media and Variants
    portfolio: [], // Existing image URLs from the backend for main product/service
    localMediaFiles: [], // New files selected for upload (main portfolio)
    localMediaPreviews: [], // Blob URLs for local previews (main portfolio)
    variants: [], // Array to hold variant objects
    isInStock: true, // Default to in stock
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filesToDelete, setFilesToDelete] = useState([]); // Array to store URLs of files marked for deletion

  // Fetch product details on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductServiceById(id);
        const productData = {
          title: data.title || "",
          categoryId: data.categoryId?._id || "",
          type: data.type || "",
          description: data.description || "",
          price: data.price || "",
          originalPrice: data.originalPrice || "",
          weight: data.weight || "",
          length: data.length || "",
          width: data.width || "",
          height: data.height || "",
          availableRegions: data.availableRegions || [],
          timeRequired: data.timeRequired || "",
          inclusions: data.inclusions || [],
          exclusions: data.exclusions || [],
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split("T")[0]
            : "",
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().split("T")[0]
            : "",
          capacity: data.capacity || "",
          portfolio: data.portfolio || [], // Existing portfolio images
          localMediaFiles: [], // No local files on initial load
          localMediaPreviews: [], // No local previews on initial load
          isInStock: data.isInStock !== undefined ? data.isInStock : true,
          // Initialize variants
          variants:
            data.variants?.map((variant) => ({
              ...variant,
              localVariantMediaFiles: [], // New files for this specific variant
              localVariantMediaPreviews: [], // Previews for new files for this variant
            })) || [],
        };
        setFormData(productData);
      } catch (error) {
        console.error("Error fetching product/service:", error);
        setAlert({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to load product/service details.",
        });
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch categories based on product type
  useEffect(() => {
    const fetchCategories = async () => {
      if (formData.type) {
        try {
          const data = await getAllCategoriesFlat(formData.type);
          setCategories(data);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setAlert({
            type: "error",
            message:
              error.response?.data?.message || "Failed to load categories.",
          });
        }
      } else {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [formData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, value) => {
    // For comma-separated string inputs like availableRegions, inclusions, exclusions
    setFormData((prev) => ({
      ...prev,
      [name]: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  };

  // --- Main Product Media Handling ---
  const handleMediaChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validNewFiles = newFiles.filter((file) => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      const isImageOrVideo =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      return isValidSize && isImageOrVideo;
    });

    const newPreviews = validNewFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      localMediaFiles: [...prev.localMediaFiles, ...validNewFiles],
      localMediaPreviews: [...prev.localMediaPreviews, ...newPreviews],
    }));
    e.target.value = null; // Clear the input so same file can be selected again
  };

  const removeLocalMedia = (index) => {
    setFormData((prev) => {
      const newLocalMediaFiles = [...prev.localMediaFiles];
      const newLocalMediaPreviews = [...prev.localMediaPreviews];

      // Revoke the object URL to free up memory
      URL.revokeObjectURL(newLocalMediaPreviews[index]);

      newLocalMediaFiles.splice(index, 1);
      newLocalMediaPreviews.splice(index, 1);

      return {
        ...prev,
        localMediaFiles: newLocalMediaFiles,
        localMediaPreviews: newLocalMediaPreviews,
      };
    });
  };

  const removeExistingMedia = (indexToRemove) => {
    setFormData((prev) => {
      const newPortfolio = [...prev.portfolio];
      const fileUrlToRemove = newPortfolio[indexToRemove];

      if (fileUrlToRemove) {
        setFilesToDelete((prevFiles) => [...prevFiles, fileUrlToRemove]);
      }

      newPortfolio.splice(indexToRemove, 1); // Remove from portfolio (visually)

      return {
        ...prev,
        portfolio: newPortfolio,
      };
    });
  };

  // --- Variant Handling ---
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: "",
          size: "",
          sku: "",
          quantity: 0,
          images: [], // Existing image URLs for this variant
          localVariantMediaFiles: [], // New files selected for this variant
          localVariantMediaPreviews: [], // Previews for new files for this variant
        },
      ],
    }));
  };

  const removeVariant = (indexToRemove) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      const variantToRemove = newVariants[indexToRemove];

      // Clean up local previews for the variant
      variantToRemove.localVariantMediaPreviews.forEach((url) =>
        URL.revokeObjectURL(url)
      );

      // Add existing variant images to filesToDelete
      if (variantToRemove.images && variantToRemove.images.length > 0) {
        setFilesToDelete((prevFiles) => [
          ...prevFiles,
          ...variantToRemove.images,
        ]);
      }

      newVariants.splice(indexToRemove, 1);
      return { ...prev, variants: newVariants };
    });
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value,
      };
      return { ...prev, variants: newVariants };
    });
  };

  // --- Variant Media Handling ---
  const handleVariantMediaChange = (variantIndex, e) => {
    const newFiles = Array.from(e.target.files);
    const validNewFiles = newFiles.filter((file) => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      const isImageOrVideo =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      return isValidSize && isImageOrVideo;
    });

    const newPreviews = validNewFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        localVariantMediaFiles: [
          ...newVariants[variantIndex].localVariantMediaFiles,
          ...validNewFiles,
        ],
        localVariantMediaPreviews: [
          ...newVariants[variantIndex].localVariantMediaPreviews,
          ...newPreviews,
        ],
      };
      return { ...prev, variants: newVariants };
    });
    e.target.value = null; // Clear the input so same file can be selected again
  };

  const removeLocalVariantMedia = (variantIndex, mediaIndex) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      const variant = newVariants[variantIndex];
      if (variant) {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(variant.localVariantMediaPreviews[mediaIndex]);

        variant.localVariantMediaFiles.splice(mediaIndex, 1);
        variant.localVariantMediaPreviews.splice(mediaIndex, 1);
      }
      return { ...prev, variants: newVariants };
    });
  };

  const removeExistingVariantMedia = (variantIndex, imageIndex) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      const variant = newVariants[variantIndex];
      if (variant && variant.images) {
        const imageUrlToRemove = variant.images[imageIndex];
        if (imageUrlToRemove) {
          setFilesToDelete((prevFiles) => [...prevFiles, imageUrlToRemove]);
        }
        variant.images.splice(imageIndex, 1); // Remove visually
      }
      return { ...prev, variants: newVariants };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);
    setIsUploading(false); // Reset upload status

    try {
      let uploadedPortfolioUrls = [...formData.portfolio]; // Start with existing portfolio images
      let finalVariants = formData.variants.map((variant) => ({ ...variant })); // Create a mutable copy

      // Set uploading state at the start of all uploads that involve actual network calls
      // This will be true if there are any local files to upload
      const hasFilesToUpload =
        formData.localMediaFiles.length > 0 ||
        finalVariants.some((v) => v.localVariantMediaFiles.length > 0);

      if (hasFilesToUpload) {
        setIsUploading(true);
      }

      // 1. Handle main product portfolio images
      if (formData.localMediaFiles.length > 0) {
        try {
          const mainUploadedObjects = await uploadFiles(
            formData.localMediaFiles
          );
          // Extract only URLs from the uploaded objects
          const mainUploadedUrls = mainUploadedObjects.map((file) => file.url);
          uploadedPortfolioUrls = [
            ...uploadedPortfolioUrls,
            ...mainUploadedUrls,
          ];
        } catch (uploadError) {
          console.error("Failed to upload main product files:", uploadError);
          toast.error(
            `Failed to upload main product images: ${
              uploadError.message || "Unknown error"
            }`
          );
          // Consider re-throwing or handling this error more strictly if main images are critical
        }
      }

      // 2. Handle variant images individually
      for (let i = 0; i < finalVariants.length; i++) {
        const variant = finalVariants[i];
        if (variant.localVariantMediaFiles.length > 0) {
          try {
            const variantUploadedObjects = await uploadFiles(
              variant.localVariantMediaFiles
            );
            // Extract only URLs from the uploaded objects
            const variantUploadedUrls = variantUploadedObjects.map(
              (file) => file.url
            );
            variant.images = [...variant.images, ...variantUploadedUrls];
          } catch (uploadError) {
            console.error(
              `Failed to upload files for variant ${i}:`,
              uploadError
            );
            toast.error(
              `Failed to upload images for variant ${i + 1}: ${
                uploadError.message || "Unknown error"
              }`
            );
            // Consider re-throwing or handling this error more strictly
          }
        }
      }

      // All uploads (or attempts) are done. Reset uploading state.
      setIsUploading(false);

      // 3. Delete old files that were marked for deletion
      if (filesToDelete.length > 0) {
        try {
          await deleteFiles(filesToDelete);
          console.log("Deleted old files:", filesToDelete);
          setFilesToDelete([]); // Clear files to delete after successful deletion
        } catch (deleteError) {
          console.error("Failed to delete old files:", deleteError);
          // Don't block product update if file deletion fails, but log it
        }
      }

      // Prepare final formData for submission
      const finalFormData = {
        ...formData,
        portfolio: uploadedPortfolioUrls, // Update with new URLs
        variants: finalVariants.map((variant) => {
          // Remove temporary local file/preview arrays from variant objects
          const { localVariantMediaFiles, localVariantMediaPreviews, ...rest } =
            variant;
          return rest;
        }),
        // Also remove temporary local file/preview arrays from main formData
        localMediaFiles: undefined,
        localMediaPreviews: undefined,
      };

      // Ensure that originalPrice is set to null if it's an empty string
      if (finalFormData.originalPrice === "") {
        finalFormData.originalPrice = null;
      }

      const { data } = await updateProductService(id, finalFormData);
      toast.success("Product/Service updated successfully!");
      setAlert({ type: "success", message: "Product/Service updated!" });

      // Clean up local previews after successful submission
      formData.localMediaPreviews.forEach((url) => URL.revokeObjectURL(url));
      formData.variants.forEach((variant) =>
        variant.localVariantMediaPreviews.forEach((url) =>
          URL.revokeObjectURL(url)
        )
      );
      window.location.reload();
    } catch (error) {
      console.error("Error updating product/service:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update product/service. Please try again.",
      });
      toast.error("Failed to update product/service.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false); // Ensure this is reset even on error
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
        Edit Product/Service
      </h1>

      {alert && (
        <Alert
          variant={alert.type === "error" ? "destructive" : "default"}
          className="mb-6"
        >
          <AlertTitle>
            {alert.type === "error" ? "Error" : "Success"}
          </AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-white">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="type"
                className="mb-2 block text-slate-700 dark:text-slate-300"
              >
                Type
              </Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                disabled // Type should not change after creation
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="title"
                className="mb-2 block text-slate-700 dark:text-slate-300"
              >
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Product/Service Title"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="categoryId"
                className="mb-2 block text-slate-700 dark:text-slate-300"
              >
                Category
              </Label>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onValueChange={(value) =>
                  handleSelectChange("categoryId", value)
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="description"
                className="mb-2 block text-slate-700 dark:text-slate-300"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the product or service"
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-white">
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="price"
                className="mb-2 block text-slate-700 dark:text-slate-300"
              >
                Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 999.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="originalPrice"
                className="mb-2 block text-slate-700 dark:text-slate-300"
              >
                Original Price (Optional, for discounts)
              </Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="e.g., 1200.00"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Fields based on Type */}
        {formData.type === "product" && (
          <Card className="shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-white">
                Product Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="weight"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Weight (in kg)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 0.5"
                  step="0.01"
                />
              </div>
              <div>
                <Label
                  htmlFor="dimensions"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Dimensions (L x W x H in cm)
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    name="length"
                    type="number"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="Length"
                    step="0.1"
                  />
                  <Input
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Width"
                    step="0.1"
                  />
                  <Input
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {formData.type === "service" && (
          <Card className="shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-white">
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="availableRegions"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Available Regions (comma-separated)
                </Label>
                <Input
                  id="availableRegions"
                  name="availableRegions"
                  value={formData.availableRegions.join(", ")}
                  onChange={(e) =>
                    handleArrayChange("availableRegions", e.target.value)
                  }
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
              </div>
              <div>
                <Label
                  htmlFor="timeRequired"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Time Required (e.g., 2 hours, 3 days)
                </Label>
                <Input
                  id="timeRequired"
                  name="timeRequired"
                  value={formData.timeRequired}
                  onChange={handleChange}
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div>
                <Label
                  htmlFor="inclusions"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Inclusions (comma-separated)
                </Label>
                <Input
                  id="inclusions"
                  name="inclusions"
                  value={formData.inclusions.join(", ")}
                  onChange={(e) =>
                    handleArrayChange("inclusions", e.target.value)
                  }
                  placeholder="e.g., Guide, Equipment"
                />
              </div>
              <div>
                <Label
                  htmlFor="exclusions"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Exclusions (comma-separated)
                </Label>
                <Input
                  id="exclusions"
                  name="exclusions"
                  value={formData.exclusions.join(", ")}
                  onChange={(e) =>
                    handleArrayChange("exclusions", e.target.value)
                  }
                  placeholder="e.g., Travel, Food"
                />
              </div>
              <div>
                <Label
                  htmlFor="startDate"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label
                  htmlFor="endDate"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label
                  htmlFor="capacity"
                  className="mb-2 block text-slate-700 dark:text-slate-300"
                >
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media Upload */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Product/Service Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label
              htmlFor="media-upload"
              className="block text-slate-700 dark:text-slate-300 mb-2"
            >
              Upload Images/Videos (Max 5MB each)
            </Label>
            <Input
              id="media-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Existing Media */}
              {formData.portfolio.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <img
                    src={url}
                    alt={`Product media ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExistingMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {/* New Local Media Previews */}
              {formData.localMediaPreviews.map((url, index) => (
                <div
                  key={`local-${index}`}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700 shadow-md"
                >
                  <img
                    src={url}
                    alt={`New media preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    New
                  </Badge>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeLocalMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Variants Section (Only for products) */}
        {formData.type === "product" && (
          <Card className="shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5" /> Product Variants
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add different variations of your product (e.g., by color, size).
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.variants.map((variant, variantIndex) => (
                <div
                  key={variant._id || `new-variant-${variantIndex}`} // Use _id if available, otherwise new index
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 relative"
                >
                  <h4 className="text-lg font-semibold mb-3 text-slate-800 dark:text-white">
                    Variant {variantIndex + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => removeVariant(variantIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="mb-2 block text-slate-700 dark:text-slate-300">
                        Color
                      </Label>
                      <Input
                        value={variant.color}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "color",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Red, Blue"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block text-slate-700 dark:text-slate-300">
                        Size
                      </Label>
                      <Input
                        value={variant.size}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "size",
                            e.target.value
                          )
                        }
                        placeholder="e.g., S, M, L, XL"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block text-slate-700 dark:text-slate-300">
                        SKU
                      </Label>
                      <Input
                        value={variant.sku}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "sku",
                            e.target.value
                          )
                        }
                        placeholder="e.g., PROD-RED-M"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block text-slate-700 dark:text-slate-300">
                        Quantity
                      </Label>
                      <Input
                        type="number"
                        value={variant.quantity}
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>

                  {/* Variant Media Upload */}
                  <div className="mt-4 border-t border-slate-200 dark:border-slate-600 pt-4">
                    <Label
                      htmlFor={`variant-media-upload-${variantIndex}`}
                      className="block text-slate-700 dark:text-slate-300 mb-2"
                    >
                      Variant Images/Videos (Max 5MB each)
                    </Label>
                    <Input
                      id={`variant-media-upload-${variantIndex}`}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) =>
                        handleVariantMediaChange(variantIndex, e)
                      }
                      className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Existing Variant Media */}
                      {variant.images &&
                        variant.images.map((url, imgIndex) => (
                          <div
                            key={`variant-${variantIndex}-existing-${imgIndex}`}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                            <img
                              src={url}
                              alt={`Variant media ${imgIndex}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                removeExistingVariantMedia(
                                  variantIndex,
                                  imgIndex
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      {/* New Local Variant Media Previews */}
                      {variant.localVariantMediaPreviews &&
                        variant.localVariantMediaPreviews.map(
                          (url, imgIndex) => (
                            <div
                              key={`variant-${variantIndex}-local-${imgIndex}`}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700 shadow-md"
                            >
                              <img
                                src={url}
                                alt={`New variant media preview ${imgIndex}`}
                                className="w-full h-full object-cover"
                              />
                              <Badge className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                New
                              </Badge>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  removeLocalVariantMedia(
                                    variantIndex,
                                    imgIndex
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full py-2 flex items-center justify-center gap-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <PlusCircle className="h-5 w-5" /> Add New Variant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stock Status */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800">
          <CardContent className="p-6">
            {!formData.variants || formData.variants.length === 0 ? ( // Only show if no variants or not a product
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                This setting is not applicable for products with variants. Stock
                is managed per variant.
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                This setting is applicable for "Service" type or Products
                without variants. For products with variants, stock is managed
                at the variant level.
              </p>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                In Stock (Overall Product/Service Status)
              </Label>
              <Switch
                checked={formData.isInStock}
                onCheckedChange={(checked) =>
                  handleSwitch("isInStock", checked)
                }
                disabled={
                  formData.type === "product" &&
                  formData.variants &&
                  formData.variants.length > 0
                } // Disable if product has variants
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 text-slate-600 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
            disabled={isSubmitting || isUploading}
            onClick={() => navigate("/dashboard/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading files..." : "Saving Changes..."}
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
