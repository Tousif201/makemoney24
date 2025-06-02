import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";

import { getAllBanners } from "../../api/banner"; // Ensure this path is correct

const LandingSlider = () => {
  const [banners, setBanners] = useState([]); // State to store fetched banner objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getAllBanners();
        console.log("Fetched Banners:", response);

        // Assuming response.data contains an array of banner objects,
        // and each banner object has a 'image.url' for the image and 'redirectTo' for navigation.
        if (response && response.data && Array.isArray(response.data)) {
          // Filter out banners that don't have a valid image URL to prevent errors
          const validBanners = response.data.filter(
            (banner) => banner.image && banner.image.url
          );
          setBanners(validBanners);
        } else if (Array.isArray(response)) {
          // Fallback if API directly returns an array (less common)
          const validBanners = response.filter(
            (banner) => banner.image && banner.image.url
          );
          setBanners(validBanners);
        } else {
          console.warn(
            "Unexpected banner API response structure or no 'data' array:",
            response
          );
          setBanners([]);
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Failed to load banners. Please try again later.");
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []); // Empty dependency array means this runs once on mount

  const handleBannerClick = (url) => {
    if (url) {
      // Use window.location.href for simple navigation.
      // If you are using React Router (e.g., react-router-dom),
      // you would use `useNavigate` hook here:
      // const navigate = useNavigate();
      // navigate(url);
      window.location.href = url;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (banners.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No banners available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-auto overflow-hidden rounded-lg">
        <Swiper
          slidesPerView="auto"
          spaceBetween={30}
          loop={true}
          speed={5000}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          className="w-full lg:h-auto sm:h-[70vh] h-[50vh]"
        >
          {banners.map(
            (
              banner,
              index // Iterate over 'banners' array
            ) => (
              <SwiperSlide
                key={banner._id || index} // Use _id for a more stable key if available
                className="!w-auto cursor-pointer" // Add cursor-pointer for visual feedback
                onClick={() => handleBannerClick(banner.redirectTo)} // Add click handler
              >
                <img
                  src={banner.image.url} // Access image URL via banner.image.url
                  className="h-full w-full object-cover"
                  alt={`Slide ${index + 1}`}
                />
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default LandingSlider;
