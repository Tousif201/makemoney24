import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  Wrench,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"; // Added ImageIcon

// Import the new API functions
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesFlat,
} from "../../../../api/categories"; // Adjust this path to your api.js file

// Import AlertDialog components for delete confirmation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import file upload/delete functions
import { deleteFiles, uploadFiles } from "../../../../api/upload"; // Ensure this path is correct

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "product",
    parentId: null,
    // imageUrl: "", // We'll manage this through selectedFile/uploadedImageUrl
  });

  // State for image upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedImageKey, setUploadedImageKey] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Memoize fetchCategories to prevent unnecessary re-creations and re-fetches
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCategoriesFlat();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Helper functions remain largely the same, operating on the flat 'categories' state
  const buildCategoryTree = (parentId) => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryLevel = (category) => {
    if (!category.parentId) return 1;
    const parent = categories.find((cat) => cat._id === category.parentId);
    if (!parent) return 1;
    return getCategoryLevel(parent) + 1;
  };

  const getChildrenCount = (categoryId) => {
    return categories.filter((cat) => cat.parentId === categoryId).length;
  };

  const handleAddCategory = (parentId = null) => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      type: "product",
      parentId: parentId,
    });
    setSelectedFile(null); // Clear selected file
    setUploadedImageUrl(""); // Clear any previously uploaded URL
    setUploadedImageKey(""); // Clear any previously uploaded key
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      type: category.type,
      parentId: category.parentId,
    });
    setSelectedFile(null); // Clear selected file for edit, as existing image is shown
    setUploadedImageUrl(category.image?.url || ""); // Set existing image URL
    setUploadedImageKey(category.image?.key || ""); // Set existing image key
    setIsDialogOpen(true);
  };

  // Function to open delete confirmation dialog
  const confirmDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsConfirmingDelete(true);
  };

  // Function to handle confirmed delete action
  const handleDeleteConfirmed = async () => {
    setIsConfirmingDelete(false);
    if (!categoryToDelete) return;

    setLoading(true);
    setError(null);
    try {
      // First, try to delete the associated image if it exists
      if (categoryToDelete.image?.key) {
        await deleteFiles([categoryToDelete.image.key]);
      }
      // Then, delete the category
      await deleteCategory(categoryToDelete._id);
      await fetchCategories();
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // Remove current image (either newly selected or existing)
  const handleRemoveImage = async () => {
    if (uploadedImageKey) {
      setUploadingImage(true);
      try {
        await deleteFiles([uploadedImageKey]);
        setUploadedImageUrl("");
        setUploadedImageKey("");
        setSelectedFile(null); // Clear selected file if it was replacing an existing one
        // If editing, also clear image from selectedCategory to reflect removal
        if (selectedCategory) {
          setSelectedCategory((prev) => ({
            ...prev,
            image: { url: "", key: "" },
          }));
        }
      } catch (err) {
        console.error("Failed to delete image:", err);
        setError("Failed to delete image. Please try again.");
      } finally {
        setUploadingImage(false);
      }
    } else {
      setUploadedImageUrl("");
      setUploadedImageKey("");
      setSelectedFile(null);
    }
  };

  // Handles both creating and updating categories
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadingImage(true); // Indicate image upload is part of the process

    let newImageUrl = uploadedImageUrl;
    let newImageKey = uploadedImageKey;
    let oldImageKeyToDelete = selectedCategory?.image?.key || ""; // Keep track of original key for deletion if new image is uploaded

    try {
      // 1. Upload new file if selected
      if (selectedFile) {
        const formDataForUpload = new FormData();
        formDataForUpload.append("files", selectedFile);
        const uploaded = await uploadFiles(formDataForUpload); // uploadFiles expects FormData
        if (uploaded && uploaded.length > 0) {
          newImageUrl = uploaded[0].url;
          newImageKey = uploaded[0].key;
        }
      } else if (!uploadedImageUrl && uploadedImageKey) {
        // Case: Image was removed by user, and it was an existing image
        await deleteFiles([uploadedImageKey]);
        newImageUrl = "";
        newImageKey = "";
      }

      // 2. Prepare payload for category creation/update
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        parentId: formData.parentId,
        image: {
          url: newImageUrl,
          key: newImageKey,
        },
      };

      // 3. Perform category creation/update
      if (selectedCategory) {
        // If a new file was uploaded AND there was an old image, delete the old image
        if (
          selectedFile &&
          oldImageKeyToDelete &&
          oldImageKeyToDelete !== newImageKey
        ) {
          await deleteFiles([oldImageKeyToDelete]);
        }
        await updateCategory(selectedCategory._id, payload);
      } else {
        await createCategory(payload);
      }

      setIsDialogOpen(false);
      await fetchCategories(); // Refresh list after successful operation
    } catch (err) {
      console.error("Error submitting category form:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save category. Please check your inputs."
      );
    } finally {
      setLoading(false);
      setUploadingImage(false); // Reset image upload status
    }
  };

  const getParentOptions = () => {
    if (!categories) return [];

    const potentialParents = categories.filter((cat) => {
      if (selectedCategory && cat._id === selectedCategory._id) {
        return false;
      }

      if (selectedCategory) {
        let current = cat;
        while (current && current.parentId) {
          if (current.parentId === selectedCategory._id) {
            return false;
          }
          current = categories.find((c) => c._id === current.parentId);
        }
      }

      return getCategoryLevel(cat) < 3;
    });

    return potentialParents.sort((a, b) => {
      if (a.type === "service" && b.type === "product") return -1;
      if (a.type === "product" && b.type === "service") return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const renderCategoryTree = (parentId, level = 0) => {
    const childCategories = buildCategoryTree(parentId);

    return childCategories.map((category) => {
      const hasChildren = getChildrenCount(category._id) > 0;
      const isExpanded = expandedCategories.has(category._id);
      const categoryLevel = getCategoryLevel(category);

      return (
        <div key={category._id} className="border-l-2 border-gray-200">
          <div
            className={`flex items-center gap-2 p-3 hover:bg-purple-50 transition-colors duration-200 ${
              level > 0 ? "ml-6" : ""
            }`}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-100"
                onClick={() => toggleExpanded(category._id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}

            <div className="flex items-center gap-2 flex-1">
              <img
                src={category.image?.url || "/placeholder.svg"}
                alt={category.name}
                className="w-8 h-8 rounded object-cover"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge
                    className={
                      category.type === "product"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }
                  >
                    {category.type === "product" ? (
                      <Package className="w-3 h-3 mr-1" />
                    ) : (
                      <Wrench className="w-3 h-3 mr-1" />
                    )}
                    {category.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-purple-600 border-purple-300"
                  >
                    Level {categoryLevel}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {category.description}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-purple-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditCategory(category)}
                    className="hover:bg-purple-50 focus:bg-purple-50"
                  >
                    <Edit className="h-4 w-4 mr-2 text-purple-600" />
                    Edit
                  </DropdownMenuItem>
                  {categoryLevel < 3 && (
                    <DropdownMenuItem
                      onClick={() => handleAddCategory(category._id)}
                      className="hover:bg-purple-50 focus:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-2 text-purple-600" />
                      Add Subcategory
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => confirmDeleteCategory(category)}
                    className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-6">
              {renderCategoryTree(category._id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-purple-600" />
        <p className="text-lg text-purple-700">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl text-center text-red-600">
        <p className="text-lg">Error: {error}</p>
        <Button
          onClick={fetchCategories}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">
            Category Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your product and service categories with up to 3 levels of
            hierarchy
          </p>
        </div>
        <Button
          onClick={() => handleAddCategory(null)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Top-Level Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Statistics Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Top Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.filter((cat) => !cat.parentId).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Product Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.filter((cat) => cat.type === "product").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Service Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.filter((cat) => cat.type === "service").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Tree */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-purple-800">
              Category Hierarchy
            </CardTitle>
            <CardDescription>
              Manage your categories in a hierarchical structure. Click the
              arrows to expand/collapse categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 && !loading && !error ? (
              <p className="text-center text-gray-500">
                No categories found. Start by adding one!
              </p>
            ) : (
              <div className="space-y-1">{renderCategoryTree(null)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-purple-800">
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update the category details below."
                : "Create a new category. You can nest up to 3 levels deep."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Category description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentId: value === "none" ? null : value,
                  }))
                }
                disabled={
                  selectedCategory && getCategoryLevel(selectedCategory) === 3
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {getParentOptions().map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {"  ".repeat(getCategoryLevel(cat) - 1)}
                      {cat.name} (Level {getCategoryLevel(cat)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && getCategoryLevel(selectedCategory) === 3 && (
                <p className="text-sm text-red-500">
                  This category is already at Level 3 and cannot have children.
                </p>
              )}
            </div>

            {/* --- Image Upload Section --- */}
            <div className="space-y-2">
              <Label htmlFor="categoryImage">Category Image</Label>
              <Input
                id="categoryImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
              />
              {/* Display currently selected/uploaded image */}
              {(selectedFile || uploadedImageUrl) && (
                <div className="flex items-center gap-2 mt-2">
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Selected preview"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    uploadedImageUrl && (
                      <img
                        src={uploadedImageUrl}
                        alt="Existing image"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )
                  )}
                  <div className="flex-1 text-sm text-gray-600 truncate">
                    {selectedFile
                      ? selectedFile.name
                      : uploadedImageUrl.split("/").pop()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {uploadingImage && (
                <p className="text-sm text-gray-500 flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-600" />{" "}
                  Uploading image...
                </p>
              )}
            </div>
            {/* --- End Image Upload Section --- */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {(loading || uploadingImage) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedCategory ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category
              <span className="font-bold"> {categoryToDelete?.name} </span>.
              Please ensure it has no subcategories or associated
              products/services, as the backend will prevent deletion otherwise.
              {categoryToDelete?.image?.key && (
                <p className="mt-2 text-sm text-red-500">
                  Note: The associated image will also be deleted.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
