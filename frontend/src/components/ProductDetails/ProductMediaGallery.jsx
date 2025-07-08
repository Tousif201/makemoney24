import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import useEmblaCarousel from "embla-carousel-react";
import SmartMedia from "./SmartMedia";

const DotButton = ({ selected, onClick }) => (
  <button
    className={`w-2 h-2 rounded-full ${
      selected ? "bg-orange-500" : "bg-gray-300"
    }`}
    onClick={onClick}
  />
);

const ProductMediaGallery = ({
  currentProductImages,
  discountRate,
  openMediaViewer,
  productTitle,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {currentProductImages.map((item, index) => (
              <div className="relative flex-[0_0_100%]" key={index}>
                <SmartMedia
                  src={typeof item === "string" ? item : item.url}
                  alt={`${productTitle} ${index + 1}`}
                  onClick={() =>
                    openMediaViewer(
                      typeof item === "string" ? item : item.url,
                      "image"
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {(() => {
          const rate = Number(discountRate);
          return rate > 0 && rate <= 100 ? (
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-1 rounded-full shadow-md">
                {Math.round(rate)}% OFF
              </Badge>
            </div>
          ) : null;
        })()}

       
      </motion.div>

      <div className="flex justify-center mt-2 space-x-2">
          {currentProductImages.map((_, index) => (
            <DotButton
              key={index}
              selected={index === selectedIndex}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
    </div>
  );
};

export default ProductMediaGallery;
