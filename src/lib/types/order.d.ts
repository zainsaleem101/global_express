export interface Order {
  _id: string;
  userId: string;
  shipmentDetails: any;
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
