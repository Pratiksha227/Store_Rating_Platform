import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { AdminNav } from "@/components/admin/admin-nav"
import { AddUserForm } from "@/components/admin/add-user-form"

export default async function AddUserPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  try {
    const user = await verifyToken(token)
    if (user.role !== "admin") {
      redirect("/login")
    }
  } catch {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
          <p className="text-gray-600 mt-2">Create a new user account</p>
        </div>

        <AddUserForm />
      </div>
    </div>
  )
}
