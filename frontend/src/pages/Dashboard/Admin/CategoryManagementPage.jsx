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
} from "lucide-react";

// Import the new API functions
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesFlat,
} from "../../../../api/categories";

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
}
from "@/components/ui/alert-dialog";

// Import file upload/delete functions
import { deleteFiles, uploadFiles } from "../../../../api/upload";

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
    setSelectedFile(null);
    setUploadedImageUrl("");
    setUploadedImageKey("");
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
    setSelectedFile(null);
    setUploadedImageUrl(category.image?.url || "");
    setUploadedImageKey(category.image?.key || "");
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
        setSelectedFile(null);
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
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError(null);
    setUploadingImage(true);

    let newImageUrl = uploadedImageUrl;
    let newImageKey = uploadedImageKey;
    let oldImageKeyToDelete = selectedCategory?.image?.key || "";

    try {
      // 1. Upload new file if selected
      if (selectedFile) {
        const formDataForUpload = new FormData();
        formDataForUpload.append("files", selectedFile);
        const uploaded = await uploadFiles(formDataForUpload);
        if (uploaded && uploaded.length > 0) {
          newImageUrl = uploaded[0].url;
          newImageKey = uploaded[0].key;
        }
      } else if (!uploadedImageUrl && uploadedImageKey) {
        // If no new file is selected, but there was an existing image and it's now removed
        // (i.e., uploadedImageUrl is empty but uploadedImageKey existed before submit)
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
        // If editing, and a new image was uploaded replacing an old one, delete the old one
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
      await fetchCategories();
    } catch (err) {
      console.error("Error submitting category form:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save category. Please check your inputs."
      );
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const getParentOptions = () => {
    if (!categories) return [];

    const potentialParents = categories.filter((cat) => {
      // Cannot be its own parent
      if (selectedCategory && cat._id === selectedCategory._id) {
        return false;
      }

      // Prevent circular hierarchy by not allowing a category to be a parent of its own descendant
      if (selectedCategory) {
        let current = cat;
        while (current && current.parentId) {
          if (current.parentId === selectedCategory._id) {
            return false;
          }
          current = categories.find((c) => c._id === current.parentId);
        }
      }

      // Only allow parents up to level 2 if current category would be level 3
      return getCategoryLevel(cat) < 3;
    });

    return potentialParents.sort((a, b) => {
      // Sort by type, then by name
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
        <div key={category._id} className="relative">
          <div
            className={`
              flex items-center gap-2 p-2 hover:bg-purple-50 transition-colors duration-200 
              border-b border-gray-100 last:border-b-0
            `}
            style={{
              paddingLeft: `${Math.max(8, level * 12 + 8)}px`,
            }}
          >
            {/* Hierarchy indicator line */}
            {level > 0 && (
              <div
                className="absolute left-0 top-0 w-px bg-gray-200 h-full"
                style={{
                  left: `${level * 12 - 4}px`,
                }}
              />
            )}

            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-purple-600 hover:bg-purple-100 flex-shrink-0 rounded"
                onClick={() => toggleExpanded(category._id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <div className="w-5 flex-shrink-0" />
            )}

            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
              <img
                src={category.image?.url || "/placeholder.svg"}
                alt={category.name}
                className="w-6 h-6 rounded object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate flex-1">
                      {category.name}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge
                        className={`
                          text-xs py-0 px-1.5 h-5
                          ${category.type === "product"
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }
                        `}
                      >
                        {category.type === "product" ? (
                          <Package className="w-2.5 h-2.5 mr-1" />
                        ) : (
                          <Wrench className="w-2.5 h-2.5 mr-1" />
                        )}
                        <span className="hidden sm:inline">{category.type}</span>
                        <span className="sm:hidden">{category.type.charAt(0).toUpperCase()}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs text-purple-600 border-purple-300 py-0 px-1.5 h-5"
                      >
                        L{categoryLevel}
                      </Badge>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-600 line-clamp-1 pr-8">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-purple-100 h-7 w-7 p-0 flex-shrink-0 rounded"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => handleEditCategory(category)}
                    className="hover:bg-purple-50 focus:bg-purple-50 text-sm"
                  >
                    <Edit className="h-3.5 w-3.5 mr-2 text-purple-600" />
                    Edit
                  </DropdownMenuItem>
                  {categoryLevel < 3 && (
                    <DropdownMenuItem
                      onClick={() => handleAddCategory(category._id)}
                      className="hover:bg-purple-50 focus:bg-purple-50 text-sm"
                    >
                      <Plus className="h-3.5 w-3.5 mr-2 text-purple-600" />
                      Add Sub
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => confirmDeleteCategory(category)}
                    className="text-red-600 hover:bg-red-50 focus:bg-red-50 text-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="relative">
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
      <div className="container mx-auto p-4 max-w-6xl flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-lg text-purple-700 mt-2">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl text-center text-red-600 min-h-screen flex flex-col justify-center">
        <p className="text-lg mb-4">Error: {error}</p>
        <Button
          onClick={fetchCategories}
          className="mx-auto bg-purple-600 hover:bg-purple-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-6xl">
      <div className="flex flex-col gap-4 mb-6">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-800">
            Category Management
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Manage your product and service categories with up to 3 levels of
            hierarchy
          </p>
        </div>
        <Button
          onClick={() => handleAddCategory(null)}
          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto sm:self-end text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Top-Level Category
        </Button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border border-gray-200">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-purple-700">
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-purple-700">
                Top Level
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {categories.filter((cat) => !cat.parentId).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-purple-700">
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {categories.filter((cat) => cat.type === "product").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs font-medium text-purple-700">
                Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {categories.filter((cat) => cat.type === "service").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Tree */}
        <Card className="w-full border border-gray-200">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-purple-800 text-base sm:text-lg lg:text-xl">
              Category Hierarchy
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage your categories in a hierarchical structure. Click the
              arrows to expand/collapse categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {categories.length === 0 && !loading && !error ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                No categories found. Start by adding one!
              </p>
            ) : (
              <div className="border-t border-gray-100">
                {renderCategoryTree(null)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-800 text-lg">
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedCategory
                ? "Update the category details below."
                : "Create a new category. You can nest up to 3 levels deep."}
            </DialogDescription>
          </DialogHeader>

          {/* Wrap the form content inside a <form> tag */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Category name"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description</Label>
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
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent" className="text-sm">Parent Category</Label>
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
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {getParentOptions().map((cat) => (
                    <SelectItem key={cat._id} value={cat._id} className="text-sm">
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

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="categoryImage" className="text-sm">Category Image</Label>
              <Input
                id="categoryImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
                className="text-sm"
              />
              {(selectedFile || uploadedImageUrl) && (
                <div className="flex items-center gap-2 mt-2">
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Selected preview"
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    uploadedImageUrl && (
                      <img
                        src={uploadedImageUrl}
                        alt="Existing image"
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                      />
                    )
                  )}
                  <div className="flex-1 text-sm text-gray-600 truncate min-w-0">
                    {selectedFile
                      ? selectedFile.name
                      : uploadedImageUrl.split("/").pop()}
                  </div>
                  <Button
                    type="button" // Important: set type="button" to prevent this from submitting the form
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 flex-shrink-0"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {uploadingImage && (
                <p className="text-sm text-gray-500 flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-600" />
                  Uploading image...
                </p>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit" // This button will now correctly submit the form
                disabled={loading || uploadingImage}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
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
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the
              category
              <span className="font-bold"> {categoryToDelete?.name} </span>.
              Please ensure it has no subcategories or associated
              products/services, as the backend will prevent deletion otherwise.
              {categoryToDelete?.image?.key && (
                <span className="block mt-2 text-sm text-red-500">
                  Note: The associated image will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
            <AlertDialogCancel
              onClick={() => setIsConfirmingDelete(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
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