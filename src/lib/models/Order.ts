import mongoose, { Schema, model, Document, Types } from "mongoose";
import type { IUser } from "./User";

// Define the Order interface
export interface IOrder extends Document {
  userId: Types.ObjectId | IUser;
  shipmentDetails: any;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Order schema
const OrderSchema: Schema<IOrder> = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shipmentDetails: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Export the Order model (reuse if already defined)
export default mongoose.models.Order || model<IOrder>("Order", OrderSchema);
