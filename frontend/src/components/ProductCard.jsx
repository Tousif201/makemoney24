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
    if (product.discountRate && product.discountRate > 0 && product.discountRate <= 100) {
      const discountAmount = (product.price * product.discountRate) / 100;
      return product.price - discountAmount;
    }
    return product.price; // No discount or invalid discount rate
  };

  const discountedPrice = calculateDiscountedPrice();
  const showDiscount = product.discountRate && product.discountRate > 0 && product.discountRate <= 100;

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

  // Handle image click (navigate to product details for mobile/tablet)
  const handleImageClick = () => {
    if (isMobileOrTablet) {
      navigate(`/item/${product.id}`); // Navigate to product detail
    }
  };

  const handleViewDetails = () => {
    console.log(`Viewing details for product: ${product.title}`);
    // This function might not be strictly necessary if Link is used directly,
    // but kept for consistency with your original code.
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative bg-white border rounded-xl overflow-hidden shadow-md group"
    >
      {/* Image - adjust size on mobile */}
      <img
        src={product.image}
        alt={product.title}
        className={`w-full ${
          isMobileOrTablet ? "h-48" : "h-80"
        } object-cover cursor-pointer`}
        onClick={handleImageClick}
      />

      {/* Overlay icons - only show on desktop */}
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

      {/* Product Info Section */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-3 flex items-baseline space-x-2">
          {showDiscount ? (
            <>
              {/* Original price, struck out */}
              <span className="text-sm text-gray-400 line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {/* Discounted price */}
              <span className="text-lg text-blue-600 font-bold">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </span>
              {/* Discount percentage badge (optional, but good for UX) */}
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {product.discountRate}% OFF
              </span>
            </>
          ) : (
            // Only show price if no discount
            <span className="text-lg text-blue-600 font-bold">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
