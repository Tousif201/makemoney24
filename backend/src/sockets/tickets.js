// sockets/tickets.js
import TicketMessage from '../models/TicketMessage.model.js';
import Ticket from '../models/Ticket.model.js';
import { User } from '../models/User.model.js'; // Assuming User model is at this path
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables for JWT secret

/**
 * @description Authenticates a Socket.IO connection using a JWT token from handshake.
 * If successful, attaches the user object to socket.user.
 * @param {Socket} socket - The Socket.IO socket instance.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
const authenticateSocket = async (socket, next) => {
    const token = socket.handshake.auth.token; // Client should send token as auth.token

    if (!token) {
        console.warn('Socket authentication error: Token not provided.');
        return next(new Error('Authentication error: Token not provided.'));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken"); // Exclude sensitive fields

        if (!user) {
            console.warn(`Socket authentication error: User not found for ID ${decodedToken?.id}.`);
            return next(new Error('Authentication error: User not found.'));
        }

        socket.user = user; // Attach authenticated user to the socket object
        console.log(`User ${user.email} (ID: ${user._id}) connected via socket.`);
        next(); // Continue with connection
    } catch (err) {
        console.error('Socket authentication error: Invalid token.', err.message);
        return next(new Error('Authentication error: Invalid token.'));
    }
};

/**
 * @description Sets up Socket.IO event listeners for ticket messaging.
 * @param {Server} io - The Socket.IO server instance.
 */
const setupTicketSocketEvents = (io) => {
    // Apply authentication middleware to all incoming socket connections
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} for user ${socket.user?.email}`);

        // ======================================
        // Event: 'joinTicket'
        // Description: Client joins a specific ticket chat room.
        // Data: { ticketId: string }
        // ======================================
        socket.on('joinTicket', (ticketId) => {
            // Ensure the user is authorized to join this ticket's room
            // You might check if socket.user is the requester or assignedTo, or an admin
            // For simplicity, we'll allow joining for now, but production needs auth check here.
            // E.g., const ticket = await Ticket.findById(ticketId);
            // if (!ticket || (ticket.requester.toString() !== socket.user._id.toString() && ticket.assignedTo.toString() !== socket.user._id.toString() && !socket.user.isAdmin)) {
            //   return socket.emit('joinTicketError', { message: 'Unauthorized to join this ticket.' });
            // }

            socket.join(ticketId);
            console.log(`User ${socket.user?.email} joined ticket room: ${ticketId}`);
            socket.emit('joinedTicket', { ticketId, message: `Joined ticket ${ticketId} chat.` });
        });

        // ======================================
        // Event: 'newTicketMessage'
        // Description: Client sends a new message for a ticket.
        // Data: { ticketId: string, message: string, attachments?: Array<{key: string, url: string}>, isInternalNote?: boolean }
        // ======================================
        socket.on('newTicketMessage', async ({ ticketId, message, attachments = [], isInternalNote = false }) => {
            // The senderId comes directly from the authenticated socket.user
            const senderId = socket.user._id;

            if (!ticketId || !message) {
                socket.emit('messageError', { success: false, message: 'Missing required fields: ticketId and message.' });
                return;
            }

            try {
                // Find the ticket to ensure it exists and update its messages array
                const ticket = await Ticket.findById(ticketId);
                if (!ticket) {
                    socket.emit('messageError', { success: false, message: 'Ticket not found.' });
                    return;
                }

                // Create and save the new message to the database
                const newMessage = await TicketMessage.create({
                    ticketId,
                    sender: senderId,
                    message,
                    attachments,
                    isInternalNote,
                });

                // Add the new message's ID to the parent ticket's messages array
                ticket.messages.push(newMessage._id);
                await ticket.save();

                // Populate sender details for broadcasting
                await newMessage.populate('sender', 'name email');

                // Emit the new message to all clients in the specific ticket room (including the sender)
                io.to(ticketId).emit('ticketMessage', newMessage);

                // Optionally, confirm to the sender that the message was sent successfully
                // socket.emit('messageSentConfirmation', newMessage);

                console.log(`Message sent in ticket ${ticketId} by ${socket.user.email}: ${message}`);

            } catch (error) {
                console.error("Error saving/emitting ticket message:", error);
                socket.emit('messageError', { success: false, message: 'Error sending message.' });
            }
        });

        // ======================================
        // Event: 'disconnect'
        // Description: Fired when a client disconnects.
        // ======================================
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id} for user ${socket.user?.email}`);
            // Clean up any user-specific data if necessary
        });

        // ======================================
        // Optional: 'leaveTicket' event
        // When a user explicitly leaves a chat room
        // socket.on('leaveTicket', (ticketId) => {
        //   socket.leave(ticketId);
        //   console.log(`User ${socket.user?.email} left ticket room: ${ticketId}`);
        // });
        // ======================================

        // You can add more events here, e.g., 'typing', 'readMessage', 'ticketStatusUpdate'
    });
};

export default setupTicketSocketEvents;