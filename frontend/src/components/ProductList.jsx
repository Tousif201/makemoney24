// components/ProductList.jsx
import React from "react";
import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    title: "Stylish Headphones",
    description: "High-quality sound and noise cancellation.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    title: "Smartwatch Pro",
    description: "Track fitness and stay connected on the go.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1617625802912-cde586faf331?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    title: "Wireless Mouse",
    description: "Ergonomic design with long battery life.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1613141411244-0e4ac259d217?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    title: "Gaming Keyboard",
    description: "RGB lighting and mechanical keys.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1592424002053-21f369ad7fdb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    title: "Portable Speaker",
    description: "Loud, clear sound with deep bass.",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1605648916319-cf082f7524a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 6,
    title: "Drone Camera",
    description: "4K camera with live GPS tracking.",
    price: 499.99,
    image: "https://plus.unsplash.com/premium_photo-1714618849685-89cad85746b1?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    title: "Laptop Stand",
    description: "Adjustable and lightweight aluminum stand.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2068&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 8,
    title: "Smart LED Bulb",
    description: "Control with app or voice assistant.",
    price: 14.99,
    image: "https://plus.unsplash.com/premium_photo-1661935889429-5079b2bac1b8?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 9,
    title: "Fitness Tracker",
    description: "Monitor your steps, heart rate, and sleep.",
    price: 79.99,
    image: "https://plus.unsplash.com/premium_photo-1712761997182-45455a50d8c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 10,
    title: "Wireless Charger",
    description: "Fast charging for all devices.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1606077095660-726118e877fd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2lyZWxlc3MlMjBjaGFyZ2VyfGVufDB8fDB8fHww",
  },
];

const ProductList = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-10">Latest Products</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
