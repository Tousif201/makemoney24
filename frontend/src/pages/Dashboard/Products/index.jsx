import { Plus, MoreHorizontal, Eye, Edit, Package, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, // Import AlertDialog
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "../../../context/SessionContext";
import {
  getProductServices,
  deleteProductService,
} from "../../../../api/vendor"; // Assuming deleteProductService is also in this file

export default function ProductsPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // State for dialog visibility
  const [productToDeleteId, setProductToDeleteId] = useState(null); // State for ID of product to delete

  const vendorId = session?.id; // Safely access session.id

  // Function to fetch products
  const fetchProducts = async () => {
    if (!vendorId) {
      if (!sessionLoading) {
        setError("Vendor ID not available. Please log in.");
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProductServices({ vendorId });
      setProducts(fetchedProducts.data);
    } catch (err) {
      console.error("Failed to fetch products:", err.message);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading) {
      fetchProducts();
    }
  }, [vendorId, sessionLoading]); // Re-run when vendorId or sessionLoading changes

  const handleAddClick = () => {
    navigate("/dashboard/products/create");
  };

  // Handler for when the delete button is clicked
  const handleDeleteClick = (productId) => {
    setProductToDeleteId(productId);
    setShowDeleteDialog(true);
  };

  // Handler for confirming the delete action
  const confirmDelete = async () => {
    if (!productToDeleteId) return;

    try {
      setLoading(true); // Show loading while deleting
      await deleteProductService(productToDeleteId);
      await fetchProducts(); // Re-fetch products to update the list
      console.log(`Product ${productToDeleteId} deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Failed to delete product. Please try again.");
    } finally {
      setShowDeleteDialog(false); // Close dialog
      setProductToDeleteId(null); // Reset ID
      setLoading(false); // Hide loading
    }
  };

  // Helper function to determine badge variant based on stock status
  const getStockStatusBadge = (isInStock, variants) => {
    if (isInStock === false) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }

    if (variants && variants.length > 0) {
      const totalQuantity = variants.reduce(
        (sum, variant) => sum + (variant.quantity || 0),
        0
      );
      if (totalQuantity === 0) {
        return <Badge variant="destructive">Out of Stock</Badge>;
      } else if (totalQuantity < 10) {
        return <Badge variant="secondary">Low Stock</Badge>;
      }
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading session...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-8 mx-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Products & Services
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          onClick={handleAddClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your products, pricing, and stock levels
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No products or services found for this vendor.
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block sm:hidden">
                <div className="space-y-4 p-4">
                  {products.map((product) => (
                    <div
                      key={product._id} // Use _id from MongoDB
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {product.type === "product" ? "Product" : "Service"}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() =>
                                navigate(
                                  `/dashboard/products/edit/${product._id}`
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600"
                              onSelect={() => handleDeleteClick(product._id)} // Call handleDeleteClick
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <span className="ml-1 font-medium">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Stock:</span>
                          <span className="ml-1 font-medium">
                            {product.type === "product" &&
                            product.variants?.length > 0
                              ? product.variants.reduce(
                                  (sum, variant) =>
                                    sum + (variant.quantity || 0),
                                  0
                                )
                              : product.isInStock
                              ? "Available"
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          {getStockStatusBadge(
                            product.isInStock,
                            product.variants
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          {product.title}
                        </TableCell>
                        <TableCell>
                          {product.type === "product" ? "Product" : "Service"}
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          {product.type === "product" &&
                          product.variants?.length > 0
                            ? product.variants.reduce(
                                (sum, variant) => sum + (variant.quantity || 0),
                                0
                              )
                            : product.isInStock
                            ? "Available"
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {getStockStatusBadge(
                            product.isInStock,
                            product.variants
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() =>
                                  navigate(
                                    `/dashboard/products/edit/${product._id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={() => handleDeleteClick(product._id)} // Call handleDeleteClick
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              product/service and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
