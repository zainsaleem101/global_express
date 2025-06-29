import mongoose from "mongoose";
import type { Document } from "mongoose";

// Define the interface for Pricing document
export interface IPricing extends Document {
  usd_conversion_rate: number;
  markup_percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Pricing schema
const pricingSchema = new mongoose.Schema(
  {
    usd_conversion_rate: {
      type: Number,
      required: [true, "USD conversion rate is required"],
      min: [0, "USD conversion rate must be positive"],
    },
    markup_percentage: {
      type: Number,
      required: [true, "Markup percentage is required"],
      min: [0, "Markup percentage must be positive"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Export the Pricing model
// Check if the model has already been defined to prevent Mongoose overwrite model error
export default mongoose.models.Pricing ||
  mongoose.model<IPricing>("Pricing", pricingSchema);
