import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: { type: String },
  byUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "resolved", "re-open"],
  },
  type: { type: String },
  supportDocuments: [
    {
      url: { type: String },
      key: { type: String },
    },
  ],
  actionTaken: { type: String },
},
{
  timestamps: true,
}
);

// ✅ Indexes for faster querying
ticketSchema.index({ status: 1 });
ticketSchema.index({ toUser: 1 });
ticketSchema.index({ actionTaken: 1 });
ticketSchema.index({ type: 1 }); // Optional but helpful if type is queried often

export const Ticket = mongoose.model("ticket", ticketSchema);
