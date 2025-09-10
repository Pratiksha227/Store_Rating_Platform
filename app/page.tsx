import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (token) {
    try {
      const user = await verifyToken(token)
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          redirect("/admin/dashboard")
        case "store_owner":
          redirect("/store/dashboard")
        case "user":
          redirect("/user/dashboard")
        default:
          redirect("/login")
      }
    } catch {
      redirect("/login")
    }
  } else {
    redirect("/login")
  }
}
