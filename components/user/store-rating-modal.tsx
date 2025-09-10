"use client";

import { useState, useEffect } from "react";
import type { Store } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StoreRatingModalProps {
  store: Store;
  userId: string;
  onClose: () => void;
  onRatingSubmitted: () => void;
}

export function StoreRatingModal({
  store,
  userId,
  onClose,
  onRatingSubmitted,
}: StoreRatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [currentUserRating, setCurrentUserRating] = useState<number | null>(
    null
  );
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentRating = async () => {
      try {
        const response = await fetch(
          `/api/ratings/user/${userId}/store/${store.id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.rating) {
            setCurrentUserRating(data.rating.rating);
            setSelectedRating(data.rating.rating);
            setRatingId(data.rating.id); // ✅ store rating id for PATCH
          }
        }
      } catch {
        // no existing rating, ignore
      }
    };

    fetchCurrentRating();
  }, [userId, store.id]);

  const handleRatingSubmit = async () => {
    if (selectedRating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;
      if (ratingId) {
        // ✅ Update rating
        response = await fetch(`/api/ratings/${ratingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: selectedRating }),
        });
      } else {
        // ✅ Create new rating
        response = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: store.id,
            rating: selectedRating,
          }),
        });
      }

      if (response.ok) {
        onRatingSubmitted();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit rating");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 ${
          interactive ? "cursor-pointer" : ""
        } transition-colors ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : interactive
            ? "text-gray-300 hover:text-yellow-400"
            : "text-gray-300"
        }`}
        onClick={interactive ? () => setSelectedRating(i + 1) : undefined}
      />
    ));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{ratingId ? "Edit Rating" : "Rate Store"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Store Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{store.address}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="mr-2 h-4 w-4" />
              <span>{store.email}</span>
            </div>
          </div>

          {/* Average Rating */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Current Average Rating
            </p>
            <div className="flex items-center space-x-2">
              <div className="flex">{renderStars(store.averageRating)}</div>
              <span className="text-sm font-medium">
                {store.averageRating > 0
                  ? store.averageRating.toFixed(1)
                  : "No ratings yet"}
              </span>
            </div>
          </div>

          {/* User's Current Rating */}
          {currentUserRating !== null && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700 mb-2">
                Your Current Rating
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(currentUserRating)}</div>
                <span className="text-sm font-medium text-blue-700">
                  {currentUserRating}/5
                </span>
              </div>
            </div>
          )}

          {/* Rating Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              {ratingId ? "Update your rating:" : "Rate this store:"}
            </p>
            <div className="flex justify-center space-x-1">
              {renderStars(selectedRating, true)}
            </div>
            {selectedRating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {selectedRating} out of 5 stars
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleRatingSubmit}
              disabled={loading || selectedRating === 0}
              className="flex-1"
            >
              {loading
                ? "Submitting..."
                : ratingId
                ? "Update Rating"
                : "Submit Rating"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
