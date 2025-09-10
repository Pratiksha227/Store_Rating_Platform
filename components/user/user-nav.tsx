"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, Store, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User as UserType } from "@/lib/auth"

interface UserNavProps {
  user: Omit<UserType, "password">
}

export function UserNav({ user }: UserNavProps) {
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
            <Link href="/user/dashboard" className="text-xl font-bold text-gray-900">
              Store Ratings
            </Link>
            <div className="hidden md:flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/user/dashboard">
                  <Store className="mr-2 h-4 w-4" />
                  Browse Stores
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/user/ratings">
                  <Star className="mr-2 h-4 w-4" />
                  My Ratings
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/user/profile">
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
