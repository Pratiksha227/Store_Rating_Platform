import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken, getAllUsers, User } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { AddStoreForm } from "@/components/admin/add-store-form";

export default async function AddStorePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== "admin") {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  // Get all users to select store owner
  const users = await getAllUsers();
  const availableOwners =
    users.filter((u: User) => u.role === "user" || u.role === "store_owner") ||
    [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Store</h1>
          <p className="text-gray-600 mt-2">
            Create a new store and assign an owner
          </p>
        </div>

        <AddStoreForm availableOwners={availableOwners} />
      </div>
    </div>
  );
}
