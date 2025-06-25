import { type NextRequest, NextResponse } from "next/server";
import User from "../../../../../src/lib/models/User";
import { verifyToken } from "../../../../../src/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("auth_token")?.value;
    console.log("Auth token from cookie:", token ? "exists" : "missing");

    if (!token) {
      console.log("No valid auth token cookie");
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const userData = verifyToken(token);
    console.log("Token verification result:", userData ? "valid" : "invalid");

    if (!userData) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user details from database (excluding password)
    const userDetails = await User.findById(userData.id).select("-password");

    if (!userDetails) {
      console.log("User not found in database");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("User found, returning user data");
    return NextResponse.json({
      user: {
        id: userDetails._id,
        name: userDetails.name,
        email: userDetails.email,
        createdAt: userDetails.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching user data" },
      { status: 500 }
    );
  }
}
