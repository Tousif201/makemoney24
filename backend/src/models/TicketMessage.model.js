import mongoose from "mongoose";

/**
 * @typedef {object} Attachment
 * @property {string} key - The unique key for the file.
 * @property {string} url - The direct URL to access the attachment.
 */

/**
 * @typedef {object} TicketMessage
 * @property {mongoose.Schema.Types.ObjectId} ticketId - Reference to the parent ticket.
 * @property {mongoose.Schema.Types.ObjectId} sender - The user who wrote the message.
 * @property {string} message - The content of the message.
 * @property {Attachment[]} attachments - Any documents attached to this specific message.
 * @property {boolean} isInternalNote - Flag for private notes visible only to agents.
 */

const ticketMessageSchema = new mongoose.Schema({
    /** @type {mongoose.Schema.Types.ObjectId} */
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
        index: true,
    },

    /** @type {mongoose.Schema.Types.ObjectId} */
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    /** @type {string} */
    message: {
        type: String,
        required: true,
    },

    /**
     * @description Array of attachments embedded directly in the message.
     * @type {Attachment[]}
     */
    attachments: [{
        key: { type: String, required: true },
        url: { type: String, required: true },
    }],

    /** @type {boolean} */
    isInternalNote: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true,
    });

const TicketMessage =
    mongoose.models.TicketMessage || mongoose.model("TicketMessage", ticketMessageSchema);

export default TicketMessage;
