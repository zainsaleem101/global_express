import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Pricing from "../../../../lib/models/Pricing";
import { updateOnlyConversionRateCache } from "../../../../lib/utils/pricing-cache";

export async function GET() {
  try {
    // Ensure the connection is established
    await connectToDatabase();

    // Get API key from environment variables
    const apiKey = process.env.CURRENCY_EXCHANGE_API_KEY;

    if (!apiKey) {
      console.error(
        "CURRENCY_EXCHANGE_API_KEY not found in environment variables"
      );
      return NextResponse.json(
        { error: "Currency exchange API key not configured" },
        { status: 500 }
      );
    }

    // Fetch conversion rates from the API
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/GBP`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the API response is successful
    if (data.result !== "success") {
      throw new Error("API returned unsuccessful result");
    }

    // Extract USD conversion rate from the response
    const usdConversionRate = data.conversion_rates?.USD;

    if (!usdConversionRate || typeof usdConversionRate !== "number") {
      throw new Error(
        "USD conversion rate not found or invalid in API response"
      );
    }

    // Find existing pricing record or create a new one
    let pricingRecord = await Pricing.findOne({});

    if (pricingRecord) {
      // Update existing record
      pricingRecord.usd_conversion_rate = usdConversionRate;
      await pricingRecord.save();
      await updateOnlyConversionRateCache(usdConversionRate.toString());
    } else {
      // Create new record with default markup percentage
      pricingRecord = new Pricing({
        usd_conversion_rate: usdConversionRate,
        markup_percentage: 0, // Default markup percentage
      });
      await pricingRecord.save();
    }

    console.log(
      `Successfully updated USD conversion rate: ${usdConversionRate}`
    );

    return NextResponse.json({
      success: true,
      message: "Conversion rate updated successfully",
      usd_conversion_rate: usdConversionRate,
      updated_at: pricingRecord.updatedAt,
    });
  } catch (error) {
    console.error("Error updating conversion rate:", error);
    return NextResponse.json(
      {
        error: "Failed to update conversion rate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
