"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ArrowRight, AlertCircle, Info } from "lucide-react";

import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../src/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../src/components/ui/alert";
import ServiceResultCard from "./ServiceResultCard";
import type { ICountry } from "../../src/lib/models/Country"; // Import the interface
import {
  saveFormDataToSession,
  loadFormDataFromSession,
  useShippingStore,
} from "../../src/lib/store/useShippingStore";
import type { PackageDimensions } from "../../src/lib/types/order";
import type { ServiceResult } from "../../src/lib/types/shipping";
import { fetchCountries, useCountries } from "../../src/lib/utils/api";

// Export the FormData type for use in the store
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

interface ApiNotification {
  Message: string;
  Severity: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    Status: string;
    Notifications: ApiNotification[];
    QuoteID: number;
    ServiceResults: ServiceResult[];
  };
}

const isValidNumber = (value: string): boolean => {
  if (value === "") return true;
  // Remove any trailing slashes or other invalid characters
  const cleanValue = value.replace(/[^0-9.]/g, "");
  if (cleanValue === "") return false;
  const num = Number.parseFloat(cleanValue);
  return !isNaN(num) && num > 0;
};

// Add item type mapping
const ITEM_TYPE_MAP = {
  parcel: "Parcel",
  document: "Document",
  pallet: "Pallet",
} as const;

type ItemTypeKey = keyof typeof ITEM_TYPE_MAP;

const convertToMetric = (
  weight: string,
  length: string,
  width: string,
  height: string
) => {
  const weightInKg = weight
    ? (Number.parseFloat(weight) / 2.20462).toFixed(2)
    : "";
  const lengthInCm = length
    ? (Number.parseFloat(length) * 2.54).toFixed(2)
    : "";
  const widthInCm = width ? (Number.parseFloat(width) * 2.54).toFixed(2) : "";
  const heightInCm = height
    ? (Number.parseFloat(height) * 2.54).toFixed(2)
    : "";

  return {
    weight: weightInKg,
    length: lengthInCm,
    width: widthInCm,
    height: heightInCm,
  };
};

export default function ShippingForm() {
  const { setMeasurementUnit } = useShippingStore();

  const [formData, setFormData] = useState<FormData>(() => {
    // Try to load saved form data from session storage
    if (typeof window !== "undefined") {
      const savedData = loadFormDataFromSession();
      if (savedData) {
        return savedData;
      }
    }

    // Return default form data if no saved data exists
    return {
      fromCountry: "",
      fromPostcode: "",
      toCountry: "",
      toPostcode: "",
      quantity: "1",
      itemType: "",
      packagingType: "",
      measurementUnit: "kg/cm",
      packages: [{ weight: "", length: "", width: "", height: "" }],
    };
  });

  // Save form data to session storage whenever it changes
  useEffect(() => {
    saveFormDataToSession(formData);
  }, [formData]);

  // Update global store when measurement unit changes
  useEffect(() => {
    setMeasurementUnit(formData.measurementUnit as "kg/cm" | "lb/inches");
  }, [formData.measurementUnit, setMeasurementUnit]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [apiNotifications, setApiNotifications] = useState<ApiNotification[]>(
    []
  );
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<ServiceResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Use the custom hook to fetch and cache countries
  const { data: countries = [], isError, error } = useCountries();

  useEffect(() => {
    if (results) {
      console.log("Service Results:", results);
      console.log("Number of service results:", results.length);
    }
  }, [results]);

  useEffect(() => {
    // Update packages array when quantity changes
    const newQuantity = Number.parseInt(formData.quantity);
    const currentPackages = formData.packages;

    if (newQuantity > currentPackages.length) {
      // Add new packages
      const newPackages = Array.from(
        { length: newQuantity - currentPackages.length },
        () => ({
          weight: "",
          length: "",
          width: "",
          height: "",
        })
      );
      setFormData((prev) => ({
        ...prev,
        packages: [...currentPackages, ...newPackages],
      }));
    } else if (newQuantity < currentPackages.length) {
      // Remove excess packages
      setFormData((prev) => ({
        ...prev,
        packages: currentPackages.slice(0, newQuantity),
      }));
    }
  }, [formData.quantity, formData.packages]);

  const validatePackageDimensions = (
    pkg: PackageDimensions
  ): PackageDimensions => {
    const errors: { [key: string]: string } = {};

    if (!isValidNumber(pkg.weight)) {
      errors.weight = "Weight must be a valid positive number";
    }
    if (!isValidNumber(pkg.length)) {
      errors.length = "Length must be a valid positive number";
    }
    if (!isValidNumber(pkg.width)) {
      errors.width = "Width must be a valid positive number";
    }
    if (!isValidNumber(pkg.height)) {
      errors.height = "Height must be a valid positive number";
    }

    return {
      ...pkg,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePackageChange = (
    index: number,
    field: keyof PackageDimensions,
    value: string
  ) => {
    // Clean the input value by removing invalid characters
    const cleanValue = value.replace(/[^0-9.]/g, "");

    setFormData((prev) => {
      const newPackages = [...prev.packages];
      newPackages[index] = {
        ...newPackages[index],
        [field]: cleanValue,
      };

      newPackages[index] = validatePackageDimensions(newPackages[index]);
      return {
        ...prev,
        packages: newPackages,
      };
    });
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate required fields (postal codes are now optional)
    if (!formData.fromCountry) errors.fromCountry = "Please select a country";
    if (!formData.toCountry) errors.toCountry = "Please select a country";
    if (!formData.itemType) errors.itemType = "Please select an item type";
    if (!formData.packagingType)
      errors.packagingType = "Please select a packaging type";

    // Validate package dimensions
    const hasPackageErrors = formData.packages.some((pkg) => pkg.errors);
    if (hasPackageErrors) {
      errors.packages = "Please fix package dimension errors";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setResults(null); // Clear previous results
    setHasSearched(false);
    setApiNotifications([]);

    if (!validateForm()) {
      return;
    }

    // Convert package dimensions if measurement unit is lb/inches
    const submissionData = {
      ...formData,
      packages: formData.packages.map((pkg) => {
        if (formData.measurementUnit === "lb/inches") {
          const { weight, length, width, height } = convertToMetric(
            pkg.weight,
            pkg.length,
            pkg.width,
            pkg.height
          );
          return { weight, length, width, height };
        }
        return pkg; // Return the package as is if already in kg/cm
      }),
    };

    setIsSubmitting(true);

    try {
      // Map CountryID to CountryData for fromCountry and toCountry
      const fromCountryData = countries.find(
        (country) => country.CountryID.toString() === formData.fromCountry
      );
      const toCountryData = countries.find(
        (country) => country.CountryID.toString() === formData.toCountry
      );

      if (!fromCountryData || !toCountryData) {
        throw new Error("Selected country not found");
      }

      const finalSubmissionData = {
        ...submissionData,
        itemType: ITEM_TYPE_MAP[formData.itemType as ItemTypeKey],
        fromCountry: {
          CountryID: fromCountryData.CountryID,
          CountryCode: fromCountryData.CountryCode,
          Title: fromCountryData.Title,
        },
        toCountry: {
          CountryID: toCountryData.CountryID,
          CountryCode: toCountryData.CountryCode,
          Title: toCountryData.Title,
        },
      };

      const response = await fetch("/api/transglobal/getQuoteMinimal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalSubmissionData),
      });

      const data: ApiResponse = await response.json();

      if (data.data && data.data.Status === "FAIL" && data.data.Notifications) {
        setApiNotifications(data.data.Notifications);

        // Check if the failure is due to missing postal codes
        const hasPostcodeError = data.data.Notifications.some(
          (notification) =>
            notification.Message &&
            notification.Message.toLowerCase().includes("postcode")
        );

        if (hasPostcodeError) {
          setSubmitError(
            "Postal codes are required for the selected countries"
          );
        } else {
          setSubmitError(data.message || "Failed to get shipping quotes");
        }

        setHasSearched(true);
        setResults([]);
      } else if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit shipping information"
        );
      } else {
        setResults(data.data.ServiceResults);
        setHasSearched(true);
        console.log("Shipping information submitted successfully:", data);
      }
    } catch (error) {
      console.error("Error submitting shipping information:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit shipping information"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const weightPlaceholder = formData.measurementUnit === "kg/cm" ? "kg" : "lb";
  const dimensionPlaceholder =
    formData.measurementUnit === "kg/cm" ? "cm" : "inches";

  return (
    <div className="space-y-8">
      {/* Display error if countries fetch fails */}
      {isError && (
        <Alert className="bg-red-50 border-red-200 mb-6">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-medium">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            Failed to load countries:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* From/To Section - Stacks on mobile */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="mb-2 text-center text-sm font-medium">
              Sending from...
            </div>
            <Select
              value={formData.fromCountry}
              onValueChange={(value) => handleInputChange("fromCountry", value)}
              disabled={isError} // Disable if countries failed to load
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem
                    key={country.CountryID}
                    value={country.CountryID.toString()}
                  >
                    {country.Title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.fromCountry && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.fromCountry}
              </p>
            )}
            <Input
              type="text"
              placeholder="Postal/ZIP code (recommended)"
              className="mt-2"
              value={formData.fromPostcode}
              onChange={(e) =>
                handleInputChange("fromPostcode", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <div className="mb-2 text-center text-sm font-medium">
              Delivered to...
            </div>
            <Select
              value={formData.toCountry}
              onValueChange={(value) => handleInputChange("toCountry", value)}
              disabled={isError} // Disable if countries failed to load
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem
                    key={country.CountryID}
                    value={country.CountryID.toString()}
                  >
                    {country.Title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.toCountry && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.toCountry}
              </p>
            )}
            <Input
              type="text"
              placeholder="Postal/ZIP code (recommended)"
              className="mt-2"
              value={formData.toPostcode}
              onChange={(e) => handleInputChange("toPostcode", e.target.value)}
            />
          </div>
        </div>

        {/* Package Details Section - Responsive layout */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left Column - Package Info */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm font-medium">Number of packages</div>
              <Select
                value={formData.quantity}
                onValueChange={(value) => handleInputChange("quantity", value)}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 100 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm font-medium">What are you sending?</div>
              <Select
                value={formData.itemType}
                onValueChange={(value) => handleInputChange("itemType", value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parcel">Parcel/Large Letter</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="pallet">Pallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formErrors.itemType && (
              <p className="text-xs text-red-500">{formErrors.itemType}</p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm font-medium">Outer Packaging Type:</div>
              <Select
                value={formData.packagingType}
                onValueChange={(value) =>
                  handleInputChange("packagingType", value)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select packaging" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardboard">Cardboard Box</SelectItem>
                  <SelectItem value="jiffy">Jiffy / Flyer Bag</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formErrors.packagingType && (
              <p className="text-xs text-red-500">{formErrors.packagingType}</p>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <div className="text-sm font-medium">Measurements:</div>
              <RadioGroup
                value={formData.measurementUnit}
                onValueChange={(value) =>
                  handleInputChange("measurementUnit", value)
                }
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="kg/cm" id="kg-cm" />
                  <Label htmlFor="kg-cm" className="text-sm">
                    kg/cm
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="lb/inches" id="lb-inches" />
                  <Label htmlFor="lb-inches" className="text-sm">
                    lb/inches
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Right Column - Package Dimensions */}
          <div>
            <div className="mb-2">
              <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-2">
                <div className="text-center text-xs sm:text-sm font-medium">
                  Weight
                </div>
                <div className="text-center text-xs sm:text-sm font-medium">
                  Length
                </div>
                <div className="text-center text-xs sm:text-sm font-medium">
                  Width
                </div>
                <div className="text-center text-xs sm:text-sm font-medium">
                  Height
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {formData.packages.map((pkg, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-2 border-b border-gray-100 py-2 last:border-0"
                  >
                    <div>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={weightPlaceholder}
                          className={`text-center text-xs sm:text-sm px-1 sm:px-2 h-8 sm:h-10 ${
                            pkg.errors?.weight ? "border-red-500" : ""
                          }`}
                          value={pkg.weight}
                          onChange={(e) =>
                            handlePackageChange(index, "weight", e.target.value)
                          }
                        />
                      </div>
                      {pkg.errors?.weight && (
                        <p className="mt-1 text-xs text-red-500">
                          {pkg.errors.weight}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={dimensionPlaceholder}
                          className={`text-center text-xs sm:text-sm px-1 sm:px-2 h-8 sm:h-10 ${
                            pkg.errors?.length ? "border-red-500" : ""
                          }`}
                          value={pkg.length}
                          onChange={(e) =>
                            handlePackageChange(index, "length", e.target.value)
                          }
                        />
                      </div>
                      {pkg.errors?.length && (
                        <p className="mt-1 text-xs text-red-500">
                          {pkg.errors.length}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={dimensionPlaceholder}
                          className={`text-center text-xs sm:text-sm px-1 sm:px-2 h-8 sm:h-10 ${
                            pkg.errors?.width ? "border-red-500" : ""
                          }`}
                          value={pkg.width}
                          onChange={(e) =>
                            handlePackageChange(index, "width", e.target.value)
                          }
                        />
                      </div>
                      {pkg.errors?.width && (
                        <p className="mt-1 text-xs text-red-500">
                          {pkg.errors.width}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={dimensionPlaceholder}
                          className={`text-center text-xs sm:text-sm px-1 sm:px-2 h-8 sm:h-10 ${
                            pkg.errors?.height ? "border-red-500" : ""
                          }`}
                          value={pkg.height}
                          onChange={(e) =>
                            handlePackageChange(index, "height", e.target.value)
                          }
                        />
                      </div>
                      {pkg.errors?.height && (
                        <p className="mt-1 text-xs text-red-500">
                          {pkg.errors.height}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {formErrors.packages && (
                <p className="mt-2 text-xs text-red-500">
                  {formErrors.packages}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-4">
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          <Button
            type="submit"
            size="lg"
            className="gap-2 bg-blue-600 px-8 w-full sm:w-auto hover:bg-blue-700"
            disabled={isSubmitting || isError}
          >
            {isSubmitting ? "Submitting..." : "Get a quote"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {hasSearched && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-6 text-center">
            Available Services
          </h2>

          {/* API Notifications */}
          {apiNotifications.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200 mb-6">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 font-medium">
                Important Information
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  {apiNotifications.map((notification, index) => (
                    <li key={index}>{notification.Message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* No results message */}
          {results && results.length === 0 && (
            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800 font-medium">
                No delivery services available
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                <p className="mb-2">
                  We couldn&apos;t find any delivery services for your specified
                  route and package details.
                </p>
                <div className="mt-4 bg-white p-4 rounded-md border border-blue-100">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    Possible reasons:
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>The destination may be outside our service area</li>
                    <li>Package dimensions or weight exceed carrier limits</li>
                    {apiNotifications.some((n) =>
                      n.Message.toLowerCase().includes("postcode")
                    ) && (
                      <li className="font-medium">
                        Postal codes are required for the selected countries
                      </li>
                    )}
                    <li>
                      The postcode entered may be invalid or not recognized
                    </li>
                    <li>Temporary service disruption on this route</li>
                  </ul>
                  <div className="mt-4 text-sm text-gray-700">
                    Try adjusting your package details or contact our customer
                    customer service for assistance.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Results list */}
          {results && results.length > 0 && (
            <div className="space-y-6">
              {results.map((result) => (
                <ServiceResultCard key={result.ServiceID} result={result} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
