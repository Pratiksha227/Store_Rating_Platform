import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyToken,
  getUserById,
  comparePassword,
  hashPassword,
  updateUser,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    const { currentPassword, newPassword } = await request.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Get full user data to verify current password
    const fullUser = await getUserById(user.id);

    console.log("fullUser", fullUser);
    if (!fullUser || !fullUser.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await comparePassword(
      currentPassword,
      fullUser.password
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password and update
    const hashedNewPassword = await hashPassword(newPassword);
    const updated = updateUser(user.id, { password: hashedNewPassword });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
