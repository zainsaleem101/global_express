import { NextResponse } from "next/server";
import { User } from "../../../backend/mongodb";
import bcrypt from "bcrypt";

export async function POST(request) {
  const { email, password } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  return NextResponse.json({ message: "User registered successfully" });
}
