import { type NextRequest, NextResponse } from "next/server";
import User from "../../../../../src/lib/models/User";
import { verifyTokenWithDetails } from "../../../../../src/lib/auth/jwt";

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

    // Get user details from database (excluding password)
    const userDetails = await User.findById(tokenResult.user!.id).select(
      "-password"
    );

    if (!userDetails) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userDetails._id,
        name: userDetails.name,
        email: userDetails.email,
        createdAt: userDetails.createdAt,
      },
    });
  } catch (error) {
    // Only log in development environment
    if (process.env.NODE_ENV === "development") {
      console.error("Error in /api/auth/me:", error);
    }
    return NextResponse.json(
      { message: "An error occurred while fetching user data" },
      { status: 500 }
    );
  }
}
