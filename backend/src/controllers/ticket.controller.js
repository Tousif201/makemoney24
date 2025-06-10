// import { Ticket } from "../models/Ticket.model.js";\
import  { Ticket } from "../models/Ticket.model.js";
import { User } from "../models/User.model.js";

// ===============================
// ✅ Create Ticket
// ===============================
export const createTicket = async (req, res) => {
  try {
    const { title, description, type, status, toUser, userId,supportDocuments = [] } = req.body;
     // Assume logged-in user ID comes from middleware

    let assignedTo = toUser;

    // If toUser not defined, assign to any available admin
    if (!assignedTo) {
      const adminUser = await User.findOne({ roles: "admin" });
      if (!adminUser) {
        return res.status(404).json({
          success: false,
          message: "No admin user found to assign the ticket.",
        });
      }
      assignedTo = adminUser._id;
    }

    const ticket = await Ticket.create({
      title,
      description,
      type,
      status: status || "pending",
      byUser: userId,
      toUser: assignedTo,
      supportDocuments, // Directly saving url and key received from frontend
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error creating ticket: " + error.message,
    });
  }
};

// ===============================
// ✅ Get All Tickets
// ===============================
export const getTickets = async (req, res) => {
  try {
    const { status, type, toUser } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (toUser) query.toUser = toUser;

    const tickets = await Ticket.find(query)
      .populate("byUser", "name email")
      .populate("toUser", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tickets: " + error.message,
    });
  }
};

// ===============================
// ✅ Get Single Ticket by ID
// ===============================
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate("byUser", "name email")
      .populate("toUser", "name email");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error getting ticket: " + error.message,
    });
  }
};

// ===============================
// ✅ Update Ticket (status, actionTaken, supportDocuments)
// ===============================
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actionTaken, supportDocuments = [] } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    if (status) ticket.status = status;
    if (actionTaken) ticket.actionTaken = actionTaken;
    if (supportDocuments.length > 0) {
      ticket.supportDocuments.push(...supportDocuments); // Append new support docs
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ticket: " + error.message,
    });
  }
};

// ===============================
// ✅ Delete Ticket
// ===============================
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTicket = await Ticket.findByIdAndDelete(id);
    if (!deletedTicket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting ticket: " + error.message,
    });
  }
};
