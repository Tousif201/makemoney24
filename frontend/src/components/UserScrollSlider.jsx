import React, { useState, useEffect } from 'react';
// No longer need to import individual brand images if we're fetching dynamically
// import brand1 from "../assets/slider/userscroll1.jpg";
// import brand2 from "../assets/slider/bag.jpg";
// ... (remove other brand imports)

import { getAllCategoriesWithImages } from '../../api/categories'; // Ensure this path is correct

const UserScrollSlider = () => {
  // State to store the fetched categories data
  const [categories, setCategories] = useState([]);
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const fetchedCategories = await getAllCategoriesWithImages();
        // Map the fetched data to match the structure expected by your component
        const formattedCategories = fetchedCategories.map(cat => ({
          img: cat.imageUrl || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png', // Use a placeholder if imageUrl is null
          name: cat.categoryName,
        }));
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Failed to fetch categories with images:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false after fetch attemptu
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this effect runs once after the initial render

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

  // If no categories are found after loading
  if (categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>No categories found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden w-full py-4">
      {/* Duplicate the array to create a continuous scroll effect */}
      <div className="flex animate-scroll w-max">
        {[...categories, ...categories].map((item, idx) => (
          <div
            key={idx} // Using index as key is generally okay for static lists or lists where items don't change order/get added/removed frequently
            className="w-32 h-40 flex flex-col items-center justify-start mx-2 shrink-0"
          >
            <img
              src={item.img}
              alt={item.name}
              className="w-28 h-28 object-cover rounded-full"
              onError={(e) => {
                // Fallback for broken images
                e.target.onerror = null;
                e.target.src = 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';
              }}
            />
            <p className="text-center text-sm mt-2">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserScrollSlider;
