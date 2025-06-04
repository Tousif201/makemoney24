import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom"; // Import useSearchParams and useNavigate
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

const DEFAULT_PRICE_MAX = 50000;

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams(); // Initialize useSearchParams
  const navigate = useNavigate(); // Initialize useNavigate for potential redirects or complex URL changes

  // State derived from URL search parameters, or default values
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all");
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("categories") ? searchParams.get("categories").split(",") : []
  );
  const [priceRange, setPriceRange] = useState(() => {
    const minPrice = parseInt(searchParams.get("minPrice") || "0");
    const maxPrice = parseInt(searchParams.get("maxPrice") || String(DEFAULT_PRICE_MAX));
    return [minPrice, maxPrice];
  });
  const [vendorIdFilter, setVendorIdFilter] = useState(searchParams.get("vendorId") || "");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get("limit") || "10"));
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") || "desc");

  const [viewMode, setViewMode] = useState(searchParams.get("viewMode") || "grid");

  const [availableCategories, setAvailableCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorItems, setErrorItems] = useState(null);
  const { session, loading: sessionLoading } = useSession();

  // --- Category Fetching: Runs once on component mount ---
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCats = await getCategories();
        const formattedCats = fetchedCats.map((cat) => ({
          id: cat._id,
          name: cat.name,
          count: 0,
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
  }, []);

  // --- Synchronize state with URL search parameters ---
  // This useEffect will update the component's internal state whenever the URL search params change.
  // It's important to keep this separate from the effect that updates the URL,
  // to avoid infinite loops and ensure single source of truth for URL-driven state.
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedType(searchParams.get("type") || "all");
    setSelectedCategories(
      searchParams.get("categories") ? searchParams.get("categories").split(",") : []
    );
    setPriceRange(() => {
      const minPrice = parseInt(searchParams.get("minPrice") || "0");
      const maxPrice = parseInt(searchParams.get("maxPrice") || String(DEFAULT_PRICE_MAX));
      return [minPrice, maxPrice];
    });
    setVendorIdFilter(searchParams.get("vendorId") || "");
    setCurrentPage(parseInt(searchParams.get("page") || "1"));
    setItemsPerPage(parseInt(searchParams.get("limit") || "10"));
    setSortBy(searchParams.get("sortBy") || "createdAt");
    setSortOrder(searchParams.get("order") || "desc");
    setViewMode(searchParams.get("viewMode") || "grid");
  }, [searchParams]);

  // --- Update URL search parameters whenever state changes ---
  // This useEffect will update the URL search parameters whenever any of the filter/sort/pagination states change.
  // This is the core of making the URL reflect the current filters.
  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    if (searchQuery) newSearchParams.set("search", searchQuery);
    if (selectedType !== "all") newSearchParams.set("type", selectedType);
    if (selectedCategories.length > 0)
      newSearchParams.set("categories", selectedCategories.join(","));
    if (priceRange[0] !== 0) newSearchParams.set("minPrice", priceRange[0].toString());
    if (priceRange[1] !== DEFAULT_PRICE_MAX) newSearchParams.set("maxPrice", priceRange[1].toString());
    if (vendorIdFilter) newSearchParams.set("vendorId", vendorIdFilter);
    if (currentPage !== 1) newSearchParams.set("page", currentPage.toString());
    if (itemsPerPage !== 10) newSearchParams.set("limit", itemsPerPage.toString());
    if (sortBy !== "createdAt") newSearchParams.set("sortBy", sortBy);
    if (sortOrder !== "desc") newSearchParams.set("order", sortOrder);
    if (viewMode !== "grid") newSearchParams.set("viewMode", viewMode);

    // Using setSearchParams from useSearchParams to update the URL
    // It will trigger a re-render and the `useEffect` that reads searchParams will update states.
    setSearchParams(newSearchParams, { replace: true }); // `replace: true` prevents adding new entries to history
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
    viewMode,
    setSearchParams, // setSearchParams must be a dependency
  ]);

  // --- Main Product/Service Fetching: Debounced and optimized ---
  const fetchProductsAndServices = useCallback(async () => {
    setLoadingItems(true);
    setErrorItems(null);

    const params = {
      title: searchQuery || undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      minPrice: priceRange[0] !== 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] !== DEFAULT_PRICE_MAX ? priceRange[1] : undefined,
      vendorId: vendorIdFilter || undefined,
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortBy,
      order: sortOrder,
    };

    if (selectedCategories.length > 0) {
      params.categoryId = selectedCategories.join(",");
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
        rating: item.rating || 0,
        vendor: item.vendorId ? item.vendorId.name : "N/A",
        category: item.categoryId ? item.categoryId.name : "N/A",
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
  ]);

  // Effect to trigger data fetching with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProductsAndServices();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchProductsAndServices]);

  // No longer need a separate effect for resetting page on filter/sort change,
  // because the `useEffect` that updates search params will handle it.
  // If a filter changes, `currentPage` will be set to 1 in the URL,
  // and the `fetchProductsAndServices` will re-run with the updated parameters including page 1.


  // --- Handlers for User Interactions ---
  // Update state, which in turn will trigger the useEffect to update the URL
  const handleCategoryChange = (categoryId, checked) => {
    setSelectedCategories((prevCategories) => {
      if (checked) {
        return [...prevCategories, categoryId];
      } else {
        return prevCategories.filter((id) => id !== categoryId);
      }
    });
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleSortChange = (val) => {
    const [field, order] = val.split("-");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to page 1 on sort change
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Memoized Values for Rendering ---
  const displayedItems = useMemo(() => items, [items]);

  const paginationRange = useMemo(() => {
    const range = [];
    const maxPagesToShow = 5;
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
              onChange={handleSearchQueryChange} // Use the new handler
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
                  <Select value={selectedType} onValueChange={handleTypeChange}>
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
                      onValueChange={handlePriceRangeChange} // Use the new handler
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
                  onValueChange={handleSortChange} // Use the new handler
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
