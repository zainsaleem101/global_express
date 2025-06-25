"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Truck,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import { Separator } from "../../src/components/ui/separator";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../src/lib/store/useAuthStore";
import { useShippingStore } from "../../src/lib/store/useShippingStore";
import type { ServiceResult } from "../../src/lib/types/shipping";

interface ServiceResultCardProps {
  result: ServiceResult;
}

export default function ServiceResultCard({ result }: ServiceResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setSelectedService } = useShippingStore();

  const handleServiceSelection = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Store the selected service in Zustand
    setSelectedService(result);

    // Navigate to the next page
    router.push("/booking");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="relative">
        {/* Main card content */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
          {/* Left side - Service info */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-blue-700">
                {result.ServiceName}
              </h3>
              {result.ServiceType && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 font-medium"
                >
                  {result.ServiceType}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-5">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{result.CarrierName}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="bg-blue-100 rounded-full p-2">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Chargeable Weight</div>
                  <div className="font-semibold">
                    {result.ChargeableWeight} kg
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="bg-blue-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Transit Time</div>
                  <div className="font-semibold">
                    {result.TransitTimeEstimate} days
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="bg-blue-100 rounded-full p-2">
                  {result.SignatureRequiredAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Signature</div>
                  <div className="font-semibold">
                    {result.SignatureRequiredAvailable
                      ? "Required"
                      : "Not Required"}
                  </div>
                </div>
              </div>
            </div>

            {result.SameDayCollectionCutOffTime && (
              <div className="flex items-center gap-3 rounded-lg bg-amber-50 px-4 py-3 text-amber-700 border border-amber-100">
                <div className="bg-amber-100 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm">
                  Same Day Collection Cutoff:{" "}
                  <strong>{result.SameDayCollectionCutOffTime}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Right side - Price */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 flex flex-col justify-center items-center md:min-w-[220px] border-t md:border-t-0 md:border-l border-blue-100">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                £{result.TotalCost.TotalCostGrossWithCollection.toFixed(2)}
              </p>
              <p className="text-sm text-blue-600 font-medium">
                with collection
              </p>

              <Separator className="my-3 sm:my-4 bg-blue-200/50" />

              <p className="text-base sm:text-lg font-medium text-gray-700">
                £{result.TotalCost.TotalCostGrossWithoutCollection.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">without collection</p>
            </div>

            <Button
              className="mt-4 sm:mt-6 w-full bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
              onClick={handleServiceSelection}
            >
              Select Service
            </Button>
          </div>
        </div>

        {/* Details toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-none border-t border-gray-100 h-12"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expanded details section */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {result.ServicePriceBreakdown.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
                    £
                  </span>
                  Price Breakdown
                </h4>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <ul className="space-y-2 divide-y divide-gray-100">
                    {result.ServicePriceBreakdown.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between text-sm py-2 first:pt-0 last:pb-0"
                      >
                        <span className="text-gray-700">
                          {item.Description}
                        </span>
                        <span className="font-medium text-gray-900">
                          £{item.Cost.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {result.OptionalExtras.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
                    +
                  </span>
                  Optional Extras
                </h4>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm">
                  <ul className="space-y-2 divide-y divide-gray-100">
                    {result.OptionalExtras.map((extra, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between text-sm py-2 first:pt-0 last:pb-0"
                      >
                        <span className="text-gray-700">
                          {extra.Description}
                        </span>
                        <span className="font-medium text-gray-900">
                          £{extra.Cost.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {result.CollectionOptions && result.CollectionOptions.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
                  <Truck className="h-3 w-3" />
                </span>
                Collection Options
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.CollectionOptions.map((option) => (
                  <div
                    key={option.CollectionOptionID}
                    className="rounded-lg border border-gray-100 bg-white p-3 sm:p-4 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h5 className="font-medium text-blue-700">
                        {option.CollectionOptionTitle}
                      </h5>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        £{option.CollectionCharge.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Cutoff Time:{" "}
                      <span className="font-medium">
                        {option.SameDayCollectionCutOffTime}
                      </span>
                    </p>
                    <Separator className="my-3" />
                    <div className="text-xs text-gray-500">
                      <p>
                        Label: {option.ExpectedLabel.LabelRole} (
                        {option.ExpectedLabel.LabelFormat})
                      </p>
                      <p>
                        Sizes:{" "}
                        {option.ExpectedLabel.AvailableSizes.map(
                          (size) => size.Size
                        ).join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.ExpectedLabels.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <path d="m9 16 2 2 4-4" />
                  </svg>
                </span>
                Expected Labels
              </h4>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {result.ExpectedLabels.map((label, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-100 bg-white p-3 text-sm shadow-sm hover:shadow transition-shadow"
                  >
                    <p className="font-medium text-gray-700">
                      {label.LabelRole}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: {label.LabelFormat}
                    </p>
                    <p className="text-xs text-gray-500">
                      Status: {label.LabelGenerateStatus}
                    </p>
                    {label.AvailableSizes.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Sizes:{" "}
                        {label.AvailableSizes.map((size) => size.Size).join(
                          ", "
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
