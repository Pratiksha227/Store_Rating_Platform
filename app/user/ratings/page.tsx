import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken, getRatingsByUserId, getAllStores } from "@/lib/auth";
import { UserNav } from "@/components/user/user-nav";
import { UserRatingsHistory } from "@/components/user/user-ratings-history";

export default async function UserRatingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let currentUser;
  try {
    currentUser = await verifyToken(token);
    if (currentUser.role !== "user") {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  const userRatings = await getRatingsByUserId(currentUser.id);
  const allStores = await getAllStores();

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav user={currentUser} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Ratings</h1>
          <p className="text-gray-600 mt-2">
            View and manage your store ratings
          </p>
        </div>

        <UserRatingsHistory
          ratings={userRatings}
          stores={allStores}
          userId={currentUser.id}
        />
      </div>
    </div>
  );
}
