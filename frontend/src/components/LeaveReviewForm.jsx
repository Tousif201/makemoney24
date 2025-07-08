import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../context/SessionContext";
import { Image as ImageIcon, Video, XCircle } from "lucide-react";
import { createReview } from "../../api/review"; // Your review API
import { uploadFiles } from "../../api/upload"; // Your file upload API

const MAX_FILES = 3; // Maximum number of files a user can upload
const MAX_FILE_SIZE_MB = 10; // Max file size in MB

export default function LeaveReviewForm({
  productId, // Renamed from productId to itemId for consistency with backend
  itemType,
  onReviewSubmitted,
}) {
  const { session } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  // `mediaFiles` stores File objects for preview and uploading
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null); // Ref for file input to trigger click

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    const errors = [];

    // Check overall file limit
    if (mediaFiles.length + files.length > MAX_FILES) {
      toast.error(`You can upload a maximum of ${MAX_FILES} files.`);
      // Clear the input value to allow selecting files again
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }

    files.forEach((file) => {
      // Validate file type
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/gif",
          "video/mp4",
          "video/webm",
        ].includes(file.type)
      ) {
        errors.push(
          `Invalid file type: ${file.name}. Only JPG, PNG, GIF, MP4, WebM are allowed.`
        );
        return; // Skip this file
      }
      // Validate file size
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(
          `File too large: ${file.name}. Max size is ${MAX_FILE_SIZE_MB}MB.`
        );
        return; // Skip this file
      }
      newFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
    }

    setMediaFiles((prevFiles) => [...prevFiles, ...newFiles]);
    // Clear the input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Remove a selected file
  const handleRemoveFile = (indexToRemove) => {
    setMediaFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Log the initiation of the submission process
    console.log("handleSubmitReview triggered.");
    console.log("Current session:", session);
    console.log("Current rating:", rating);
    console.log("Current comment:", comment);
    console.log("Media files to upload:", mediaFiles);
    console.log("Product ID (itemId):", productId);
    console.log("Item Type:", itemType);

    if (!session) {
      // Ensure session and user ID are available
      toast.error("You must be logged in to leave a review.");
      console.log("Validation failed: User not logged in.");
      return;
    }

    // Check if session.id exists and is valid
    // Assuming session.id is the user's unique identifier from your SessionContext
    if (!session.id) {
      toast.error("User session ID is missing. Please log in again.");
      console.error("Validation failed: session.id is undefined or null.");
      return;
    }

    if (rating === 0) {
      toast.error("Please provide a rating (1-5 stars).");
      console.log("Validation failed: Rating is 0.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment for your review.");
      console.log("Validation failed: Comment is empty.");
      return;
    }

    setIsSubmitting(true);
    console.log("Setting isSubmitting to true.");

    let uploadedMedia = []; // To store URLs of uploaded media

    try {
      // 1. Upload media files if any
      if (mediaFiles.length > 0) {
        console.log(`Attempting to upload ${mediaFiles.length} media file(s).`);
        toast.info("Uploading media files...");
        const formData = new FormData();
        mediaFiles.forEach((file) => {
          formData.append("media", file); // 'media' should match the field name your Multer expects
          console.log(
            `Appending file to FormData: ${file.name} (${file.type})`
          );
        });

        // Call the upload API function
        console.log("Calling uploadFiles API...");
        const uploadResult = await uploadFiles(formData);
        console.log("UploadFiles API response:", uploadResult);

        // --- CORRECTED LOGIC BASED ON YOUR CONSOLE LOG ---
        // Your console log shows `uploadResult` is directly the array of file objects.
        if (Array.isArray(uploadResult)) {
          uploadedMedia = uploadResult.map((file) => ({
            // The `type` in your console log is already simplified (e.g., "image"),
            // so we can use it directly. If it were full mimetypes (e.g., "image/jpeg"),
            // you'd keep `file.type.startsWith("image/") ? "image" : "video"`.
            type: file.type,
            url: file.url, // URL provided by your upload service (e.g., Uploadthing)
          }));
          console.log("Processed uploaded media URLs:", uploadedMedia);
          toast.success("Media uploaded successfully!");
        } else {
          // Handle case where uploadResult is not an array as expected
          console.warn(
            "Upload response did not contain expected array of files:",
            uploadResult
          );
          toast.error("Media upload response malformed. Please try again.");
          setIsSubmitting(false); // Stop submission if upload failed to return expected data
          return;
        }
      } else {
        console.log("No media files to upload.");
      }

      // 2. Submit the review with the uploaded media URLs
      const reviewPayload = {
        userId: session.id, // Get userId from authenticated session
        itemId: productId, // Use the prop, ensures consistency
        itemType,
        rating,
        comment,
        media: uploadedMedia, // Pass the array of { type, url }
      };

      console.log("Review payload prepared:", reviewPayload);
      console.log("Calling createReview API...");
      await createReview(reviewPayload);
      console.log("createReview API call successful.");

      toast.success("Review submitted successfully!");
      console.log("Review submission successful. Resetting form.");

      // Reset form
      setRating(0);
      setComment("");
      setMediaFiles([]); // Clear media files
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Clear file input visual state
        console.log("File input cleared.");
      }

      // Call the callback to inform the parent component to re-fetch reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
        console.log("onReviewSubmitted callback invoked.");
      }
    } catch (err) {
      console.error("Caught error during review submission:", err);
      // More specific error message if available from backend
      toast.error(
        err.message || err.response?.data?.message || "Failed to submit review."
      );
    } finally {
      setIsSubmitting(false);
      console.log(
        "Setting isSubmitting to false. Submission process finished."
      );
    }
  };

  return (
    <form onSubmit={handleSubmitReview} className="space-y-6 ">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Leave a Review</h3>

      {/* Star Rating Input */}
      <div>
        <Label
          htmlFor="rating"
          className="block text-base font-semibold text-gray-700 mb-2"
        >
          Your Rating <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-8 w-8 cursor-pointer transition-colors duration-200
                ${
                  rating > i
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
                hover:fill-yellow-300 hover:text-yellow-300`}
              onClick={() => setRating(i + 1)}
            />
          ))}
          <span className="ml-3 text-lg font-medium text-gray-700">
            {rating > 0
              ? `${rating} Star${rating > 1 ? "s" : ""}`
              : "Select your rating"}
          </span>
        </div>
      </div>

      {/* Comment Textarea */}
      <div>
        <Label
          htmlFor="comment"
          className="block text-base font-semibold text-gray-700 mb-2"
        >
          Your Comment <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this product/service..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="resize-y min-h-[100px] border-gray-300 focus-visible:ring-blue-500"
          required
        />
      </div>

      {/* Media Upload Section */}
      <div>
        <Label
          htmlFor="media-upload"
          className="block text-base font-semibold text-gray-700 mb-2"
        >
          Attach Photos or Videos (Optional)
        </Label>
        <Input
          id="media-upload"
          type="file"
          accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef} // Attach ref
          className="hidden" // Hide the default input
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current.click()} // Trigger click on hidden input
          variant="outline"
          className="mb-3"
          disabled={mediaFiles.length >= MAX_FILES || isSubmitting} // Disable if max files reached or submitting
        >
          <ImageIcon className="h-4 w-4 mr-2" /> Upload Media
        </Button>
        <p className="text-sm text-gray-500 mb-3">
          Max {MAX_FILES} files, up to {MAX_FILE_SIZE_MB}MB each. Allowed: JPG,
          PNG, GIF, MP4, WebM.
        </p>

        {/* Media Previews */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-4">
            {mediaFiles.map((file, index) => (
              <div
                key={index}
                className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="object-cover w-full h-full"
                    controls={false} // No controls for thumbnail
                    muted // Mute video preview
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                  onClick={() => handleRemoveFile(index)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                {file.type.startsWith("video/") && (
                  <Video className="absolute bottom-1 left-1 text-white h-5 w-5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !session || rating === 0 || !comment.trim()}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
      {!session && (
        <p className="text-sm text-red-500 mt-2">
          Please log in to submit a review.
        </p>
      )}
    </form>
  );
}
