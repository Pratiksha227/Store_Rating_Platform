import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, createStore, updateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, address, ownerId } = await request.json();

    // Validation
    if (!name || !email || !address || !ownerId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create store
    const newStore = await createStore({
      name,
      email,
      address,
      ownerId,
    });

    // Update user role to store_owner and link to store
    await updateUser(ownerId, {
      role: "store_owner",
      storeId: newStore.id,
    });

    return NextResponse.json({
      message: "Store created successfully",
      store: newStore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
