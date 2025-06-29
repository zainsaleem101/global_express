import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../src/lib/mongodb";
import Order from "../../../../../src/lib/models/Order";
import { verifyTokenWithDetails } from "../../../../../src/lib/auth/jwt";
import type { Order as OrderType } from "../../../../../src/lib/types/order.d";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const { id } = await params;

    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token with detailed result
    const tokenResult = verifyTokenWithDetails(token);
    if (!tokenResult.valid) {
      // Clear the invalid token cookie
      const response = NextResponse.json(
        {
          message: tokenResult.expired ? "Token expired" : "Invalid token",
        },
        { status: 401 }
      );

      response.cookies.set({
        name: "auth_token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0), // Set expiry to epoch time to delete the cookie
        sameSite: "strict",
        path: "/",
      });

      return response;
    }

    // Connect to database
    await connectToDatabase();

    // Find the order by ID and ensure it belongs to the authenticated user
    const order = await Order.findOne({
      _id: id,
      userId: tokenResult.user!.id,
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Convert Mongoose document to match OrderType
    const orderPlain: OrderType = {
      _id: order._id.toString(),
      userId: order.userId.toString(),
      shipmentDetails: order.shipmentDetails,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return NextResponse.json({ order: orderPlain });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
