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
  Search,
  ArrowDownWideNarrow,
  ListFilter,
  IndianRupee,
  Palette, // NEW: Import Palette icon for Color
  Ruler, // NEW: Import Ruler icon for Size (or another suitable icon)
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProductFilters = ({
  searchInput,
  handleSearchInputChange,
  sortBy,
  sortOrder,
  handleSortChange,
  selectedCategory,
  handleCategoryChange,
  level2and3Categories,
  selectedPriceRange,
  handlePriceRangeChange,
  selectedColor, // NEW: Prop for selected color
  handleColorChange, // NEW: Prop for color handler
  selectedSize, // NEW: Prop for selected size
  handleSizeChange, // NEW: Prop for size handler
}) => {
  // States to control individual drawer visibility
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isPriceDrawerOpen, setIsPriceDrawerOpen] = useState(false);
  // NEW: States for Color and Size drawer visibility
  const [isColorDrawerOpen, setIsColorDrawerOpen] = useState(false);
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);

  // Example data for color and size (replace with actual data from your backend if available)
  const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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
        {/* Sort By Drawer */}
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
                      setIsSortDrawerOpen(false);
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
                      setIsSortDrawerOpen(false);
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
                      setIsSortDrawerOpen(false);
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
                      setIsSortDrawerOpen(false);
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
                      setIsSortDrawerOpen(false);
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

        {/* Category Filter Drawer */}
        <Drawer
          open={isCategoryDrawerOpen}
          onOpenChange={setIsCategoryDrawerOpen}
        >
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              Category
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <ScrollArea className="h-[80vh]">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Filter by Category</DrawerTitle>
                  <DrawerDescription>
                    Select a category to narrow your search.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => {
                      handleCategoryChange("all");
                      setIsCategoryDrawerOpen(false);
                    }}
                  >
                    All Categories
                  </Button>
                  {level2and3Categories.map((cat) => (
                    <Button
                      key={cat._id}
                      variant={
                        selectedCategory === cat._id ? "default" : "outline"
                      }
                      onClick={() => {
                        handleCategoryChange(cat._id);
                        setIsCategoryDrawerOpen(false);
                      }}
                    >
                      {cat.name} ({cat.type})
                    </Button>
                  ))}
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

        {/* Price Range Filter Drawer */}
        <Drawer open={isPriceDrawerOpen} onOpenChange={setIsPriceDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Price
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <ScrollArea className="h-[80vh]">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Filter by Price Range</DrawerTitle>
                  <DrawerDescription>
                    Choose a price range for the products.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant={
                      selectedPriceRange === "all" ? "default" : "outline"
                    }
                    onClick={() => {
                      handlePriceRangeChange("all");
                      setIsPriceDrawerOpen(false);
                    }}
                  >
                    All Prices
                  </Button>
                  <Button
                    variant={
                      selectedPriceRange === "0-500" ? "default" : "outline"
                    }
                    onClick={() => {
                      handlePriceRangeChange("0-500");
                      setIsPriceDrawerOpen(false);
                    }}
                  >
                    ₹0 - ₹500
                  </Button>
                  <Button
                    variant={
                      selectedPriceRange === "501-1000" ? "default" : "outline"
                    }
                    onClick={() => {
                      handlePriceRangeChange("501-1000");
                      setIsPriceDrawerOpen(false);
                    }}
                  >
                    ₹501 - ₹1000
                  </Button>
                  <Button
                    variant={
                      selectedPriceRange === "1001-2000" ? "default" : "outline"
                    }
                    onClick={() => {
                      handlePriceRangeChange("1001-2000");
                      setIsPriceDrawerOpen(false);
                    }}
                  >
                    ₹1001 - ₹2000
                  </Button>
                  <Button
                    variant={
                      selectedPriceRange === "2001-5000" ? "default" : "outline"
                    }
                    onClick={() => {
                      handlePriceRangeChange("2001-5000");
                      setIsPriceDrawerOpen(false);
                    }}
                  >
                    ₹2001 - ₹5000
                  </Button>
                  <Button
                    variant={
                      selectedPriceRange === "5001-above"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      handlePriceRangeChange("5001-above");
                      setIsPriceDrawerOpen(false);
                    }}
                  >
                    ₹5001 & Above
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

        {/* NEW: Color Filter Drawer */}
        <Drawer open={isColorDrawerOpen} onOpenChange={setIsColorDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <ScrollArea className="h-[80vh]">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Filter by Color</DrawerTitle>
                  <DrawerDescription>
                    Select a color to filter products.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant={selectedColor === "all" ? "default" : "outline"}
                    onClick={() => {
                      handleColorChange("all");
                      setIsColorDrawerOpen(false);
                    }}
                  >
                    All Colors
                  </Button>
                  {colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => {
                        handleColorChange(color);
                        setIsColorDrawerOpen(false);
                      }}
                    >
                      {color}
                    </Button>
                  ))}
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

        {/* NEW: Size Filter Drawer */}
        <Drawer open={isSizeDrawerOpen} onOpenChange={setIsSizeDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Size
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <ScrollArea className="h-[80vh]">
              <div className="mx-auto w-full max-w-md p-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Filter by Size</DrawerTitle>
                  <DrawerDescription>
                    Select a size to filter products.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant={selectedSize === "all" ? "default" : "outline"}
                    onClick={() => {
                      handleSizeChange("all");
                      setIsSizeDrawerOpen(false);
                    }}
                  >
                    All Sizes
                  </Button>
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => {
                        handleSizeChange(size);
                        setIsSizeDrawerOpen(false);
                      }}
                    >
                      {size}
                    </Button>
                  ))}
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
      </div>
    </div>
  );
};

export default ProductFilters;
