import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const navigate = useNavigate();

  // Detect screen size for responsiveness
  useEffect(() => {
    const checkScreen = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (
      product.discountRate &&
      product.discountRate > 0 &&
      product.discountRate <= 100
    ) {
      const discountAmount = (product.price * product.discountRate) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  };

  const discountedPrice = calculateDiscountedPrice();
  const showDiscount = Boolean(
    product.discountRate &&
      parseInt(product.discountRate) > 0 &&
      parseInt(product.discountRate) <= 100
  );

  // Add product to cart and show success toast
  const handleAddToCart = () => {
    addToCart(product);
    Swal.fire({
      icon: "success",
      title: "🛍️ Added to Cart!",
      text: `${product.title} has been added to your cart.`,
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: "bottom-end",
      background: "#f0fdf4",
      color: "#0f172a",
    });
  };

  // Navigate to product detail on image click (for mobile/tablet)
  const handleImageClick = () => {
    if (isMobileOrTablet) {
      navigate(`/item/${product.id}`);
    }
  };

  const handleViewDetails = () => {
    console.log(`Viewing details for product: ${product.title}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative bg-white border rounded-md overflow-hidden shadow-md group"
    >
      {/* Product Image */}
      <img
        src={product.image}
        alt={product.title}
        className={`w-full ${
          isMobileOrTablet ? "h-52" : "h-80"
        } object-cover cursor-pointer`}
        onClick={handleImageClick}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
        }}
      />

      {/* Overlay Action Buttons (desktop only) */}
      <div
        className={`absolute inset-0 transition duration-300 flex items-center justify-center gap-4
          ${
            isMobileOrTablet
              ? "hidden"
              : "md:flex md:opacity-0 md:group-hover:opacity-100 md:group-hover:bg-black/10"
          }
        `}
      >
        <button
          onClick={handleAddToCart}
          className="text-white text-xl bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition"
          aria-label={`Add ${product.title} to cart`}
        >
          <FaShoppingCart />
        </button>

        <Link to={`/item/${product.id}`}>
          <button
            onClick={handleViewDetails}
            className="text-white text-xl bg-gray-600 p-2 rounded-full hover:bg-gray-700 transition"
            aria-label={`View details for ${product.title}`}
          >
            <FaEye />
          </button>
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">
          {product.description}
        </p>

        {/* Price & Discount */}
        <div className="mt-3 flex items-center flex-wrap gap-2">
          {showDiscount ? (
            <>
              <span className="text-lg text-slate-800 font-bold">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {product.discountRate}% OFF
              </span>
            </>
          ) : (
            <span className="text-lg text-slate-800 font-bold">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
