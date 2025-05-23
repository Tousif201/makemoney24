import React from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (service) => {
    addToCart(service);
    Swal.fire({
    
      icon: "success",
      title: "🛍️ Added to Cart!",
      text: `${service.title} has been added to your cart.`,
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      background: "#f0fdf4",
      color: "#0f172a",
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative bg-white border rounded-xl overflow-hidden shadow-md group"
    >
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-80 object-cover"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
        <button
          onClick={handleAddToCart}
          className="text-white text-xl bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition"
        >
          <FaShoppingCart />
        </button>
        <button
          className="text-white text-xl bg-gray-600 p-2 rounded-full hover:bg-gray-700 transition"
        >
          <FaEye />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{product.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{product.description}</p>
        <div className="mt-3 text-lg text-blue-600 font-bold">
          ${product.price}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
