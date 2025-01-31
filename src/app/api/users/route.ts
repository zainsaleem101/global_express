import { NextResponse } from "next/server";
import { User } from "../../../backend/mongodb";

export async function GET() {
  const users = await User.find({}, { password: 0 }); // Exclude password
  return NextResponse.json(users);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url); // Get the URL search parameters
  const email = searchParams.get("email"); // Retrieve the email from the search parameters

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const result = await User.deleteOne({ email });
  if (result.deletedCount === 0) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "User deleted successfully" });
}
