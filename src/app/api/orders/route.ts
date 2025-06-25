import { type NextRequest, NextResponse } from "next/server";
import type { Model } from "mongoose";
import type { IOrder } from "../../../../src/lib/models/Order";
import OrderImport from "../../../../src/lib/models/Order";
import { verifyToken } from "../../../../src/lib/auth/jwt";
import type { Order } from "../../../../src/lib/types/order";

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

    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Fetch orders for the current user
    const orders = await Order.find({ userId: userData.id }).sort({
      createdAt: -1,
    });

    // Transform orders to match the Order interface
    const transformedOrders: Order[] = orders.map((order) => ({
      _id: order._id.toString(),
      userId: order.userId.toString(),
      status: order.shipmentDetails.Status.toLowerCase() as
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled",
      trackingNumber: order.shipmentDetails.Labels[0]?.AirWaybillReference,
      serviceType: order.shipmentDetails.Labels[0]?.ServiceName,
      carrierName: order.shipmentDetails.Labels[0]?.CarrierName,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shipmentDetails: order.shipmentDetails,
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

    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
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
      userId: userData.id,
      shipmentDetails,
    });

    // Save the order to the database
    await newOrder.save();

    // Transform the new order to match the Order interface
    const transformedOrder: Order = {
      _id: newOrder._id.toString(),
      userId: newOrder.userId.toString(),
      status: newOrder.shipmentDetails.Status.toLowerCase() as
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled",
      trackingNumber: newOrder.shipmentDetails.Labels[0]?.AirWaybillReference,
      serviceType: newOrder.shipmentDetails.Labels[0]?.ServiceName,
      carrierName: newOrder.shipmentDetails.Labels[0]?.CarrierName,
      createdAt: newOrder.createdAt.toISOString(),
      updatedAt: newOrder.updatedAt.toISOString(),
      shipmentDetails: newOrder.shipmentDetails,
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
