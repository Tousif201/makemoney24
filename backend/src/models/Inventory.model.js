import mongoose from "mongoose";

// Track each inventory item
const InventorySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin or Reseller
       required: true
  },
  productDetail: {
    product:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductService",
    required: true
  },
sku:{
  type: String,
  required:true,
  trim:true
}
},
  initialQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  
  stockMovements: [
    {
      type: {
        type: String,
        enum: ["purchase", "sale", "transfer", "return", "adjustment"],
        required: true
      },
      quantity: { type: Number, required: true, min: 1 },
      date: { type: Date, default: Date.now },
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // only for transfers
      to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // only for transfers
      note: { type: String } // optional note
    }
  ]
}, { timestamps: true });

export const Inventory = mongoose.model("Inventory", InventorySchema);


