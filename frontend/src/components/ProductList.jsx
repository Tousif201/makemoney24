import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProductServices } from "../../api/productService"; // Ensure this path is correct
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { Skeleton } from "@/components/ui/skeleton"; // Import Shadcn Skeleton

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        const params = {
          limit: 8, // Request up to 8 items for the initial display
          sortBy: "createdAt", // Sort by creation date
          order: "desc", // Get the newest first
          page: 1, // Ensure we get the first page
        };

        const response = await getProductServices(params);

        if (response && response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.warn(
            "API response data is not an array or is missing 'data' property:",
            response
          );
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load products. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="bg-white sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-12">
            Featured Products
          </h2>
          <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {/* Skeleton Loader for 8 product cards */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg shadow-md overflow-hidden p-4 flex flex-col items-center"
              >
                <Skeleton className="w-full aspect-video rounded-md mb-4" /> {/* Image skeleton */}
                <Skeleton className="h-6 w-3/4 rounded-md mb-2" /> {/* Title skeleton */}
                <Skeleton className="h-4 w-full rounded-md mb-2" /> {/* Description line 1 skeleton */}
                <Skeleton className="h-4 w-5/6 rounded-md mb-4" /> {/* Description line 2 skeleton */}
                <Skeleton className="h-8 w-1/2 rounded-md" /> {/* Price/Button skeleton */}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64 bg-red-100 rounded-lg shadow-md p-4 m-4">
        <p className="text-xl font-medium text-red-700">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center bg-gray-50 rounded-lg shadow-lg my-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          Latest Products
        </h2>
        <p className="text-lg text-gray-600">
          No products or services available at the moment. Please check back soon!
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-12">
          Featured Products
        </h2>
        <div className="grid gap-2 sm:gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={{
                id: product._id,
                title: product.title,
                description: product.description,
                price: product.price,
                image:
                  product.portfolio && product.portfolio.length > 0
                    ? product.portfolio[0].url
                    : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png", // Placeholder image
              }}
            />
          ))}
        </div>

        {/* Button to see all products */}
        <div className="mt-12 text-center">
          <Link
            to="/browse"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:px-10 text-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            See All Products
            <svg
              className="ml-3 -mr-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductList;
