// src/components/ProductDetailPage/ProductMediaGallery.jsx
import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PlayCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  // useCarousel, // Removed useCarousel hook
} from "@/components/ui/carousel";
import SmartMedia from "./SmartMedia";

export default function ProductMediaGallery({
  currentProductImages,
  discountRate,
  openMediaViewer,
  productTitle,
}) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Carousel
          // Removed: setApi={setApi}
          className="w-full h-full"
          opts={{
            align: "start",
            loop: true, // Optional: loop the carousel
          }}
        >
          <CarouselContent className="w-full h-full">
            {currentProductImages.map((item, index) => (
              <CarouselItem key={index} className="w-full h-full">
                <div className="relative w-full h-full">
                  <SmartMedia
                    src={typeof item === "string" ? item : item.url}
                    alt={`${productTitle} ${index + 1}`}
                    onClick={() =>
                      openMediaViewer(
                        typeof item === "string" ? item : item.url,
                        "media" // use 'media' since type is abstracted now
                      )
                    }
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {currentProductImages.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-300 z-10" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-8 h-8 md:w-10 md:h-10 border border-gray-300 z-10" />
            </>
          )}
        </Carousel>

        {(() => {
          const rate = Number(discountRate); // Explicit type conversion

          return rate > 0 && rate <= 100 ? (
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-1 rounded-full shadow-md">
                {Math.round(rate)}% OFF
              </Badge>
            </div>
          ) : null;
        })()}
      </motion.div>
    </div>
  );
}
