import { NextResponse } from "next/server";
import { User } from "../../../backend/mongodb";
import bcrypt from "bcrypt";

export async function POST(request) {
  const { email, password } = await request.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Set a session or token here if needed
  return NextResponse.json({ message: "Login successful" });
}
