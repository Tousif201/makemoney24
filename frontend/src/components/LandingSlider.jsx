import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";

import { getAllBanners } from "../../api/banner";

const LandingSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
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
          throw new Error("Invalid response structure");
        }

        const validBanners = bannerData.filter(
          (banner) => banner.image?.url
        );

        if (validBanners.length === 0) {
          throw new Error("No valid banners available.");
        }

        setBanners(validBanners.slice(0, 3)); // Only use the first 3
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("No banners available or failed to load. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleBannerClick = (url) => {
    if (url) {
      window.location.href = url;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
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
          {banners.map((banner, index) => (
            <SwiperSlide
              key={banner._id || index}
              className="!w-auto cursor-pointer"
              onClick={() => handleBannerClick(banner.redirectTo)}
            >
              <img
                src={banner.image.url}
                alt={`Slide ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default LandingSlider;
