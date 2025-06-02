import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  UserCircle, // For displaying user profile in reviews
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { getProductServiceById } from "../../api/productService";
import LeaveReviewForm from "../components/LeaveReviewForm";

export default function ProductDetailPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addItem } = useCart();

  // Encapsulate fetch logic in useCallback to make it stable
  const fetchProductDetails = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      setError("No product ID provided in the URL.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await getProductServiceById(productId);
      setProduct(data);
      console.log("Fetched product data with reviews:", data); // Log the full data

      setSelectedVariantIndex(0);
      setQuantity(1);
      setSelectedImageIndex(0);
    } catch (err) {
      console.error("Error fetching product details:", err);
      if (err.response) {
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
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Error setting up the request: " + err.message);
      }
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]); // productId is the only dependency

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]); // Depend on the memoized fetch function

  const handleAddToCart = () => {
    if (!product) {
      toast.error("Cannot add to cart: Product data not available.");
      return;
    }

    const currentVariant = product.variants?.[selectedVariantIndex];

    if (
      product.type === "product" &&
      product.variants &&
      product.variants.length > 0 &&
      !currentVariant
    ) {
      toast.error("Please select a variant.");
      return;
    }
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
    if (
      product.type === "product" &&
      !product.isInStock &&
      (!currentVariant || currentVariant.quantity <= 0)
    ) {
      toast.error("This product is currently out of stock.");
      return;
    }

    const itemToAdd = {
      id: `${product._id}`,
      productId: product._id,
      productServiceId: productId,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      image:
        product.portfolio?.[selectedImageIndex]?.url ||
        currentVariant?.images?.[0]?.url ||
        "/placeholder.svg",
      vendor: product.vendorId?.name || "Unknown Vendor", // Access vendor name if populated
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

  // Calculate average rating if needed (though backend can provide it)
  const averageRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : (product.rating || 0).toFixed(1); // Use backend rating if no reviews or fallback

  const totalReviewsCount = product.reviews ? product.reviews.length : 0;

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
                  product.variants?.[selectedVariantIndex]?.images?.[0]?.url ||
                  "/placeholder.svg"
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
              {[
                ...(product.portfolio || []),
                ...(product.variants?.[selectedVariantIndex]?.images || []),
              ]
                .filter(
                  (item, index, self) =>
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
                        i < Math.floor(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {averageRating} ({totalReviewsCount} reviews)
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
                              10,
                              product.variants[selectedVariantIndex]
                                ?.quantity || 1
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
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {" "}
                {/* Adjusted grid-cols */}
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({totalReviewsCount})
                </TabsTrigger>
                {/* Add other tabs if you have them, e.g., "Shipping", "Vendor Info" */}
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
                  {/* Overall Review Summary */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{averageRating}</div>
                      <div className="flex items-center justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {totalReviewsCount} reviews
                      </div>
                    </div>
                    {/* Could add rating breakdown bars here (e.g., 5-star, 4-star, etc.) */}
                  </div>
                  <Separator />

                  {/* Leave a Review Section */}
                  <LeaveReviewForm
                    productId={productId}
                    itemType={product.type}
                    onReviewSubmitted={fetchProductDetails} // Pass the fetch function to re-fetch reviews
                  />
                  <Separator />

                  {/* Individual Reviews List */}
                  <h3 className="text-xl font-semibold mb-4">
                    Customer Reviews
                  </h3>
                  <div className="space-y-6">
                    {totalReviewsCount > 0 ? (
                      product.reviews
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        ) // Sort newest first
                        .map((review) => (
                          <div
                            key={review._id}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {review.userId?.avatar ? ( // Display user avatar if available
                                <img
                                  src={review.userId.avatar}
                                  alt={review.userId.username || "User"}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <UserCircle className="h-8 w-8 text-gray-400" /> // Fallback icon
                              )}
                              <span className="font-medium">
                                {review.userId?.username || "Anonymous User"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {" "}
                                &bull;{" "}
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                            {review.media && review.media.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {review.media.map((mediaItem, idx) => (
                                  <img
                                    key={idx}
                                    src={mediaItem.url}
                                    alt={`Review media ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-md"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-600">
                        No reviews yet for this product. Be the first to leave
                        one!
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
