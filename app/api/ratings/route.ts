import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, createRating } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (user.role !== "user") {
      return NextResponse.json(
        { error: "Only users can submit ratings" },
        { status: 403 }
      );
    }

    const { storeId, rating } = await request.json();

    // Validation
    if (!storeId || !rating) {
      return NextResponse.json(
        { error: "Store ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Create or update rating
    const newRating = await createRating(user.id, storeId, rating);

    return NextResponse.json({
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
