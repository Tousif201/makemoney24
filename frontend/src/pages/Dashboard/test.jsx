import React, { useState, useEffect, useCallback } from "react";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketMessages,
} from "../../../api/ticket"; // Adjust path as needed
import { io } from "socket.io-client"; // For WebSocket
import { backendConfig } from "../../../constant/config"; // To get backend URL for Socket.IO
import { useSession } from "../../context/SessionContext"; // Assuming useSession provides session.id

const Test = () => {
  const [tickets, setTickets] = useState([]); // State to hold all tickets
  const [selectedTicketId, setSelectedTicketId] = useState(null); // ID of the currently viewed ticket
  const [selectedTicket, setSelectedTicket] = useState(null); // Details of the currently viewed ticket
  const [messages, setMessages] = useState([]); // Messages for the selected ticket
  const [newMessage, setNewMessage] = useState(""); // Input for new chat message
  const [loading, setLoading] = useState(true); // Global loading state
  const [ticketFormLoading, setTicketFormLoading] = useState(false); // Loading for ticket creation/update
  const [error, setError] = useState(null); // Global error state
  const [socket, setSocket] = useState(null); // Socket.IO instance

  // Form states for creating a new ticket
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("general_inquiry");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");
  const [newTicketAssignedTo, setNewTicketAssignedTo] = useState(""); // Optional: to assign to a specific user

  const { session, loading: sessionLoading } = useSession();
  const currentUserId = session?.id; // Get user ID from session context

  // Fetch all tickets when the component mounts or `currentUserId` becomes available
  const fetchAllTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTickets();
      setTickets(response.tickets);
    } catch (err) {
      setError(err.message || "Failed to fetch all tickets.");
      console.error("Error fetching all tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch all tickets initially
  useEffect(() => {
    if (!sessionLoading && currentUserId) {
      fetchAllTickets();
    }
  }, [sessionLoading, currentUserId, fetchAllTickets]);

  // Effect to fetch selected ticket details and set up WebSocket
  useEffect(() => {
    if (!selectedTicketId || !currentUserId) {
      // Clean up socket if no ticket is selected
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setSelectedTicket(null);
      setMessages([]);
      return;
    }

    const fetchSelectedTicketData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch ticket details
        const ticketResponse = await getTicketById(selectedTicketId);
        setSelectedTicket(ticketResponse.ticket);

        // Fetch initial messages for the ticket
        const messagesResponse = await getTicketMessages(selectedTicketId);
        setMessages(messagesResponse.messages);

        // --- WebSocket Setup ---
        const token = localStorage.getItem("authToken");
        // Disconnect existing socket before creating a new one
        if (socket) {
          socket.disconnect();
        }
        const newSocket = io(backendConfig.origin, {
          auth: { token: token },
          transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
          console.log("Socket Connected!");
          newSocket.emit("joinTicket", selectedTicketId);
        });

        newSocket.on("joinedTicket", (data) => {
          console.log(data.message);
        });

        newSocket.on("ticketMessage", (message) => {
          console.log("Received new message via socket:", message);
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on("messageError", (err) => {
          console.error("Socket message error:", err.message);
          alert(`Error sending message: ${err.message}`);
        });

        newSocket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          setError(`Socket connection failed: ${err.message}`);
        });

        newSocket.on("disconnect", () => {
          console.log("Socket Disconnected!");
        });

        setSocket(newSocket);
      } catch (err) {
        setError(err.message || "Failed to fetch selected ticket data.");
        console.error("Error fetching selected ticket data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedTicketData();

    // Clean up socket on component unmount or when selectedTicketId changes
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [selectedTicketId, currentUserId]); // Dependency array for selected ticket and socket

  // --- Handlers for Ticket Management ---

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketTitle || !newTicketDescription || !newTicketCategory || !currentUserId) {
      alert("Please fill in all required ticket fields (Title, Description, Category).");
      return;
    }
    setTicketFormLoading(true);
    setError(null);
    try {
      const ticketData = {
        title: newTicketTitle,
        description: newTicketDescription,
        category: newTicketCategory,
        priority: newTicketPriority,
        requesterId: currentUserId,
        assignedToId: newTicketAssignedTo || undefined, // Send undefined if empty
        attachments: [], // Add logic for attachments if needed
      };
      const response = await createTicket(ticketData);
      alert("Ticket created successfully!");
      setNewTicketTitle("");
      setNewTicketDescription("");
      setNewTicketCategory("general_inquiry");
      setNewTicketPriority("medium");
      setNewTicketAssignedTo("");
      fetchAllTickets(); // Refresh the list of tickets
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create ticket.");
      alert(`Error creating ticket: ${error}`);
      console.error("Error creating ticket:", err);
    } finally {
      setTicketFormLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm("Are you sure you want to delete this ticket and all its messages?")) {
      setLoading(true); // Global loading for delete operation
      setError(null);
      try {
        await deleteTicket(id);
        alert("Ticket deleted successfully!");
        if (selectedTicketId === id) {
          setSelectedTicketId(null); // Deselect if the current ticket was deleted
        }
        fetchAllTickets(); // Refresh the list
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to delete ticket.");
        alert(`Error deleting ticket: ${error}`);
        console.error("Error deleting ticket:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateTicketStatus = async (status) => {
    if (!selectedTicketId) return;
    setTicketFormLoading(true);
    setError(null);
    try {
      const response = await updateTicket(selectedTicketId, { status });
      alert(`Ticket status updated to ${status}!`);
      setSelectedTicket(response.ticket); // Update local state
      fetchAllTickets(); // Refresh all tickets list to show updated status
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update ticket status.");
      alert(`Error updating ticket status: ${error}`);
      console.error("Error updating ticket status:", err);
    } finally {
      setTicketFormLoading(false);
    }
  };

  // --- Chat Messaging Handler ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedTicketId || !currentUserId) return;

    const messageData = {
      ticketId: selectedTicketId,
      senderId: currentUserId,
      message: newMessage,
      attachments: [],
      isInternalNote: false, // Could be toggled with a checkbox for agents
    };

    socket.emit("newTicketMessage", messageData);
    setNewMessage(""); // Clear input immediately
  };

  if (sessionLoading) {
    return <div>Loading session...</div>;
  }
  if (!currentUserId) {
    return <div>Please log in to use the ticket system.</div>;
  }
  if (loading && !selectedTicketId) return <div>Loading tickets...</div>; // Only show global loading if no ticket is selected yet
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* Left Panel: Create Ticket & Ticket List */}
      <div style={{ flex: 1, borderRight: "1px solid #eee", paddingRight: "20px" }}>
        <h2>Create New Ticket</h2>
        <form onSubmit={handleCreateTicket} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
          <input type="text" placeholder="Title" value={newTicketTitle} onChange={(e) => setNewTicketTitle(e.target.value)} required />
          <textarea placeholder="Description" value={newTicketDescription} onChange={(e) => setNewTicketDescription(e.target.value)} required />
          <select value={newTicketCategory} onChange={(e) => setNewTicketCategory(e.target.value)} required>
            <option value="general_inquiry">General Inquiry</option>
            <option value="technical_support">Technical Support</option>
            <option value="glitch_report">Glitch Report</option>
            <option value="bug_report">Bug Report</option>
            <option value="feature_request">Feature Request</option>
            <option value="billing_inquiry">Billing Inquiry</option>
            <option value="payment_issue">Payment Issue</option>
            <option value="membership_issue">Membership Issue</option>
            <option value="item_replacement">Item Replacement</option>
            <option value="other">Other</option>
          </select>
          <select value={newTicketPriority} onChange={(e) => setNewTicketPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>
          <input type="text" placeholder="Assign To (User ID - Optional)" value={newTicketAssignedTo} onChange={(e) => setNewTicketAssignedTo(e.target.value)} />
          <button type="submit" disabled={ticketFormLoading}>
            {ticketFormLoading ? "Creating..." : "Create Ticket"}
          </button>
        </form>

        <hr />

        <h2>All Tickets</h2>
        {loading && !tickets.length ? (
          <div>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <p>No tickets found. Create one!</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {tickets.map((t) => (
              <li
                key={t._id}
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  marginBottom: "5px",
                  cursor: "pointer",
                  backgroundColor: selectedTicketId === t._id ? "#e6f7ff" : "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => setSelectedTicketId(t._id)}
              >
                <div>
                  <strong>{t.title}</strong> - <small>{t.status}</small> ({t.category})
                  <br />
                  <small>Req: {t.requester?.name || "N/A"} | Assigned: {t.assignedTo?.name || "N/A"}</small>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting ticket when deleting
                    handleDeleteTicket(t._id);
                  }}
                  style={{ background: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                  disabled={loading}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Panel: Selected Ticket Details & Chat */}
      <div style={{ flex: 2, paddingLeft: "20px" }}>
        {selectedTicket ? (
          <>
            <h2>Ticket Details: {selectedTicket.title}</h2>
            <p><strong>Description:</strong> {selectedTicket.description}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>
            <p><strong>Category:</strong> {selectedTicket.category}</p>
            <p><strong>Priority:</strong> {selectedTicket.priority}</p>
            <p><strong>Requester:</strong> {selectedTicket.requester?.name || "N/A"}</p>
            <p><strong>Assigned To:</strong> {selectedTicket.assignedTo?.name || "N/A"}</p>
            <p><strong>Created At:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>

            {/* Update Status Buttons */}
            <div style={{ marginBottom: "20px" }}>
              <button onClick={() => handleUpdateTicketStatus("open")} disabled={ticketFormLoading || selectedTicket.status === "open"}>
                Set Open
              </button>
              <button onClick={() => handleUpdateTicketStatus("in_progress")} disabled={ticketFormLoading || selectedTicket.status === "in_progress"} style={{ marginLeft: "10px" }}>
                Set In Progress
              </button>
              <button onClick={() => handleUpdateTicketStatus("resolved")} disabled={ticketFormLoading || selectedTicket.status === "resolved"} style={{ marginLeft: "10px" }}>
                Set Resolved
              </button>
              <button onClick={() => handleUpdateTicketStatus("closed")} disabled={ticketFormLoading || selectedTicket.status === "closed"} style={{ marginLeft: "10px" }}>
                Set Closed
              </button>
              <button onClick={() => handleUpdateTicketStatus("reopened")} disabled={ticketFormLoading || selectedTicket.status === "reopened"} style={{ marginLeft: "10px" }}>
                Set Reopened
              </button>
            </div>

            <hr />
            <h3>Chat Messages</h3>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                marginBottom: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {messages.length === 0 ? (
                <p>No messages yet. Be the first to send one!</p>
              ) : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {messages.map((msg) => (
                    <li
                      key={msg._id}
                      style={{
                        marginBottom: "8px",
                        padding: "8px",
                        borderRadius: "5px",
                        backgroundColor: msg.sender?._id === currentUserId ? "#dcf8c6" : "#e9e9eb",
                        alignSelf: msg.sender?._id === currentUserId ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        wordBreak: "break-word",
                      }}
                    >
                      <strong>{msg.sender?.name || "Unknown"}:</strong> {msg.message}{" "}
                      (<small>{new Date(msg.createdAt).toLocaleString()}</small>)
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                disabled={loading}
              />
              <button
                type="submit"
                style={{ padding: "10px 20px", borderRadius: "5px", border: "none", background: "#007bff", color: "white", cursor: "pointer" }}
                disabled={loading}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div>
            <h3>Select a Ticket to View Details and Chat</h3>
            <p>Click on a ticket from the left panel to see its details and participate in the chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;
