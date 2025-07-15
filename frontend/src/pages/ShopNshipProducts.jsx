// src/components/ShopNshipProductList.js
import React, { useEffect, useState } from "react";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchAffiliateLinkProducts } from "../../api/affiliate";
import { useParams } from "react-router-dom";

const ProductCard = ({ product,userId,companyName }) => {
  const discountedPrice = product.price * (1 - product.discountRate / 100);
  // const { userId, companyName } = useParams();
  // console.log("upar wala",userId,companyName)

  return (
    <Link
      to={`/shopNship/${userId}/${companyName}/products/${product._id}`}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden block"
    >
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
        {product.discountRate}% OFF
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => e.preventDefault()}
        className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
      >
        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
      </button>

      {/* Product Image */}
      <div className="relative h-32 md:h-48 overflow-hidden">
        <img
          src={product.portfolio[0].url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* Product Details */}
      <div className="p-3 md:p-4 space-y-2">
        <h3 className="font-bold text-sm md:text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="text-xs md:text-sm text-gray-500 ml-1">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-2xl font-bold text-green-600">
              ₹{discountedPrice.toFixed(2)}
            </span>
            <span className="text-xs md:text-sm text-gray-500 line-through">
              ₹{product.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buy Now Button */}
        <button
          onClick={(e) => e.preventDefault()}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 md:py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
          Buy Now
        </button>
      </div>
    </Link>
  );
};

const ShopNshipProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId, companyName } = useParams()
  // console.log("neeche wala", userId, companyName)
  useEffect(() => {
    const loadAffiliateProducts = async () => {
      try {
        setLoading(true);

        const response = await fetchAffiliateLinkProducts(userId, companyName);
        console.log("response affiliate", response)
        if (response.data && response.data.length > 0) {
          setProducts(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAffiliateProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ShoP&Ship {companyName}
          </h1>
          <div className="flex justify-end px-3 py-2 rounded-2xl">
            <Link to="/">
              <Button
                variant="outline"
                className="text-white bg-purple-600 border-pink-700 hover:bg-pink-300"
              >
                Explore More Products
              </Button>
            </Link>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals on our carefully curated selection of premium products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} 
            product={product} 
            userId={userId}
            companyName={companyName}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopNshipProductList;
