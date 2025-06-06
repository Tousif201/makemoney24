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
        className={`w-full ${isMobileOrTablet ? "h-48" : "h-80"} object-cover cursor-pointer`}
        onClick={handleImageClick}
      />

      {/* Overlay icons - only show on desktop */}
      <div
        className={`absolute inset-0 transition duration-300 flex items-center justify-center gap-4
          ${isMobileOrTablet ? "hidden" : "md:flex md:opacity-0 md:group-hover:opacity-100 md:group-hover:bg-black/10"}
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
        <h3 className="text-xl font-semibold text-gray-800">{product.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{product.description}</p>
        <div className="mt-3 text-lg text-blue-600 font-bold">
          ₹{product.price}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
