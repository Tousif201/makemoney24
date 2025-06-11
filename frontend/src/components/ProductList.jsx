import React, { useEffect, useState, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import { getProductServices } from "../../api/productService"; // Ensure this path is correct
import { getCategoriesByParentId } from "../../api/categories"; // Import for category fetching
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton"; // Import Shadcn Skeleton
import { Input } from "@/components/ui/input"; // Assuming you have a Shadcn Input component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming you have Shadcn Select components

const ProductList = () => {
  const [products, setProducts] = useState([]); // Raw products from API
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState(
    []
  ); // Products after client-side filtering/sorting
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // To check if there are more products to load

  // Filter and Sort States
  const [filterType, setFilterType] = useState("all"); // 'all', 'product', 'service'
  const [sortBy, setSortBy] = useState("createdAt"); // 'createdAt', 'price', 'title'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc', 'desc'
  const [searchTerm, setSearchTerm] = useState("");

  // New Category and Price Range Filter States
  const [allCategories, setAllCategories] = useState([]); // Stores all fetched categories for lookup
  const [level2and3Categories, setLevel2and3Categories] = useState([]); // Categories to display in the dropdown
  const [selectedCategory, setSelectedCategory] = useState("all"); // ID of the selected category or "all"
  const [selectedPriceRange, setSelectedPriceRange] = useState("all"); // String like "0-500", "501-1000", "1001-above"

  // Infinite Scroll Observer
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

  // --- API Data Fetching Effect (Infinite Scroll) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          limit: 8, // Fetch 8 items per page
          sortBy: "createdAt", // We'll always fetch by createdAt for consistent pagination
          order: "desc",
          page: currentPage,
        };

        const response = await getProductServices(params);

        if (response && response.data && Array.isArray(response.data)) {
          setProducts((prevProducts) => {
            // Filter out duplicates in case of fast scrolling or API quirks
            const newProducts = response.data.filter(
              (newProd) =>
                !prevProducts.some((prevProd) => prevProd._id === newProd._id)
            );
            return [...prevProducts, ...newProducts];
          });
          setHasMore(response.data.length > 0); // If less than limit, no more pages
        } else {
          console.warn(
            "API response data is not an array or is missing 'data' property:",
            response
          );
          setProducts([]);
          setHasMore(false); // No more data if response is invalid
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load products. Please try again later."
        );
        setHasMore(false); // Stop trying to load more on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]); // Re-fetch when currentPage changes

  // --- Effect to Fetch All Hierarchical Categories (Level 2 and 3) ---
  useEffect(() => {
    const fetchAllHierarchicalCategories = async () => {
      try {
        const fetchedL2L3Categories = [];
        const fetchedAllCategories = []; // To hold all categories for potential future use

        // Fetch top-level categories for 'product' and 'service'
        const productTopLevel = await getCategoriesByParentId(
          "null",
          "product"
        );
        const serviceTopLevel = await getCategoriesByParentId(
          "null",
          "service"
        );

        const allTopLevel = [...productTopLevel, ...serviceTopLevel];
        fetchedAllCategories.push(...allTopLevel);

        for (const topCat of allTopLevel) {
          // Fetch Level 2 categories
          const level2Cats = await getCategoriesByParentId(
            topCat._id,
            topCat.type
          );
          fetchedAllCategories.push(...level2Cats);
          fetchedL2L3Categories.push(...level2Cats); // Level 2 categories are included

          for (const level2Cat of level2Cats) {
            // Fetch Level 3 categories
            const level3Cats = await getCategoriesByParentId(
              level2Cat._id,
              level2Cat.type
            );
            fetchedAllCategories.push(...level3Cats);
            fetchedL2L3Categories.push(...level3Cats); // Level 3 categories are included
          }
        }
        setLevel2and3Categories(fetchedL2L3Categories);
        setAllCategories(fetchedAllCategories);
      } catch (err) {
        console.error("Error fetching hierarchical categories:", err);
        // Optionally set an error state for category loading here
      }
    };
    fetchAllHierarchicalCategories();
  }, []); // Run once on mount

  // --- Client-Side Filtering and Sorting Effect ---
  useEffect(() => {
    let currentProducts = [...products]; // Start with the full list of fetched products

    // 1. Apply Type Filter
    if (filterType !== "all") {
      currentProducts = currentProducts.filter(
        (product) => product.type === filterType
      );
    }

    // 2. Apply Category Filter (NEW)
    if (selectedCategory !== "all") {
      currentProducts = currentProducts.filter(
        (product) => product.categoryId === selectedCategory
      );
    }

    // 3. Apply Price Range Filter (NEW)
    if (selectedPriceRange !== "all") {
      const [minStr, maxStr] = selectedPriceRange.split("-");
      const minPrice = parseFloat(minStr);
      const maxPrice = maxStr === "above" ? Infinity : parseFloat(maxStr);

      currentProducts = currentProducts.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );
    }

    // 4. Apply Search Term Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentProducts = currentProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          product.description.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // 5. Apply Sorting
    currentProducts.sort((a, b) => {
      let valA, valB;

      if (sortBy === "price") {
        valA = a.price;
        valB = b.price;
      } else if (sortBy === "title") {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortBy === "createdAt") {
        // Convert to Date objects for proper comparison
        valA = new Date(a.createdAt);
        valB = new Date(b.createdAt);
      }

      if (valA < valB) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredAndSortedProducts(currentProducts);
  }, [
    products,
    filterType,
    selectedCategory,
    selectedPriceRange,
    sortBy,
    sortOrder,
    searchTerm,
  ]); // Re-run when any of these dependencies change

  // --- Handlers for Filter and Sort UI ---
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setCurrentPage(1); // Reset page on filter change to fetch from start
    setProducts([]); // Clear existing products
    setHasMore(true); // Assume more data
  };

  const handleSortChange = (value) => {
    // Split the value into sortBy and sortOrder
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // New Handlers for Category and Price Range
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handlePriceRangeChange = (value) => {
    setSelectedPriceRange(value);
  };

  if (loading && currentPage === 1) {
    return (
      <section className="bg-white py-0 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-12">
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

  if (products.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center bg-gray-50 rounded-lg shadow-lg my-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          Latest Products & Services
        </h2>
        <p className="text-lg text-gray-600">
          No items available at the moment. Please check back soon!
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white py-0 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-12">
          Featured Products & Services
        </h2>

        {/* --- Filters and Search Section --- */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Search, Category, Price Range, and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-64"
            />
            <div className="flex space-x-2">
              {/* Category Dropdown (NEW) */}
              <Select
                onValueChange={handleCategoryChange}
                value={selectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {level2and3Categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name} ({cat.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range Dropdown (NEW) */}
              <Select
                onValueChange={handlePriceRangeChange}
                value={selectedPriceRange}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                  <SelectItem value="501-1000">₹501 - ₹1000</SelectItem>
                  <SelectItem value="1001-2000">₹1001 - ₹2000</SelectItem>
                  <SelectItem value="2001-5000">₹2001 - ₹5000</SelectItem>
                  <SelectItem value="5001-above">₹5001 & Above</SelectItem>
                </SelectContent>
              </Select>

              {/* Existing Sort Dropdown */}
              <Select
                onValueChange={handleSortChange}
                defaultValue={`${sortBy}-${sortOrder}`}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="title-asc">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Alphabetical (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* --- Product Grid --- */}
        {filteredAndSortedProducts.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">
              No items match your current filters or search. Try adjusting them!
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {filteredAndSortedProducts.map((product, index) => {
            // Attach ref to the last element for infinite scrolling
            if (filteredAndSortedProducts.length === index + 1) {
              return (
                <ProductCard
                  ref={lastProductElementRef}
                  key={product._id}
                  product={{
                    id: product._id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    type: product.type,
                    image:
                      product.portfolio && product.portfolio.length > 0
                        ? product.portfolio[0].url
                        : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
                  }}
                />
              );
            } else {
              return (
                <ProductCard
                  key={product._id}
                  product={{
                    id: product._id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    type: product.type,
                    image:
                      product.portfolio && product.portfolio.length > 0
                        ? product.portfolio[0].url
                        : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
                  }}
                />
              );
            }
          })}
        </div>

        {/* Loading indicator for infinite scroll */}
        {loading && currentPage > 1 && (
          <div className="mt-8 flex justify-center">
            <p className="text-indigo-600 font-medium">Loading more items...</p>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/browse"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:px-10 text-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Explore All
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
        )}
      </div>
    </section>
  );
};

export default ProductList;
