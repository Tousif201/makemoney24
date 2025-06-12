import React, { useEffect, useState, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import { getProductServices } from "../../api/productService";
import { getCategoriesByParentId } from "../../api/categories";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  // --- REFACTORED: Simplified State ---
  // 'products' now holds the final, filtered, and sorted data from the API.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- Filter and Sort States (These will be sent to the API) ---
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  // State for category dropdown
  const [level2and3Categories, setLevel2and3Categories] = useState([]);

  // Ref to detect if a filter/sort has changed, which requires resetting products
  const isNewSearch = useRef(false);

  // --- Infinite Scroll Observer (No changes needed here) ---
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

  // --- REFACTORED: Unified Data Fetching Effect ---
  // This single effect now handles initial load, infinite scroll, and re-fetching when filters change.
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      // --- NEW: Build params object for the API from current state ---
      const params = {
        limit: 800, // Fetch smaller, manageable pages
        page: currentPage,
        sortBy: sortBy,
        order: sortOrder,
      };

      if (searchTerm) {
        params.title = searchTerm; // Backend uses $regex for searching
      }
      if (selectedCategory !== "all") {
        params.categoryId = selectedCategory;
      }
      if (selectedPriceRange !== "all") {
        const [minPrice, maxPrice] = selectedPriceRange.split("-");
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice !== "above") params.maxPrice = maxPrice;
      }

      try {
        // The API call now includes all our filter/sort parameters
        const response = await getProductServices(params);

        if (response && response.data && Array.isArray(response.data)) {
          // If it's a new search (filter changed), replace products. Otherwise, append for infinite scroll.
          setProducts((prevProducts) => {
            if (isNewSearch.current || currentPage === 1) {
              return response.data;
            }
            // Filter out duplicates before appending
            const newProducts = response.data.filter(
              (newProd) => !prevProducts.some((prevProd) => prevProd._id === newProd._id)
            );
            return [...prevProducts, ...newProducts];
          });

          // Use totalPages from the API to know if there's more data
          setHasMore(response.page < response.totalPages);
          isNewSearch.current = false; // Reset the flag after fetch
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
    // This effect runs whenever the page or any filter/sort option changes.
  }, [currentPage, sortBy, sortOrder, searchTerm, selectedCategory, selectedPriceRange]);

  // --- Effect to Fetch Categories (No changes needed) ---
  useEffect(() => {
    const fetchAllHierarchicalCategories = async () => {
      try {
        const fetchedL2L3Categories = [];
        const productTopLevel = await getCategoriesByParentId("null", "product");
        const serviceTopLevel = await getCategoriesByParentId("null", "service");
        const allTopLevel = [...productTopLevel, ...serviceTopLevel];
        for (const topCat of allTopLevel) {
          const level2Cats = await getCategoriesByParentId(topCat._id, topCat.type);
          fetchedL2L3Categories.push(...level2Cats);
          for (const level2Cat of level2Cats) {
            const level3Cats = await getCategoriesByParentId(level2Cat._id, level2Cat.type);
            fetchedL2L3Categories.push(...level3Cats);
          }
        }
        setLevel2and3Categories(fetchedL2L3Categories);
      } catch (err) {
        console.error("Error fetching hierarchical categories:", err);
      }
    };
    fetchAllHierarchicalCategories();
  }, []);

  // --- REFACTORED: Handlers now reset the page to 1 on any change ---
  const resetSearch = () => {
    isNewSearch.current = true; // Mark that a filter has changed
    if (currentPage === 1) {
      // If already on page 1, the effect won't re-run on its own, so we need to manually handle it
      // This is a bit of a trick to force the effect to re-evaluate with the new params
      setProducts([]); // Clear current products immediately for better UX
      // The main useEffect will handle the rest
    } else {
      setCurrentPage(1); // Triggers the main useEffect, which will then use the new filter values
    }
  };

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    resetSearch();
  };

  // State to hold the current input value for the search bar (before debouncing)
  const [searchInput, setSearchInput] = useState("");

  // Debounced version of setSearchTerm
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      resetSearch();
    }, 500), // 500ms debounce delay
    []
  );

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Update the immediate input value
    debouncedSetSearchTerm(value); // Pass the value to the debounced function
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    resetSearch();
  };

  const handlePriceRangeChange = (value) => {
    setSelectedPriceRange(value);
    resetSearch();
  };


  // --- JSX (Rendering Logic) ---
  // The structure remains mostly the same, but now it always renders the `products` state.

  if (loading && currentPage === 1) {
    // Initial loading skeleton
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

  return (
    <section className="bg-white py-0 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-12">
          Featured Products & Services
        </h2>

        {/* --- Filters and Search Section --- */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search by title..."
              value={searchInput} // Bind to searchInput
              onChange={handleSearchInputChange} // Use the new handler
              className="w-full sm:w-64"
            />
            <div className="flex space-x-2">
              <Select onValueChange={handleSortChange} defaultValue={`${sortBy}-${sortOrder}`}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Sort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Sort</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="title-asc">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Alphabetical (Z-A)</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={handleCategoryChange} value={selectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {level2and3Categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name} ({cat.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={handlePriceRangeChange} value={selectedPriceRange}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Price" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Filter</SelectItem>
                  <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                  <SelectItem value="501-1000">₹501 - ₹1000</SelectItem>
                  <SelectItem value="1001-2000">₹1001 - ₹2000</SelectItem>
                  <SelectItem value="2001-5000">₹2001 - ₹5000</SelectItem>
                  <SelectItem value="5001-above">₹5001 & Above</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* --- Product Grid --- */}
        {products.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">
              No items match your current filters. Try adjusting them!
            </p>
          </div>
        )}

        {/* --- REFACTORED: Map over 'products' directly --- */}
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
      </div>
    </section>
  );
};

export default ProductList;