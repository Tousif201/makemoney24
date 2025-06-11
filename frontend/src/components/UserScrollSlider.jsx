import React, { useState, useEffect, useRef } from "react";
import { getAllCategoriesWithImages } from "../../api/categories"; // Ensure this API function fetches the 'image' object
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton"; // Import Shadcn Skeleton

const UserScrollSlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Assuming getAllCategoriesWithImages now returns categories with an 'image' object {url, key}
        const fetchedCategories = await getAllCategoriesWithImages();

        const formattedCategories = fetchedCategories.map((cat) => ({
          _id: cat._id,
          // Access the image URL safely using optional chaining
          img:
            cat.image?.url ||
            "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
          name: cat.name, // Assuming the category name is now 'name' instead of 'categoryName' based on your previous controller
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
      // Check if the user has reached the end
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
      // Append the same categories again for infinite scrolling
      // Make sure to create truly unique _id for React's key prop
      const newCategories = categories.map((cat, index) => ({
        ...cat,
        _id: `${cat._id}-copy-${Date.now()}-${index}`, // Ensure unique _id for React rendering
      }));
      setCategories((prevCategories) => [...prevCategories, ...newCategories]);
    }
  };

  if (loading) {
    return (
      <div className="scroll-container">
        <div className="flex w-max px-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="w-32 h-40 flex flex-col items-center justify-start mx-2 shrink-0"
            >
              <Skeleton className="w-28 h-28 rounded-full" />
              <Skeleton className="w-20 h-4 mt-2 rounded-md" />
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
      className="scroll-container"
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      <div className="scroll-content">
        {categories.map((item) => (
          <Link
            to={`/browse?categories=${item._id}`}
            key={item._id}
            className="scroll-item"
          >
            <img
              src={item.img}
              alt={item.name}
              className="w-28 h-28 object-cover rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
              }}
            />
            <p className="text-center text-sm mt-2">{item.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserScrollSlider;
