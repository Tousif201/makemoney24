import React, { useState, useEffect, useRef } from "react";
import { getAllCategoriesWithImages } from "../../api/categories";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryScrollSlider = ({ type }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  // Define styles based on type
  const isServiceType = type === 'services' || type === 'service';

  const getContainerStyles = () => {
    if (isServiceType) {
      return "overflow-x-auto px-2 py-4 no-scrollbar bg-gradient-to-r from-blue-300 to-purple-200 rounded-lg shadow-sm";
    }
    return "overflow-x-auto px-2 py-4 no-scrollbar";

  };

  const getItemStyles = (item) => {
    const isEmiCategory = item.name.toLowerCase().includes("emi");

    if (isServiceType) {
      // Service-specific styling with permanent background and hover effects
      return `flex flex-col items-center justify-start shrink-0 w-20 sm:w-32 relative transition-all duration-300 bg-white/70 backdrop-blur-sm rounded-xl p-2 shadow-sm hover:shadow-lg hover:scale-105 hover:bg-white/90 border border-white/50 hover:border-purple-200 ${isEmiCategory
          ? "animate-pulse border-amber-500 shadow-lg scale-105 bg-amber-50 hover:bg-amber-100"
          : ""
        }`;
    }

    // Product-specific styling (original)
    return `flex flex-col items-center justify-start shrink-0 w-20 sm:w-32 relative ${isEmiCategory
        ? "animate-pulse border-amber-500 shadow-lg scale-105 transition-all duration-300 ease-in-out z-10 rounded-xl p-2 bg-amber-50"
        : ""
      }`;
  };

  const getImageStyles = (item) => {
    const isEmiCategory = item.name.toLowerCase().includes("emi");

    if (isServiceType) {
      // Service-specific image styling with permanent border and hover effects
      return `md:w-22 md:h-22 w-14 h-14 object-cover rounded-full border-2 transition-all duration-300 shadow-sm hover:shadow-md ${isEmiCategory
          ? "border-amber-400 hover:border-amber-500"
          : "border-blue-200 hover:border-purple-400"
        }`;
    }

    // Product-specific image styling (original)
    return `md:w-22 md:h-22 w-14 h-14 object-cover rounded-full ${isEmiCategory ? "border-2 border-amber-400" : ""
      }`;
  };

  const getTextStyles = (item) => {
    const isEmiCategory = item.name.toLowerCase().includes("emi");

    if (isServiceType) {
      // Service-specific text styling
      return `text-center text-xs sm:text-sm mt-1 sm:mt-2 px-1 leading-tight font-medium ${isEmiCategory
          ? "text-amber-700 font-bold"
          : "text-gray-700 hover:text-purple-600"
        }`;
    }

    // Product-specific text styling (original)
    return `text-center text-xs sm:text-sm mt-1 sm:mt-2 px-1 leading-tight ${isEmiCategory ? "text-amber-700 font-bold" : ""
      }`;
  };

  const getFlexContainerStyles = () => {
    if (isServiceType) {
      return "flex gap-3 md:gap-2 w-max";
    }
    return "flex gap-2 md:gap-1 w-max";
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await getAllCategoriesWithImages(type);
        // Filter categories where parentId is null
        const parentCategories = fetchedCategories.filter(
          (cat) => cat.parentId === null
        );

        const formattedCategories = parentCategories.map((cat) => ({
          _id: cat._id,
          img:
            cat.image?.url ||
            "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
          name: cat.categoryName,
        }));
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Failed to fetch categories with images:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      if (
        scrollContainer.scrollLeft + scrollContainer.clientWidth >=
        scrollContainer.scrollWidth - 5
      ) {
        loadMoreCategories();
      }
    }
  };

  const loadMoreCategories = () => {
    if (categories.length > 0) {
      const newCategories = categories.map((cat, index) => ({
        ...cat,
        _id: `${cat._id}-copy-${Date.now()}-${index}`,
      }));
      setCategories((prev) => [...prev, ...newCategories]);
    }
  };

  if (loading) {
    const skeletonContainerClass = isServiceType
      ? "overflow-x-auto py-4 px-2 no-scrollbar bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg"
      : "overflow-x-auto py-4 px-2 no-scrollbar";

    return (
      <div>
        {isServiceType && (
          <div className="px-4 py-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Services
            </h2>
          </div>
        )}
        <div className={skeletonContainerClass}>
          <div className="flex w-max gap-2 sm:gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="w-20 h-28 sm:w-32 sm:h-40 flex flex-col items-center justify-start shrink-0"
              >

                <Skeleton className={`w-16 h-16 sm:w-28 sm:h-28 rounded-full ${isServiceType ? 'bg-blue-200' : ''}`} />
                <Skeleton className={`w-14 h-3 sm:w-20 sm:h-4 mt-1 sm:mt-2 rounded-md ${isServiceType ? 'bg-blue-200' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {isServiceType && (
          <div className="px-4 py-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Services
            </h2>
          </div>
        )}
        <div className="flex justify-center items-center h-40 text-red-500 bg-red-50 rounded-lg m-4">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div>
        {isServiceType && (
          <div className="px-4 py-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Services
            </h2>
          </div>
        )}
        <div className="flex justify-center items-center h-40 bg-gray-50 rounded-lg shadow-lg my-8">
          <p className="text-lg text-gray-600">No categories found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isServiceType && (
        <div className="px-12 py-2">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2 ">
            Services
          </h2>
        </div>
      )}
      <div
        className={getContainerStyles()}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className={getFlexContainerStyles()}>
          {categories.map((item) => {
            const isEmiCategory = item.name.toLowerCase().includes("emi");
            return (
              <Link
                to={`/category-browse/${item._id}`}
                key={item._id}
                className={getItemStyles(item)}
                style={isEmiCategory ? { transform: "scale(1.05)" } : {}}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className={getImageStyles(item)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
                  }}
                />
                <p className={getTextStyles(item)}>
                  {item.name}
                </p>
                {isEmiCategory && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full font-bold">
                    EMI
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryScrollSlider;