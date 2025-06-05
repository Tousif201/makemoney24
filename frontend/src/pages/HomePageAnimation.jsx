import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllBanners } from "../../api/banner";

const HomePageAnimation = () => {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
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

        // --- MODIFIED LOGIC HERE ---
        const totalBanners = validBanners.length;
        const halfLength = Math.ceil(totalBanners / 2); // Same logic as LandingSlider
        const animationBanners = validBanners.slice(halfLength); // Slice from halfLength to the end

        if (animationBanners.length === 0) {
          throw new Error(
            "No banners for animation available in the second half."
          );
        }
        // --- END MODIFIED LOGIC ---

        setBanners(animationBanners);
      } catch (err) {
        console.error("Error fetching animation banners:", err);
        setError(
          "Failed to load homepage banners or no banners available for animation."
        );
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    // Only set up interval if banners are loaded
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % banners.length);
      }, 3000); // Adjust interval time as needed (e.g., 3000ms = 3 seconds)
      return () => clearInterval(interval);
    }
  }, [banners]); // Dependency on banners ensures effect runs when banners state is updated

  const handleRedirect = (url) => {
    if (url) {
      window.location.href = url;
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg m-4">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  // Show a loading state or nothing if banners are still being fetched and not yet error
  if (banners.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 md:min-h-[35rem] w-full bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-t-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-700">Loading animated banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full md:min-h-[35rem] overflow-hidden rounded-lg">
      <AnimatePresence>
        {banners.length > 0 && ( // Ensure banners array is not empty before rendering
          <motion.img
            key={activeIndex}
            src={banners[activeIndex].image.url}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer" // Used inset-0 for full coverage
            alt={`Animated Slide ${activeIndex + 1}`} // Alt text adjusted
            onClick={() => handleRedirect(banners[activeIndex].redirectTo)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePageAnimation;
