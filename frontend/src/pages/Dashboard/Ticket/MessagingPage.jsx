import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Paperclip,
  Send,
  Eye,
  EyeOff,
  XCircle,
  Loader2,
  X, // For removing attached files
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { backendConfig } from "../../../../constant/config";
import { useSession } from "../../../context/SessionContext";

import {
  getTicketById,
  getTicketMessages,
  updateTicket,
} from "../../../../api/ticket";
import { uploadFiles } from "../../../../api/upload";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  reopened: "bg-red-100 text-red-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function MessagingPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  const { session, loading: sessionLoading } = useSession();
  const currentUserId = session?.id;
  const currentUserName = session?.name;
  const currentUserRole = session?.role;
  console.log(currentUserRole, "role");
  useEffect(() => {
    if (!ticketId || sessionLoading || !currentUserId) {
      if (!sessionLoading && !currentUserId) {
        setError("User not logged in or session not loaded.");
      }
      return;
    }

    const fetchTicketData = async () => {
      setLoading(true);
      setError(null);
      try {
        const ticketResponse = await getTicketById(ticketId);
        setTicket(ticketResponse.ticket);

        const messagesResponse = await getTicketMessages(ticketId);
        setMessages(messagesResponse.messages);

        const token = localStorage.getItem("authToken");
        const newSocket = io(backendConfig.origin, {
          auth: { token: token },
          transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
          console.log("Socket Connected!");
          newSocket.emit("joinTicket", ticketId);
        });

        newSocket.on("joinedTicket", (data) => {
          console.log(data.message);
        });

        newSocket.on("ticketMessage", (message) => {
          console.log("Received new message via socket:", message);
          setMessages((prevMessages) => {
            if (prevMessages.some((m) => m._id === message._id)) {
              return prevMessages;
            }
            return [...prevMessages, message];
          });
        });

        newSocket.on("ticketUpdated", (updatedTicket) => {
          console.log("Ticket updated via socket:", updatedTicket);
          setTicket(updatedTicket);
          toast.info(
            `Ticket status updated to ${updatedTicket.status.replace(
              "_",
              " "
            )}!`
          );
        });

        newSocket.on("messageError", (err) => {
          console.error("Socket message error:", err.message);
          toast.error(`Error sending message: ${err.message}`);
        });

        newSocket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          setError(`Socket connection failed: ${err.message}`);
          toast.error(`Socket connection failed: ${err.message}`);
        });

        newSocket.on("disconnect", () => {
          console.log("Socket Disconnected!");
        });

        setSocket(newSocket);
      } catch (err) {
        setError(err.message || "Failed to fetch ticket data.");
        toast.error(err.message || "Failed to load ticket details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [ticketId, sessionLoading, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileAttach = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        fileObject: file,
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (index) => {
    const newFiles = [...attachedFiles];
    newFiles.splice(index, 1);
    setAttachedFiles(newFiles);
  };

  const handleSendMessage = async (isInternalNote = false) => {
    if (!newMessage.trim() && attachedFiles.length === 0) {
      toast.info("Message cannot be empty.");
      return;
    }
    if (!socket || !ticketId || !currentUserId) {
      toast.error("System error: Not connected or user ID missing.");
      return;
    }

    setIsSendingMessage(true);
    toast.loading("Sending message...", { id: "sendMessage" });

    try {
      let uploadedAttachmentData = [];

      if (attachedFiles.length > 0) {
        const filesToUpload = attachedFiles.map((item) => item.fileObject);
        const uploadResponse = await uploadFiles(filesToUpload);

        if (uploadResponse && uploadResponse.length > 0) {
          uploadedAttachmentData = uploadResponse.map((file) => ({
            key: file.key,
            url: file.url,
          }));
        } else {
          toast.warning(
            "Files uploaded but no URLs received. Sending message without attachments.",
            { id: "sendMessage" }
          );
          console.warn(
            "Upload files response did not contain expected file data:",
            uploadResponse
          );
        }
      }

      const messageData = {
        ticketId: ticketId,
        senderId: currentUserId,
        message: newMessage,
        attachments: uploadedAttachmentData,
        isInternalNote: isInternalNote,
      };

      socket.emit("newTicketMessage", messageData);

      setNewMessage("");
      setAttachedFiles([]);
      toast.success("Message sent!", { id: "sendMessage" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send message.";
      toast.error(errorMessage, { id: "sendMessage" });
      console.error("Error sending message:", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId || !ticket) return;

    if (ticket.status === "closed") {
      toast.info("Ticket is already closed.");
      return;
    }

    if (!window.confirm("Are you sure you want to close this ticket?")) {
      return;
    }

    setIsUpdatingTicket(true);
    toast.loading("Closing ticket...", { id: "closeTicket" });

    try {
      const response = await updateTicket(ticketId, { status: "closed" });
      setTicket(response.ticket);
      toast.success("Ticket successfully closed!", { id: "closeTicket" });
      socket.emit("ticketStatusUpdated", { ticketId, status: "closed" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to close ticket.";
      toast.error(errorMessage, { id: "closeTicket" });
      console.error("Error closing ticket:", err);
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <p className="text-lg text-muted-foreground">
          Loading ticket details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-red-600">
            <XCircle className="h-12 w-12 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link to="/dashboard/tickets">
              <Button>Back to Tickets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
            <p className="text-muted-foreground mb-4">
              The ticket you're looking for doesn't exist or you don't have
              access.
            </p>
            <Link to="/dashboard/tickets">
              <Button>Back to Tickets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredMessages = showInternalNotes
    ? messages
    : messages.filter((msg) => !msg.isInternalNote);

  const getSenderFallback = (sender) => {
    if (!sender) return "??";
    return sender.name
      ? sender.name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : "User";
  };
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between space-x-4">
        <Link to="/dashboard/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCloseTicket}
          disabled={isUpdatingTicket || ticket.status === "closed"}
        >
          {isUpdatingTicket ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          {ticket.status === "closed" ? "Ticket Closed" : "Close Ticket"}
        </Button>
      </div>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={statusColors[ticket.status]}
                >
                  {ticket.status.replace("_", " ")}
                </Badge>
                <Badge
                  variant="outline"
                  className={priorityColors[ticket.priority]}
                >
                  {ticket.priority}
                </Badge>
                <Badge variant="outline">
                  {ticket.category.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              {/* <Button variant="outline" size="sm">
                Edit Ticket
              </Button> */}
              {!currentUserRole === "user" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInternalNotes(!showInternalNotes)}
                >
                  {showInternalNotes ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {showInternalNotes ? "Hide" : "Show"} Internal Notes
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={ticket.requester?.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {getSenderFallback(ticket.requester)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Requester</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.requester?.name || "N/A"}
                  </p>
                </div>
              </div>

              {ticket.assignedTo && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={ticket.assignedTo.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {getSenderFallback(ticket.assignedTo)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.assignedTo.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-muted p-2 rounded text-sm hover:underline"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>{attachment.key}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>
            {filteredMessages.length}{" "}
            {filteredMessages.length === 1 ? "message" : "messages"}
            {showInternalNotes && " (including internal notes)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {" "}
            {/* Added max-height and overflow for scrolling */}
            {filteredMessages.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No messages yet. Start the conversation!
              </p>
            ) : (
              filteredMessages.map((message, index) => {
                const sender = message.sender || {
                  name: "Unknown",
                  _id: "unknown",
                };
                const isInternal = message.isInternalNote;
                const isCurrentUser = sender._id === currentUserId;

                return (
                  <div key={message._id || `msg-${index}`}>
                    <div
                      className={`flex items-start gap-3 ${
                        isCurrentUser ? "justify-end" : ""
                      }`}
                    >
                      {/* Avatar for the sender */}
                      <Avatar
                        className={`h-8 w-8 min-w-[32px] ${
                          isCurrentUser ? "order-2" : "order-1"
                        }`}
                      >
                        <AvatarImage
                          src={sender?.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {getSenderFallback(sender)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Message Bubble */}
                      <div
                        className={`
                          flex-1 p-3 rounded-lg max-w-[80%] relative
                          ${
                            isCurrentUser
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }
                          ${
                            isInternal
                              ? "bg-yellow-50 text-yellow-900 border border-yellow-200"
                              : ""
                          }
                          ${isCurrentUser ? "order-1" : "order-2"}
                      `}
                      >
                        <div
                          className={`flex items-center text-sm font-medium mb-1 ${
                            isCurrentUser ? "justify-end" : ""
                          }`}
                        >
                          <span
                            className={`text-xs ${
                              isCurrentUser ? "text-blue-200" : "text-gray-500"
                            } ${
                              isCurrentUser ? "order-2 ml-2" : "order-1 mr-2"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                          <span
                            className={`${
                              isCurrentUser ? "order-1" : "order-2"
                            }`}
                          >
                            {isCurrentUser ? "You" : sender?.name}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>

                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div
                              className={`flex flex-wrap gap-2 mt-2 ${
                                isCurrentUser ? "justify-end" : ""
                              }`}
                            >
                              {message.attachments.map(
                                (attachment, attachIndex) => (
                                  <a
                                    key={attachIndex}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center space-x-2 p-1 rounded text-xs hover:underline
                                    ${
                                      isCurrentUser
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                                  >
                                    <Paperclip className="h-3 w-3" />
                                    <span>{attachment.key}</span>
                                  </a>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                    {index < filteredMessages.length - 1 && (
                      <Separator className="my-4" />
                    )}{" "}
                    {/* Add vertical spacing */}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
              disabled={isSendingMessage || ticket.status === "closed"}
            />
            {attachedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">Attached files:</p>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachedFile(index)}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={isSendingMessage}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <Label
                htmlFor="message-file-upload"
                className={`cursor-pointer inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-md text-sm ${
                  isSendingMessage || ticket.status === "closed"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
                <Input
                  id="message-file-upload"
                  type="file"
                  multiple
                  onChange={handleFileAttach}
                  className="hidden"
                  accept="image/*,video/*"
                  disabled={isSendingMessage || ticket.status === "closed"}
                />
              </Label>

              <div className="space-x-2">
                {!currentUserRole === "user" && (
                  <Button
                    variant="outline"
                    onClick={() => handleSendMessage(true)}
                    disabled={isSendingMessage || ticket.status === "closed"}
                  >
                    Add Internal Note
                  </Button>
                )}
                <Button
                  onClick={() => handleSendMessage(false)}
                  disabled={isSendingMessage || ticket.status === "closed"}
                >
                  {isSendingMessage ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
