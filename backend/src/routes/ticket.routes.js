import express from "express";
import {
  // Ticket Controllers
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  // Ticket Message Controllers
  createTicketMessage,
  getTicketMessages,
  deleteTicketMessage,
} from "../controllers/ticket.controller.js"; // All controllers are in one file

const router = express.Router();

// Ticket Routes
router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

router.post("/messages", createTicketMessage);
router.get("/:ticketId/messages", getTicketMessages);
router.delete("/messages/:messageId", deleteTicketMessage);

export default router;
