import React, { useState, useEffect } from "react";
import { getAllCategoriesWithImages } from "../../api/categories";
import { Link } from "react-router-dom";

const UserScrollSlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await getAllCategoriesWithImages();
        const formattedCategories = fetchedCategories.map((cat) => ({
          _id: cat._id, // <--- Add this line to include _id
          img:
            cat.imageUrl ||
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>No categories found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden w-full py-4">
      <div className="flex animate-scroll hover:animate-none w-max">
        {[...categories, ...categories].map((item, idx) => (
          <Link
            to={`/browse?categories=${item._id}`} // _id is now available here
            key={idx}
            className="w-32 h-40 flex flex-col items-center justify-start mx-2 shrink-0"
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
