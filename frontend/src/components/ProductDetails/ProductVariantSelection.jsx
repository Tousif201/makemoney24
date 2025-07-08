// src/components/ProductDetailPage/ProductVariantSelection.jsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductVariantSelection({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  selectedVariant,
  availableColors,
  availableSizes,
  itemVariants,
}) {
  const scrollRef = useRef(null);

  return (
    <motion.div className="space-y-8" variants={itemVariants}>
      {/* Color Selection */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
          Color
        </h3>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar touch-pan-x -mx-1 px-1"
        >
          {availableColors.map((colorOption, index) => (
            <motion.button
              key={colorOption.color || `color-${index}`}
              onClick={() => {
                setSelectedColor(colorOption.color);
                setSelectedSize(null);
                setQuantity(1);
              }}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background group ${
                selectedColor === colorOption.color
                  ? "border-blue-600 shadow-md transform scale-105"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={colorOption.image}
                alt={colorOption.color}
                className="w-full h-full object-cover"
              />
              {selectedColor === colorOption.color && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-600/40 text-white text-3xl font-bold">
                  ✓
                </div>
              )}
              <span className="absolute bottom-0 left-0 right-0 text-white text-xs font-semibold bg-black/60 rounded-b-lg py-1 px-1 text-center truncate">
                {colorOption.color}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      {selectedColor && availableSizes.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Size
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size, index) => (
              <motion.button
                key={size || `size-${index}`}
                onClick={() => {
                  setSelectedSize(size);
                  setQuantity(1);
                }}
                className={`px-5 py-2 text-sm border rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background ${
                  selectedSize === size
                    ? "border-blue-600 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-sm"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {size}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
          Quantity
        </h3>
        <Select
          value={quantity.toString()}
          onValueChange={(value) => setQuantity(Number.parseInt(value))}
          disabled={!selectedVariant || selectedVariant.quantity <= 0}
        >
          <SelectTrigger className="w-36 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background">
            <SelectValue placeholder="Select Qty" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
            {[...Array(Math.min(10, selectedVariant?.quantity || 1))].map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {selectedVariant
            ? selectedVariant.quantity > 0
              ? `${selectedVariant.quantity} items available`
              : "Out of stock for this selection"
            : "Select color and size to see stock"}
        </p>
      </div>
    </motion.div>
  );
}
