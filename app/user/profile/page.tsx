import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { UserNav } from "@/components/user/user-nav"
import { UserProfileForm } from "@/components/user/user-profile-form"

export default async function UserProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  let currentUser
  try {
    currentUser = await verifyToken(token)
    if (currentUser.role !== "user") {
      redirect("/login")
    }
  } catch {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav user={currentUser} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <UserProfileForm user={currentUser} />
      </div>
    </div>
  )
}
