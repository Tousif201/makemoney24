import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { getProductServiceById } from "../../api/productService";
import ProductTabs from "../components/ProductDetails/ProductTabs";
import ProductVariantSelection from "../components/ProductDetails/ProductVariantSelection";
import { Badge } from "@/components/ui/badge";
import { useSession } from "../context/SessionContext";
import { toast } from "sonner";
import { addAffiliateUserBucket } from "../../api/affiliate";

const ShopNshipProductDetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { user } = useSession();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductServiceById(productId);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to fetch product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const availableColors = useMemo(
    () => product?.variants?.map((v) => ({ color: v.color, image: v.image })) || [],
    [product]
  );

  const availableSizes = useMemo(() => {
    const colorVariants = product?.variants?.filter((v) => v.color === selectedColor);
    const sizes = colorVariants?.map((v) => v.size) || [];
    return [...new Set(sizes)];
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    return (
      product?.variants?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) || {}
    );
  }, [product, selectedColor, selectedSize]);

  const averageRating = product?.averageRating || 0;
  const totalReviewsCount = product?.reviews?.length || 0;

  if (loading) return <div className="text-center py-20 text-lg">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-20">No product found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-30">
        {/* Left: Product Image */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <img
            src={selectedVariant?.image || product.portfolio?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            className="w-full rounded-xl object-  "
          />
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col justify-between space-y-6 bg-white p-6 rounded-xl shadow-md">
          <div className="space-y-4">
            {/* Category + Type Badges */}
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border-blue-200">
                {product.categoryId?.name || "Uncategorized"}
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
              </Badge>
            </div>

            {/* Title and Bucket Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
              {user?.roles?.includes("affiliate") && (
                <button
                  onClick={async () => {
                    try {
                      const res = await addAffiliateUserBucket(product._id);
                      toast.success(res.message || "Product added to bucket!");
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to add to bucket");
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-md"
                >
                  ➕ Add to your Bucket
                </button>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className="text-sm text-gray-500 ml-2">({totalReviewsCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap gap-4 items-center text-xl font-semibold mt-2">
              <span className="text-green-600">
                ₹{(product.price * (1 - product.discountRate / 100)).toFixed(2)}
              </span>
              <span className="line-through text-gray-400">₹{product.price.toFixed(2)}</span>
              <Badge className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                Save {product.discountRate}%
              </Badge>
              <Badge
                className={`text-xs font-semibold px-2 py-1 rounded-full ${product.courierCharges > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                  }`}
              >
                {product.courierCharges > 0 ? `Delivery ₹${product.courierCharges}` : "Free Delivery"}
              </Badge>
            </div>

            {/* Variant Selection */}
            <ProductVariantSelection
              product={product}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedVariant={selectedVariant}
              availableColors={availableColors}
              availableSizes={availableSizes}
              itemVariants={{}}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/checkout"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex justify-center items-center gap-2 text-base text-center"
            >
              <ShoppingCart className="w-5 h-5" />
              Buy Now
            </Link>

            {/* <Link
              to={`/shopNship/${product.affiliateUser}/${product.affiliateCompany}/products`}
              className="text-blue-600 underline text-sm text-center"
            >
              ← Back to Product List
            </Link> */}
          </div>
        </div>
      </div>

      {/* Tabs for Description, Reviews, Portfolio */}
      <div className="max-w-6xl mx-auto mt-12">
        <ProductTabs
          product={product}
          productId={productId}
          fetchProductDetails={async () => {
            const res = await getProductServiceById(productId);
            setProduct(res.data);
          }}
          averageRating={averageRating}
          totalReviewsCount={totalReviewsCount}
          openMediaViewer={(url, type) => window.open(url, "_blank")}
        />
      </div>
    </div>
  );
};

export default ShopNshipProductDetailsPage;
