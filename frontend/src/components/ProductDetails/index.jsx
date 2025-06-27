// src/components/ProductDetailPage/index.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "../../context/SessionContext";
import { getProductServiceById } from "../../../api/productService";
import { useCart } from "../../context/CartContext";
import NoProduct from "./NoProduct";
import DetailsError from "./DetailsError";
import DetailsLoading from "./DetailsLoading";

// Import the new sub-components
import ProductMediaGallery from "./ProductMediaGallery";
import ProductInfo from "./ProductInfo";
import ProductVariantSelection from "./ProductVariantSelection";
import ProductActions from "./ProductActions";
import ProductTabs from "./ProductTabs";
import MediaViewerModal from "./MediaViewerModal"; // New component for the modal
import { Link } from "react-router-dom";

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

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { session } = useSession(); // Although not directly used in this snippet, keeping it for context
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState({ url: "", type: "" });
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const { addItem } = useCart();

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

      if (
        data.type === "product" &&
        data.variants &&
        data.variants.length > 0
      ) {
        setSelectedColor(data.variants[0].color);
        setSelectedSize(data.variants[0].size);
      } else {
        setSelectedColor(null);
        setSelectedSize(null);
      }
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
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  useEffect(() => {
    if (product && product.type === "product" && product.variants) {
      if (selectedColor && selectedSize) {
        const foundVariant = product.variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        );
        setSelectedVariant(foundVariant || null);
      } else if (selectedColor) {
        const variantWithColor = product.variants.find(
          (v) => v.color === selectedColor
        );
        setSelectedVariant(variantWithColor || null);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [selectedColor, selectedSize, product]);

  useEffect(() => {
    if (
      selectedVariant ||
      (product && product.portfolio && product.portfolio.length > 0)
    ) {
      setSelectedImageIndex(0);
    }
  }, [selectedVariant, product]);

  const handleAddToCart = () => {
    if (!product) {
      toast.error("Cannot add to cart: Product data not available.");
      return;
    }

    if (
      product.type === "product" &&
      product.variants &&
      product.variants.length > 0 &&
      !selectedVariant
    ) {
      toast.error("Please select both color and size.");
      return;
    }
    if (
      product.type === "product" &&
      selectedVariant &&
      quantity > selectedVariant.quantity
    ) {
      toast.error(
        `Not enough stock. Only ${selectedVariant.quantity} items available.`
      );
      return;
    }
    if (
      product.type === "product" &&
      !product.isInStock &&
      (!selectedVariant || selectedVariant.quantity <= 0)
    ) {
      toast.error("This product is currently out of stock.");
      return;
    }

    let finalPrice = product.price;
    let originalPriceForCart = product.price;

    if (
      product.discountRate &&
      product.discountRate > 0 &&
      product.discountRate <= 100
    ) {
      const discountAmount = (product.price * product.discountRate) / 100;
      finalPrice = product.price - discountAmount;
    }

    const itemToAdd = {
      id: `${product._id}-${selectedVariant?._id || "default"}`,
      productId: product._id,
      productServiceId: productId,
      title: product.title,
      price: finalPrice,
      originalPrice: originalPriceForCart,
      quantity: quantity,
      image:
        selectedVariant?.images?.[0] ||
        product.portfolio?.[selectedImageIndex]?.url ||
        "/placeholder.svg",
      vendor: product.vendorId || "Unknown Vendor",
      type: product.type,
      variant: selectedVariant
        ? {
            color: selectedVariant.color,
            size: selectedVariant.size,
            sku: selectedVariant.sku,
            variantId: selectedVariant._id,
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

  const openMediaViewer = (url, type) => {
    setCurrentMedia({ url, type });
    setIsMediaViewerOpen(true);
  };

  const closeMediaViewer = () => {
    setIsMediaViewerOpen(false);
    setCurrentMedia({ url: "", type: "" });
  };

  const currentProductUrl = `${"https://makemoney24hrs.com"}/products/${productId}`;
  const shareTitle = `Check out this ${
    product?.type || "item"
  } on [Your App Name]!`;
  const shareText = product?.title
    ? `Discover "${product.title}" - `
    : "Discover this amazing item!";
  const shareDescription =
    product?.description || "Find great products and services here!";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentProductUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          toast.error("Failed to share.");
        }
      }
    } else {
      setIsSharePopoverOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentProductUrl);
      toast.success("Link copied to clipboard!");
      setIsSharePopoverOpen(false);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link.");
    }
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentProductUrl
      )}&quote=${encodeURIComponent(shareText + (product?.title || ""))}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentProductUrl
      )}&text=${encodeURIComponent(shareText + (product?.title || ""))}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareOnWhatsapp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText + (product?.title || "") + " " + currentProductUrl
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        currentProductUrl
      )}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(
        shareDescription
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const availableColors = product?.variants
    ? Array.from(
        new Map(
          product.variants.map((v) => [
            v.color,
            { color: v.color, image: v.images?.[0] || "/placeholder.svg" },
          ])
        ).values()
      )
    : [];
  const availableSizes = product?.variants
    ? [
        ...new Set(
          product.variants
            .filter((v) => v.color === selectedColor)
            .map((v) => v.size)
        ),
      ]
    : [];

  const currentProductImages =
    product?.type === "product" &&
    selectedVariant &&
    selectedVariant.images?.length > 0
      ? selectedVariant.images
      : (product?.portfolio || []).map((item) => item.url);

  if (loading) {
    return <DetailsLoading />;
  }

  if (error) {
    return <DetailsError />;
  }

  if (!product) {
    return <NoProduct />;
  }

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : (product.rating || 0).toFixed(1);

  const totalReviewsCount = product.reviews ? product.reviews.length : 0;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto px-4 py-5 lg:py-5">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-6"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Product Images */}
          <motion.div className="" variants={itemVariants}>
            <ProductMediaGallery
              currentProductImages={currentProductImages}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              discountRate={product.discountRate}
              openMediaViewer={openMediaViewer}
              productTitle={product.title}
            />
          </motion.div>

          {/* Product Details */}
          <motion.div
            className="md:space-y-8 space-y-4"
            variants={itemVariants}
          >
            <ProductInfo
              product={product}
              averageRating={averageRating}
              totalReviewsCount={totalReviewsCount}
            />

            {/* Variants (Only for products with variants) */}
            {product.type === "product" &&
              product.variants &&
              product.variants.length > 0 && (
                <ProductVariantSelection
                  product={product}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  selectedVariant={selectedVariant}
                  availableColors={availableColors}
                  availableSizes={availableSizes}
                  itemVariants={itemVariants} // Pass Framer Motion variants
                />
              )}

            {/* Action Buttons */}
            <ProductActions
              product={product}
              selectedVariant={selectedVariant}
              quantity={quantity}
              handleAddToCart={handleAddToCart}
              isSharePopoverOpen={isSharePopoverOpen}
              setIsSharePopoverOpen={setIsSharePopoverOpen}
              currentProductUrl={currentProductUrl}
              shareTitle={shareTitle}
              shareText={shareText}
              shareDescription={shareDescription}
              copyToClipboard={copyToClipboard}
              shareOnFacebook={shareOnFacebook}
              shareOnTwitter={shareOnTwitter}
              shareOnWhatsapp={shareOnWhatsapp}
              shareOnLinkedIn={shareOnLinkedIn}
              itemVariants={itemVariants} // Pass Framer Motion variants
            />

            {product.details && (
              <div className="border  mr-15 border-amber-300 rounded-md py-2  font-bold text-sm text-center bg-amber-100 text-amber-900 shadow-lg animate-glow hover:shadow-amber-500/60 transition-all duration-300">
              <Link to="/Return" className="hover:text-yellow-500">
                🔁 Click to view Exchange policy
              </Link>
            </div>
            
            )}
          </motion.div>
        </motion.div>
        <ProductTabs
          product={product}
          productId={productId}
          fetchProductDetails={fetchProductDetails}
          averageRating={averageRating}
          totalReviewsCount={totalReviewsCount}
          openMediaViewer={openMediaViewer}
        />
      </div>

      {/* Media Viewer Modal */}
      <MediaViewerModal
        isOpen={isMediaViewerOpen}
        currentMedia={currentMedia}
        onClose={closeMediaViewer}
      />
    </motion.div>
  );
}
