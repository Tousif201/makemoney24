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
}) => {
  // States to control individual drawer visibility
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isPriceDrawerOpen, setIsPriceDrawerOpen] = useState(false);

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
                    onClick={() => handleSortChange("createdAt-desc")}
                  >
                    Default (Newest)
                  </Button>
                  <Button
                    variant={
                      sortBy === "price" && sortOrder === "asc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleSortChange("price-asc")}
                  >
                    Price: Low to High
                  </Button>
                  <Button
                    variant={
                      sortBy === "price" && sortOrder === "desc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleSortChange("price-desc")}
                  >
                    Price: High to Low
                  </Button>
                  <Button
                    variant={
                      sortBy === "title" && sortOrder === "asc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleSortChange("title-asc")}
                  >
                    Alphabetical (A-Z)
                  </Button>
                  <Button
                    variant={
                      sortBy === "title" && sortOrder === "desc"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleSortChange("title-desc")}
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
                    onClick={() => handleCategoryChange("all")}
                  >
                    All Categories
                  </Button>
                  {level2and3Categories.map((cat) => (
                    <Button
                      key={cat._id}
                      variant={selectedCategory === cat._id ? "default" : "outline"}
                      onClick={() => handleCategoryChange(cat._id)}
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
                    variant={selectedPriceRange === "all" ? "default" : "outline"}
                    onClick={() => handlePriceRangeChange("all")}
                  >
                    All Prices
                  </Button>
                  <Button
                    variant={selectedPriceRange === "0-500" ? "default" : "outline"}
                    onClick={() => handlePriceRangeChange("0-500")}
                  >
                    ₹0 - ₹500
                  </Button>
                  <Button
                    variant={selectedPriceRange === "501-1000" ? "default" : "outline"}
                    onClick={() => handlePriceRangeChange("501-1000")}
                  >
                    ₹501 - ₹1000
                  </Button>
                  <Button
                    variant={selectedPriceRange === "1001-2000" ? "default" : "outline"}
                    onClick={() => handlePriceRangeChange("1001-2000")}
                  >
                    ₹1001 - ₹2000
                  </Button>
                  <Button
                    variant={selectedPriceRange === "2001-5000" ? "default" : "outline"}
                    onClick={() => handlePriceRangeChange("2001-5000")}
                  >
                    ₹2001 - ₹5000
                  </Button>
                  <Button
                    variant={selectedPriceRange === "5001-above" ? "default" : "outline"}
                    onClick={() => handlePriceRangeChange("5001-above")}
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
      </div>
    </div>
  );
};

export default ProductFilters;