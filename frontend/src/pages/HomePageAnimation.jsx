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
        const animationBanners = validBanners.slice(3, 6); // 4th to 6th

        if (animationBanners.length === 0) {
          throw new Error("No animation banners available.");
        }

        setBanners(animationBanners);
      } catch (err) {
        console.error("Error fetching animation banners:", err);
        setError("Failed to load homepage banners.");
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleRedirect = (url) => {
    if (url) {
      window.location.href = url;
    }
  };

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="relative w-full md:min-h-[35rem]  overflow-hidden rounded-lg">
      <AnimatePresence>
        {banners.length > 0 && (
          <motion.img
            key={activeIndex}
            src={banners[activeIndex].image.url}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute w-full h-full object-cover cursor-pointer"
            alt={`Slide ${activeIndex + 4}`}
            onClick={() => handleRedirect(banners[activeIndex].redirectTo)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePageAnimation;
