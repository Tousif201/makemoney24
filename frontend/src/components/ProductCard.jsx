import React from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Removed 'service' parameter as it's not passed directly from onClick
    addToCart(product); // Pass the 'product' prop directly
    Swal.fire({
      icon: "success",
      title: "🛍️ Added to Cart!",
      text: `${product.title} has been added to your cart.`, // Use product.title
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: "bottom-end", // Often better for toasts
      background: "#f0fdf4",
      color: "#0f172a",
      customClass: {
        popup: "swal2-toast-popup", // Add a custom class if you want to style further
      },
    });
  };

  // Optional: Function to handle view/details click
  const handleViewDetails = () => {
    // Implement navigation to a product details page
    // For example, if using React Router:
    // navigate(`/product/${product.id}`);
    console.log(
      `Viewing details for product: ${product.title} (ID: ${product.id})`
    );
    // Or open a modal with details
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
          // Pass the product object directly to handleAddToCart without an extra arrow function
          // when `handleAddToCart` doesn't need to be parameterized from the JSX.
          // If you need to pass it, you'd do: `onClick={() => handleAddToCart(product)}`
          // but since `handleAddToCart` now accesses `product` from the prop, this is cleaner.
          onClick={handleAddToCart}
          className="text-white text-xl bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition"
          aria-label={`Add ${product.title} to cart`} // Accessibility
        >
          <FaShoppingCart />
        </button>
        <Link to={`/item/${product.id}`}>
          <button
            onClick={handleViewDetails} // Added click handler for view details
            className="text-white text-xl bg-gray-600 p-2 rounded-full hover:bg-gray-700 transition"
            aria-label={`View details for ${product.title}`} // Accessibility
          >
            <FaEye />
          </button>
        </Link>
      </div>

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
