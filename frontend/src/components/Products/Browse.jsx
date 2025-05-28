import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, Grid, List } from "lucide-react";

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]); // Removed type annotation
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");

  const categories = [
    { id: "electronics", name: "Electronics", count: 2450 },
    { id: "fashion", name: "Fashion", count: 5230 },
    { id: "home-garden", name: "Home & Garden", count: 1890 },
    { id: "web-dev", name: "Web Development", count: 340 },
    { id: "design", name: "Design Services", count: 520 },
    { id: "consulting", name: "Consulting", count: 180 },
  ];

  const items = [
    {
      id: 1,
      title: "Premium Leather Office Chair",
      price: 12499,
      originalPrice: 15999,
      image: "https://images.unsplash.com/photo-1616627981169-d0928fb3a1d0?auto=format&fit=crop&w=400&q=80",
      rating: 4.5,
      vendor: "Urban Living Furniture",
      category: "Office Furniture",
      type: "product",
      inStock: true,
    },
    {
      id: 2,
      title: "Wireless Bluetooth Headphones",
      price: 7999,
      originalPrice: 9999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
      rating: 4.5,
      vendor: "TechGear Pro",
      category: "Electronics",
      type: "product",
      inStock: true,
    },
    {
      id: 3,
      title: "Custom Website Development",
      price: 25000,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
      rating: 4.9,
      vendor: "WebCraft Studios",
      category: "Web Development",
      type: "service",
      duration: "2-4 weeks",
    },
    {
      id: 4,
      title: "Designer Handbag Collection",
      price: 5999,
      originalPrice: 7999,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80",
      rating: 4.4,
      vendor: "Luxury Bags",
      category: "Fashion",
      type: "product",
      inStock: true,
    },
    {
      id: 5,
      title: "Logo & Brand Identity Design",
      price: 8000,
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80",
      rating: 4.7,
      vendor: "Creative Minds",
      category: "Design Services",
      type: "service",
      duration: "1-2 weeks",
    },
    {
      id: 6,
      title: "Smart Home Security System",
      price: 18999,
      originalPrice: 22999,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80",
      rating: 4.6,
      vendor: "SecureHome Tech",
      category: "Electronics",
      type: "product",
      inStock: true,
    },
    {
      id: 7,
      title: "Business Strategy Consulting",
      price: 15000,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80",
      rating: 4.8,
      vendor: "Strategy Pro",
      category: "Consulting",
      type: "service",
      duration: "3-5 days",
    },
    {
      id: 8,
      title: "Modern Dining Table Set",
      price: 24999,
      originalPrice: 29999,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
      rating: 4.3,
      vendor: "Home Decor Plus",
      category: "Home & Garden",
      type: "product",
      inStock: true,
    },
  ];

  const handleCategoryChange = (categoryId, checked) => { // Removed type annotations
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) => item.category.toLowerCase().includes(cat.replace("-", " ")));
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

    return matchesSearch && matchesType && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Products & Services</h1>
          <p className="text-gray-600">Discover amazing products and services from trusted vendors</p>
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
            <Card className="sticky top-4">
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
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => handleCategoryChange(category.id, checked)} // No need for 'as boolean'
                        />
                        <Label htmlFor={category.id} className="text-sm flex-1 cursor-pointer">
                          {category.name}
                        </Label>
                        <span className="text-xs text-gray-500">({category.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider value={priceRange} onValueChange={setPriceRange} max={50000} step={500} className="mb-4" />
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
                <p className="text-gray-600">Showing {filteredItems.length} results</p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort by Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
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

            {/* Results Grid */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredItems.map((item) => (
                <Link key={item.id} to={`/item/${item.id}`}> {/* Changed href to to */}
                  <Card
                    className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${viewMode === "list" ? "flex" : ""}`}
                  >
                    <CardContent className={`p-0 ${viewMode === "list" ? "flex w-full" : ""}`}>
                      <div
                        className={`relative overflow-hidden ${viewMode === "list" ? "w-48 h-32" : "h-48"} ${viewMode === "grid" ? "rounded-t-lg" : "rounded-l-lg"}`}
                      >
                        {/* Replaced Next.js Image with standard <img> */}
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge variant={item.type === "product" ? "default" : "secondary"}>
                            {item.type === "product" ? "Product" : "Service"}
                          </Badge>
                        </div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-red-500">
                              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.vendor}</p>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                          </div>
                          {item.type === "service" && item.duration && (
                            <span className="text-sm text-blue-600">{item.duration}</span>
                          )}
                          {item.type === "product" && item.inStock && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              In Stock
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">₹{item.price.toLocaleString()}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
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

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
