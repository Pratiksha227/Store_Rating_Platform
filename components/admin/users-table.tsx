"use client"

import { useState } from "react"
import type { User } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

interface UsersTableProps {
  users: Omit<User, "password">[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [filteredUsers, setFilteredUsers] = useState(users)
  const [sortField, setSortField] = useState<keyof User>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "all", // Updated default value to "all"
  })

  const handleSort = (field: keyof User) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(direction)

    const sorted = [...filteredUsers].sort((a, b) => {
      const aValue = a[field]?.toString().toLowerCase() || ""
      const bValue = b[field]?.toString().toLowerCase() || ""
      return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })
    setFilteredUsers(sorted)
  }

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)

    const filtered = users.filter((user) => {
      return (
        user.name.toLowerCase().includes(newFilters.name.toLowerCase()) &&
        user.email.toLowerCase().includes(newFilters.email.toLowerCase()) &&
        user.address.toLowerCase().includes(newFilters.address.toLowerCase()) &&
        (newFilters.role === "all" || user.role === newFilters.role) // Updated condition to check for "all"
      )
    })
    setFilteredUsers(filtered)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "store_owner":
        return "default"
      case "user":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({filteredUsers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => handleFilter("name", e.target.value)}
          />
          <Input
            placeholder="Filter by email..."
            value={filters.email}
            onChange={(e) => handleFilter("email", e.target.value)}
          />
          <Input
            placeholder="Filter by address..."
            value={filters.address}
            onChange={(e) => handleFilter("address", e.target.value)}
          />
          <Select value={filters.role} onValueChange={(value) => handleFilter("role", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem> {/* Updated value to "all" */}
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="store_owner">Store Owner</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">
                  <Button variant="ghost" onClick={() => handleSort("name")} className="font-semibold">
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button variant="ghost" onClick={() => handleSort("email")} className="font-semibold">
                    Email <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button variant="ghost" onClick={() => handleSort("address")} className="font-semibold">
                    Address <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button variant="ghost" onClick={() => handleSort("role")} className="font-semibold">
                    Role <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 max-w-xs truncate">{user.address}</td>
                  <td className="p-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.replace("_", " ").toUpperCase()}</Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found matching your filters.</div>
        )}
      </CardContent>
    </Card>
  )
}
