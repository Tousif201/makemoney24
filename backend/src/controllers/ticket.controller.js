import Ticket from "../models/Ticket.model.js";
import TicketMessage from "../models/TicketMessage.model.js";
import { User } from "../models/User.model.js"; // Assuming you have a User model

/**
 * @description Helper function to handle common errors and send a standardized error response.
 * @param {object} res - The Express response object.
 * @param {Error} error - The error object caught in the try-catch block.
 * @param {string} message - A human-readable message describing the error context.
 * @returns {void}
 */
const handleControllerError = (res, error, message) => {
  console.error(`${message}:`, error);
  res.status(500).json({
    success: false,
    message: `${message}: ${error.message}`,
  });
};

// ===========================================
// ✅ Ticket Controllers
// ===========================================

/**
 * @description Creates a new support ticket.
 * Assigns the ticket to an admin user if no specific agent is provided.
 * @param {object} req - The Express request object.
 * @param {object} req.body - The request body containing ticket details.
 * @param {string} req.body.title - The title of the ticket.
 * @param {string} req.body.description - The detailed description of the ticket.
 * @param {string} req.body.category - The category of the ticket (e.g., 'technical_support').
 * @param {('low' | 'medium' | 'high' | 'urgent')} [req.body.priority='medium'] - The priority of the ticket.
 * @param {string} req.body.requesterId - The ObjectId of the user submitting the ticket.
 * @param {string} [req.body.assignedToId] - Optional ObjectId of the user/agent to assign the ticket to.
 * @param {Array<{key: string, url: string}>} [req.body.attachments=[]] - An array of attachment objects.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If there's an issue with database operations or input validation.
 */
export const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority = "medium",
      requesterId,
      assignedToId,
      attachments = [],
    } = req.body;

    if (!title || !description || !category || !requesterId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, category, and requesterId.",
      });
    }

    let assignedTo = assignedToId;

    if (!assignedTo) {
      const adminUser = await User.findOne({ roles: "admin" });
      if (!adminUser) {
        return res.status(404).json({
          success: false,
          message: "No admin/support user found to assign the ticket.",
        });
      }
      assignedTo = adminUser._id;
    }

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      requester: requesterId,
      assignedTo: assignedTo,
      attachments,
      messages: [],
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      ticket,
    });
  } catch (error) {
    handleControllerError(res, error, "Error creating ticket");
  }
};

/**
 * @description Retrieves a list of support tickets, with optional filtering by status, category, requester, or assigned agent.
 * Populates requester, assignedTo, and messages with sender details.
 * @param {object} req - The Express request object.
 * @param {object} req.query - The query parameters for filtering tickets.
 * @param {('open' | 'in_progress' | 'resolved' | 'closed' | 'reopened')} [req.query.status] - Filter by ticket status.
 * @param {string} [req.query.category] - Filter by ticket category.
 * @param {string} [req.query.requesterId] - Filter by the ID of the ticket requester.
 * @param {string} [req.query.assignedToId] - Filter by the ID of the assigned agent.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If there's an issue with database operations.
 */
export const getTickets = async (req, res) => {
  try {
    const { status, category, requesterId, assignedToId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (requesterId) query.requester = requesterId;
    if (assignedToId) query.assignedTo = assignedToId;

    const tickets = await Ticket.find(query)
      .populate("requester", "name email")
      .populate("assignedTo", "name email")
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    handleControllerError(res, error, "Error fetching tickets");
  }
};

/**
 * @description Retrieves a single support ticket by its ID.
 * Populates requester, assignedTo, and messages with sender details.
 * @param {object} req - The Express request object.
 * @param {object} req.params - The route parameters.
 * @param {string} req.params.id - The ObjectId of the ticket to retrieve.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If the ticket is not found or there's a database error.
 */
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate("requester", "name email")
      .populate("assignedTo", "name email")
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "name email",
        },
        options: { sort: { createdAt: 1 } }
      });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    handleControllerError(res, error, "Error fetching ticket");
  }
};

/**
 * @description Updates an existing support ticket's status, assigned agent, priority, or adds new attachments.
 * @param {object} req - The Express request object.
 * @param {object} req.params - The route parameters.
 * @param {string} req.params.id - The ObjectId of the ticket to update.
 * @param {object} req.body - The request body containing update fields.
 * @param {('open' | 'in_progress' | 'resolved' | 'closed' | 'reopened')} [req.body.status] - New status for the ticket.
 * @param {string} [req.body.assignedToId] - New ObjectId of the agent to assign the ticket to.
 * @param {('low' | 'medium' | 'high' | 'urgent')} [req.body.priority] - New priority for the ticket.
 * @param {Array<{key: string, url: string}>} [req.body.attachments=[]] - An array of new attachment objects to append.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If the ticket is not found, input validation fails, or there's a database error.
 */
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedToId, priority, attachments = [] } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    if (status) {
      if (!["open", "in_progress", "resolved", "closed", "reopened"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value." });
      }
      ticket.status = status;
    }
    if (assignedToId) ticket.assignedTo = assignedToId;
    if (priority) {
      if (!["low", "medium", "high", "urgent"].includes(priority)) {
        return res.status(400).json({ success: false, message: "Invalid priority value." });
      }
      ticket.priority = priority;
    }
    if (attachments.length > 0) {
      ticket.attachments.push(...attachments);
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully.",
      ticket,
    });
  } catch (error) {
    handleControllerError(res, error, "Error updating ticket");
  }
};

/**
 * @description Deletes a support ticket and all its associated messages.
 * @param {object} req - The Express request object.
 * @param {object} req.params - The route parameters.
 * @param {string} req.params.id - The ObjectId of the ticket to delete.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If the ticket is not found or there's a database error.
 */
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTicket = await Ticket.findByIdAndDelete(id);
    if (!deletedTicket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    await TicketMessage.deleteMany({ ticketId: id });

    res.status(200).json({
      success: true,
      message: "Ticket and its associated messages deleted successfully.",
    });
  } catch (error) {
    handleControllerError(res, error, "Error deleting ticket");
  }
};

// ===========================================
// ✅ Ticket Message Controllers
// ===========================================

/**
 * @description Creates a new message for a specific ticket.
 * Adds the new message's ID to the parent ticket's `messages` array.
 * @param {object} req - The Express request object.
 * @param {object} req.body - The request body containing message details.
 * @param {string} req.body.ticketId - The ObjectId of the parent ticket.
 * @param {string} req.body.senderId - The ObjectId of the user sending the message.
 * @param {string} req.body.message - The content of the message.
 * @param {Array<{key: string, url: string}>} [req.body.attachments=[]] - An array of attachment objects for the message.
 * @param {boolean} [req.body.isInternalNote=false] - Flag indicating if the message is an internal note.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If missing required fields, ticket not found, or a database error occurs.
 */
export const createTicketMessage = async (req, res) => {
  try {
    const {
      ticketId,
      senderId,
      message,
      attachments = [],
      isInternalNote = false,
    } = req.body;

    if (!ticketId || !senderId || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: ticketId, senderId, and message.",
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    const newMessage = await TicketMessage.create({
      ticketId,
      sender: senderId,
      message,
      attachments,
      isInternalNote,
    });

    ticket.messages.push(newMessage._id);
    await ticket.save();

    await newMessage.populate("sender", "name email");

    res.status(201).json({
      success: true,
      message: "Ticket message created successfully.",
      ticketMessage: newMessage,
    });
  } catch (error) {
    handleControllerError(res, error, "Error creating ticket message");
  }
};

/**
 * @description Retrieves all messages for a specific ticket, ordered chronologically.
 * Populates the sender details for each message.
 * @param {object} req - The Express request object.
 * @param {object} req.params - The route parameters.
 * @param {string} req.params.ticketId - The ObjectId of the ticket whose messages are to be retrieved.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If the ticket is not found or there's a database error.
 */
export const getTicketMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticketExists = await Ticket.exists({ _id: ticketId });
    if (!ticketExists) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    const messages = await TicketMessage.find({ ticketId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    handleControllerError(res, error, "Error fetching ticket messages");
  }
};

/**
 * @description Deletes a specific ticket message by its ID and removes its reference from the parent ticket.
 * @param {object} req - The Express request object.
 * @param {object} req.params - The route parameters.
 * @param {string} req.params.messageId - The ObjectId of the ticket message to delete.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A Promise that resolves to void. Sends JSON response.
 * @throws {Error} If the message is not found or there's a database error.
 */
export const deleteTicketMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await TicketMessage.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ success: false, message: "Ticket message not found." });
    }

    await Ticket.updateOne(
      { _id: deletedMessage.ticketId },
      { $pull: { messages: messageId } }
    );

    res.status(200).json({
      success: true,
      message: "Ticket message deleted successfully.",
    });
  } catch (error) {
    handleControllerError(res, error, "Error deleting ticket message");
  }
};
