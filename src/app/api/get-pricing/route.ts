import { NextResponse } from "next/server";
import { updatePricingCache } from "../../../lib/utils/pricing-cache";

export async function GET() {
  try {
    // Fetch and update cache
    await updatePricingCache();

    // Return minimal response to frontend
    return NextResponse.json(
      { message: "Pricing information cached successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pricing information:", error);
    return NextResponse.json(
      { message: "Failed to initialize pricing information" },
      { status: 500 }
    );
  }
}
