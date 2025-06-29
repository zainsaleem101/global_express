import { getCachedPricing } from "./pricing-cache";

interface CostObject {
  TotalCostNetWithCollection?: number;
  TotalCostNetWithoutCollection?: number;
  TotalCostGrossWithCollection?: number;
  TotalCostGrossWithoutCollection?: number;
  Cost?: number;
  CollectionCharge?: number;
}

interface ServiceResult {
  TotalCost: CostObject;
  ServicePriceBreakdown: CostObject[];
  OptionalExtras: CostObject[];
  CollectionOptions: Array<{ CollectionCharge: number; ExpectedLabel: any }>;
}

interface ApiResponse {
  Status: string;
  Notifications: any[];
  QuoteID: number;
  ServiceResults: ServiceResult[];
}

export async function convertToUSD(apiData: ApiResponse): Promise<ApiResponse> {
  const pricing = await getCachedPricing();
  const usdConversionRate = parseFloat(pricing.usd_conversion_rate || "0");
  const markupPercentage = pricing.markup_percentage || 0;

  // Deep clone the API data to avoid mutating the original
  const convertedData = JSON.parse(JSON.stringify(apiData)) as ApiResponse;

  // Convert all monetary values in ServiceResults
  convertedData.ServiceResults.forEach((service) => {
    // Convert TotalCost
    if (service.TotalCost) {
      if (typeof service.TotalCost.TotalCostNetWithCollection === "number") {
        service.TotalCost.TotalCostNetWithCollection =
          service.TotalCost.TotalCostNetWithCollection *
          usdConversionRate *
          (1 + markupPercentage / 100);
      }
      if (typeof service.TotalCost.TotalCostNetWithoutCollection === "number") {
        service.TotalCost.TotalCostNetWithoutCollection =
          service.TotalCost.TotalCostNetWithoutCollection *
          usdConversionRate *
          (1 + markupPercentage / 100);
      }
      if (typeof service.TotalCost.TotalCostGrossWithCollection === "number") {
        service.TotalCost.TotalCostGrossWithCollection =
          service.TotalCost.TotalCostGrossWithCollection *
          usdConversionRate *
          (1 + markupPercentage / 100);
      }
      if (
        typeof service.TotalCost.TotalCostGrossWithoutCollection === "number"
      ) {
        service.TotalCost.TotalCostGrossWithoutCollection =
          service.TotalCost.TotalCostGrossWithoutCollection *
          usdConversionRate *
          (1 + markupPercentage / 100);
      }
    }

    // Convert ServicePriceBreakdown
    if (
      service.ServicePriceBreakdown &&
      Array.isArray(service.ServicePriceBreakdown)
    ) {
      service.ServicePriceBreakdown.forEach((breakdown) => {
        if (typeof breakdown.Cost === "number") {
          breakdown.Cost =
            breakdown.Cost * usdConversionRate * (1 + markupPercentage / 100);
        }
      });
    }

    // Convert OptionalExtras
    if (service.OptionalExtras && Array.isArray(service.OptionalExtras)) {
      service.OptionalExtras.forEach((extra) => {
        if (typeof extra.Cost === "number") {
          extra.Cost =
            extra.Cost * usdConversionRate * (1 + markupPercentage / 100);
        }
      });
    }

    // Convert CollectionOptions
    if (service.CollectionOptions && Array.isArray(service.CollectionOptions)) {
      service.CollectionOptions.forEach((option) => {
        if (typeof option.CollectionCharge === "number") {
          option.CollectionCharge =
            option.CollectionCharge *
            usdConversionRate *
            (1 + markupPercentage / 100);
        }
      });
    }
  });

  return convertedData;
}
