import { connectToDatabase } from "../mongodb";
import Pricing from "../models/Pricing";

// In-memory cache to store pricing data
const pricingCache: {
  usd_conversion_rate?: string;
  markup_percentage?: number;
  last_updated?: Date;
} = {};

// Internal function to fetch and update cache
export async function updatePricingCache() {
  try {
    await connectToDatabase();
    const pricingRecord = await Pricing.findOne({});

    if (pricingRecord) {
      pricingCache.usd_conversion_rate = pricingRecord.usd_conversion_rate;
      pricingCache.markup_percentage = pricingRecord.markup_percentage;
      pricingCache.last_updated = pricingRecord.updatedAt;
    } else {
      // Set default values if no record exists
      pricingCache.usd_conversion_rate = "";
      pricingCache.markup_percentage = 0;
      pricingCache.last_updated = new Date();
    }
  } catch (error) {
    console.error("Error updating pricing cache:", error);
    throw new Error("Failed to fetch pricing information");
  }
}

// Internal function to fetch and update cache
export async function updateOnlyConversionRateCache(
  new_conversion_rate: string
) {
  pricingCache.usd_conversion_rate = new_conversion_rate;
  pricingCache.markup_percentage = 0;
  pricingCache.last_updated = new Date();
  return;
}

// Utility function to access cached pricing data
export async function getCachedPricing() {
  // Check if cache is empty or missing required data
  if (
    !pricingCache.usd_conversion_rate &&
    pricingCache.markup_percentage == null
  ) {
    await updatePricingCache();
  }

  return {
    usd_conversion_rate: pricingCache.usd_conversion_rate,
    markup_percentage: pricingCache.markup_percentage,
    last_updated: pricingCache.last_updated,
  };
}
