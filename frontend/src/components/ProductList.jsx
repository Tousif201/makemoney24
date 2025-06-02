// components/ProductList.jsx
import React, { useEffect, useState } from "react"; // Import useEffect and useState
import ProductCard from "./ProductCard";
// Make sure this path is correct based on where you saved productService.js
import { getProductServices } from "../../api/productService";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Fetch products and services. You can add filters if needed, e.g., { type: "product" }
        // For now, let's fetch all and limit to 6.
        const response = await getProductServices();
        
        // Ensure response.data is an array before setting
        if (response && Array.isArray(response)) {
          setProducts(response);
        } else {
          console.warn("API response is not an array:", response);
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading products...</p> {/* You can replace this with a spinner */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // If no products are found after loading
  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <h2 className="text-3xl font-bold mb-10">Latest Products</h2>
        <p className="text-gray-600">No products or services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-10">Latest Products</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Map over the fetched products and slice to get only the first 6 */}
        {products.slice(0, 6).map((product) => (
          <ProductCard
            key={product._id} // Use product._id from MongoDB for unique key
            product={{
              id: product._id,
              title: product.title,
              description: product.description,
              price: product.price,
              // Check if portfolio has items, and get the first image URL
              // Assuming portfolio items have a 'url' property for the image
              image: product.portfolio && product.portfolio.length > 0
                     ? product.portfolio[0].url
                     : "https://via.placeholder.com/400x300?text=No+Image", // Placeholder if no image
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
