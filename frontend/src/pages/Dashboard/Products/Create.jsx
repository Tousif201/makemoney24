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
  PlusCircle,
  XCircle,
} from "lucide-react";

// Shadcn Dialog Imports
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
import { useSession } from "../../../context/SessionContext";
import { deleteFiles, uploadFiles } from "../../../../api/upload";
import { createProductService } from "../../../../api/vendor";
// Updated imports for categories API:
import { createCategory, getCategories, getCategoriesByParentId } from "../../../../api/categories"; //

export default function CreateProduct() {
  const { session, loading: sessionLoading } = useSession();
  const [formData, setFormData] = useState({
    vendorId: "",
    categoryId: "", // This will hold the ID of the *most specific* category
    type: "", // 'product' or 'service' - crucial for fetching relevant categories
    title: "",
    description: "",
    price: "",
    variants: [],
    pincode: "",
    localMediaFiles: [],
    localMediaPreviews: [],
    portfolio: [],
    isBookable: false,
    isInStock: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // --- Category Management States ---
  const [parentCategories, setParentCategories] = useState([]); // Stores top-level categories
  const [subCategories, setSubCategories] = useState([]); // Stores subcategories of the selected parent
  const [selectedTopLevelCategory, setSelectedTopLevelCategory] = useState(""); // Tracks selected top-level category ID
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryType, setNewCategoryType] = useState(""); // Will default to formData.type
  const [newCategoryParentId, setNewCategoryParentId] = useState(""); // New: Parent ID for the new category
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState(null);
  const [newCategorySuccess, setNewCategorySuccess] = useState(null);
  // --- End Category Management States ---

  // Set vendorId from session.id once it's available
  useEffect(() => {
    if (!sessionLoading && session?.id && formData.vendorId !== session.id) {
      setFormData((prev) => ({
        ...prev,
        vendorId: session.id,
      }));
    }
  }, [session, sessionLoading, formData.vendorId]);

  // Effect to fetch top-level categories when type changes
  useEffect(() => {
    const fetchTopLevelCategories = async () => {
      if (!formData.type) {
        setParentCategories([]);
        setSelectedTopLevelCategory("");
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, categoryId: "" }));
        return;
      }
      setFetchingCategories(true);
      setCategoryError(null);
      try {
        // Fetch top-level categories (parentId: null) filtered by type
        const fetched = await getCategoriesByParentId("null", formData.type); //
        setParentCategories(fetched);
      } catch (error) {
        console.error("Error fetching top-level categories:", error);
        setCategoryError(
          `Failed to load main categories: ${
            error.response?.data?.message || error.message
          }`
        );
        setParentCategories([]);
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchTopLevelCategories();
  }, [formData.type]); // Re-fetch when product type changes

  // Effect to fetch subcategories when selectedTopLevelCategory changes
  useEffect(() => {
    const fetchChildrenCategories = async () => {
      if (selectedTopLevelCategory) {
        setFetchingCategories(true);
        setCategoryError(null);
        try {
          // Fetch subcategories for the selected top-level category
          const fetchedChildren = await getCategoriesByParentId(selectedTopLevelCategory, formData.type); //
          setSubCategories(fetchedChildren);
          // If the previously selected categoryId is not among new subcategories, reset it
          if (!fetchedChildren.some(cat => cat._id === formData.categoryId)) {
            setFormData(prev => ({ ...prev, categoryId: "" }));
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setCategoryError(
            `Failed to load subcategories: ${
              error.response?.data?.message || error.message
            }`
          );
          setSubCategories([]);
        } finally {
          setFetchingCategories(false);
        }
      } else {
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, categoryId: "" })); // Clear categoryId if no top-level is selected
      }
    };

    fetchChildrenCategories();
  }, [selectedTopLevelCategory, formData.type]); // Re-fetch when top-level category or product type changes

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
        categoryId: "", // Reset category and subcategories
      }));
      setSelectedTopLevelCategory(""); // Reset selected top-level category
      setNewCategoryType(value); // Set newCategoryType for the dialog
    } else if (name === "selectedTopLevelCategory") {
      setSelectedTopLevelCategory(value);
      // When a top-level category is selected, the product/service category should be this one initially
      // But allow user to choose a subcategory if available
      setFormData((prev) => ({
        ...prev,
        categoryId: value, // Set categoryId to the selected top-level category
      }));
    } else if (name === "categoryId") {
        // This is for selecting the final category (can be a subcategory or top-level)
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
        parentId: newCategoryParentId || null, // Include parentId for new category
      };
      const created = await createCategory(categoryData); //
      setNewCategorySuccess(`Category "${created.name}" created successfully!`);

      // Refresh categories based on the type and potentially selected parent
      // If a subcategory was created, we need to refresh the subCategories list
      // If a top-level category was created, we refresh the parentCategories list
      if (created.parentId) {
          const updatedSubcategories = await getCategoriesByParentId(created.parentId, created.type); //
          setSubCategories(updatedSubcategories);
      } else {
          const updatedParentCategories = await getCategoriesByParentId("null", created.type); //
          setParentCategories(updatedParentCategories);
      }

      // Auto-select the newly created category
      setFormData((prev) => ({
        ...prev,
        categoryId: created._id,
        type: created.type, // Ensure product form type matches new category type
      }));

      // If a new subcategory was created, ensure its parent is selected in the UI
      if (created.parentId && selectedTopLevelCategory !== created.parentId) {
          setSelectedTopLevelCategory(created.parentId);
      } else if (!created.parentId && selectedTopLevelCategory !== created._id) {
          setSelectedTopLevelCategory(created._id); // Select the new top-level category
      }


      // Clear dialog fields and close dialog
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryParentId(""); // Reset parentId for next category creation
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

  // --- Variant Handlers ---
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

    if (!session?.id) {
      setFormError("Authentication error: Vendor ID not found. Please log in.");
      setIsSubmitting(false);
      return;
    }

    let finalPortfolio = [...formData.portfolio];

    try {
      if (formData.localMediaFiles.length > 0) {
        setIsUploading(true);
        try {
          const uploadedMediaArray = await uploadFiles(
            formData.localMediaFiles
          );
          finalPortfolio = [...finalPortfolio, ...uploadedMediaArray];

          setFormData((prev) => ({
            ...prev,
            portfolio: finalPortfolio, // Update portfolio here as well for consistency
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
        vendorId: session.id,
        categoryId: formData.categoryId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        portfolio: finalPortfolio.map((item) => ({
          type: item.type,
          url: item.url,
          key: item.key, // Ensure key is included if it exists in portfolio items
        })),
        pincode: formData.pincode,
        isBookable: formData.type === "service" ? formData.isBookable : false,
        isInStock: formData.isInStock,
        variants:
          formData.type === "product"
            ? formData.variants.map((variant) => ({
                ...variant,
                quantity: parseInt(variant.quantity) || 0, // Ensure quantity is number
              }))
            : [],
      };

      // --- Validation Checks ---
      if (
        !productServicePayload.vendorId ||
        !productServicePayload.categoryId ||
        !productServicePayload.type ||
        !productServicePayload.title ||
        isNaN(productServicePayload.price)
      ) {
        setFormError(
          "Please fill all required fields: Vendor ID, Category, Type, Title, Price."
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

      const createdProduct = await createProductService(productServicePayload);

      setFormSuccess("Product/Service created successfully!");
      console.log(createdProduct);
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
      setSelectedTopLevelCategory(""); // Reset category selection UI
      setSubCategories([]);
    } catch (apiError) {
      console.error("Error creating product:", apiError);
      setFormError(
        `Failed to create product: ${
          apiError.response?.data?.message || apiError.message
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
                    htmlFor="categorySelection"
                    className="text-sm font-medium text-slate-700"
                  >
                    Category
                  </Label>
                  <div className="flex gap-2 items-center">
                    {/* Select for Top-Level Categories */}
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("selectedTopLevelCategory", value)
                      }
                      value={selectedTopLevelCategory}
                      disabled={!formData.type || fetchingCategories}
                    >
                      <SelectTrigger className="h-11 flex-grow">
                        <SelectValue
                          placeholder={
                            fetchingCategories
                              ? "Loading main categories..."
                              : "Select Main Category"
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
                        {parentCategories.length === 0 &&
                          !fetchingCategories &&
                          !categoryError &&
                          formData.type && (
                            <div className="p-2 text-slate-500 text-sm">
                              No main categories found for "{formData.type}".
                            </div>
                          )}
                        {parentCategories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Select for Subcategories (visible only if a top-level is selected) */}
                    {selectedTopLevelCategory && (
                        <Select
                        onValueChange={(value) =>
                            handleSelectChange("categoryId", value)
                        }
                        value={formData.categoryId} // This now holds the selected subcategory or top-level ID
                        disabled={!selectedTopLevelCategory || fetchingCategories || subCategories.length === 0}
                        >
                            <SelectTrigger className="h-11 flex-grow">
                                <SelectValue
                                placeholder={
                                    fetchingCategories
                                    ? "Loading subcategories..."
                                    : (subCategories.length === 0 ? "No subcategories" : "Select Subcategory")
                                }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {subCategories.length === 0 && (
                                    <div className="p-2 text-slate-500 text-sm">
                                        No subcategories available.
                                    </div>
                                )}
                                {/* Allow selecting the parent category itself if no subcategory is chosen */}
                                {selectedTopLevelCategory && (
                                    <SelectItem value={selectedTopLevelCategory}>
                                        (No Subcategory) - {parentCategories.find(c => c._id === selectedTopLevelCategory)?.name}
                                    </SelectItem>
                                )}
                                {subCategories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}


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
                            Add a new category or subcategory for "
                            {formData.type}" products/services.
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
                           {/* New: Select Parent Category for the new category */}
                                                   <div className="space-y-2">
                            <Label htmlFor="newCategoryParent">
                              Parent Category (Optional)
                            </Label>
                            <Select
                                onValueChange={(value) =>
                                    // Use a specific string like "__NONE__" for "None (Top-Level)"
                                    // and convert it to null when updating the state.
                                    setNewCategoryParentId(value === "__NONE__" ? null : value)
                                }
                                value={newCategoryParentId === null ? "__NONE__" : newCategoryParentId} // Control the value prop
                                disabled={creatingCategory}
                            >
                                <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Select parent category (Optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Change value from "" to a distinct non-empty string, e.g., "__NONE__" */}
                                    <SelectItem value="__NONE__">None (Top-Level)</SelectItem> {/* Option for top-level category */}
                                    {/* Display only parent categories of the same type */}
                                    {parentCategories
                                        .filter(cat => cat.type === newCategoryType)
                                        .map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                    {/* Also allow existing subcategories to be parents (if desired, though not strictly required by model, helpful for deep nesting) */}
                                    {subCategories
                                        .filter(cat => cat.type === newCategoryType)
                                        .map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                &nbsp;&nbsp;&nbsp;&nbsp;{cat.name} {/* Indent for visual hierarchy */}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                If you select a parent, this will be a subcategory.
                            </p>
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
                              setNewCategoryParentId(""); // Clear parentId on cancel
                              setNewCategoryName("");
                              setNewCategoryDescription("");
                            }}
                            disabled={creatingCategory}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateCategory}
                            disabled={creatingCategory || !newCategoryName || !newCategoryType}
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
                      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                      <span className="ml-2">Uploading media...</span>
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
