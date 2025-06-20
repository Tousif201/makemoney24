import React, { useState, useEffect, useRef } from "react";
import { getAllCategoriesWithImages } from "../../api/categories";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryScrollSlider = ({type}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await getAllCategoriesWithImages(type);
        const formattedCategories = fetchedCategories.map((cat) => ({
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
  }, []);

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
    return (
      <div className="overflow-x-auto py-4 px-2 no-scrollbar">
        <div className="flex w-max gap-2 sm:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="w-20 h-28 sm:w-32 sm:h-40 flex flex-col items-center justify-start shrink-0"
            >
              <Skeleton className="w-16 h-16 sm:w-28 sm:h-28 rounded-full" />
              <Skeleton className="w-14 h-3 sm:w-20 sm:h-4 mt-1 sm:mt-2 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-red-500 bg-red-50 rounded-lg m-4">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-gray-50 rounded-lg shadow-lg my-8">
        <p className="text-lg text-gray-600">No categories found.</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto px-2 py-4 no-scrollbar"
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      <div className="flex gap-2 sm:gap-4 w-max">
        {categories.map((item) => {
          const isEmiCategory = item.name.toLowerCase().includes("emi");
          return (
            <Link
              to={`/browse?categories=${item._id}`}
              key={item._id}
              className={`flex flex-col items-center justify-start shrink-0 w-20 sm:w-32 relative ${
                isEmiCategory
                  ? "border-2 border-amber-500 shadow-lg scale-105 transition-all duration-300 ease-in-out z-10 rounded-xl p-2 bg-amber-50"
                  : ""
              }`}
              style={isEmiCategory ? { transform: "scale(1.05)" } : {}}
            >
              <img
                src={item.img}
                alt={item.name}
                className={`w-16 h-16 sm:w-28 sm:h-28 object-cover rounded-full ${
                  isEmiCategory ? "border-2 border-amber-400" : ""
                }`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
                }}
              />
              <p
                className={`text-center text-xs sm:text-sm mt-1 sm:mt-2 px-1 leading-tight ${
                  isEmiCategory ? "text-amber-700 font-bold" : ""
                }`}
              >
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
  );
};

export default CategoryScrollSlider;
