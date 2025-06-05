import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

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
  UserCircle,
  X, // Import X icon for closing modal
  PlayCircle, // For video overlay on thumbnails
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { getProductServiceById } from "../../api/productService";
import LeaveReviewForm from "../components/LeaveReviewForm";
import { useSession } from "../context/SessionContext";

// --- Framer Motion Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const thumbnailVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 300 } },
  active: { borderColor: "var(--blue-500)" }, // Using custom property for active border
};

const reviewItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { session } = useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // New state for media viewer modal
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState({ url: "", type: "" }); // Stores URL and type of media to display

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
      console.log("Fetched product data with reviews:", data);

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
      vendor: product.vendorId || "Unknown Vendor", // Access vendor name if populated
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

  // Function to open the media viewer modal
  const openMediaViewer = (url, type) => {
    setCurrentMedia({ url, type });
    setIsMediaViewerOpen(true);
  };

  // Function to close the media viewer modal
  const closeMediaViewer = () => {
    setIsMediaViewerOpen(false);
    setCurrentMedia({ url: "", type: "" });
  };

  // --- Conditional Rendering for Loading/Error/Not Found ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center p-8 bg-white rounded-xl shadow-xl flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full"
          ></motion.div>
          <p className="text-xl font-semibold text-gray-700">
            Loading product details...
          </p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md w-full flex flex-col items-center gap-4"
        >
          <X className="h-16 w-16 text-red-500 animate-bounce" />
          <p className="text-2xl text-red-600 font-bold mb-2">
            Oops! An Error Occurred
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            Reload Page
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md w-full flex flex-col items-center gap-4"
        >
          <ShoppingCart className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-2xl text-gray-700 font-bold mb-2">
            Product Not Found
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            The product or service you are looking for does not exist or has
            been removed.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
              whileTap={{ scale: 0.95 }}
            >
              Go Back
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200"
              whileTap={{ scale: 0.95 }}
            >
              Go to Home
            </Button>
          </div>
        </motion.div>
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
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {" "}
        {/* Increased padding */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-12"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Product Images */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {" "}
            {/* Increased space-y */}
            <motion.div
              className="relative aspect-square overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg" // Added shadow, more rounded
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <img
                src={
                  product.portfolio?.[selectedImageIndex]?.url ||
                  product.variants?.[selectedVariantIndex]?.images?.[0]?.url ||
                  "/placeholder.svg"
                }
                alt={product.title}
                className="object-contain w-full h-full p-4" // Use object-contain and add padding
              />
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </div>
                )}
            </motion.div>
            <motion.div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-4">
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
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedImageIndex === index
                        ? "border-blue-500 shadow-md"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                    variants={thumbnailVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={item.url || "/placeholder.svg"}
                      alt={`Product thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </motion.button>
                ))}
            </motion.div>
          </motion.div>

          {/* Product Details */}
          <motion.div className="space-y-8" variants={itemVariants}>
            {" "}
            {/* Increased space-y */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-2">
                {" "}
                {/* Increased gap */}
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                >
                  {product.categoryId?.name || "Uncategorized"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-white">
                {" "}
                {/* Larger, bolder title */}
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        // Larger stars
                        i < Math.floor(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                    {averageRating} ({totalReviewsCount} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-4 mb-6">
                {" "}
                {/* Align baseline */}
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {" "}
                  {/* Larger price */}₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-3 py-1 rounded-full">
                        Save ₹
                        {(
                          product.originalPrice - product.price
                        ).toLocaleString()}
                      </Badge>
                    </>
                  )}
              </div>
            </motion.div>
            {/* Variants (Only for products with variants) */}
            {product.type === "product" &&
              product.variants &&
              product.variants.length > 0 && (
                <motion.div className="space-y-6" variants={itemVariants}>
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300">
                      Color
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {" "}
                      {/* Use flex-wrap for responsiveness */}
                      {product.variants.map((variant, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSelectedVariantIndex(index)}
                          className={`px-5 py-2 border rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            selectedVariantIndex === index
                              ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {variant.color}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300">
                      Quantity
                    </h3>
                    <Select
                      value={quantity.toString()}
                      onValueChange={(value) =>
                        setQuantity(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-blue-500">
                        {" "}
                        {/* Wider trigger */}
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        {[
                          ...Array(
                            Math.min(
                              10, // Max quantity to show in dropdown
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {product.variants[selectedVariantIndex]?.quantity} items
                      available
                    </p>
                  </div>
                </motion.div>
              )}
            {/* Action Buttons */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 text-base py-3 rounded-lg"
                  onClick={handleAddToCart}
                  disabled={
                    product.type === "product" &&
                    product.variants &&
                    product.variants.length > 0 &&
                    product.variants[selectedVariantIndex]?.quantity <= 0
                  }
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>

              <Card className="mb-12 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700">
                {" "}
                {/* Added shadow, more rounded */}
                <CardContent className="p-6">
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-2  bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      {" "}
                      {/* Styled TabList */}
                      <TabsTrigger
                        value="description"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-md transition-all duration-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white"
                      >
                        Description
                      </TabsTrigger>
                      <TabsTrigger
                        value="reviews"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-md transition-all duration-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white"
                      >
                        Reviews ({totalReviewsCount})
                      </TabsTrigger>
                      {/* Add other tabs if you have them, e.g., "Shipping", "Vendor Info" */}
                    </TabsList>
                    <TabsContent value="description" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="prose max-w-none dark:prose-invert" // Added prose-invert for dark mode
                      >
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                          {product.description}
                        </p>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-8" // Increased space-y
                      >
                        {/* Overall Review Summary */}
                        <div className="flex items-center gap-8 bg-blue-50 dark:bg-blue-950 p-6 rounded-lg shadow-inner">
                          {" "}
                          {/* Styled summary */}
                          <div className="text-center">
                            <div className="text-4xl font-extrabold text-blue-700 dark:text-blue-200">
                              {averageRating}
                            </div>
                            <div className="flex items-center justify-center mt-1">
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
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {totalReviewsCount} reviews
                            </div>
                          </div>
                          {/* Could add rating breakdown bars here (e.g., 5-star, 4-star, etc.) */}
                          <div className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                            Customer satisfaction is key!
                          </div>
                        </div>
                        <Separator className="bg-gray-200 dark:bg-gray-700" />

                        {/* Leave a Review Section */}
                        <LeaveReviewForm
                          productId={productId}
                          itemType={product.type}
                          onReviewSubmitted={fetchProductDetails} // Pass the fetch function to re-fetch reviews
                        />
                        <Separator className="bg-gray-200 dark:bg-gray-700" />

                        {/* Individual Reviews List */}
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                          Customer Reviews
                        </h3>
                        <div className="space-y-8">
                          {" "}
                          {/* Increased space-y */}
                          {totalReviewsCount > 0 ? (
                            product.reviews
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt) - new Date(a.createdAt)
                              ) // Sort newest first
                              .map((review, index) => (
                                <motion.div
                                  key={review._id}
                                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700" // Styled individual review card
                                  variants={reviewItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  custom={index} // Pass index for staggered animation
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    {review.userId?.avatar ? ( // Display user avatar if available
                                      <img
                                        src={review.userId.avatar}
                                        alt={review.userId.name || "User"}
                                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                                      />
                                    ) : (
                                      <UserCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" /> // Fallback icon
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {review.userId?.name ||
                                          "Anonymous User"}
                                      </span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {" "}
                                        •{" "}
                                        {new Date(
                                          review.createdAt
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex mb-3">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                          i < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base mb-3">
                                    {review.comment}
                                  </p>
                                  {review.media && review.media.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4">
                                      {" "}
                                      {/* Use flex-wrap for responsiveness */}
                                      {review.media.map((mediaItem, idx) => (
                                        <motion.button
                                          key={idx}
                                          onClick={() =>
                                            openMediaViewer(
                                              mediaItem.url,
                                              mediaItem.type
                                            )
                                          }
                                          className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-lg cursor-pointer relative group border border-gray-200 dark:border-gray-700 shadow-sm"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 10,
                                          }}
                                        >
                                          {mediaItem.type === "image" ? (
                                            <img
                                              src={mediaItem.url}
                                              alt={`Review media ${idx + 1}`}
                                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                            />
                                          ) : (
                                            <>
                                              <video
                                                src={mediaItem.url}
                                                className="w-full h-full object-cover"
                                                controls={false}
                                                muted
                                                loop
                                                playsInline
                                                preload="metadata" // Optimize video loading
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-200">
                                                <PlayCircle className="h-8 w-8 text-white" />
                                              </div>
                                            </>
                                          )}
                                        </motion.button>
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              ))
                          ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-lg py-4 text-center">
                              No reviews yet for this product. Be the first to
                              leave one!
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
        {/* Product Details Tabs */}
      </div>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {isMediaViewerOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" // Increased z-index, darker backdrop, blur
            onClick={closeMediaViewer} // Close when clicking outside content
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="relative bg-gray-900 p-2 rounded-xl shadow-2xl max-w-5xl max-h-[90vh] overflow-hidden" // Darker background, larger max-w, more rounded, shadow
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on content
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-white/20 text-white hover:bg-white/40 hover:text-white rounded-full p-2 transition-all duration-200" // More prominent close button
                onClick={closeMediaViewer}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6" />
              </Button>
              {currentMedia.type === "image" ? (
                <img
                  src={currentMedia.url}
                  alt="Enlarged media"
                  className="max-w-full max-h-[85vh] object-contain mx-auto my-auto rounded-lg" // Added rounded-lg
                />
              ) : (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-[85vh] object-contain mx-auto my-auto rounded-lg" // Added rounded-lg
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
