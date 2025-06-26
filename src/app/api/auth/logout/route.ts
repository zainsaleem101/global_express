import { NextResponse } from "next/server";

export async function POST() {
  console.log("Logout API called");

  // Create response
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear the auth token cookie
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
