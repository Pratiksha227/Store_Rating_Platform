import { type NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  createUser,
  hashPassword,
  generateToken,
} from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { name, email, address, password } = await request.json();

    if (!name || !email || !address || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists (via JSON Server)
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user in JSON Server
    const newUser = await createUser({
      name,
      email,
      address,
      password: hashedPassword,
      role: "user",
    });

    const { password: _, ...userWithoutPassword } = newUser;
    const token = generateToken(userWithoutPassword);

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      message: "Registration successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
