import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../src/lib/mongodb";
import Country from "../../../../src/lib/models/Country";

export async function GET() {
  try {
    await connectToDatabase(); // Ensure the connection is established
    // Fetch countries using Mongoose model
    const countries = await Country.find({});
    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
