"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User as UserType } from "@/lib/auth"

interface StoreOwnerNavProps {
  user: Omit<UserType, "password">
}

export function StoreOwnerNav({ user }: StoreOwnerNavProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/store/dashboard" className="text-xl font-bold text-gray-900">
              Store Owner Panel
            </Link>
            <div className="hidden md:flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/store/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/store/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Hello, {user.name.split(" ")[0]}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
