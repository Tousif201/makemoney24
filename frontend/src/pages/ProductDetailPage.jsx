import { useEffect, useState } from "react";
// Assuming you are using react-router-dom to get the ID from the URL
import { useParams } from "react-router-dom"; // <--- Import useParams
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // For toasts

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  MapPin,
  Clock,
  Shield,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { getProductServiceById } from "../../api/productService"; // Correct import for your API function

export default function ProductDetailPage() {
  // Get the product ID from the URL parameters
  const { productId } = useParams();

  const [product, setProduct] = useState(null); // State to store the fetched product
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addItem } = useCart();

  useEffect(() => {
    // If productId is not available (e.g., direct access without ID in URL), handle it
    if (!productId) {
      setLoading(false);
      setError("No product ID provided in the URL.");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        const { data } = await getProductServiceById(productId); // Use the actual productId from URL
        setProduct(data);
        console.log(data);

        // Reset selected variant/image/quantity when a new product is loaded
        setSelectedVariantIndex(0);
        setQuantity(1);
        setSelectedImageIndex(0);
      } catch (err) {
        console.error("Error fetching product details:", err);
        // Handle specific error types if needed (e.g., 404, 400)
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (err.response.status === 404) {
            setError("Product or Service not found.");
          } else if (err.response.status === 400) {
            setError("Invalid product ID format.");
          } else {
            setError(
              err.response.data.message || "An unexpected error occurred."
            );
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError("Network error. Please check your internet connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError("Error setting up the request: " + err.message);
        }
        setProduct(null); // Ensure product is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]); // Re-run effect if productId changes
  console.log(product);
  // Handlers
  const handleAddToCart = () => {
    if (!product) {
      toast.error("Cannot add to cart: Product data not available.");
      return;
    }

    const currentVariant = product.variants?.[selectedVariantIndex]; // Use optional chaining

    // Check if a product variant is required and selected
    if (
      product.type === "product" &&
      product.variants &&
      product.variants.length > 0 &&
      !currentVariant
    ) {
      toast.error("Please select a variant.");
      return;
    }
    // Check stock for products
    if (
      product.type === "product" &&
      currentVariant &&
      quantity > currentVariant.quantity
    ) {
      toast.error(
        `Not enough stock. Only ${currentVariant.quantity} items available.`
      );
      return;
    }
    // Check if the product itself is in stock (for products without variants, or general check)
    if (
      product.type === "product" &&
      !product.isInStock &&
      (!currentVariant || currentVariant.quantity <= 0)
    ) {
      toast.error("This product is currently out of stock.");
      return;
    }

    // Prepare item for cart
    const itemToAdd = {
      id: `${product._id}`, // More robust unique ID
      productId: product._id,
      productServiceId: productId,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      // Prioritize selected portfolio image, then variant image, then fallback
      image:
        product.portfolio?.[selectedImageIndex]?.url ||
        currentVariant?.images?.[0] ||
        "/placeholder.svg",
      vendor: product.vendorId || "Unknown Vendor", // Use optional chaining
      type: product.type,
      variant: currentVariant
        ? {
            color: currentVariant.color,
            size: currentVariant.size,
            sku: currentVariant.sku,
          }
        : undefined,
    };

    addItem(itemToAdd);

    toast.success("Item Added Successfully", {
      description: `${itemToAdd.title} ${itemToAdd.variant?.color || ""} ${
        itemToAdd.variant?.size || ""
      } added to cart!`,
      duration: 3000,
      icon: "🛒",
      style: {
        borderRadius: "10px",
        background: "#e0ffe0",
        color: "#1a1a1a",
      },
    });
  };

  // --- Conditional Rendering for Loading/Error/Not Found ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <p className="text-xl text-gray-700">Loading product details...</p>
          {/* You can add a spinner here */}
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto mt-4"
            viewBox="0 0 24 24"
          ></svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4 bg-white rounded-lg shadow-md max-w-md">
          <p className="text-xl text-red-600 font-semibold mb-4">Error:</p>
          <p className="text-gray-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // If product is null after loading, it means it was not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4 bg-white rounded-lg shadow-md max-w-md">
          <p className="text-xl text-gray-700 font-semibold mb-4">
            Product Not Found
          </p>
          <p className="text-gray-600">
            The product or service you are looking for does not exist or has
            been removed.
          </p>
          {/* Replaced Link with Button for consistency, assuming no Next.js Link */}
          <Button onClick={() => window.history.back()} className="mt-6 mr-2">
            Go Back
          </Button>
          <Button onClick={() => (window.location.href = "/")} className="mt-6">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // --- Render Product Details (only if product is loaded and not null) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={
                  product.portfolio?.[selectedImageIndex]?.url ||
                  product.variants?.[selectedVariantIndex]?.images?.[0]?.url || // Access .url for variant images
                  "/placeholder.svg" // Final fallback
                }
                alt={product.title}
                className="object-cover w-full h-full"
              />
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </div>
                )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {/* Ensure portfolio and variant images are properly mapped and unique */}
              {[
                ...(product.portfolio || []),
                ...(product.variants?.[selectedVariantIndex]?.images || []),
              ]
                .filter(
                  (item, index, self) =>
                    // Ensure item and item.url exist and filter out duplicates by URL
                    item &&
                    item.url &&
                    self.findIndex((t) => t.url === item.url) === index
                )
                .map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                      selectedImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={item.url || "/placeholder.svg"}
                      alt={`Product thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {product.categoryId?.name || "Uncategorized"}
                </Badge>
                <Badge variant="secondary">{product.type}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating || 0} ({product.reviews || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        Save ₹
                        {(
                          product.originalPrice - product.price
                        ).toLocaleString()}
                      </Badge>
                    </>
                  )}
              </div>
            </div>

            {/* Variants (Only for products with variants) */}
            {product.type === "product" &&
              product.variants &&
              product.variants.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Color</h3>
                    <div className="flex gap-3">
                      {product.variants.map((variant, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVariantIndex(index)}
                          className={`px-4 py-2 border rounded-lg ${
                            selectedVariantIndex === index
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          {variant.color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Quantity</h3>
                    <Select
                      value={quantity.toString()}
                      onValueChange={(value) =>
                        setQuantity(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          ...Array(
                            Math.min(
                              10, // Max quantity selectable from dropdown
                              product.variants[selectedVariantIndex]
                                ?.quantity || 1 // Or available stock
                            )
                          ),
                        ].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.variants[selectedVariantIndex]?.quantity} items
                      available
                    </p>
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={
                    product.type === "product" &&
                    product.variants &&
                    product.variants.length > 0 &&
                    product.variants[selectedVariantIndex]?.quantity <= 0
                  }
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
              <Button size="lg" variant="outline" className="w-full">
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {product.rating || 0}
                      </div>
                      <div className="flex items-center justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.reviews || 0} reviews
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {/* Placeholder for real reviews */}
                    {product.reviews > 0 ? (
                      [1, 2, 3].map(
                        (
                          review // Replace with actual product.reviews.map
                        ) => (
                          <div key={review} className="border-b pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                              <span className="font-medium">John Doe</span>
                              <span className="text-sm text-gray-500">
                                2 days ago
                              </span>
                            </div>
                            <p className="text-gray-700">
                              Excellent chair! Very comfortable for long working
                              hours. The leather quality is premium and the
                              adjustability is perfect.
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-gray-600">
                        No reviews yet for this product.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
