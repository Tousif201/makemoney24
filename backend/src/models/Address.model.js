// models/address.models.js
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const addressSchema = new Schema(
  {
    addressLine1: {
      required: true,
      type: String,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      required: true,
      type: String,
      trim: true,
    },
    state: {
      required: true,
      type: String,
      trim: true,
    },
    country: {
      required: true,
      type: String,
      trim: true,
    },
    pincode: {
      required: true,
      type: String,
      trim: true,
    },
    owner: {
      ref: "User",
      type: Schema.Types.ObjectId,
      required: true, // An address must belong to a user
    },
    // Add an optional label for addresses (e.g., "Home", "Work")
    label: {
      type: String,
      trim: true,
      default: "Other",
    },
    // A flag to mark a default address for a user
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.plugin(mongooseAggregatePaginate);

export const Address = mongoose.model("Address", addressSchema);
