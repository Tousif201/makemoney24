import React from "react";
import { motion } from "framer-motion";
import { FaChevronRight, FaCartPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCart } from "../context/CartContext"; // Make sure this path is correct

const services = [
  {
    id: 1,
    title: "Salon for Women",
    description: "Beauty treatments at your doorstep",
    image: "https://plus.unsplash.com/premium_photo-1676897161738-de689007567e?q=80&w=1887&auto=format&fit=crop",
    link: "/services/salon-women",
  },
  {
    id: 2,
    title: "Men's Grooming",
    description: "Haircuts, beard styling, facials & more",
    image: "https://images.unsplash.com/photo-1603899968034-1a56ca48d172?q=80&w=1887&auto=format&fit=crop",
    link: "/services/mens-grooming",
  },
  {
    id: 3,
    title: "Massage",
    description: "Haircuts, beard styling, facials & more",
    image: "https://images.unsplash.com/photo-1603899968034-1a56ca48d172?q=80&w=1887&auto=format&fit=crop",
    link: "/services/masa",
  },
  // ... Add more items like before
];

const Services = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (service) => {
    addToCart(service);
    Swal.fire({
      position: "top-start",
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
    <div className="min-h-screen pt-10 px-4 sm:px-6 lg:px-12 bg-gray-50">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Home services at your doorstep</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow hover:shadow-md transition"
              >
                <img src={service.image} alt={service.title} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-semibold">{service.title}</h4>
                  <p className="text-xs text-gray-500">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            "https://images.unsplash.com/photo-1594611372970-4e9201566205",
            "https://images.unsplash.com/photo-1605152276897-4f618f831968",
            "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea",
            "https://images.unsplash.com/photo-1708915965975-2a950db0e215",
          ].map((img, i) => (
            <img
              key={i}
              src={`${img}?q=80&w=800&auto=format&fit=crop`}
              alt={`Service ${i + 1}`}
              className="rounded-xl object-cover h-36 sm:h-48 w-full"
            />
          ))}
        </div>
      </div>

      {/* Explore Services */}
      <div className="mt-16 max-w-screen-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">Explore Our Services</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <img src={service.image} alt={service.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <a
                    href={service.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details <FaChevronRight className="ml-1 text-xs" />
                  </a>
                  <button
                    onClick={() => handleAddToCart(service)}
                    className="text-green-600 hover:text-green-800 text-lg"
                    title="Add to Cart"
                  >
                    <FaCartPlus />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
