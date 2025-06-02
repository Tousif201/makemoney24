// components/ProductList.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProductServices } from "../../api/productService"; // Make sure this path is correct

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Fetch products and services.
        // We can now send parameters for sorting or limiting,
        // for example, to get the latest 6 products ordered by creation date.
        const params = {
          limit: 6, // Request only 6 items
          sortBy: "createdAt", // Sort by creation date
          order: "desc", // Get the newest first
          page: 1, // Ensure we get the first page
        };

        const response = await getProductServices(params);

        // *** Crucial Update: Access response.data instead of response directly ***
        if (response && response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          // Log a warning if the data structure is unexpected
          console.warn("API response data is not an array or is missing 'data' property:", response);
          setProducts([]); // Ensure products is an empty array if data is malformed
          // You might set an error here if this is a critical issue
          // setError("Unexpected data format from the server.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        // Access nested error message if available, otherwise use a generic message
        setError(err.response?.data?.message || "Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading products...</p> {/* Consider using a more visually engaging spinner */}
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
        {/* Map over the fetched products directly; no need for .slice(0, 6)
            because the backend is already limiting the results to 6. */}
        {products.map((product) => (
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
                     : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png", // Placeholder if no image
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
