import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken, getAllStores } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { StoresTable } from "@/components/admin/stores-table";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import Link from "next/link";

export default async function StoresPage() {
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

  const stores = await getAllStores();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Stores Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all stores on the platform
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/stores/add">
              <Store className="mr-2 h-4 w-4" />
              Add Store
            </Link>
          </Button>
        </div>

        <StoresTable stores={stores} />
      </div>
    </div>
  );
}
