import type { Document, Types } from "mongoose";

export interface Order {
  _id: string;
  userId: string;
  shipmentDetails: any;
  orderApi: "transglobal" | "parcel2go";
  createdAt: string;
  updatedAt: string;
}

export interface PackageDimensions {
  weight: string;
  length: string;
  width: string;
  height: string;
  errors?: {
    weight?: string;
    length?: string;
    width?: string;
    height?: string;
  };
}

export interface PackageDetail {
  Weight: number;
  Length: number;
  Width: number;
  Height: number;
}

// From src/lib/models/Order.ts
export interface IOrder extends Document {
  userId: Types.ObjectId;
  shipmentDetails: any;
  orderApi: "transglobal" | "parcel2go";
  createdAt: Date;
  updatedAt: Date;
}
