// ============================
// File: models/ProductService.js
// ============================
const productServiceSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: "Vendor" },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  type: { type: String, enum: ["product", "service"], required: true },
  title: String,
  description: String,
  price: Number,

  // Portfolio with media type
  portfolio: [
    {
      type: { type: String, enum: ["image", "video"] },
      url: String,
    },
  ],

  pincode: String,
  isBookable: { type: Boolean, default: false }, // only true for services

  // ✅ Allows vendors to toggle product/service availability
  isInStock: { type: Boolean, default: true },
});
export const ProductService = model("ProductService", productServiceSchema);
