import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Assuming you might want to add a title or similar
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../context/SessionContext"; // Adjust path as needed
// Assuming you will have an API function for submitting reviews
// import { submitReview } from "../../api/reviewService"; // You'll create this later

export default function LeaveReviewForm({ productId, itemType, onReviewSubmitted }) {
  const { session } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [media, setMedia] = useState([]); // For future media uploads
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to simulate review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!session || !session.isAuthenticated) {
      toast.error("You must be logged in to leave a review.");
      return;
    }

    if (rating === 0) {
      toast.error("Please provide a rating (1-5 stars).");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment for your review.");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real application, you would call your API here:
      // const reviewData = {
      //   userId: session.user.id, // Or session.user._id, depending on your session structure
      //   itemId: productId,
      //   itemType: itemType,
      //   rating: rating,
      //   comment: comment,
      //   media: media, // If you implement media uploads
      // };
      // await submitReview(reviewData); // Call your API function

      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Review submitted:", { productId, itemType, rating, comment, userId: session.user?.username || 'Guest' }); // For debugging

      toast.success("Review submitted successfully!");
      // Reset form
      setRating(0);
      setComment("");
      setMedia([]);
      // Call the callback to inform the parent component
      // In a real app, you'd refetch reviews or add the new one to state
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitReview} className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-3">Leave a Review</h3>

      {/* Star Rating Input */}
      <div>
        <Label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </Label>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-7 w-7 cursor-pointer transition-colors duration-200
                ${rating > i ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                hover:fill-yellow-300 hover:text-yellow-300`}
              onClick={() => setRating(i + 1)}
            />
          ))}
          <span className="ml-2 text-md font-medium text-gray-700">
            {rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : "Select a rating"}
          </span>
        </div>
      </div>

      {/* Comment Textarea */}
      <div>
        <Label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Comment
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this product/service..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
          required
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting || !session?.isAuthenticated}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
      {!session?.isAuthenticated && (
        <p className="text-sm text-red-500 mt-2">
          Please log in to submit a review.
        </p>
      )}
    </form>
  );
}