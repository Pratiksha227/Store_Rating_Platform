import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: "admin" | "user" | "store_owner";
  password?: string;
  storeId?: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  ratings: Rating[];
  averageRating: number;
}

export interface Rating {
  id: string;
  userId: string;
  storeId: string;
  rating: number;
  createdAt: string;
}

// In-memory storage (replace with actual database in production)

const BASE_URL = "http://localhost:5004";

// Get all users
export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
}

// Get user by email
export async function getUserByEmail(email: string) {
  const res = await fetch(`${BASE_URL}/users?email=${email}`);
  const users = await res.json();
  return users[0] || null;
}

// Create user
export async function createUser(userData: Omit<User, "id">) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}

// Update user
export async function updateUser(id: string, updates: Partial<User>) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  return res.ok;
}

export async function getUserById(id: string): Promise<User | null> {
  const res = await fetch(`${BASE_URL}/users/${id}`);

  if (!res.ok) {
    return null;
  }

  const user: User = await res.json();

  if (!user) return null;

  return user;
}

// Statistics functions

export async function getStats() {
  const [usersRes, storesRes, ratingsRes] = await Promise.all([
    fetch(`${BASE_URL}/users`),
    fetch(`${BASE_URL}/stores`),
    fetch(`${BASE_URL}/ratings`),
  ]);

  if (!usersRes.ok || !storesRes.ok || !ratingsRes.ok) {
    throw new Error("Failed to fetch stats");
  }

  const [users, stores, ratings] = await Promise.all([
    usersRes.json(),
    storesRes.json(),
    ratingsRes.json(),
  ]);

  return {
    totalUsers: users.filter((u: any) => u.role !== "admin").length,
    totalStores: stores.length,
    totalRatings: ratings.length,
  };
}

export function generateToken(user: Omit<User, "password">) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): Promise<Omit<User, "password">> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as Omit<User, "password">);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Store management functions
export async function getAllStores(): Promise<Store[]> {
  const res = await fetch(`${BASE_URL}/stores`);
  const stores: Store[] = await res.json();
  const storesWithRatings = await Promise.all(
    stores.map(async (store) => {
      const averageRating = await calculateAverageRating(store.id);
      return { ...store, averageRating };
    })
  );
  return storesWithRatings;
}

export async function getStoreById(id: string): Promise<Store> {
  const res = await fetch(`${BASE_URL}/stores/${id}`);
  const store: Store = await res.json();
  const averageRating = await calculateAverageRating(store.id);
  return { ...store, averageRating };
}

export async function createStore(
  storeData: Omit<Store, "id" | "ratings" | "averageRating">
): Promise<Store> {
  const newStore: Store = {
    ...storeData,
    id: Date.now().toString(),
    ratings: [],
    averageRating: 0,
  };
  const res = await fetch(`${BASE_URL}/stores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newStore),
  });

  return res.json();
}

// Rating management functions
export async function getAllRatings(): Promise<Rating[]> {
  const res = await fetch(`${BASE_URL}/ratings`);
  const ratings: Rating[] = await res.json();
  return ratings || [];
}

export async function getRatingsByStoreId(storeId: string): Promise<Rating[]> {
  const res = await fetch(`${BASE_URL}/ratings`);
  const ratings: Rating[] = await res.json();
  return ratings.filter((r) => r.storeId === storeId) || [];
}

export async function getRatingsByUserId(userId: string): Promise<Rating[]> {
  const res = await fetch(`${BASE_URL}/ratings`);
  const ratings: Rating[] = await res.json();
  return ratings.filter((r) => r.userId === userId) || [];
}

export async function getUserRatingForStore(
  userId: string,
  storeId: string
): Promise<Rating | null> {
  const res = await fetch(`${BASE_URL}/ratings`);
  const ratings: Rating[] = await res.json();
  return (
    ratings.find((r) => r.userId === userId && r.storeId === storeId) || null
  );
}

export async function createRating(
  userId: string,
  storeId: string,
  rating: number
): Promise<Rating> {
  const newRating: Rating = {
    id: Date.now().toString(),
    userId,
    storeId,
    rating,
    createdAt: new Date().toISOString(),
  };

  const res = await fetch(`${BASE_URL}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRating),
  });

  if (!res.ok) throw new Error("Failed to create rating");
  return res.json();
}

export async function updateRating(
  ratingId: string,
  rating: number
): Promise<Rating> {
  const res = await fetch(`${BASE_URL}/ratings/${ratingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });

  if (!res.ok) throw new Error("Failed to update rating");
  return res.json();
}

export async function calculateAverageRating(storeId: string): Promise<number> {
  const storeRatings = await getRatingsByStoreId(storeId);
  if (storeRatings.length === 0) return 0;
  const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / storeRatings.length) * 10) / 10;
}

export async function deleteRating(ratingId: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/ratings/${ratingId}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function getRatingStats(storeId?: string) {
  const targetRatings = storeId
    ? await getRatingsByStoreId(storeId)
    : await getAllRatings();

  if (targetRatings.length === 0) {
    return {
      totalRatings: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  targetRatings.forEach((rating) => {
    distribution[rating.rating as keyof typeof distribution]++;
    sum += rating.rating;
  });

  return {
    totalRatings: targetRatings.length,
    averageRating: sum / targetRatings.length,
    ratingDistribution: distribution,
  };
}
