export interface Address {
  forename: string;
  surname: string;
  email: string;
  phone: string;
  companyName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  countryState: string;
  postcode: string;
  country: string;
  countryId?: string;
}

export interface PackageItem {
  description: string;
  commodityCode: string;
  countryOfOrigin: string;
  countryOfOriginId?: string;
  quantity: number;
  valuePerItem: number;
  weightPerItem: number;
  length: number;
  width: number;
  height: number;
}

export interface ServiceQuote {
  ServiceID: number;
  ServiceName: string;
  CarrierName: string;
  ChargeableWeight: number;
  TransitTimeEstimate: string;
  SameDayCollectionCutOffTime: string;
  IsWarehouseService: boolean;
  TotalCost: {
    TotalCostGrossWithCollection: number;
  };
  ServicePriceBreakdown: Array<{
    Code: string;
    Description: string;
    Cost: number;
  }>;
  OptionalExtras: Array<{
    Code: string;
    Description: string;
    Cost: number;
  }>;
  SignatureRequiredAvailable: boolean;
  ServiceType: string;
}

export interface ServiceResult {
  ServiceID: number;
  ServiceName: string;
  CarrierName: string;
  ChargeableWeight: number;
  TransitTimeEstimate: string;
  IsWarehouseService: boolean;
  TotalCost: {
    TotalCostNetWithCollection: number;
    TotalCostNetWithoutCollection: number;
    TotalCostGrossWithCollection: number;
    TotalCostGrossWithoutCollection: number;
  };
  ServicePriceBreakdown: Array<{
    Code: string;
    Description: string;
    Cost: number;
  }>;
  OptionalExtras: Array<{
    Code: string;
    Description: string;
    Cost: number;
  }>;
  SignatureRequiredAvailable: boolean;
  ExpectedLabels: Array<{
    LabelRole: string;
    LabelFormat: string;
    LabelGenerateStatus: string;
    AvailableSizes: Array<{ Size: string }>;
  }>;
  CollectionOptions?: Array<{
    CollectionOptionID: number;
    CollectionOptionTitle: string;
    CollectionCharge: number;
    SameDayCollectionCutOffTime: string;
    ExpectedLabel: {
      LabelRole: string;
      LabelFormat: string;
      LabelGenerateStatus: string;
      AvailableSizes: Array<{ Size: string }>;
    };
  }>;
  SameDayCollectionCutOffTime?: string;
  ServiceType?: string;
}

// Add this interface for the minimal form data
export interface MinimalFormData {
  fromCountry:
    | {
        CountryID: number;
        CountryCode: string;
        Title: string;
      }
    | string;
  fromPostcode: string;
  toCountry:
    | {
        CountryID: number;
        CountryCode: string;
        Title: string;
      }
    | string;
  toPostcode: string;
  quantity: string;
  itemType: string;
  packagingType: string;
  measurementUnit: string;
  packages: PackageDimensions[];
}

// From src/lib/utils/rate-conversion.ts
export interface CostObject {
  TotalCostNetWithCollection?: number;
  TotalCostNetWithoutCollection?: number;
  TotalCostGrossWithCollection?: number;
  TotalCostGrossWithoutCollection?: number;
  Cost?: number;
  CollectionCharge?: number;
}

// ApiResponse from rate-conversion and minimal-shipping-form (merge if needed)
export interface ApiResponse {
  Status: string;
  Notifications: any[];
  QuoteID: number;
  ServiceResults: ServiceResult[];
}

// From src/components/minimal-shipping-form.tsx
export interface FormData {
  fromCountry: string;
  fromPostcode: string;
  toCountry: string;
  toPostcode: string;
  quantity: string;
  itemType: string;
  packagingType: string;
  measurementUnit: string;
  packages: PackageDimensions[];
}

export interface ApiNotification {
  Message: string;
  Severity: string;
}

export type ItemTypeKey = 'parcel' | 'document' | 'pallet';

// From src/app/booking/page.tsx
export interface BookingData {
  collectionAddress: Address | null;
  deliveryAddress: Address | null;
  packageItems: PackageItem[];
  reasonForShipment: string;
  collectionDate: string;
  readyFrom: string;
}

// From src/lib/store/useShippingStore.ts
export interface ShippingState {
  selectedService: ServiceResult | null;
  measurementUnit: "kg/cm" | "lb/inches";
  minimalFormData: MinimalFormData | null;
  setSelectedService: (service: ServiceResult) => void;
  clearSelectedService: () => void;
  setMeasurementUnit: (unit: "kg/cm" | "lb/inches") => void;
  setMinimalFormData: (data: MinimalFormData) => void;
  clearMinimalFormData: () => void;
}
