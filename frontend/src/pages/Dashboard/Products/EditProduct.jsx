// src/pages/EditProduct.jsx
import React, { useState, useEffect } from "react";
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

// Shadcn Dialog Imports (for new category creation)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import your API functions
import { getProductServiceById, updateProductService } from "../../../../api/vendor";
import { deleteFiles, uploadFiles } from "../../../../api/upload";
import { createCategory, getCategories } from "../../../../api/categories";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    type: "", // 'product' or 'service'
    description: "",
    price: "",
    localMediaFiles: [], // To hold File objects for new uploads
    localMediaPreviews: [], // To hold Blob URLs for new file previews
    portfolio: [], // Array of { type: string, url: string, key: string } (key is for deletion)
    variants: [], // THIS IS THE ORIGINAL STRUCTURE FOR VARIANTS
    pincode: "",
    isBookable: false,
    isInStock: true,
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // --- Category Management States ---
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState(null);
  const [newCategorySuccess, setNewCategorySuccess] = useState(null);
  // --- End Category Management States ---

  // Fetch product details on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setFormError(null);
      try {
        const product = await getProductServiceById(id);
        if (product) {
          setFormData({
            title: product.title || "",
            categoryId: product.categoryId || "",
            type: product.type || "",
            description: product.description || "",
            price: product.price !== undefined ? product.price.toString() : "",
            localMediaFiles: [],
            localMediaPreviews: [],
            portfolio: product.portfolio || [],
            variants: product.variants || [], // Retain the original variants array
            pincode: product.pincode || "",
            isBookable: product.isBookable || false,
            isInStock: product.isInStock !== undefined ? product.isInStock : true,
          });
          setNewCategoryType(product.type || "");
        } else {
          setFormError("Product or service not found.");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setFormError(`Failed to load product details: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch categories based on selected product/service type
  useEffect(() => {
    const fetchCategoriesForType = async () => {
      if (!formData.type) {
        setCategories([]);
        return;
      }
      setFetchingCategories(true);
      setCategoryError(null);
      try {
        const fetched = await getCategories(formData.type);
        setCategories(fetched);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryError(
          `Failed to load categories: ${
            error.response?.data?.message || error.message
          }`
        );
        setCategories([]);
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategoriesForType();
  }, [formData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && { categoryId: "" }),
    }));
    if (name === "type") {
      setNewCategoryType(value);
    }
  };

  const handleSwitch = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleMediaChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validNewFiles = newFiles.filter((file) => {
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
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
    e.target.value = null; // Clear input for next selection
  };

  const removeLocalMedia = (index) => {
    URL.revokeObjectURL(formData.localMediaPreviews[index]);
    setFormData((prev) => ({
      ...prev,
      localMediaFiles: prev.localMediaFiles.filter((_, i) => i !== index),
      localMediaPreviews: prev.localMediaPreviews.filter((_, i) => i !== index),
    }));
  };

  const removeUploadedMedia = async (key, url) => {
    if (!key) return;

    setFormSuccess(null);
    setFormError(null);
    setIsUploading(true);

    try {
      await deleteFiles([key]);
      setFormData((prev) => ({
        ...prev,
        portfolio: prev.portfolio.filter((item) => item.key !== key),
      }));
      setFormSuccess("Media deleted successfully!");
    } catch (error) {
      console.error("Failed to delete media:", error);
      setFormError(
        `Failed to delete media: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCategory = async () => {
    setNewCategoryError(null);
    setNewCategorySuccess(null);
    setCreatingCategory(true);

    if (!newCategoryName || !newCategoryType) {
      setNewCategoryError("Category name and type are required.");
      setCreatingCategory(false);
      return;
    }
    if (!["product", "service"].includes(newCategoryType)) {
      setNewCategoryError('Category type must be "product" or "service".');
      setCreatingCategory(false);
      return;
    }

    try {
      const categoryData = {
        name: newCategoryName,
        description: newCategoryDescription,
        type: newCategoryType,
      };
      const created = await createCategory(categoryData);
      setNewCategorySuccess(`Category "${created.name}" created successfully!`);
      setCategories((prev) => [...prev, created]);
      setFormData((prev) => ({
        ...prev,
        categoryId: created._id,
        type: created.type,
      }));

      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsNewCategoryDialogOpen(false);
    } catch (error) {
      console.error("Error creating new category:", error);
      setNewCategoryError(
        `Failed to create category: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  // --- Variant Handlers (Restored to original structure) ---
  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { color: "", size: "", sku: "", quantity: 0, images: [] },
      ],
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleRemoveVariant = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== indexToRemove),
    }));
  };
  // --- End Variant Handlers ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    let finalPortfolio = [...formData.portfolio];

    try {
      if (formData.localMediaFiles.length > 0) {
        setIsUploading(true);
        try {
          const uploadedMediaArray = await uploadFiles(formData.localMediaFiles);
          finalPortfolio = [...finalPortfolio, ...uploadedMediaArray];

          setFormData((prev) => ({
            ...prev,
            localMediaFiles: [],
            localMediaPreviews: [],
          }));
        } catch (uploadError) {
          console.error("Error during media upload:", uploadError);
          setFormError(
            `Media upload failed: ${
              uploadError.response?.data?.message || uploadError.message
            }`
          );
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const productServicePayload = {
        title: formData.title,
        categoryId: formData.categoryId,
        type: formData.type,
        description: formData.description,
        price: parseFloat(formData.price),
        portfolio: finalPortfolio.map((item) => ({
          type: item.type,
          url: item.url,
          key: item.key,
        })),
        pincode: formData.pincode,
        isBookable: formData.type === "service" ? formData.isBookable : false,
        isInStock: formData.isInStock,
        // Ensure variants are correctly formatted for payload
        variants: formData.type === "product" ? formData.variants.map(variant => ({
          ...variant,
          quantity: parseInt(variant.quantity) || 0 // Ensure quantity is number
        })) : [],
      };

      // --- Validation Checks ---
      if (
        !productServicePayload.categoryId ||
        !productServicePayload.type ||
        !productServicePayload.title ||
        isNaN(productServicePayload.price)
      ) {
        setFormError(
          "Please fill all required fields: Category, Type, Title, Price."
        );
        setIsSubmitting(false);
        return;
      }

      if (productServicePayload.price < 0) {
        setFormError("Price cannot be negative.");
        setIsSubmitting(false);
        return;
      }

      if (!["product", "service"].includes(productServicePayload.type)) {
        setFormError('Type must be "product" or "service".');
        setIsSubmitting(false);
        return;
      }
      // --- End Validation Checks ---

      await updateProductService(id, productServicePayload);
      setFormSuccess("Product/Service updated successfully!");
      // Optionally navigate or reset form if staying on page
      // navigate("/dashboard/products");
    } catch (err) {
      console.error("Failed to update product:", err);
      setFormError(
        `Failed to update product/service: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup for local media previews
  useEffect(() => {
    return () => {
      formData.localMediaPreviews.forEach(URL.revokeObjectURL);
    };
  }, [formData.localMediaPreviews]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="ml-4 text-lg text-gray-600">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Edit {formData.type === 'product' ? 'Product' : formData.type === 'service' ? 'Service' : 'Item'} ( {formData.title})
          </h1>
          <p className="text-slate-600 text-lg">
            Modify details of your existing listing
          </p>
        </div>

        {formSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{formSuccess}</AlertDescription>
          </Alert>
        )}
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        {newCategorySuccess && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <AlertTitle>Category Created!</AlertTitle>
            <AlertDescription>{newCategorySuccess}</AlertDescription>
          </Alert>
        )}

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
                  <Label
                    htmlFor="type"
                    className="text-sm font-medium text-slate-700"
                  >
                    Type
                  </Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("type", value)}
                    value={formData.type}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pincode"
                    className="text-sm font-medium text-slate-700"
                  >
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="categoryId"
                  className="text-sm font-medium text-slate-700"
                >
                  Category
                </Label>
                <div className="flex gap-2 items-center">
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("categoryId", value)
                    }
                    value={formData.categoryId}
                    disabled={!formData.type || fetchingCategories}
                  >
                    <SelectTrigger className="h-11 flex-grow">
                      <SelectValue
                        placeholder={
                          fetchingCategories
                            ? "Loading categories..."
                            : "Select category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryError && (
                        <div className="p-2 text-red-500 text-sm">
                          {categoryError}
                        </div>
                      )}
                      {!formData.type && (
                        <div className="p-2 text-slate-500 text-sm">
                          Please select a product type first.
                        </div>
                      )}
                      {categories.length === 0 &&
                        !fetchingCategories &&
                        !categoryError &&
                        formData.type && (
                          <div className="p-2 text-slate-500 text-sm">
                            No categories found for "{formData.type}".
                          </div>
                        )}
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog
                    open={isNewCategoryDialogOpen}
                    onOpenChange={setIsNewCategoryDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 flex-shrink-0"
                        disabled={!formData.type}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>
                          Add a new category. This will be available for "
                          {formData.type}" products.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {newCategoryError && (
                          <Alert variant="destructive">
                            <AlertTitle>Error!</AlertTitle>
                            <AlertDescription>
                              {newCategoryError}
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="newCategoryName">
                            Category Name
                          </Label>
                          <Input
                            id="newCategoryName"
                            value={newCategoryName}
                            onChange={(e) =>
                              setNewCategoryName(e.target.value)
                            }
                            placeholder="e.g., Electronics, Plumbing Service"
                            disabled={creatingCategory}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newCategoryType">
                            Category Type
                          </Label>
                          <Input
                            id="newCategoryType"
                            value={newCategoryType}
                            disabled
                            className="bg-slate-100 text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newCategoryDescription">
                            Description (Optional)
                          </Label>
                          <Textarea
                            id="newCategoryDescription"
                            value={newCategoryDescription}
                            onChange={(e) =>
                              setNewCategoryDescription(e.target.value)
                            }
                            placeholder="Brief description of the category"
                            disabled={creatingCategory}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsNewCategoryDialogOpen(false);
                            setNewCategoryError(null);
                            setNewCategorySuccess(null);
                          }}
                          disabled={creatingCategory}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateCategory}
                          disabled={creatingCategory}
                        >
                          {creatingCategory ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Category"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700"
                >
                  Product Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter product title"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className="min-h-[120px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <IndianRupee className="h-5 w-5 text-green-600" />
                Pricing & Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-sm font-medium text-slate-700"
                >
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>

              {/* Variant Section (Restored to original individual inputs) */}
              {formData.type === "product" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Product Variants</h3>
                  {formData.variants.length === 0 && (
                    <p className="text-slate-500 text-sm">No variants added yet.</p>
                  )}
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border p-3 rounded-md bg-slate-50 relative">
                      <Button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white h-6 w-6 p-1 rounded-full"
                        size="icon"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor={`color-${index}`}>Color</Label>
                          <Input
                            id={`color-${index}`}
                            value={variant.color}
                            onChange={(e) =>
                              handleVariantChange(index, "color", e.target.value)
                            }
                            placeholder="e.g. Red"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor={`size-${index}`}>Size</Label>
                          <Input
                            id={`size-${index}`}
                            value={variant.size}
                            onChange={(e) =>
                              handleVariantChange(index, "size", e.target.value)
                            }
                            placeholder="e.g. S, M, L"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor={`sku-${index}`}>SKU (Optional)</Label>
                          <Input
                            id={`sku-${index}`}
                            value={variant.sku}
                            onChange={(e) =>
                              handleVariantChange(index, "sku", e.target.value)
                            }
                            placeholder="e.g. PROD-RED-M"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            value={variant.quantity}
                            onChange={(e) =>
                              handleVariantChange(index, "quantity", e.target.value)
                            }
                            min="0"
                          />
                        </div>
                        {/* Variant Images: Could be another file input here for variant-specific images */}
                        {/* This would require more complex state management for nested media */}
                      </div>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddVariant} variant="outline" className="w-full">
                    Add New Variant
                  </Button>
                </div>
              )}
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
                <Label className="text-sm font-medium text-slate-700">
                  Upload Images/Videos
                </Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors relative">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-slate-600 font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-slate-500">
                      PNG, JPG, GIF, MP4 up to 10MB each
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading || isSubmitting}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                      <Loader2 className="mr-2 h-8 w-8 animate-spin text-purple-500" />
                      <span className="ml-2 text-purple-600">
                        Uploading media...
                      </span>
                    </div>
                  )}
                </div>

                {(formData.localMediaPreviews.length > 0 ||
                  formData.portfolio.length > 0) && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Preview (
                      {formData.localMediaPreviews.length +
                        formData.portfolio.length}{" "}
                      files)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {/* Render locally selected media previews */}
                      {formData.localMediaPreviews.map((src, index) => {
                        const file = formData.localMediaFiles[index];
                        if (!file) return null;
                        return (
                          <div
                            key={`local-${index}`}
                            className="relative group aspect-square border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50"
                          >
                            {file.type.startsWith("video") ? (
                              <video
                                src={src}
                                className="w-full h-full object-cover"
                                controls={false}
                              />
                            ) : (
                              <img
                                src={src}
                                alt={`preview-${index}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeLocalMedia(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              disabled={isUploading || isSubmitting}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1">
                              <Badge variant="secondary" className="text-xs">
                                {file.type.startsWith("video")
                                  ? "Video (Local)"
                                  : "Image (Local)"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      {/* Render already uploaded media from portfolio state */}
                      {formData.portfolio.map((item, index) => (
                        <div
                          key={`uploaded-${item.key || index}`}
                          className="relative group aspect-square border-2 border-green-400 rounded-lg overflow-hidden bg-slate-50"
                        >
                          {item.type === "video" ? (
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              controls={false}
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={`uploaded-${item.key}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              removeUploadedMedia(item.key, item.url)
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            disabled={isUploading || isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1">
                            <Badge variant="success" className="text-xs">
                              {item.type === "video"
                                ? "Video (Uploaded)"
                                : "Image (Uploaded)"}
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
                <Label className="text-sm font-medium text-slate-700">
                  Bookable
                </Label>
                <Switch
                  checked={formData.isBookable}
                  onCheckedChange={(checked) =>
                    handleSwitch("isBookable", checked)
                  }
                  disabled={formData.type !== "service"}
                />
              </div>
              {formData.type !== "service" && (
                <p className="text-xs text-red-500">
                  "Bookable" is only applicable for "Service" type.
                </p>
              )}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">
                  In Stock
                </Label>
                <Switch
                  checked={formData.isInStock}
                  onCheckedChange={(checked) =>
                    handleSwitch("isInStock", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 text-slate-600 border-slate-300 hover:bg-slate-50"
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
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}