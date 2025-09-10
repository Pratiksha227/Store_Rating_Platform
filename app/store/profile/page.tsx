import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { StoreOwnerNav } from "@/components/store/store-owner-nav"
import { StoreOwnerProfileForm } from "@/components/store/store-owner-profile-form"

export default async function StoreOwnerProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  let currentUser
  try {
    currentUser = await verifyToken(token)
    if (currentUser.role !== "store_owner") {
      redirect("/login")
    }
  } catch {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreOwnerNav user={currentUser} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <StoreOwnerProfileForm user={currentUser} />
      </div>
    </div>
  )
}
