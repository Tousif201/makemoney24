// src/pages/Create.jsx
import { useState, useEffect } from "react";
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
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "../../../context/SessionContext";
import { deleteFiles, uploadFiles } from "../../../../api/upload";
import { createProductService } from "../../../../api/vendor";
// Updated imports for categories API: Using getAllCategoriesFlat
import { getAllCategoriesFlat } from "../../../../api/categories";
import PortableTextEditor from "./RichTextEditor";

export default function CreateProduct() {
  const { session, loading: sessionLoading } = useSession();
  const [formData, setFormData] = useState({
    vendorId: "",
    categoryId: "", // This will hold the ID of the *most specific* category (Level 2 or 3)
    type: "", // 'product' or 'service' - crucial for fetching relevant categories
    title: "",
    description: "",
    price: "",
    variants: [],
    pincode: "",
    localMediaFiles: [], // For main product/service portfolio
    localMediaPreviews: [], // For main product/service portfolio
    portfolio: [], // For main product/service portfolio
    isBookable: false,
    isInStock: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // --- Category Management States ---
  const [allCategories, setAllCategories] = useState([]); // Stores flat list of all categories
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  // Helper to get category level (similar to CategoryManagementPage)
  const getCategoryLevel = (category, categoriesArray) => {
    if (!category || !categoriesArray) return 0; // Invalid input

    let level = 1;
    let current = category;
    while (current && current.parentId) {
      const parent = categoriesArray.find(
        (cat) => cat._id === current.parentId
      );
      if (parent) {
        level++;
        current = parent;
      } else {
        // Parent not found, might be a data inconsistency, break and return current level
        break;
      }
    }
    return level;
  };

  // Set vendorId from session.id once it's available
  useEffect(() => {
    if (!sessionLoading && session?.id && formData.vendorId !== session.id) {
      setFormData((prev) => ({
        ...prev,
        vendorId: session.id,
      }));
    }
  }, [session, sessionLoading, formData.vendorId]);

  // Effect to fetch all categories when component mounts or type changes
  useEffect(() => {
    const fetchAllCategories = async () => {
      setFetchingCategories(true);
      setCategoryError(null);
      try {
        const fetched = await getAllCategoriesFlat();
        setAllCategories(fetched);
      } catch (error) {
        console.error("Error fetching all categories:", error);
        setCategoryError(
          `Failed to load categories: ${
            error.response?.data?.message || error.message
          }`
        );
        setAllCategories([]);
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchAllCategories();
  }, []); // Fetch all categories once on mount

  // Filter categories and update form data when type or allCategories changes
  useEffect(() => {
    if (!formData.type) {
      setFormData((prev) => ({ ...prev, categoryId: "" }));
      return;
    }

    // Check if the currently selected category is valid for the new type, and is level 2 or 3
    const currentCategoryValid = allCategories.some(
      (cat) =>
        cat._id === formData.categoryId &&
        cat.type === formData.type &&
        (getCategoryLevel(cat, allCategories) === 2 ||
          getCategoryLevel(cat, allCategories) === 3)
    );

    if (!currentCategoryValid) {
      setFormData((prev) => ({ ...prev, categoryId: "" }));
    }
  }, [formData.type, allCategories, formData.categoryId]); // Re-evaluate when type or available categories change

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        categoryId: "", // Reset category selection when type changes
      }));
    } else if (name === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        categoryId: value,
      }));
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
    e.target.value = null;
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

  // --- Variant Handlers ---
  const generateSku = (title, color, size) => {
    const cleanTitle = title.replace(/\s+/g, "-").toUpperCase();
    const cleanColor = color ? color.replace(/\s+/g, "-").toUpperCase() : "";
    const cleanSize = size ? size.replace(/\s+/g, "-").toUpperCase() : "";

    let skuParts = [cleanTitle];
    if (cleanColor) skuParts.push(cleanColor);
    if (cleanSize) skuParts.push(cleanSize);

    return skuParts.filter(Boolean).join("-") || `SKU-${Date.now()}`;
  };

  const handleAddVariant = () => {
    setFormData((prev) => {
      const newVariant = {
        color: "",
        size: "",
        sku: generateSku(prev.title, "", ""), // Initial SKU based on title
        quantity: 0,
        images: [], // Stores URLs of uploaded variant images
        localVariantMediaFiles: [], // Stores File objects for variant images
        localVariantMediaPreviews: [], // Stores Object URLs for variant image previews
      };
      return {
        ...prev,
        variants: [...prev.variants, newVariant],
      };
    });
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };

      // Auto-generate SKU when color, size, or title changes
      if (field === "color" || field === "size" || field === "title") {
        newVariants[index].sku = generateSku(
          prev.title,
          newVariants[index].color,
          newVariants[index].size
        );
      }
      return { ...prev, variants: newVariants };
    });
  };

  const handleRemoveVariant = (indexToRemove) => {
    setFormData((prev) => {
      const variantToRemove = prev.variants[indexToRemove];
      // Revoke object URLs for local variant media previews
      variantToRemove.localVariantMediaPreviews.forEach(URL.revokeObjectURL);

      return {
        ...prev,
        variants: prev.variants.filter((_, index) => index !== indexToRemove),
      };
    });
  };

  const handleVariantMediaChange = (index, e) => {
    const newFiles = Array.from(e.target.files);
    const validNewFiles = newFiles.filter((file) => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB for variant images
      const isImage = file.type.startsWith("image/");
      return isValidSize && isImage;
    });

    const newPreviews = validNewFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = {
        ...newVariants[index],
        localVariantMediaFiles: [
          ...newVariants[index].localVariantMediaFiles,
          ...validNewFiles,
        ],
        localVariantMediaPreviews: [
          ...newVariants[index].localVariantMediaPreviews,
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
        URL.revokeObjectURL(variant.localVariantMediaPreviews[mediaIndex]);
        variant.localVariantMediaFiles = variant.localVariantMediaFiles.filter(
          (_, i) => i !== mediaIndex
        );
        variant.localVariantMediaPreviews =
          variant.localVariantMediaPreviews.filter((_, i) => i !== mediaIndex);
      }
      return { ...prev, variants: newVariants };
    });
  };

  const removeUploadedVariantMedia = async (variantIndex, key, url) => {
    if (!key) return;

    setFormSuccess(null);
    setFormError(null);
    setIsUploading(true); // Re-using global upload state for simplicity

    try {
      await deleteFiles([key]); // Assuming deleteFiles can handle variant image keys
      setFormData((prev) => {
        const newVariants = [...prev.variants];
        const variant = newVariants[variantIndex];
        if (variant) {
          variant.images = variant.images.filter((img) => img.key !== key);
        }
        return { ...prev, variants: newVariants };
      });
      setFormSuccess("Variant media deleted successfully!");
    } catch (error) {
      console.error("Failed to delete variant media:", error);
      setFormError(
        `Failed to delete variant media: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // --- End Variant Handlers ---

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    setIsUploading(true); // Set to true for the entire upload process

    if (!session?.id) {
      setFormError("Authentication error: Vendor ID not found. Please log in.");
      setIsSubmitting(false);
      setIsUploading(false);
      return;
    }

    let currentPortfolio = [...formData.portfolio]; // Will be updated with uploaded main media
    let currentVariants = (formData.variants); // Deep copy to modify

    const uploadPromises = [];
    const uploadErrors = []; // To collect all errors

    // Promise for main product/service media upload
    if (formData.localMediaFiles.length > 0) {
      const mainUploadPromise = uploadFiles(formData.localMediaFiles)
        .then((uploadedMediaArray) => {
          currentPortfolio = [...currentPortfolio, ...uploadedMediaArray];
        })
        .catch((error) => {
          uploadErrors.push(`Main media upload failed: ${error.response?.data?.message || error.message}`);
          console.error("Error during main media upload:", error);
        });
      uploadPromises.push(mainUploadPromise);
    }
    // Promises for variant media uploads (if type is product)
    if (formData.type === "product") {
      currentVariants.forEach((variant, index) => {
        if (variant.localVariantMediaFiles.length > 0) {
          const variantUploadPromise = uploadFiles(variant.localVariantMediaFiles)
            .then((uploadedVariantImages) => {
              variant.images = [
                ...variant.images,
                ...uploadedVariantImages.map((item) => ({
                  url: item.url,
                  key: item.key,
                  type: item.type,
                })),
              ];
            })
            .catch((error) => {
              uploadErrors.push(`Variant ${index} media upload failed: ${error.response?.data?.message || error.message}`);
              console.error(`Error during variant ${index} media upload:`, error);
            });
          uploadPromises.push(variantUploadPromise);
        }
      });
    }

    try {
      // Wait for all uploads to settle (succeed or fail)
      await Promise.allSettled(uploadPromises); // Use allSettled to ensure all promises run

      if (uploadErrors.length > 0) {
        setFormError(uploadErrors.join("; "));
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }

      // Update formData with the new portfolio and variant images, and clear local files
      setFormData((prev) => ({
        ...prev,
        portfolio: currentPortfolio,
        localMediaFiles: [], // Clear after successful processing
        localMediaPreviews: [], // Clear after successful processing
        variants: currentVariants.map(v => ({
          ...v,
          localVariantMediaFiles: [], // Clear after successful processing
          localVariantMediaPreviews: [], // Clear after successful processing
        })),
      }));


      const productServicePayload = {
        vendorId: session.id,
        categoryId: formData.categoryId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        portfolio: currentPortfolio.map((item) => ({ // Use the updated currentPortfolio
          type: item.type,
          url: item.url,
          key: item.key,
        })),
        pincode: formData.pincode,
        isBookable: formData.type === "service" ? formData.isBookable : false,
        isInStock: formData.isInStock,
        variants:
          formData.type === "product"
            ? currentVariants.map((variant) => ({ // Use the updated currentVariants
                color: variant.color,
                size: variant.size,
                sku: variant.sku,
                quantity: parseInt(variant.quantity) || 0,
                images: variant.images.map(({url}) => (url)),
              }))
            : [],
      };
      // --- Validation Checks ---
      if (
        !productServicePayload.vendorId ||
        !productServicePayload.categoryId || // categoryId is now mandatory
        !productServicePayload.type ||
        !productServicePayload.title ||
        isNaN(productServicePayload.price)
      ) {
        setFormError(
          "Please fill all required fields: Vendor ID, Category, Type, Title, Price."
        );
        setIsSubmitting(false);
        setIsUploading(false); // Make sure to set to false
        return;
      }

      if (productServicePayload.price < 0) {
        setFormError("Price cannot be negative.");
        setIsSubmitting(false);
        setIsUploading(false); // Make sure to set to false
        return;
      }

      if (!["product", "service"].includes(productServicePayload.type)) {
        setFormError('Type must be "product" or "service".');
        setIsSubmitting(false);
        setIsUploading(false); // Make sure to set to false
        return;
      }

      const selectedCategory = allCategories.find(
        (cat) => cat._id === formData.categoryId
      );
      if (!selectedCategory) {
        setFormError("Selected category is invalid.");
        setIsSubmitting(false);
        setIsUploading(false); // Make sure to set to false
        return;
      }
      const categoryLevel = getCategoryLevel(selectedCategory, allCategories);
      if (categoryLevel !== 2 && categoryLevel !== 3) {
        setFormError("Please select a category from Level 2 or Level 3.");
        setIsSubmitting(false);
        setIsUploading(false); // Make sure to set to false
        return;
      }

      if (formData.type === "product" && productServicePayload.variants.some(v => v.quantity < 0)) {
        setFormError("Variant quantity cannot be negative.");
        setIsSubmitting(false);
        setIsUploading(false); // Make sure to set to false
        return;
      }
      // --- End Validation Checks ---


      const createdProduct = await createProductService(productServicePayload);

      setFormSuccess("Product/Service created successfully!");
      // Reset form after successful submission
      setFormData({
        vendorId: session.id, // Keep vendorId
        categoryId: "",
        type: "",
        title: "",
        description: "",
        price: "",
        variants: [], // Reset variants to empty array
        pincode: "",
        localMediaFiles: [],
        localMediaPreviews: [],
        portfolio: [], // Reset portfolio here as well
        isBookable: false,
        isInStock: true,
      });
    } catch (apiError) {
      console.error("Error creating product:", apiError);
      setFormError(
        `Failed to create product: ${
          apiError.response?.data?.message || apiError.message
        }`
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false); // Ensure this is always called at the very end
    }
  };

  // Cleanup for local media previews (main and variant)
  useEffect(() => {
    return () => {
      formData.localMediaPreviews.forEach(URL.revokeObjectURL);
      formData.variants.forEach((variant) => {
        if (variant.localVariantMediaPreviews) {
          variant.localVariantMediaPreviews.forEach(URL.revokeObjectURL);
        }
      });
    };
  }, [formData.localMediaPreviews, formData.variants]);

  // Update SKU when product title changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => ({
        ...variant,
        sku: generateSku(prev.title, variant.color, variant.size)
      }))
    }));
  }, [formData.title]);

  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="ml-4 text-lg text-gray-600">Loading user session...</p>
      </div>
    );
  }

  if (!session?.id) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <Alert variant="destructive">
          <AlertTitle>Authentication Required!</AlertTitle>
          <AlertDescription>
            Please log in as a vendor to create products.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter and format categories for the single select dropdown
  const getSelectableCategories = () => {
    if (!formData.type || allCategories.length === 0) return [];

    const filteredCategories = allCategories
      .filter((cat) => cat.type === formData.type)
      .map((cat) => ({
        ...cat,
        level: getCategoryLevel(cat, allCategories),
      }))
      .filter((cat) => cat.level === 2 || cat.level === 3)
      .sort((a, b) => {
        // Sort by parent, then by name within same parent
        const getFullPath = (c) => {
          let path = [c.name];
          let current = c;
          while (current.parentId) {
            current = allCategories.find((p) => p._id === current.parentId);
            if (current) path.unshift(current.name);
            else break;
          }
          return path.join(" > ");
        };
        return getFullPath(a).localeCompare(getFullPath(b));
      });

    return filteredCategories;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Add New Product
          </h1>
          <p className="text-slate-600 text-lg">
            Create a new product or service listing
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
                    htmlFor="vendorId"
                    className="text-sm font-medium text-slate-700"
                  >
                    Vendor ID
                  </Label>
                  <Input
                    id="vendorId"
                    name="vendorId"
                    value={formData.vendorId}
                    disabled
                    className="h-11 bg-slate-100 text-slate-500"
                  />
                  <p className="text-xs text-slate-500">
                    Automatically set from your session.
                  </p>
                </div>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="categoryId"
                    className="text-sm font-medium text-slate-700"
                  >
                    Category
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("categoryId", value)
                    }
                    value={formData.categoryId}
                    disabled={!formData.type || fetchingCategories}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue
                        placeholder={
                          fetchingCategories
                            ? "Loading categories..."
                            : !formData.type
                            ? "Select type first"
                            : "Select Category (Level 2 or 3)"
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
                      {getSelectableCategories().length === 0 &&
                        !fetchingCategories &&
                        !categoryError &&
                        formData.type && (
                          <div className="p-2 text-slate-500 text-sm">
                            No Level 2 or Level 3 categories found for "
                            {formData.type}".
                          </div>
                        )}
                      {getSelectableCategories().map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {"\u00A0\u00A0".repeat(cat.level - 2)}{" "}
                          {/* Indent for Level 3 */}
                          {cat.name} (Level {cat.level})
                        </SelectItem>
                      ))}
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
              {/* <PortableTextEditor/> */}
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

              {/* Variant Section */}
              {formData.type === "product" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Product Variants
                  </h3>
                  {formData.variants.length === 0 && (
                    <p className="text-slate-500 text-sm">
                      No variants added yet.
                    </p>
                  )}
                  {formData.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="border p-3 rounded-md bg-slate-50 relative"
                    >
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
                              handleVariantChange(
                                index,
                                "color",
                                e.target.value
                              )
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
                          <Label htmlFor={`sku-${index}`}>SKU (Auto-generated)</Label>
                          <Input
                            id={`sku-${index}`}
                            value={variant.sku}
                            readOnly
                            className="bg-gray-100 cursor-not-allowed"
                            title="SKU is auto-generated based on product title, color, and size"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            value={variant.quantity}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Variant Image Upload Section */}
                      <div className="mt-6 space-y-3">
                        <Label className="text-sm font-medium text-slate-700">
                          Variant Images (Max 5MB each, Image only)
                        </Label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors relative">
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600 font-medium text-sm">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-slate-500">
                            PNG, JPG, GIF up to 5MB each
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleVariantMediaChange(index, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading || isSubmitting}
                          />
                          {isUploading && ( // This applies to all uploads, could make more granular
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              <span className="ml-1 text-sm">Uploading...</span>
                            </div>
                          )}
                        </div>

                        {(variant.localVariantMediaPreviews?.length > 0 ||
                          variant.images?.length > 0) && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {/* Local Variant Image Previews */}
                            {variant.localVariantMediaPreviews.map((src, i) => {
                              const file = variant.localVariantMediaFiles[i];
                              return (
                                <div
                                  key={`variant-local-${index}-${i}`}
                                  className="relative group aspect-square border border-slate-200 rounded-md overflow-hidden bg-slate-50"
                                >
                                  <img
                                    src={src}
                                    alt={`variant-preview-${index}-${i}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeLocalVariantMedia(index, i)
                                    }
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    disabled={isUploading || isSubmitting}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <div className="absolute bottom-1 left-1">
                                    <Badge variant="secondary" className="text-xs">
                                      Local
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                            {/* Uploaded Variant Images */}
                            {variant.images.map((img, i) => (
                              <div
                                key={`variant-uploaded-${index}-${img.key || i}`}
                                className="relative group aspect-square border border-green-400 rounded-md overflow-hidden bg-slate-50"
                              >
                                <img
                                  src={img.url}
                                  alt={`variant-uploaded-${index}-${i}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeUploadedVariantMedia(
                                      index,
                                      img.key,
                                      img.url
                                    )
                                  }
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  disabled={isUploading || isSubmitting}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <div className="absolute bottom-1 left-1">
                                  <Badge variant="success" className="text-xs">
                                    Uploaded
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddVariant}
                    variant="outline"
                    className="w-full"
                  >
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
                Product/Service Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-slate-700">
                  Upload Images/Videos for Main Listing
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
                      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                      <span className="ml-2">Uploading media...</span>
                    </div>
                  )}
                </div>

                {(formData.localMediaPreviews.length > 0 ||
                  formData.portfolio.length > 0) && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Main Media Preview (
                      {formData.localMediaPreviews.length +
                        formData.portfolio.length}{" "}
                      files)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {/* Render locally selected main media previews */}
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
                      {/* Render already uploaded main media from portfolio state */}
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
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
