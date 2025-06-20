// components/ProductList/ProductGrid.jsx
import React from "react";
import ProductCard from "../ProductCard"; // Adjust import path if needed
import { Skeleton } from "@/components/ui/skeleton";

const ProductGrid = ({ products, loading, hasMore, lastProductElementRef, currentPage }) => {
  if (products.length === 0 && !loading && currentPage === 1) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">
          No items match your current filters. Try adjusting them!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            ref={products.length === index + 1 ? lastProductElementRef : null}
            key={product._id}
            product={{
              id: product._id,
              title: product.title,
              description: product.description,
              price: product.price,
              discountRate: product.discountRate,
              type: product.type,
              image:
                product.portfolio?.length > 0
                  ? product.portfolio[0].url
                  : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
            }}
          />
        ))}
      </div>

      {/* Loading indicator for infinite scroll */}
      {loading && currentPage > 1 && (
        <div className="mt-8 flex justify-center">
          <p className="text-indigo-600 font-medium">Loading more items...</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="mt-12 text-center text-gray-500">
          You've reached the end!
        </div>
      )}
    </>
  );
};

export default ProductGrid;
