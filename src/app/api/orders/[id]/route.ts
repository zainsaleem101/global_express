import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../src/lib/mongodb";
import Order from "../../../../../src/lib/models/Order";
import { verifyToken } from "../../../../../src/lib/auth/jwt";
import type { Order as OrderType } from "../../../../../src/lib/types/order.d";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get token from cookie
    const token = req.headers
      .get("cookie")
      ?.split("auth_token=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the order by ID and ensure it belongs to the authenticated user
    const order = await Order.findOne({
      _id: id,
      userId: userData.id,
    }) as OrderType | null;

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
