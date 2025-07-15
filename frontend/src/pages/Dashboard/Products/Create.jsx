import { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "../../../context/SessionContext";
import { deleteFiles, uploadFiles } from "../../../../api/upload";
import { createProductService } from "../../../../api/vendor";
import { getAllCategoriesFlat } from "../../../../api/categories";
import PortableTextEditor from "./RichTextEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function CreateProduct() {
  const { session, loading: sessionLoading } = useSession();
  const [formData, setFormData] = useState({
    vendorId: "",
    categoryId: "", // This will hold the ID of the *most specific* category selected
    type: "",
    title: "",
    description: "",
    price: "",
    courierCharges: "",
    details: "",
    variants: [],
    pincode: "",
    localMediaFiles: [],
    localMediaPreviews: [],
    portfolio: [],
    isBookable: false,
    isInStock: true,
    discountRate: "",
    affiliatecomission: "", // Added to state
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // --- Category Management States ---
  const [allCategories, setAllCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  // New states for cascading dropdowns
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedLevel2, setSelectedLevel2] = useState("");
  const [selectedLevel3, setSelectedLevel3] = useState("");

  // Set vendorId from session.id once it's available
  useEffect(() => {
    if (!sessionLoading && session?.id && formData.vendorId !== session.id) {
      setFormData((prev) => ({
        ...prev,
        vendorId: session.id,
      }));
    }
  }, [session, sessionLoading, formData.vendorId]);

  // Effect to fetch all categories when component mounts
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
  }, []);

  // Memoized category lists for the three dropdowns
  const level1Categories = useMemo(() => {
    if (!formData.type || !allCategories) return [];
    return allCategories.filter((cat) => cat.type === formData.type && !cat.parentId);
  }, [allCategories, formData.type]);

  const level2Categories = useMemo(() => {
    if (!selectedLevel1 || !allCategories) return [];
    return allCategories.filter((cat) => cat.parentId === selectedLevel1);
  }, [allCategories, selectedLevel1]);

  const level3Categories = useMemo(() => {
    if (!selectedLevel2 || !allCategories) return [];
    return allCategories.filter((cat) => cat.parentId === selectedLevel2);
  }, [allCategories, selectedLevel2]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  // --- New Category Handlers ---
  const handleTypeChange = (value) => {
    setSelectedLevel1("");
    setSelectedLevel2("");
    setSelectedLevel3("");
    setFormData((prev) => ({
      ...prev,
      type: value,
      categoryId: "", // Reset categoryId
    }));
  };

  const handleLevel1Change = (value) => {
    setSelectedLevel1(value);
    setSelectedLevel2("");
    setSelectedLevel3("");
    setFormData((prev) => ({ ...prev, categoryId: value || "" }));
  };

  const handleLevel2Change = (value) => {
    setSelectedLevel2(value);
    setSelectedLevel3("");
    // If user unselects L2, fallback to L1, otherwise use L2
    setFormData((prev) => ({ ...prev, categoryId: value || selectedLevel1 }));
  };

  const handleLevel3Change = (value) => {
    setSelectedLevel3(value);
    // If user unselects L3, fallback to L2, otherwise use L3
    setFormData((prev) => ({ ...prev, categoryId: value || selectedLevel2 }));
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
      localMediaPreviews: prev.localMediaPreviews.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const removeUploadedMedia = async (key, url) => {
    if (!key) return;

    setIsUploading(true);
    try {
      await deleteFiles([key]);
      setFormData((prev) => ({
        ...prev,
        portfolio: prev.portfolio.filter((item) => item.key !== key),
      }));
      toast.success("Media deleted successfully!");
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error(
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
        images: [], // Stores {url, key} of uploaded variant images
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

      if (field === "color" || field === "size") {
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
    e.target.value = null;
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

  const removeUploadedVariantMedia = async (variantIndex, key) => {
    if (!key) return;

    setIsUploading(true);
    try {
      await deleteFiles([key]);
      setFormData((prev) => {
        const newVariants = [...prev.variants];
        const variant = newVariants[variantIndex];
        if (variant) {
          variant.images = variant.images.filter((img) => img.key !== key);
        }
        return { ...prev, variants: newVariants };
      });
      toast.success("Variant media deleted successfully!");
    } catch (error) {
      console.error("Failed to delete variant media:", error);
      toast.error(
        `Failed to delete variant media: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (
      !formData.vendorId ||
      !formData.categoryId ||
      !formData.type ||
      !formData.title ||
      !formData.price
    ) {
      const errorMessage = "Please fill all required fields: Type, Category, Title, and Price.";
      setFormError(errorMessage);
      toast.error(errorMessage);
      return;
    }


    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Media Upload Logic
      let uploadedPortfolio = [...formData.portfolio];
      if (formData.localMediaFiles.length > 0) {
        const uploaded = await uploadFiles(formData.localMediaFiles);
        uploadedPortfolio = [...uploadedPortfolio, ...uploaded];
      }

      let updatedVariants = await Promise.all(
        formData.variants.map(async (variant) => {
          if (variant.localVariantMediaFiles.length > 0) {
            const uploadedImages = await uploadFiles(
              variant.localVariantMediaFiles
            );
            return {
              ...variant,
              images: [...variant.images, ...uploadedImages],
            };
          }
          return variant;
        })
      );
      
      setIsUploading(false);

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        courierCharges: parseFloat(formData.courierCharges) || 0,
        discountRate: parseFloat(formData.discountRate) || 0,
        affiliatecomission: parseFloat(formData.affiliatecomission) || 0,
        portfolio: uploadedPortfolio,
        variants: updatedVariants.map((v) => ({
          color: v.color,
          size: v.size,
          sku: v.sku,
          quantity: parseInt(v.quantity, 10) || 0,
          images: v.images.map((img) => img.url),
        })),
        isBookable: formData.type === "service" ? formData.isBookable : undefined,
      };
      
      await createProductService(payload);

      toast.success("Product/Service created successfully!");
      setFormSuccess("Product/Service created successfully!");

      // Reset form
      setFormData({
        vendorId: session.id,
        categoryId: "",
        type: "",
        title: "",
        description: "",
        price: "",
        courierCharges: "",
        details: "",
        variants: [],
        pincode: "",
        localMediaFiles: [],
        localMediaPreviews: [],
        portfolio: [],
        isBookable: false,
        isInStock: true,
        discountRate: "",
        affiliatecomission: "",
      });
      setSelectedLevel1("");
      setSelectedLevel2("");
      setSelectedLevel3("");
    } catch (apiError) {
      console.error("Error creating product:", apiError);
      const errorMessage = `Failed to create product: ${
        apiError.response?.data?.message || apiError.message
      }`;
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Cleanup for local media previews
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
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) => ({
        ...variant,
        sku: generateSku(prev.title, variant.color, variant.size),
      })),
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
                  <Label htmlFor="vendorId">Vendor ID</Label>
                  <Input
                    id="vendorId"
                    name="vendorId"
                    value={formData.vendorId}
                    disabled
                    className="h-11 bg-slate-100 text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    onValueChange={handleTypeChange}
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

              {/* === NEW CASCADING CATEGORY SECTION === */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-slate-700">
                    Category
                  </Label>
                  {fetchingCategories && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Level 1 */}
                  <Select
                    onValueChange={handleLevel1Change}
                    value={selectedLevel1}
                    disabled={!formData.type || fetchingCategories}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Level 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {level1Categories.length > 0 ? (
                        level1Categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-slate-500 text-sm">
                          Select a type first.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {/* Level 2 */}
                  <Select
                    onValueChange={handleLevel2Change}
                    value={selectedLevel2}
                    disabled={!selectedLevel1}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Level 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {level2Categories.length > 0 ? (
                        level2Categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-slate-500 text-sm">
                          No sub-categories.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {/* Level 3 */}
                  <Select
                    onValueChange={handleLevel3Change}
                    value={selectedLevel3}
                    disabled={!selectedLevel2}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Level 3" />
                    </SelectTrigger>
                    <SelectContent>
                      {level3Categories.length > 0 ? (
                        level3Categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-slate-500 text-sm">
                          No sub-categories.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {categoryError && (
                  <p className="text-xs text-red-600 pt-1">{categoryError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
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
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Product Details</Label>
                <PortableTextEditor
                  onChange={(val) => {
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      details: val,
                    }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
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
          
         {/* //pricing  varient*/}

         <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing & Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 space-x-2 grid grid-cols-2 md:grid-cols-2">
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
              <div className="space-y-2">
                <Label
                  htmlFor="courierCharges"
                  className="text-sm font-medium text-slate-700"
                >
                  Courier Charge (₹)
                </Label>
                <Input
                  id="courierCharges"
                  name="courierCharges"
                  type="number"
                  value={formData.courierCharges}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="discountRate"
                  className="text-sm font-medium text-slate-700"
                >
                  Discount Rate(%)
                </Label>
                <Input
                  id="discountRate"
                  name="discountRate"
                  type="number"
                  value={formData.discountRate}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-11"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <TooltipProvider delayDuration={500}>
                  {/* Label Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor="affiliatecomission"
                        className="text-sm font-medium text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        Affiliate Commission (%) <Info className="w-4 h-4 text-muted-foreground" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      sideOffset={8}
                      className="text-xs text-red-500 bg-white border rounded shadow-md w-[250px] sm:w-auto text-wrap"
                    >
                      The % commission given to ShopNShip user if they resale the products.
                    </TooltipContent>
                  </Tooltip>

                  {/* Input Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="affiliatecomission"
                        name="affiliatecomission"
                        type="number"
                        value={formData.affiliatecomission}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="h-11"
                        max="100"
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      sideOffset={8}
                      className="text-xs text-red-500 bg-white border rounded shadow-md w-[250px] sm:w-auto text-wrap"
                    >
                      The % commission given to ShopNShip user if they resale the products.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {/* Variant Section */}
              {formData.type === "product" && (
                <div className="space-y-4 col-span-2">
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
                      className="border p-3 rounded-md bg-slate-50 relative col-span-2"
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
                            placeholder="One Size At a Time (S or M)"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor={`sku-${index}`}>
                            SKU (Auto-generated)
                          </Label>
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
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Local
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                              {/* Uploaded Variant Images */}
                              {variant.images.map((img, i) => (
                                <div
                                  key={`variant-uploaded-${index}-${img.key || i
                                    }`}
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