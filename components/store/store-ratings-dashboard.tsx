"use client"

import type { Store, Rating, User } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, TrendingUp, Calendar } from "lucide-react"

interface RatingWithUser extends Rating {
  user: Omit<User, "password"> | null
}

interface StoreRatingsDashboardProps {
  store: Store
  ratingsWithUsers: RatingWithUser[]
}

export function StoreRatingsDashboard({ store, ratingsWithUsers }: StoreRatingsDashboardProps) {
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

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingsWithUsers.forEach((rating) => {
      distribution[rating.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const distribution = getRatingDistribution()
  const sortedRatings = [...ratingsWithUsers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-8">
      {/* Store Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Store Name</label>
              <p className="text-lg font-medium">{store.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{store.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-lg">{store.address}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Average Rating</label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex">{renderStars(store.averageRating)}</div>
                <span className="text-2xl font-bold">
                  {store.averageRating > 0 ? store.averageRating.toFixed(1) : "No ratings"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Ratings</label>
              <p className="text-2xl font-bold">{ratingsWithUsers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratingsWithUsers.length}</div>
            <p className="text-xs text-muted-foreground">Customer reviews received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.averageRating > 0 ? store.averageRating.toFixed(1) : "0.0"}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                ratingsWithUsers.filter((r) => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Reviews this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating as keyof typeof distribution]
              const percentage = ratingsWithUsers.length > 0 ? (count / ratingsWithUsers.length) * 100 : 0

              return (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">{count}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedRatings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No ratings received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRatings.slice(0, 10).map((rating) => (
                <div key={rating.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{rating.user ? rating.user.name : "Anonymous User"}</h3>
                        <Badge className={getRatingColor(rating.rating)}>{rating.rating}/5</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {rating.user && <div className="text-sm text-gray-600 mb-2">{rating.user.email}</div>}
                    <div className="flex items-center space-x-1">
                      <div className="flex">{renderStars(rating.rating)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
