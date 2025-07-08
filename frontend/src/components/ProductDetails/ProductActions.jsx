import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2, ShoppingCart, Facebook, Twitter, Linkedin, Link } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

export default function ProductActions({
  product,
  selectedVariant,
  quantity,
  handleAddToCart,
  isSharePopoverOpen,
  setIsSharePopoverOpen,
  currentProductUrl,
  shareTitle,
  shareText,
  shareDescription,
  copyToClipboard,
  shareOnFacebook,
  shareOnTwitter,
  shareOnWhatsapp,
  shareOnLinkedIn,
  itemVariants,
}) {
  const navigate = useNavigate(); // Initialize useNavigate

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

  const handleBuyNow = () => {
    // Add logic to handle the buy now action, e.g., add to cart and navigate to checkout
    handleAddToCart();
    navigate('/checkout', { state: { product, selectedVariant, quantity } });
  };

  return (
    <motion.div className="space-y-4" variants={itemVariants}>
      <div className="flex gap-4">
        <Button
          size="lg"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 text-base py-3 rounded-lg"
          onClick={handleAddToCart}
          disabled={
            (product.type === "product" &&
              product.variants &&
              product.variants.length > 0 &&
              (!selectedVariant || selectedVariant?.quantity <= 0)) ||
            (!product.isInStock &&
              (!selectedVariant || selectedVariant.quantity <= 0))
          }
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>

        <Button
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200 text-base py-3 rounded-lg"
          onClick={handleBuyNow}
          disabled={
            (product.type === "product" &&
              product.variants &&
              product.variants.length > 0 &&
              (!selectedVariant || selectedVariant?.quantity <= 0)) ||
            (!product.isInStock &&
              (!selectedVariant || selectedVariant.quantity <= 0))
          }
          whileTap={{ scale: 0.95 }}
        >
          Buy Now
        </Button>

        {/* Share Button with Popover */}
        <Popover open={isSharePopoverOpen} onOpenChange={setIsSharePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              className="w-10 h-10 p-0 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg"
              onClick={() => {
                if (navigator.share) {
                  handleShare();
                } else {
                  setIsSharePopoverOpen(true);
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="grid gap-2">
              <Button
                variant="ghost"
                className="justify-start gap-3 w-full text-left"
                onClick={shareOnFacebook}
              >
                <Facebook className="h-5 w-5 text-blue-600" /> Share on Facebook
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-3 w-full text-left"
                onClick={shareOnTwitter}
              >
                <Twitter className="h-5 w-5 text-blue-400" /> Share on Twitter
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-3 w-full text-left"
                onClick={shareOnWhatsapp}
              >
                Share on WhatsApp
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-3 w-full text-left"
                onClick={shareOnLinkedIn}
              >
                <Linkedin className="h-5 w-5 text-blue-700" /> Share on LinkedIn
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-3 w-full text-left"
                onClick={copyToClipboard}
              >
                <Link className="h-5 w-5 text-gray-500" /> Copy Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
}
