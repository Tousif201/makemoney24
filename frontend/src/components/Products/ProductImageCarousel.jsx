import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

const ProductImageCarousel = ({
  product,
  currentProductImages,
  selectedImageIndex,
  setSelectedImageIndex,
  itemVariants
}) => {
  return (
    <motion.div variants={itemVariants}>
      {/* Main Image Display */}
      <motion.div
        className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <img
          src={currentProductImages[selectedImageIndex]?.url || currentProductImages[selectedImageIndex] || "/placeholder.svg"}
          alt={product.title}
          className="w-full h-full object-contain bg-white"
        />

        {/* Discount Badge */}
        {product.discountRate && product.discountRate > 0 && product.discountRate <= 100 && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-1 rounded-full shadow-md">
              {Math.round(product.discountRate)}% OFF
            </Badge>
          </div>
        )}
      </motion.div>

      {/* Thumbnails Carousel */}
      <div className="mt-5">
        <Carousel
          opts={{ align: "start" }}
          className="w-full max-w-4xl"
        >
          <CarouselContent className="gap-4">
            {currentProductImages.map((item, index) => (
              <CarouselItem
                key={index}
                className="basis-1/5 md:basis-1/6 lg:basis-1/8"
                onClick={() => setSelectedImageIndex(index)}
              >
                <button
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedImageIndex === index
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                >
                  {typeof item === "string" ? (
                    <img
                      src={item || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  ) : item.type === "video" ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors duration-200">
                        <PlayCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  )}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </motion.div>
  );
};

export default ProductImageCarousel;
