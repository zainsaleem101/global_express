export interface Pricing {
  _id: string;
  usd_conversion_rate: number;
  markup_percentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingResponse {
  usd_conversion_rate: number;
  markup_percentage: number;
  last_updated: string;
}

export interface ConversionRateUpdateResponse {
  success: boolean;
  message: string;
  usd_conversion_rate: number;
  updated_at: string;
}
