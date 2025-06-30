import mongoose, { Schema, model, models } from "mongoose";
import type { IOrder } from "../types/order";

// Define the Order schema
const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shipmentDetails: { type: Schema.Types.Mixed, required: true },
    orderApi: {
      type: String,
      enum: ["transglobal", "parcel2go"],
      required: true,
    },
  },
  { timestamps: true }
);

// THIS IS CRUCIAL FOR NEXT.JS APP DIRECTORY:
export default (models.Order as mongoose.Model<IOrder>) ||
  model<IOrder>("Order", OrderSchema);
