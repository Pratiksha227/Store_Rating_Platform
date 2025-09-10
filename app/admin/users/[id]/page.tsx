import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  verifyToken,
  getUserById,
  getStoreById,
  getRatingsByUserId,
} from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const currentUser = await verifyToken(token);
    if (currentUser.role !== "admin") {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  const user = await getUserById(id);
  if (!user) {
    redirect("/admin/users");
  }

  // Get additional data for store owners
  let ownedStore = null;
  if (user.role === "store_owner" && user.storeId) {
    ownedStore = await getStoreById(user.storeId);
  }

  // Get user's ratings
  const userRatings = await getRatingsByUserId(id);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "store_owner":
        return "default";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4 bg-transparent">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600 mt-2">
            View detailed information about this user
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="text-lg">{user.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Role
                </label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Information (for store owners) */}
          {user.role === "store_owner" && ownedStore && (
            <Card>
              <CardHeader>
                <CardTitle>Owned Store</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Store Name
                  </label>
                  <p className="text-lg font-medium">{ownedStore.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Store Email
                  </label>
                  <p className="text-lg">{ownedStore.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Store Address
                  </label>
                  <p className="text-lg">{ownedStore.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Average Rating
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-medium">
                      {ownedStore.averageRating > 0
                        ? ownedStore.averageRating.toFixed(1)
                        : "No ratings"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Activity (for regular users) */}
          {user.role === "user" && (
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total Ratings Submitted
                    </label>
                    <p className="text-2xl font-bold">{userRatings.length}</p>
                  </div>
                  {userRatings.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Recent Ratings
                      </label>
                      <div className="mt-2 space-y-2">
                        {userRatings.slice(0, 5).map((rating) => (
                          <div
                            key={rating.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">
                              Store ID: {rating.storeId}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">
                                {rating.rating}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
