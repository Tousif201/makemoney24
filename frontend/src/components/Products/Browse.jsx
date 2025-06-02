import React, { useState, useEffect, useCallback, useMemo } from "react"; // Import useMemo
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Star, Grid, List } from "lucide-react";

import { getCategories } from "../../../api/categories";
import { getProductServices } from "../../../api/productService";
import { useSession } from "../../context/SessionContext";

const DEFAULT_PRICE_MAX = 50000; // Define a constant for max price

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, DEFAULT_PRICE_MAX]);
  const [vendorIdFilter, setVendorIdFilter] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Corresponds to 'limit' in backend
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortBy, setSortBy] = useState("createdAt"); // Default to 'createdAt' matching backend default
  const [sortOrder, setSortOrder] = useState("desc"); // Default to 'desc' matching backend default

  const [viewMode, setViewMode] = useState("grid");

  const [availableCategories, setAvailableCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorItems, setErrorItems] = useState(null);
  // --- Category Fetching: Runs once on component mount ---
  const { session, loading } = useSession();
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCats = await getCategories();
        const formattedCats = fetchedCats.map((cat) => ({
          id: cat._id,
          name: cat.name,
          count: 0, // Still no count from API, so keeping it 0
        }));
        setAvailableCategories(formattedCats);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setErrorCategories("Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchAllCategories();
  }, []); // Empty dependency array ensures this runs only once

  // --- Main Product/Service Fetching: Debounced and optimized ---
  // Memoize the API call logic to ensure it's stable across renders
  const fetchProductsAndServices = useCallback(async () => {
    setLoadingItems(true);
    setErrorItems(null); // Clear previous errors

    const params = {
      title: searchQuery || undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      // Only send price range if it's not the default full range
      minPrice: priceRange[0] !== 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] !== DEFAULT_PRICE_MAX ? priceRange[1] : undefined,
      vendorId: vendorIdFilter || undefined,
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortBy,
      order: sortOrder,
    };

    if (selectedCategories.length > 0) {
      params.categoryId = selectedCategories.join(","); // Join multiple IDs for backend
    }

    try {
      const response = await getProductServices(params);
      const fetchedItems = response.data;
      const totalCount = response.totalCount;
      const totalPages = response.totalPages;

      const formattedItems = fetchedItems.map((item) => ({
        id: item._id,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image:
          item.portfolio && item.portfolio.length > 0
            ? item.portfolio[0].url
            : "/placeholder.svg",
        rating: item.rating || 0, // Default to 0 if no rating field
        vendor: item.vendorId ? item.vendorId.name : "N/A", // Use populated vendor name
        category: item.categoryId ? item.categoryId.name : "N/A", // Use populated category name
        type: item.type,
        inStock: item.isInStock,
        isBookable: item.isBookable,
        duration: item.isBookable && item.duration ? item.duration : undefined,
      }));
      setItems(formattedItems);
      setTotalItems(totalCount);
      setTotalPages(totalPages);
    } catch (err) {
      console.error("Error fetching products/services:", err);
      setErrorItems(
        err.response?.data?.message || "Failed to load products and services."
      );
    } finally {
      setLoadingItems(false);
    }
  }, [
    searchQuery,
    selectedType,
    selectedCategories,
    priceRange,
    vendorIdFilter,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
  ]); // Dependencies for the memoized callback

  // Effect to trigger data fetching with debounce
  // This useEffect will re-run `fetchProductsAndServices` after a delay
  // whenever any of its dependencies (passed via useCallback) change.
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProductsAndServices();
    }, 300); // Debounce delay

    return () => {
      clearTimeout(handler); // Cleanup: clear timeout if dependencies change before delay
    };
  }, [fetchProductsAndServices]); // The only dependency is the memoized callback

  // --- Reset Page on Filter/Sort Change ---
  // This effect ensures that whenever filters or sort options change,
  // we reset to the first page to get relevant results.
  useEffect(() => {
    // Only reset page if not already on page 1, to avoid unnecessary re-fetches
    // or if the component is just mounting with initial state.
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [
    searchQuery,
    selectedType,
    selectedCategories,
    priceRange,
    vendorIdFilter,
    sortBy,
    sortOrder,
  ]); // Dependencies that should trigger a page reset

  // --- Handlers for User Interactions ---
  const handleCategoryChange = (categoryId, checked) => {
    setSelectedCategories((prevCategories) => {
      if (checked) {
        return [...prevCategories, categoryId];
      } else {
        return prevCategories.filter((id) => id !== categoryId);
      }
    });
    // No need to call setCurrentPage(1) directly here,
    // as the useEffect above handles resetting the page when selectedCategories changes.
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Memoized Values for Rendering ---
  // `displayedItems` is simply `items` because filtering/sorting is done by the backend.
  // Use useMemo here if you were doing any significant client-side transformation
  // that you don't want to re-run on every render.
  const displayedItems = useMemo(() => items, [items]);

  // Use useMemo for pagination range to avoid re-calculating on every render
  const paginationRange = useMemo(() => {
    const range = [];
    const maxPagesToShow = 5; // e.g., show 5 page numbers in pagination
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Browse Products & Services
          </h1>
          <p className="text-gray-600">
            Discover amazing products and services from trusted vendors
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search products, services, or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-10">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <Filter className="h-5 w-5 mr-2" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Type</h3>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="product">Products</SelectItem>
                      <SelectItem value="service">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Categories</h3>
                  {loadingCategories ? (
                    <p className="text-gray-500">Loading categories...</p>
                  ) : errorCategories ? (
                    <p className="text-red-500">{errorCategories}</p>
                  ) : availableCategories.length === 0 ? (
                    <p className="text-gray-500">No categories available.</p>
                  ) : (
                    <div className="space-y-3">
                      {availableCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) =>
                              handleCategoryChange(category.id, checked)
                            }
                          />
                          <Label
                            htmlFor={category.id}
                            className="text-sm flex-1 cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={DEFAULT_PRICE_MAX}
                      step={500}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                {loadingItems ? (
                  <p className="text-gray-600">Loading results...</p>
                ) : errorItems ? (
                  <p className="text-red-500">Error: {errorItems}</p>
                ) : (
                  <p className="text-gray-600">
                    Showing {displayedItems.length} of {totalItems} results
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(val) => {
                    const [field, order] = val.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    <SelectItem value="title-asc">Title: A-Z</SelectItem>
                    <SelectItem value="title-desc">Title: Z-A</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Grid / List */}
            {loadingItems ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-500">
                  Fetching products and services...
                </p>
              </div>
            ) : errorItems ? (
              <div className="flex justify-center items-center h-48 text-red-500">
                <p>{errorItems}</p>
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-500">
                  No products or services found matching your criteria.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {displayedItems.map((item) => (
                  <Link key={item.id} to={`/item/${item.id}`}>
                    <Card
                      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      <CardContent
                        className={`p-0 ${
                          viewMode === "list" ? "flex w-full" : ""
                        }`}
                      >
                        <div
                          className={`relative overflow-hidden ${
                            viewMode === "list" ? "w-48 h-32" : "h-68"
                          } ${
                            viewMode === "grid"
                              ? "rounded-t-lg"
                              : "rounded-l-lg"
                          }`}
                        >
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
                            }}
                          />
                          <div className="absolute top-4 right-4">
                            <Badge
                              variant={
                                item.type === "product"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {item.type === "product" ? "Product" : "Service"}
                            </Badge>
                          </div>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-red-500">
                                  {Math.round(
                                    ((item.originalPrice - item.price) /
                                      item.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </Badge>
                              </div>
                            )}
                        </div>
                        <div
                          className={`p-4 ${
                            viewMode === "list" ? "flex-1" : ""
                          }`}
                        >
                          <h3 className="font-semibold mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Vendor: {item.vendor}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Category: {item.category}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600 ml-1">
                                {item.rating.toFixed(1)}
                              </span>
                            </div>
                            {item.type === "service" &&
                              item.isBookable &&
                              item.duration && (
                                <span className="text-sm text-blue-600">
                                  Duration: {item.duration}
                                </span>
                              )}
                            {item.type === "product" && item.inStock && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                In Stock
                              </Badge>
                            )}
                            {item.type === "product" && !item.inStock && (
                              <Badge
                                variant="outline"
                                className="text-red-600 border-red-600"
                              >
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                ₹{item.price.toLocaleString()}
                              </span>
                              {item.originalPrice &&
                                item.originalPrice > item.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{item.originalPrice.toLocaleString()}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1 || loadingItems}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {/* Render page numbers based on the calculated range */}
                  {paginationRange.map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loadingItems}
                    >
                      {pageNumber}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages || loadingItems}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
