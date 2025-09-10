import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyToken,
  getAllRatings,
  deleteRating,
  updateRating,
} from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    ratingId: string;
  }>;
}

// DELETE /api/ratings/[ratingId]
export async function DELETE(
  request: Request,
  { params }: { params: { ratingId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    const { ratingId } = params;

    // Find the rating
    const allRatings = await getAllRatings();
    const rating = allRatings.find((r) => r.id === ratingId);

    if (!rating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    // Only owner or admin can delete
    if (rating.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteRating(ratingId);

    return NextResponse.json({
      message: "Rating deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ratingId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    const { ratingId } = params;
    const { rating } = await request.json();

    if (!rating) {
      return NextResponse.json(
        { error: "Rating value is required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check rating ownership
    const allRatings = await getAllRatings();
    const existing = allRatings.find((r) => r.id === ratingId);

    if (!existing) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Update rating
    const updated = await updateRating(ratingId, rating);

    return NextResponse.json({
      message: "Rating updated successfully",
      rating: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
