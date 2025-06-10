"use client";

import { useState, useEffect } from "react"; // Import useEffect
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paperclip, X } from "lucide-react";

// Import your API functions and toast
import { createTicket as createTicketApi } from "../../../api/ticket";
import { useSession } from "../../context/SessionContext";
import { toast } from "sonner";
import { uploadFiles } from "../../../api/upload";

export function CreateTicketDialog({
  open,
  onOpenChange,
  onTicketCreated,
  initialValues = null, // Accept initialValues prop
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedTo, setAssignedTo] = useState(null); // New state for assignedTo

  // Get current user ID from session context
  const { session, loading: sessionLoading } = useSession();
  const currentUserId = session?.id;

  // Effect to set form fields when dialog opens or initialValues change
  useEffect(() => {
    if (open && initialValues) {
      setTitle(initialValues.title || "");
      setDescription(initialValues.description || "");
      setCategory(initialValues.category || "");
      setAssignedTo(initialValues.assignedTo || null); // Set assignedTo
      setAttachments([]); // Clear attachments when new initialValues are set
    } else if (!open) {
      // When dialog closes and is not triggered by new initialValues, reset form
      // This handles cases where the dialog is manually closed without submitting
      resetForm();
    }
  }, [open, initialValues]); // Re-run when 'open' or 'initialValues' props change

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        fileObject: file,
      }));
      setAttachments((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sessionLoading || !currentUserId) {
      toast.error("User session not loaded. Please try again.");
      return;
    }

    // Basic validation
    if (!title.trim() || !description.trim() || !category) {
      toast.error(
        "Please fill in all required fields (Title, Description, Category)."
      );
      return;
    }

    setIsSubmitting(true);
    toast.loading("Creating ticket...", { id: "createTicket" });

    try {
      let uploadedAttachmentData = [];

      // 1. Upload files if any attachments exist
      if (attachments.length > 0) {
        const filesToUpload = attachments.map((item) => item.fileObject);
        const uploadResponse = await uploadFiles(filesToUpload);

        if (
          uploadResponse &&
          uploadResponse.files &&
          uploadResponse.files.length > 0
        ) {
          uploadedAttachmentData = uploadResponse.files.map((file) => ({
            key: file.key,
            url: file.url,
          }));
        } else {
          toast.warning(
            "Files uploaded but no URLs received. Proceeding without attachments.",
            { id: "createTicket" }
          );
          console.warn(
            "Upload files response did not contain expected file data:",
            uploadResponse
          );
        }
      }

      // 2. Create the ticket with the returned attachment data
      const ticketData = {
        title,
        description,
        category,
        requesterId: currentUserId,
        attachments: uploadedAttachmentData,
        // Conditionally add assignedTo if it's set
        ...(assignedTo && { assignedTo }), // Include assignedTo if present
      };

      const response = await createTicketApi(ticketData);

      toast.success("Ticket created successfully!", { id: "createTicket" });
      console.log("Ticket created:", response.ticket);

      if (onTicketCreated) {
        onTicketCreated(response.ticket);
      }

      // resetForm(); // resetForm will be called by useEffect when dialog closes due to onOpenChange(false)
      onOpenChange(false); // Close the dialog
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create ticket. Please try again.";
      toast.error(errorMessage, { id: "createTicket" });
      console.error("Error creating ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setAttachments([]);
    setAssignedTo(null); // Reset assignedTo
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new support ticket.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="required">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="required">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of the issue"
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="required">
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_inquiry">
                      General Inquiry
                    </SelectItem>
                    <SelectItem value="technical_support">
                      Technical Support
                    </SelectItem>
                    <SelectItem value="glitch_report">Glitch Report</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="feature_request">
                      Feature Request
                    </SelectItem>
                    <SelectItem value="billing_inquiry">
                      Billing Inquiry
                    </SelectItem>
                    <SelectItem value="payment_issue">Payment Issue</SelectItem>
                    <SelectItem value="membership_issue">
                      Membership Issue
                    </SelectItem>
                    <SelectItem value="item_replacement">
                      Item Replacement
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-md text-sm"
                >
                  <Paperclip className="h-4 w-4" />
                  Add Images/Videos
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                  disabled={isSubmitting}
                />
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Attached files:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
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
                          onClick={() => removeAttachment(index)}
                          className="text-muted-foreground hover:text-destructive"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false); // Let useEffect handle resetForm on close
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
