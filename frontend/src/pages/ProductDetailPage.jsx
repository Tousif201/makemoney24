import { useState } from "react";
// No need to import Image from 'next/image' or Link from 'next/link'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  MapPin,
  Clock,
  Shield,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductDetailPage() {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { addItem } = useCart();

  // Mock data based on the provided structure
  const product = {
    _id: "6650a3c9f33e3b5a0a9f1234",
    vendorId: {
      _id: "6650a1baf33e3b5a0a9f1111",
      name: "Urban Living Furniture",
      salesRep: "6650a0f3f33e3b5a0a9faaaa",
      userId: "6650a0d1f33e3b5a0a9fabcd",
      pincode: "110001",
      commissionRate: 10,
    },
    categoryId: {
      _id: "6650a1f4f33e3b5a0a9f2222",
      name: "Office Furniture",
      description:
        "Chairs, desks, and ergonomic setups for office environments.",
      type: "product",
      createdAt: "2024-12-01T08:45:00.000Z",
    },
    type: "product",
    title: "Premium Leather Office Chair",
    description:
      "Ergonomic high-back leather office chair with adjustable height and lumbar support. Perfect for long working hours with premium comfort and style.",
    price: 12499,
    originalPrice: 15999,
    portfolio: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
      },
    ],
    variants: [
      {
        color: "Black",
        size: "Standard",
        sku: "CHAIR-BLK-STD",
        quantity: 45,
        images: [
          "https://images.unsplash.com/photo-1582582421075-b3f60f3db3c2?auto=format&fit=crop&w=800&q=80",
        ],
      },
      {
        color: "Brown",
        size: "Standard",
        sku: "CHAIR-BRN-STD",
        quantity: 30,
        images: [
          "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
        ],
      },
    ],
    pincode: "110001",
    isBookable: false,
    isInStock: true,
    rating: 4.5,
    reviews: 127,
    createdAt: "2024-12-01T10:30:00.000Z",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
              {/* Replaced Next.js Image with standard <img> */}
              <img
                src={
                  product.portfolio[selectedImage]?.url ||
                  product.variants[selectedVariant]?.images[0]
                }
                alt={product.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  % OFF
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.portfolio.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                    selectedImage === index
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  {/* Replaced Next.js Image with standard <img> */}
                  <img
                    src={item.url || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.categoryId.name}</Badge>
                <Badge variant="secondary">{product.type}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <Badge className="bg-green-100 text-green-800">
                  Save ₹
                  {(product.originalPrice - product.price).toLocaleString()}
                </Badge>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(index)}
                      className={`px-4 py-2 border rounded-lg ${
                        selectedVariant === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Quantity</h3>
                <Select
                  value={quantity.toString()}
                  onValueChange={(value) => setQuantity(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      ...Array(
                        Math.min(
                          10,
                          product.variants[selectedVariant]?.quantity || 1
                        )
                      ),
                    ].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  {product.variants[selectedVariant]?.quantity} items available
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    addItem({
                      id: `${product._id}-${product.variants[selectedVariant]?.color}-${product.variants[selectedVariant]?.size}`,
                      title: product.title,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image:
                        product.portfolio[0]?.url ||
                        product.variants[selectedVariant]?.images[0],
                      vendor: product.vendorId.name,
                      type: product.type, // 'product' | 'service'
                      variant: {
                        color: product.variants[selectedVariant]?.color,
                        size: product.variants[selectedVariant]?.size,
                        sku: product.variants[selectedVariant]?.sku,
                      },
                    });
                  }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              <Button size="lg" variant="outline" className="w-full">
                Buy Now
              </Button>
            </div>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Free Delivery</p>
                      <p className="text-sm text-gray-600">
                        Delivered by Dec 28
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">1 Year Warranty</p>
                      <p className="text-sm text-gray-600">
                        Manufacturer warranty included
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">
                        Available in {product.pincode}
                      </p>
                      <p className="text-sm text-gray-600">
                        Check other pincodes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="vendor">Vendor Info</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                  <h4 className="font-semibold mt-6 mb-3">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Ergonomic design with lumbar support</li>
                    <li>Adjustable height mechanism</li>
                    <li>Premium leather upholstery</li>
                    <li>360-degree swivel base</li>
                    <li>Weight capacity up to 120kg</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Dimensions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Height:</span>
                        <span>110-120 cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Width:</span>
                        <span>65 cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Depth:</span>
                        <span>70 cm</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Materials</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Upholstery:</span>
                        <span>Genuine Leather</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frame:</span>
                        <span>Steel</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base:</span>
                        <span>Aluminum</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{product.rating}</div>
                      <div className="flex items-center justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.reviews} reviews
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="font-medium">John Doe</span>
                          <span className="text-sm text-gray-500">
                            2 days ago
                          </span>
                        </div>
                        <p className="text-gray-700">
                          Excellent chair! Very comfortable for long working
                          hours. The leather quality is premium and the
                          adjustability is perfect.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="vendor" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {product.vendorId.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            Pincode: {product.vendorId.pincode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">4.8 vendor rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            Usually responds within 2 hours
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div>
                    <h4 className="font-semibold mb-3">About the Vendor</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Urban Living Furniture has been providing high-quality
                      office and home furniture for over 15 years. We specialize
                      in ergonomic designs that combine comfort with style.
                    </p>
                    <Button variant="outline" className="mt-4">
                      View All Products
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
