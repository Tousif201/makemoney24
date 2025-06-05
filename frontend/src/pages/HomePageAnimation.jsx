import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllBanners } from "../../api/banner";
import { Skeleton } from "@/components/ui/skeleton"; // Import Shadcn Skeleton

const HomePageAnimation = () => {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getAllBanners();
        let bannerData = [];

        if (response?.data && Array.isArray(response.data)) {
          bannerData = response.data;
        } else if (Array.isArray(response)) {
          bannerData = response;
        } else {
          throw new Error("Unexpected response format");
        }

        const validBanners = bannerData.filter((b) => b.image?.url);

        const totalBanners = validBanners.length;
        const halfLength = Math.ceil(totalBanners / 2);
        const animationBanners = validBanners.slice(halfLength);

        if (animationBanners.length === 0) {
          throw new Error(
            "No banners for animation available in the second half."
          );
        }

        setBanners(animationBanners);
      } catch (err) {
        console.error("Error fetching animation banners:", err);
        setError(
          "Failed to load homepage banners or no banners available for animation."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (!loading && banners.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % banners.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [banners, loading]);

  const handleRedirect = (url) => {
    if (url) {
      window.location.href = url;
    }
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-[20rem] md:min-h-[35rem] overflow-hidden rounded-lg">
        <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg m-4">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 min-h-[20rem] md:min-h-[35rem] w-full bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-700">No animated banners to display.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[20rem] md:min-h-[35rem] overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        {banners.length > 0 && (
          <motion.img
            key={activeIndex}
            src={banners[activeIndex].image.url}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-contain sm:object-cover cursor-pointer"
            alt={`Animated Slide ${activeIndex + 1}`}
            onClick={() => handleRedirect(banners[activeIndex].redirectTo)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePageAnimation;
