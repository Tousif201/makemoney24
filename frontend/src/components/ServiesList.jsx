import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProductServices } from "../../api/productService"; // Ensure this path is correct
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { Skeleton } from "@/components/ui/skeleton"; // Import Shadcn Skeleton

const ServiesList = () => {
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
          type: "service",
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
      <section className="bg-white py-0 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="md:text-4xl text-3xl font-extrabold text-gray-900 text-center mb-12">
            Featured Services
          </h2>
          <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {/* Skeleton Loader for 8 product cards */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg shadow-md overflow-hidden p-4 flex flex-col items-center"
              >
                <Skeleton className="w-full aspect-video rounded-md mb-4" />{" "}
                {/* Image skeleton */}
                <Skeleton className="h-6 w-3/4 rounded-md mb-2" />{" "}
                {/* Title skeleton */}
                <Skeleton className="h-4 w-full rounded-md mb-2" />{" "}
                {/* Description line 1 skeleton */}
                <Skeleton className="h-4 w-5/6 rounded-md mb-4" />{" "}
                {/* Description line 2 skeleton */}
                <Skeleton className="h-8 w-1/2 rounded-md" />{" "}
                {/* Price/Button skeleton */}
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
        <h2 className="md:text-4xl text-3xl font-extrabold text-gray-900 mb-4">
          Featured Services
        </h2>
        <p className="text-lg text-gray-600">
          No services available at the moment. Please check back soon!
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white  sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h2 className="md:text-4xl text-3xl font-extrabold text-gray-900 text-center mb-12">
          Featured Services
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
      </div>
    </section>
  );
};

export default ServiesList;
