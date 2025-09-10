"use client"

import { useState } from "react"
import type { Rating, Store } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, Edit, Trash2 } from "lucide-react"
import { StoreRatingModal } from "@/components/user/store-rating-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserRatingsHistoryProps {
  ratings: Rating[]
  stores: Store[]
  userId: string
}

export function UserRatingsHistory({ ratings, stores, userId }: UserRatingsHistoryProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [deletingRating, setDeletingRating] = useState<string | null>(null)
  const [error, setError] = useState("")

  const getStoreById = (storeId: string) => {
    return stores.find((store) => store.id === storeId)
  }

  const handleDeleteRating = async (ratingId: string) => {
    setDeletingRating(ratingId)
    setError("")

    try {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete rating")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setDeletingRating(null)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-100 text-green-800"
    if (rating >= 3) return "bg-yellow-100 text-yellow-800"
    if (rating >= 2) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  const sortedRatings = [...ratings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Rating Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Stores Rated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(ratings.map((r) => r.storeId)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle>Rating History</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedRatings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't rated any stores yet.</p>
              <Button asChild className="mt-4">
                <a href="/user/dashboard">Browse Stores</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRatings.map((rating) => {
                const store = getStoreById(rating.storeId)
                if (!store) return null

                return (
                  <div key={rating.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{store.name}</h3>
                        <Badge className={getRatingColor(rating.rating)}>{rating.rating}/5</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{store.address}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="flex">{renderStars(rating.rating)}</div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStore(store)}
                        className="bg-transparent"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRating(rating.id)}
                        disabled={deletingRating === rating.id}
                        className="text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {deletingRating === rating.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Rating Modal */}
      {selectedStore && (
        <StoreRatingModal
          store={selectedStore}
          userId={userId}
          onClose={() => setSelectedStore(null)}
          onRatingSubmitted={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
