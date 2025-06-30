import { type NextRequest, NextResponse } from "next/server";
import type { Model } from "mongoose";
import type { IOrder } from "../../../../src/lib/types/order";
import type { Order as OrderType } from "../../../../src/lib/types/order";
import OrderImport from "../../../../src/lib/models/Order";
import { verifyTokenWithDetails } from "../../../../src/lib/auth/jwt";

const Order = OrderImport as Model<IOrder>;

// GET handler to fetch orders for the current user
export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

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

    // Fetch orders for the current user
    const orders = await Order.find({ userId: tokenResult.user!.id }).sort({
      createdAt: -1,
    });

    // Transform orders to match the Order interface
    const transformedOrders: OrderType[] = orders.map((order) => ({
      _id: order._id.toString(),
      userId: order.userId.toString(),
      shipmentDetails: order.shipmentDetails,
      orderApi: order.orderApi,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : String(order.updatedAt),
    }));

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST handler to create a new order
export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

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

    // Parse request body
    const { shipmentDetails } = await req.json();

    // Validate shipmentDetails
    if (!shipmentDetails || typeof shipmentDetails !== "object") {
      return NextResponse.json(
        { message: "Invalid shipment details" },
        { status: 400 }
      );
    }

    // Create a new order
    const newOrder = new Order({
      userId: tokenResult.user!.id,
      shipmentDetails,
    });

    // Save the order to the database
    await newOrder.save();

    // Transform the new order to match the Order interface
    const transformedOrder: OrderType = {
      _id: newOrder._id.toString(),
      userId: newOrder.userId.toString(),
      shipmentDetails: newOrder.shipmentDetails,
      orderApi: newOrder.orderApi,
      createdAt: newOrder.createdAt instanceof Date ? newOrder.createdAt.toISOString() : String(newOrder.createdAt),
      updatedAt: newOrder.updatedAt instanceof Date ? newOrder.updatedAt.toISOString() : String(newOrder.updatedAt),
    };

    return NextResponse.json(
      { message: "Order created successfully", order: transformedOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
