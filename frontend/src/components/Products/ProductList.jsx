// components/ProductList/ProductList.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";

import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoriesByParentId } from "../../../api/categories";
import { getProductServices } from "../../../api/productService";

// Helper function for debouncing
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter and Sort States
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  // NEW: State for Color and Size filters
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");

  // State for category dropdown
  // Ref to detect if a filter/sort has changed, which requires resetting products
  const isNewSearch = useRef(false);

  // --- Infinite Scroll Observer ---
  const observer = useRef();
  const lastProductElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // --- Unified Data Fetching Effect ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const params = {
        limit: 800, // Fetch smaller, manageable pages
        page: currentPage,
        sortBy: sortBy,
        order: sortOrder,
      };

      if (searchTerm) {
        params.title = searchTerm;
      }

      if (selectedPriceRange !== "all") {
        const [minPrice, maxPrice] = selectedPriceRange.split("-");
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice !== "above") params.maxPrice = maxPrice;
      }
      // NEW: Add color and size to params if not 'all'
      if (selectedColor !== "all") {
        params.color = selectedColor;
      }
      if (selectedSize !== "all") {
        params.size = selectedSize;
      }

      try {
        const response = await getProductServices(params);

        if (response && response.data && Array.isArray(response.data)) {
          setProducts((prevProducts) => {
            if (isNewSearch.current || currentPage === 1) {
              return response.data;
            }
            const newProducts = response.data.filter(
              (newProd) =>
                !prevProducts.some((prevProd) => prevProd._id === newProd._id)
            );
            return [...prevProducts, ...newProducts];
          });

          setHasMore(response.page < response.totalPages);
          isNewSearch.current = false;
        } else {
          setProducts([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    searchTerm,
    selectedPriceRange,
    selectedColor, // NEW: Add to dependencies
    selectedSize, // NEW: Add to dependencies
  ]);

  // --- Handlers now reset the page to 1 on any filter change ---
  const resetSearch = () => {
    isNewSearch.current = true;
    if (currentPage === 1) {
      setProducts([]); // Clear current products immediately for better UX
    } else {
      setCurrentPage(1);
    }
  };

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    resetSearch();
  };

  const [searchInput, setSearchInput] = useState("");
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      resetSearch();
    }, 500),
    []
  );

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSetSearchTerm(value);
  };

  const handlePriceRangeChange = (value) => {
    setSelectedPriceRange(value);
    resetSearch();
  };

  // NEW: Handlers for Color and Size
  const handleColorChange = (value) => {
    setSelectedColor(value);
    resetSearch();
  };

  const handleSizeChange = (value) => {
    setSelectedSize(value);
    resetSearch();
  };

  if (loading && currentPage === 1) {
    // Initial loading skeleton for the whole page
    return (
      <section className="bg-white py-0 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="md:text-4xl text-2xl font-extrabold text-gray-900 text-center mb-12">
            Featured Products & Services
          </h2>
          <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg shadow-md overflow-hidden p-4 flex flex-col items-center"
              >
                <Skeleton className="w-full aspect-video rounded-md mb-4" />
                <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
                <Skeleton className="h-4 w-full rounded-md mb-2" />
                <Skeleton className="h-4 w-5/6 rounded-md mb-4" />
                <Skeleton className="h-8 w-1/2 rounded-md" />
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

  return (
    <section className="bg-white py-0 sm:py-16 md:py-3">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h2 className="md:text-4xl text-2xl font-extrabold text-gray-900 text-center mb-12">
          Featured Products
        </h2>

        {/* Filters and Search Section */}
        <ProductFilters
          searchInput={searchInput}
          handleSearchInputChange={handleSearchInputChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSortChange={handleSortChange}
          selectedPriceRange={selectedPriceRange}
          handlePriceRangeChange={handlePriceRangeChange}
          selectedColor={selectedColor} // NEW: Pass color state
          handleColorChange={handleColorChange} // NEW: Pass color handler
          selectedSize={selectedSize} // NEW: Pass size state
          handleSizeChange={handleSizeChange} // NEW: Pass size handler
        />

        {/* Product Grid Section */}
        <ProductGrid
          products={products}
          loading={loading}
          hasMore={hasMore}
          lastProductElementRef={lastProductElementRef}
          currentPage={currentPage}
        />
      </div>
    </section>
  );
};

export default ProductList;
