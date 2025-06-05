import React, { useEffect, useState } from "react";
// Import Shadcn Carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Adjust path if necessary, depends on your shadcn setup

// Import your API
import { getAllBanners } from "../../api/banner";

// For autoplay, we'll use Embla Carousel's API
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
          // If response is not an array, assume it's directly the array of banners
          // This handles cases where the API might return the array directly or inside a 'data' field.
          bannerData = response;
        }

        const validBanners = bannerData.filter((banner) => banner.image?.url);

        if (validBanners.length === 0) {
          throw new Error("No valid banners available.");
        }

        // --- MODIFIED LOGIC HERE ---
        // Calculate half the number of valid banners
        const halfLength = Math.ceil(validBanners.length / 2);
        // Slice the array to get exactly half of the banners
        setBanners(validBanners.slice(0, halfLength));
        // --- END MODIFIED LOGIC ---

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
  }, []); // Empty dependency array means this runs once on mount

  const handleBannerClick = (url) => {
    if (url) {
      window.location.href = url;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-t-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-700">Loading banners...</p>
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
            // No specific breakpoints needed here for `opts` as `basis-full` handles single slide
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {" "}
            {/* Adjusted spacing for single item */}
            {banners.map((banner, index) => (
              <CarouselItem
                key={banner._id || index}
                // ALWAYS basis-full for single slide view
                className="pl-4 basis-full" // `pl-4` creates spacing around the item, effectively -ml-4 on content creates the space
                onClick={() => handleBannerClick(banner.redirectTo)}
              >
                <div className="p-1">
                  {" "}
                  {/* Small padding around the item content */}
                  <div className="w-full aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <img
                      src={banner.image.url}
                      alt={`Slide ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Navigation arrows are still available if you want to allow manual navigation */}
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default LandingSlider;
