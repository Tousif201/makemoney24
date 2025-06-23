import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox"; // Keep Checkbox for the main filter sidebar
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter, // Added Filter icon back for the general filters section
  Star,
  Grid,
  List,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Keep ScrollArea for category list
import { Separator } from "@/components/ui/separator";

import { getCategoriesWithSubcategories } from "../../../api/categories"; // This API is perfect for your UI
import { getProductServices } from "../../../api/productService";
import { useSession } from "../../context/SessionContext";

const DEFAULT_PRICE_MAX = 50000;

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();

  // --- State Management ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  // selectedCategories will now hold IDs of both main and sub categories chosen for filtering
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, DEFAULT_PRICE_MAX]);
  const [vendorIdFilter, setVendorIdFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");

  // Category data for the two-column UI
  const [categoriesData, setCategoriesData] = useState([]); // Stores main categories with their subcategories
  const [currentCategory, setCurrentCategory] = useState(null); // The currently selected main category in the left sidebar

  // Product/Service Items State
  const [items, setItems] = useState([]);

  // Loading and error states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorItems, setErrorItems] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // --- Synchronize state with URL search parameters on initial load ---
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedType(searchParams.get("type") || "all");
    setSelectedCategories(
      searchParams.get("categories")
        ? searchParams.get("categories").split(",")
        : []
    );
    setPriceRange(() => {
      const minPrice = parseInt(searchParams.get("minPrice") || "0");
      const maxPrice = parseInt(
        searchParams.get("maxPrice") || String(DEFAULT_PRICE_MAX)
      );
      return [minPrice, maxPrice];
    });
    setVendorIdFilter(searchParams.get("vendorId") || "");
    setCurrentPage(parseInt(searchParams.get("page") || "1"));
    setItemsPerPage(parseInt(searchParams.get("limit") || "10"));
    setSortBy(searchParams.get("sortBy") || "createdAt");
    setSortOrder(searchParams.get("order") || "desc");
    setViewMode(searchParams.get("viewMode") || "grid");
  }, [searchParams]);

  // --- Update URL search parameters whenever relevant state changes ---
  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    if (searchQuery) newSearchParams.set("search", searchQuery);
    if (selectedType !== "all") newSearchParams.set("type", selectedType);
    if (selectedCategories.length > 0)
      newSearchParams.set("categories", selectedCategories.join(","));
    if (priceRange[0] !== 0)
      newSearchParams.set("minPrice", priceRange[0].toString());
    if (priceRange[1] !== DEFAULT_PRICE_MAX)
      newSearchParams.set("maxPrice", priceRange[1].toString());
    if (vendorIdFilter) newSearchParams.set("vendorId", vendorIdFilter);
    if (currentPage !== 1) newSearchParams.set("page", currentPage.toString());
    if (itemsPerPage !== 10)
      newSearchParams.set("limit", itemsPerPage.toString());
    if (sortBy !== "createdAt") newSearchParams.set("sortBy", sortBy);
    if (sortOrder !== "desc") newSearchParams.set("order", sortOrder);
    if (viewMode !== "grid") newSearchParams.set("viewMode", viewMode);

    setSearchParams(newSearchParams, { replace: true });
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
    setSearchParams,
  ]);

  // --- Category Fetching: For the two-column UI (main and subcategories) ---
  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
        const res = await getCategoriesWithSubcategories({
          type: selectedType,
        });
        setCategoriesData(res);
        // Set initial currentCategory if none is selected or type changes
        if (
          res.length > 0 &&
          (!currentCategory ||
            !res.find((cat) => cat._id === currentCategory._id))
        ) {
          setCurrentCategory(res[0]);
        } else if (res.length === 0) {
          setCurrentCategory(null);
        }
      } catch (err) {
        console.error("Error fetching categories with subcategories:", err);
        setErrorCategories("Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchAllCategories();
  }, [selectedType, currentCategory]); // Re-fetch if type changes or currentCategory is somehow invalid

  // --- Main Product/Service Fetching ---
  const fetchProductsAndServices = useCallback(async () => {
    setLoadingItems(true);
    setErrorItems(null);

    // Build params for API call
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
      params.categoryId = selectedCategories.join(","); // Send multiple category IDs as a comma-separated string
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
            : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png", // Fallback placeholder
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
    selectedCategories, // Added selectedCategories as a dependency
    priceRange,
    vendorIdFilter,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
  ]);

  // Effect to trigger data fetching with debounce for search query and other filters
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    const handler = setTimeout(() => {
      fetchProductsAndServices();
    }, 300); // Debounce by 300ms
    setDebounceTimer(handler);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [
    fetchProductsAndServices,
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

  // --- Handlers for User Interactions ---
  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    setCurrentPage(1); // Reset to page 1 on filter change
    // When type changes, re-fetch categories and clear current category/selection
    setCategoriesData([]);
    setCurrentCategory(null);
    setSelectedCategories([]);
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

  const handleSidebarCategoryClick = useCallback((category) => {
    setCurrentCategory(category);
    // When a main category is clicked, only that specific category is selected
    // If you want to automatically select its subcategories too, add logic here.
    // For now, it just sets the currentCategory for subcategory display.
    setSelectedCategories([category._id]); // Select only the clicked main category by default
    setCurrentPage(1); // Reset page on category click
  }, []);

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

  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="ml-4 text-lg text-gray-600">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto  py-8">
        {/* Header */}
        <div className="mb-4 px-4">
          <h1 className="text-[24px] md:text-4xl font-bold mb-2">
            Browse Products & Services
          </h1>
          <p className="text-gray-600 text-[16px] md:text-xl">
            Discover amazing products and services from trusted vendors
          </p>
        </div>

        {/* Search Bar */}
        <div className=" px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search products, services, or vendors..."
              value={searchQuery}
              onChange={handleSearchQueryChange}
              className="pl-10 h-10 text-xs "
            />
          </div>
        </div>

        {/* Main Layout: Filters + Categories + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* General Filters (Left Column - first part) */}
          <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6    top-8">
            {" "}
            {/* Added sticky and h-fit for better layout */}
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filters
            </h2>
            <div className="space-y-6">
              {/* Type Filter */}
              <div>
                <Label htmlFor="type-filter" className="mb-2 block font-medium">
                  Type
                </Label>
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger id="type-filter" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="product">Products</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div>
                <Label htmlFor="price-range" className="mb-4 block font-medium">
                  Price Range: ₹{priceRange[0].toLocaleString()} - ₹
                  {priceRange[1].toLocaleString()}
                </Label>
                <Slider
                  id="price-range"
                  min={0}
                  max={DEFAULT_PRICE_MAX}
                  step={100}
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  range
                  className="w-full"
                />
              </div>

              {/* You can add more filters here if needed (e.g., Vendor Filter) */}
            </div>
          </div>

          {/* Category Browse Section (Middle Section - span 3 columns on desktop) */}
          <div className="lg:col-span-3">
            {" "}
            {/* This div was causing layout issues before */}
            <div className="flex bg-gray-100 font-sans rounded-lg shadow-md">
              {/* Main Categories Sidebar (Your original left panel) */}
              <div className="w-[30%] lg:w-[18%] bg-white shadow-md border-r  border-gray-200 h-[90vh] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent rounded-l-xl flex flex-col items-center">
                <nav className="mt-2 w-full space-y-2">
                  {loadingCategories ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : errorCategories ? (
                    <p className="text-red-500 text-center text-sm p-4">
                      {errorCategories}
                    </p>
                  ) : categoriesData.length === 0 ? (
                    <p className="text-gray-500 text-center text-sm p-4">
                      No categories found.
                    </p>
                  ) : (
                    categoriesData.map((category) => (
                      <div
                        key={category._id}
                        className="my-2 border-b-[1px] border-slate-400 px-1"
                      >
                        <div
                          onClick={() => handleSidebarCategoryClick(category)}
                          className={`flex flex-col items-center justify-center  cursor-pointer my-2 transition  
                          ${
                            currentCategory?._id === category._id
                              ? "bg-gray-100 border-t-4 border-b-0 border-purple-500 text-black rounded-lg"
                              : "bg-white text-gray-700"
                          }`}
                        >
                          <div className="rounded-full">
                            <img
                              src={
                                category.image?.url ||
                                "https://via.placeholder.com/80"
                              } // Fallback image
                              className="h-12 w-12 rounded-2xl object-cover  mb-2 mt-2"
                              alt={category.name}
                            />
                          </div>
                          <p className="text-xs font-medium text-center">
                            {category.name}
                          </p>
                        </div>
                        {/* <Separator classname="bg-black h-4" /> */}
                      </div>
                    ))
                  )}
                </nav>
              </div>

              {/* Subcategories Display (Your original right panel) */}
              <div className="flex-1 p-4 overflow-y-auto min-h-[20vh] rounded-r-xl">
                {currentCategory && currentCategory.subcategories && (
                  <section className="mb-8">
                    <h3 className="text-sm font-semibold mb-4">
                      {currentCategory.name}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {currentCategory.subcategories.length === 0 ? (
                        <p className="text-gray-500 col-span-full">
                          No subcategories for this category.
                        </p>
                      ) : (
                        currentCategory.subcategories.map((subCategory) => (
                          <div
                            key={subCategory._id}
                            onClick={() =>
                              setSelectedCategories([subCategory._id])
                            } // Select only this subcategory
                            className={` w-full   p-2 flex flex-col items-center justify-center text-center  cursor-pointer transition
                              ${
                                selectedCategories.includes(subCategory._id)
                                  ? "border-purple-500 ring-2 ring-purple-200"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <div className="relative">
                              <img
                                src={
                                  subCategory.image?.url ||
                                  "https://via.placeholder.com/60"
                                } // Fallback image
                                alt={subCategory.name}
                                className="w-14 h-14 object-cover rounded-2xl"
                              />
                            </div>
                            <p className="mt-2 text-xs font-medium text-gray-800">
                              {subCategory.name}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}
                {!currentCategory &&
                  !loadingCategories &&
                  categoriesData.length > 0 && (
                    <p className="text-gray-500 text-center mt-10">
                      Select a category from the left to view its subcategories.
                    </p>
                  )}
                {loadingCategories && !currentCategory && (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* End Category Browse Section */}

          {/* Results Section (Right Column - spans 3 columns on desktop, below the category browser) */}
          <div className="lg:col-span-4 mt-8 px-4">
            {" "}
            {/* Adjusted to span full width below categories */}
            {/* Results Header and Controls */}
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
                  onValueChange={handleSortChange}
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
            {/* Product/Service Display */}
            {loadingItems ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-500 flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Fetching
                  products and services...
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
                            src={item.image}
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
