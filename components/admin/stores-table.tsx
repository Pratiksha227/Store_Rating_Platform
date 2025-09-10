"use client";

import { useState } from "react";
import type { Store } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Star } from "lucide-react";
import Link from "next/link";

interface StoresTableProps {
  stores: Store[];
}

export function StoresTable({ stores }: StoresTableProps) {
  const [filteredStores, setFilteredStores] = useState(stores);
  const [sortField, setSortField] = useState<keyof Store>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleSort = (field: keyof Store) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredStores].sort((a, b) => {
      const aValue = a[field]?.toString().toLowerCase() || "";
      const bValue = b[field]?.toString().toLowerCase() || "";
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    setFilteredStores(sorted);
  };

  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    const filtered = stores.filter((store) => {
      return (
        store.name.toLowerCase().includes(newFilters.name.toLowerCase()) &&
        store.email.toLowerCase().includes(newFilters.email.toLowerCase()) &&
        store.address.toLowerCase().includes(newFilters.address.toLowerCase())
      );
    });
    setFilteredStores(filtered);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    if (rating >= 2) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Stores ({filteredStores.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="font-semibold"
                  >
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="font-semibold"
                  >
                    Email <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("address")}
                    className="font-semibold"
                  >
                    Address <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="text-left p-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("averageRating")}
                    className="font-semibold"
                  >
                    Rating <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                {/* <th className="text-left p-4">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store) => (
                <tr key={store.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{store.name}</td>
                  <td className="p-4">{store.email}</td>
                  <td className="p-4 max-w-xs truncate">{store.address}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Star
                        className={`h-4 w-4 ${getRatingColor(
                          store.averageRating
                        )}`}
                      />
                      <span
                        className={`font-medium ${getRatingColor(
                          store.averageRating
                        )}`}
                      >
                        {store.averageRating > 0
                          ? store.averageRating.toFixed(1)
                          : "No ratings"}
                      </span>
                    </div>
                  </td>
                  {/* <td className="p-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/stores/${store.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No stores found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
