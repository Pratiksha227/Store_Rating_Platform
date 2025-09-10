import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  verifyToken,
  getStoreById,
  getRatingsByStoreId,
  getAllUsers,
  User,
} from "@/lib/auth";
import { StoreOwnerNav } from "@/components/store/store-owner-nav";
import { StoreRatingsDashboard } from "@/components/store/store-ratings-dashboard";

export default async function StoreOwnerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let currentUser;
  try {
    currentUser = await verifyToken(token);
    if (currentUser.role !== "store_owner") {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  // Get the store owned by this user
  const store = currentUser.storeId
    ? await getStoreById(currentUser.storeId)
    : null;
  console.log("store =>", store);
  if (!store) {
    redirect("/login");
  }

  // Get ratings for this store
  const storeRatings = await getRatingsByStoreId(store.id);

  // Get user information for each rating
  const allUsers: User[] = (await getAllUsers()) || [];
  const ratingsWithUsers = storeRatings.map((rating) => {
    const user = allUsers.find((u) => u.id === rating.userId);
    return {
      ...rating,
      user: user || null,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreOwnerNav user={currentUser} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your store: {store.name}</p>
        </div>

        <StoreRatingsDashboard
          store={store}
          ratingsWithUsers={ratingsWithUsers}
        />
      </div>
    </div>
  );
}
