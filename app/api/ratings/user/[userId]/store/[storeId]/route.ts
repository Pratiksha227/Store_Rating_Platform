import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getUserRatingForStore } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    userId: string;
    storeId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    const { userId, storeId } = await params;

    // Users can only access their own ratings
    if (user.id !== userId && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rating = await getUserRatingForStore(userId, storeId);

    return NextResponse.json({
      rating: rating,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
