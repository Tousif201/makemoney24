// src/context/CartContext.js
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Effect to load cart from localStorage on initial mount
  // This useEffect remains, as it's for initial loading.
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error(
          "[CartContext] Error parsing cart from localStorage:",
          error
        );
      }
    } else {
      console.log("[CartContext] No saved cart found in localStorage.");
    }
  }, []); // Runs only once on mount

  // --- IMPORTANT CHANGE: REMOVED THE PREVIOUS SAVE useEffect ---
  // The saving logic is now integrated directly into the state-modifying functions.
  // This ensures localStorage is updated synchronously with the state change.

  const updateLocalStorage = (newItems) => {
    try {
      localStorage.setItem("cart", JSON.stringify(newItems));
    } catch (error) {
      console.error("[CartContext] Error saving cart to localStorage:", error);
    }
  };

  const addItem = (newItem) => {
    setItems((prevItems) => {
      let newState;
      const existingItem = prevItems.find(
        (item) =>
          item.id === newItem.id &&
          item.variant?.color === newItem.variant?.color &&
          item.variant?.size === newItem.variant?.size
      );

      if (existingItem) {
        newState = prevItems.map((item) =>
          item.id === existingItem.id &&
          item.variant?.color === existingItem.variant?.color &&
          item.variant?.size === existingItem.variant?.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newState = [...prevItems, { ...newItem, quantity: 1 }];
      }

      updateLocalStorage(newState); // <--- SAVE TO LOCALSTORAGE HERE
      return newState;
    });
  };

  const removeItem = (id) => {
    setItems((prevItems) => {
      const newState = prevItems.filter((item) => item.id !== id);
      updateLocalStorage(newState); // <--- SAVE TO LOCALSTORAGE HERE
      return newState;
    });
  };

  const updateQuantity = (id, quantity) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        const newState = prevItems.filter((item) => item.id !== id);
        updateLocalStorage(newState); // <--- SAVE TO LOCALSTORAGE HERE
        return newState;
      }

      const newState = prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      updateLocalStorage(newState); // <--- SAVE TO LOCALSTORAGE HERE
      return newState;
    });
  };

  const clearCart = () => {
    setItems([]);
    updateLocalStorage([]); // <--- SAVE TO LOCALSTORAGE HERE
    console.log("[CartContext] Cart cleared.");
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
