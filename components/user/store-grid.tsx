"use client"

import { useState, useEffect } from "react"
import type { Store } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Mail, Search } from "lucide-react"
import { StoreRatingModal } from "@/components/user/store-rating-modal"

interface StoreGridProps {
  stores: Store[]
  userId: string
}

interface UserRating {
  storeId: string
  rating: number
}

export function StoreGrid({ stores, userId }: StoreGridProps) {
  const [filteredStores, setFilteredStores] = useState(stores)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [userRatings, setUserRatings] = useState<UserRating[]>([])

  // Fetch user's ratings for all stores
  useEffect(() => {
    const fetchUserRatings = async () => {
      try {
        const response = await fetch(`/api/ratings/user/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setUserRatings(data.ratings || [])
        }
      } catch (err) {
        // Handle error silently
      }
    }

    fetchUserRatings()
  }, [userId])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(term.toLowerCase()) ||
        store.address.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredStores(filtered)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    if (rating >= 2) return "text-orange-600"
    return "text-red-600"
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const getUserRatingForStore = (storeId: string) => {
    return userRatings.find((ur) => ur.storeId === storeId)?.rating || null
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => {
          const userRating = getUserRatingForStore(store.id)

          return (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{store.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="truncate">{store.address}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="truncate">{store.email}</span>
                </div>

                <div className="space-y-2">
                  {/* Overall Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(store.averageRating)}</div>
                      <span className={`text-sm font-medium ${getRatingColor(store.averageRating)}`}>
                        {store.averageRating > 0 ? store.averageRating.toFixed(1) : "No ratings"}
                      </span>
                    </div>
                  </div>

                  {userRating && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Your Rating:</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {userRating}/5
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => setSelectedStore(store)} className="w-full">
                  {userRating ? "Update Rating" : "Rate Store"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No stores found matching your search.</p>
        </div>
      )}

      {/* Rating Modal */}
      {selectedStore && (
        <StoreRatingModal
          store={selectedStore}
          userId={userId}
          onClose={() => setSelectedStore(null)}
          onRatingSubmitted={() => {
            // Refresh the page to show updated ratings
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
