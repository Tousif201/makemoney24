import React, { useEffect, useState } from "react";

// Import Shadcn Carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Adjust path as per your setup

// Import Shadcn Skeleton component
import { Skeleton } from "@/components/ui/skeleton"; // <<<--- Import Skeleton

import { getAllBanners } from "../../api/banner";
import AutoplayPlugin from "embla-carousel-autoplay";

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
          bannerData = response;
        }

        const validBanners = bannerData.filter((banner) => banner.image?.url);

        if (validBanners.length === 0) {
          throw new Error("No valid banners available.");
        }

        const halfLength = Math.ceil(validBanners.length / 2);
        setBanners(validBanners.slice(0, halfLength));
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError(
          "No banners available or failed to load. Please try again later."
        );
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
    return (
      <div className="flex flex-col gap-4 max-w-full">
        <div className="w-full overflow-hidden rounded-lg">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {/* Skeleton Loader Items using shadcn/ui Skeleton */}
              {Array.from({ length: 3 }).map((_, index) => ( // Adjust length as needed
                <CarouselItem key={index} className="pl-4 basis-full">
                  <div className="p-1">
                    <Skeleton className="w-full aspect-video md:aspect-[16/6] rounded-lg" /> {/* <<<--- Using Shadcn Skeleton */}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center bg-gray-50 rounded-lg shadow-lg my-8">
        <p className="text-lg text-gray-600">
          No banners available to display.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-full">
      <div className="w-full overflow-hidden rounded-lg">
        <Carousel
          plugins={[
            AutoplayPlugin({
              delay: 3000,
              stopOnInteraction: false,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {banners.map((banner, index) => (
              <CarouselItem
                key={banner._id || index}
                className="pl-4 basis-full"
                onClick={() => handleBannerClick(banner.redirectTo)}
              >
                <div className="p-1">
                  <div className="w-full aspect-video md:aspect-[16/6] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-gray-100">
                    <img
                      src={banner.image.url}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full  object-cover md:object-cover sm:object-cover"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default LandingSlider;
