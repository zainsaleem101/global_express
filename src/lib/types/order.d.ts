export interface Order {
  _id: string;
  userId: string;
  orderDate?: string;
  totalAmount?: number;
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"; // Made optional as not in response
  trackingNumber?: string;
  serviceType?: string;
  carrierName?: string;
  orderDetails?: OrderDetail;
  createdAt: string;
  updatedAt: string;
  shipmentDetails: ShipmentDetails;
  __v?: number; // Added to match response
}

export interface ShipmentDetails {
  $?: {
    "xmlns:i"?: string;
    xmlns?: string;
  };
  Status: string;
  Notifications: {
    Notification:
      | { Message: string; Severity: string }
      | { Message: string; Severity: string }[];
  };
  OrderReference: string;
  OrderInvoice: {
    InvoiceReference: string | null;
    TotalNet: string; // Changed to string to match response
    Tax: string; // Changed to string to match response
    TotalGross: string; // Changed to string to match response
    InvoiceItems: {
      OrderInvoiceItem: {
        ItemDescription: string;
        AmountNet: string; // Changed to string to match response
      };
    };
  };
  Labels: {
    Label: Array<{
      LabelRole: string;
      LabelFormat: string;
      LabelSize: string;
      AirWaybillReference: string;
      LabelContent: string;
      DownloadURL: string;
      CarrierName: string;
      ServiceName: string;
    }>;
  };
  Documents: {
    Document:
      | {
          DocumentType: string;
          Format: string;
          Content: string;
          DownloadURL: string;
        }
      | Array<{
          DocumentType: string;
          Format: string;
          Content: string;
          DownloadURL: string;
        }>;
  };
  TrackingURL: string;
}

export interface OrderDetail {
  CollectionAddress?: {
    City: string;
    Postcode: string;
    Country: { Title: string };
  };
  DeliveryAddress?: {
    City: string;
    Postcode: string;
    Country: { Title: string };
  };
  TransitTimeEstimate?: number;
  Consignment?: {
    Packages: Array<PackageDetail>;
  };
  ServiceResults?: Array<{
    ServiceName: string;
    CarrierName: string;
    TransitTimeEstimate: number;
    TotalCost: {
      TotalCostGrossWithCollection: number;
    };
  }>;
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
