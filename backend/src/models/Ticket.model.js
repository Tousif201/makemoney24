import mongoose from "mongoose";

/**
 * @typedef {object} Attachment
 * @property {string} key - The unique key for the file, often used for storage services like S3.
 * @property {string} url - The direct URL to access the attachment.
 */

/**
 * @typedef {object} Ticket
 * @property {string} title - The main title or subject of the ticket.
 * @property {mongoose.Schema.Types.ObjectId} requester - The user who submitted the ticket.
 * @property {mongoose.Schema.Types.ObjectId} assignedTo - The agent or user assigned to handle the ticket.
 * @property {string} description - A detailed description of the issue or request.
 * @property {'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened'} status - The current status of the ticket.
 * @property {'low' | 'medium' | 'high' | 'urgent'} priority - The priority level of the ticket.
 * @property {string} category - The category of the ticket for classification.
 * @property {Attachment[]} attachments - An array of supporting documents.
 * @property {mongoose.Schema.Types.ObjectId[]} messages - A history of all messages and comments related to this ticket.
 */

const ticketSchema = new mongoose.Schema({
  /** @type {string} */
  title: { type: String, required: true },

  /** @type {mongoose.Schema.Types.ObjectId} */
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  /** @type {mongoose.Schema.Types.ObjectId} */
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },

  /** @type {string} */
  description: { type: String, required: true },

  /** @type {'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened'} */
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed", "reopened"],
    default: "open",
    index: true,
  },



  /** @type {string} */
  category: {
    type: String,
    enum: [
      "general_inquiry", "technical_support", "glitch_report", "bug_report",
      "feature_request", "billing_inquiry", "payment_issue", "membership_issue", "item_replacement", "other"
    ],
    required: true,
    index: true,
  },

  /**
   * @description Array of attachments embedded directly in the ticket.
   * @type {Attachment[]}
   */
  attachments: [{
    key: { type: String, required: true },
    url: { type: String, required: true },
  }],

  /** @type {mongoose.Schema.Types.ObjectId[]} */
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketMessage"
  }]
},
  {
    timestamps: true,
  });

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;
