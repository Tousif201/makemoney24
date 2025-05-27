// src/pages/EditProduct.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// If you store products in real backend, you'd fetch by ID.
// For demo, re-use the same static data:
const productsData = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: "99.99",
    stock: 45,
    status: "In Stock",
    orders: 23,
    type: "Product",
    description: "High-quality wireless headphones.",
    variants: "Black, White",
    pincode: "700091",
    media: [],
    isBookable: false,
    isInStock: true,
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: "199.99",
    stock: 0,
    status: "Out of Stock",
    orders: 15,
    type: "Product",
    description: "Latest model smart watch.",
    variants: "Silver, Gold",
    pincode: "700091",
    media: [],
    isBookable: false,
    isInStock: false,
  },
  {
    id: 3,
    name: "Laptop Stand",
    category: "Accessories",
    price: "49.99",
    stock: 12,
    status: "Low Stock",
    orders: 8,
    type: "Product",
    description: "Ergonomic laptop stand.",
    variants: "Small, Large",
    pincode: "700091",
    media: [],
    isBookable: false,
    isInStock: true,
  },
];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Local state for the editable form
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    description: "",
    price: "",
    variants: "",
    pincode: "",
    isBookable: false,
    isInStock: true,
    media: [],
    mediaPreviews: [],
  });

  useEffect(() => {
    // Simulate fetching data by ID:
    const existing = productsData.find((p) => p.id === Number(id));
    if (existing) {
      setFormData({
        name: existing.name,
        category: existing.category.toLowerCase(), // match dropdown value
        type: existing.type || "",
        description: existing.description || "",
        price: existing.price || "",
        variants: existing.variants || "",
        pincode: existing.pincode || "",
        isBookable: existing.isBookable,
        isInStock: existing.isInStock,
        media: existing.media || [],
        mediaPreviews: existing.media?.map((url) => url) || [],
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "price" && /\D/.test(value)) return;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSwitch = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleMediaChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...newFiles],
      mediaPreviews: [...prev.mediaPreviews, ...newPreviews],
    }));
  };

  const handleCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Edited Data for ID", id, formData);
    // TODO: send updated formData to backend
    navigate("/dashboard/products");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6">
        Edit Product (ID: {id})
      </h2>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <table className="table-auto w-full border-separate border-spacing-y-4">
          <tbody className="text-left text-sm">

            {/* Name */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Title</td>
              <td className="w-2/3">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Product Name"
                  className="w-full"
                />
              </td>
            </tr>

            {/* Category */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Category</td>
              <td className="w-2/3">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="accessories">Accessories</option>
                  <option value="furniture">Furniture</option>
                  <option value="fashion">Fashion</option>
                </select>
              </td>
            </tr>

            {/* Type */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Type (Product/Service)</td>
              <td className="w-2/3">
                <Input
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Product or Service"
                  className="w-full"
                />
              </td>
            </tr>

            {/* Description */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Description</td>
              <td className="w-2/3">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full"
                />
              </td>
            </tr>

            {/* Price */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Price (in ₹)</td>
              <td className="w-2/3">
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="w-full"
                />
              </td>
            </tr>

            {/* Variants */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Variants (comma-separated)</td>
              <td className="w-2/3">
                <Input
                  name="variants"
                  value={formData.variants}
                  onChange={handleChange}
                  placeholder="e.g. Small, Medium, Large"
                  className="w-full"
                />
              </td>
            </tr>

            {/* Pincode */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Pincode</td>
              <td className="w-2/3">
                <Input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 700091"
                  className="w-full"
                />
              </td>
            </tr>

            {/* Media Upload */}
            <tr className="align-top">
              <td className="font-medium pr-6 py-2 w-1/3">Upload Images/Videos</td>
              <td className="w-2/3">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaChange}
                  className="w-full"
                />
                <div className="mt-3 flex gap-3 flex-wrap">
                  {formData.mediaPreviews.map((src, index) => (
                    <div
                      key={index}
                      className="w-24 h-24 border rounded overflow-hidden relative"
                    >
                      {formData.media[index]?.type.startsWith("video") ? (
                        <video
                          src={src}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={src}
                          alt={`preview-${index}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </td>
            </tr>

            {/* Switch: Is Bookable? */}
            <tr className="align-middle">
              <td className="font-medium pr-6 py-2 w-1/3">Is Bookable?</td>
              <td>
                <Switch
                  checked={formData.isBookable}
                  onCheckedChange={(val) => handleSwitch("isBookable", val)}
                />
              </td>
            </tr>

            {/* Switch: Is In Stock? */}
            <tr className="align-middle">
              <td className="font-medium pr-6 py-2 w-1/3">Is In Stock?</td>
              <td>
                <Switch
                  checked={formData.isInStock}
                  onCheckedChange={(val) => handleSwitch("isInStock", val)}
                />
              </td>
            </tr>

            {/* Submit Button */}
            <tr>
              <td colSpan="2" className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Save Changes
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
