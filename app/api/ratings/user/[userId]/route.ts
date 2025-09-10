import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getRatingsByUserId } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    userId: string;
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
    const { userId } = await params;

    // Users can only access their own ratings, admins can access any
    if (user.id !== userId && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ratings = await getRatingsByUserId(userId);

    // Transform ratings to include just storeId and rating for the grid component
    const userRatings = ratings.map((rating) => ({
      storeId: rating.storeId,
      rating: rating.rating,
    }));

    return NextResponse.json({
      ratings: userRatings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
