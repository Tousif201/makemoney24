// components/ProductList/ProductFilters.jsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  ArrowDownWideNarrow,
  Search,
  SlidersHorizontal, // Icon for the main "Filters" button
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

const ProductFilters = ({
  searchInput,
  handleSearchInputChange,
  sortBy,
  sortOrder,
  handleSortChange,
  // Note: selectedCategory and handleCategoryChange are no longer used here if category drawer is removed.
  // If you re-add a category filter elsewhere, ensure these props are passed.
  selectedPriceRange,
  handlePriceRangeChange,
  selectedColor,
  handleColorChange,
  selectedSize,
  handleSizeChange,
}) => {
  // State to control the visibility of the "Sort By" drawer
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  // State to control the visibility of the combined "Filters" drawer
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

  // Example data for color (now including both name and hex/css value for swatches)
  const colors = [
    { name: "Red", value: "red" },
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Black", value: "black" },
    { name: "White", value: "white" }, // White text on white background needs border
    { name: "Yellow", value: "yellow" },
    { name: "Gray", value: "gray" },
    { name: "Brown", value: "brown" },
    { name: "Purple", value: "purple" },
    { name: "Orange", value: "orange" },
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

  // Function to clear Price, Color, and Size filters
  const handleClearPriceColorSizeFilters = () => {
    handlePriceRangeChange("all");
    handleColorChange("all");
    handleSizeChange("all");
    // No need to close the drawer immediately, user might want to set other filters
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by title..."
          value={searchInput}
          onChange={handleSearchInputChange}
          className="w-full pl-9"
        />
      </div>

      <div className="flex space-x-2">
        {/* Sort By Drawer - NOW CONTROLLED BY isSortDrawerOpen STATE */}
        <Drawer open={isSortDrawerOpen} onOpenChange={setIsSortDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowDownWideNarrow className="h-4 w-4" />
              Sort By
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <ScrollArea className="h-[80vh]">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Sort Products</DrawerTitle>
                  <DrawerDescription>
                    Choose how to sort the products.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant={
                      sortBy === "createdAt" && sortOrder === "desc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      handleSortChange("createdAt-desc");
                      setIsSortDrawerOpen(false); // Close drawer on selection
                    }}
                  >
                    Default (Newest)
                  </Button>
                  <Button
                    variant={
                      sortBy === "price" && sortOrder === "asc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      handleSortChange("price-asc");
                      setIsSortDrawerOpen(false); // Close drawer on selection
                    }}
                  >
                    Price: Low to High
                  </Button>
                  <Button
                    variant={
                      sortBy === "price" && sortOrder === "desc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      handleSortChange("price-desc");
                      setIsSortDrawerOpen(false); // Close drawer on selection
                    }}
                  >
                    Price: High to Low
                  </Button>
                  <Button
                    variant={
                      sortBy === "title" && sortOrder === "asc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      handleSortChange("title-asc");
                      setIsSortDrawerOpen(false); // Close drawer on selection
                    }}
                  >
                    Alphabetical (A-Z)
                  </Button>
                  <Button
                    variant={
                      sortBy === "title" && sortOrder === "desc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      handleSortChange("title-desc");
                      setIsSortDrawerOpen(false); // Close drawer on selection
                    }}
                  >
                    Alphabetical (Z-A)
                  </Button>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>

        {/* Combined Price, Color, Size Filters Drawer */}
        <Drawer
          open={isFiltersDrawerOpen}
          onOpenChange={setIsFiltersDrawerOpen}
        >
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <ScrollArea className="h-[80vh]">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Additional Filters</DrawerTitle>
                  <DrawerDescription>
                    Filter by price, color, or size.
                  </DrawerDescription>
                </DrawerHeader>

                <Tabs defaultValue="price" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="price">Price</TabsTrigger>
                    <TabsTrigger value="color">Color</TabsTrigger>
                    <TabsTrigger value="size">Size</TabsTrigger>
                  </TabsList>

                  <TabsContent value="price" className="py-4">
                    <div className="grid gap-4">
                      <Button
                        variant={
                          selectedPriceRange === "all" ? "default" : "outline"
                        }
                        onClick={() => handlePriceRangeChange("all")}
                      >
                        All Prices
                      </Button>
                      <Button
                        variant={
                          selectedPriceRange === "0-500" ? "default" : "outline"
                        }
                        onClick={() => handlePriceRangeChange("0-500")}
                      >
                        ₹0 - ₹500
                      </Button>
                      <Button
                        variant={
                          selectedPriceRange === "501-1000"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handlePriceRangeChange("501-1000")}
                      >
                        ₹501 - ₹1000
                      </Button>
                      <Button
                        variant={
                          selectedPriceRange === "1001-2000"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handlePriceRangeChange("1001-2000")}
                      >
                        ₹1001 - ₹2000
                      </Button>
                      <Button
                        variant={
                          selectedPriceRange === "2001-5000"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handlePriceRangeChange("2001-5000")}
                      >
                        ₹2001 - ₹5000
                      </Button>
                      <Button
                        variant={
                          selectedPriceRange === "5001-above"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handlePriceRangeChange("5001-above")}
                      >
                        ₹5001 & Above
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="color" className="py-4">
                    <div className="grid gap-4">
                      <Button
                        variant={
                          selectedColor === "all" ? "default" : "outline"
                        }
                        onClick={() => handleColorChange("all")}
                        className="flex items-center justify-center gap-2" // Center content in button
                      >
                        All Colors
                      </Button>
                      {colors.map((color) => (
                        <Button
                          key={color.value} // Use color.value for key
                          variant={
                            selectedColor === color.value
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handleColorChange(color.value)}
                          className="flex items-center justify-center gap-2" // Center content in button
                        >
                          <span
                            className={`inline-block w-4 h-4 rounded-full ${
                              color.value === "white"
                                ? "border border-gray-300"
                                : "" // Add border for white swatch
                            }`}
                            style={{ backgroundColor: color.value }}
                          ></span>
                          {color.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="size" className="py-4">
                    <div className="grid gap-4">
                      <Button
                        variant={selectedSize === "all" ? "default" : "outline"}
                        onClick={() => handleSizeChange("all")}
                      >
                        All Sizes
                      </Button>
                      {sizes.map((size) => (
                        <Button
                          key={size}
                          variant={
                            selectedSize === size ? "default" : "outline"
                          }
                          onClick={() => handleSizeChange(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <DrawerFooter className="flex-row justify-between">
                  <Button
                    variant="outline"
                    onClick={handleClearPriceColorSizeFilters}
                  >
                    Clear Filters
                  </Button>
                  <DrawerClose asChild>
                    <Button>Apply Filters</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default ProductFilters;
