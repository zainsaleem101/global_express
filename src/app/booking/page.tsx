"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import AddressForm from "../../components/AddressForm";
import PackageDetailsForm from "../../components/PackageDetailsForm";
import { useAuthStore } from "../../lib/store/useAuthStore";
import SiteLayout from "../../components/layout/site-layout";
import type {
  Address,
  PackageItem,
  ServiceQuote,
} from "../../lib/types/shipping";

interface BookingData {
  collectionAddress: Address | null;
  deliveryAddress: Address | null;
  packageItems: PackageItem[];
  reasonForShipment: string;
  collectionDate: string;
  readyFrom: string;
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [collectionAddress, setCollectionAddress] = useState<Address | null>(
    null
  );
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [packageItems, setPackageItems] = useState<PackageItem[]>([]);
  const [reasonForShipment, setReasonForShipment] = useState<string>("");
  const [collectionDate, setCollectionDate] = useState<string>("");
  const [readyFrom, setReadyFrom] = useState<string>("");
  const [quotes, setQuotes] = useState<ServiceQuote[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceQuote | null>(
    null
  );
  const [quoteId, setQuoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthStore();

  // Check authentication on component mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/booking");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("bookingData");
    if (savedData) {
      try {
        const parsedData: BookingData = JSON.parse(savedData);
        if (parsedData.collectionAddress)
          setCollectionAddress(parsedData.collectionAddress);
        if (parsedData.deliveryAddress)
          setDeliveryAddress(parsedData.deliveryAddress);
        if (parsedData.packageItems.length > 0)
          setPackageItems(parsedData.packageItems);
        if (parsedData.reasonForShipment)
          setReasonForShipment(parsedData.reasonForShipment);
        if (parsedData.collectionDate)
          setCollectionDate(parsedData.collectionDate);
        if (parsedData.readyFrom) setReadyFrom(parsedData.readyFrom);
      } catch (error) {
        console.error("Error parsing saved booking data:", error);
      }
    }
  }, []);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // Don&apos;t render the page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Save data to localStorage whenever form data changes
  const saveToLocalStorage = (data: Partial<BookingData>) => {
    const currentData = {
      collectionAddress,
      deliveryAddress,
      packageItems,
      reasonForShipment,
      collectionDate,
      readyFrom,
      ...data,
    };
    localStorage.setItem("bookingData", JSON.stringify(currentData));
  };

  const handleAddressSubmit = (collection: Address, delivery: Address) => {
    setCollectionAddress(collection);
    setDeliveryAddress(delivery);
    saveToLocalStorage({
      collectionAddress: collection,
      deliveryAddress: delivery,
    });
    setStep(2);
  };

  const handlePackageDetailsSubmit = (
    items: PackageItem[],
    reason: string,
    date: string,
    time: string
  ) => {
    setPackageItems(items);
    setReasonForShipment(reason);
    setCollectionDate(date);
    setReadyFrom(time);
    saveToLocalStorage({
      packageItems: items,
      reasonForShipment: reason,
      collectionDate: date,
      readyFrom: time,
    });
    fetchQuotes(collectionAddress!, deliveryAddress!, items, reason);
  };

  const fetchQuotes = async (
    collection: Address,
    delivery: Address,
    items: PackageItem[],
    reason: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/getQuote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionAddress: collection,
          deliveryAddress: delivery,
          packageItems: items,
          reasonForShipment: reason,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.response, "application/xml");
        const quoteIdElement =
          xmlDoc.getElementsByTagName("QuoteID")[0]?.textContent;
        const serviceResults =
          xmlDoc.getElementsByTagName("ServiceQuoteResult");

        const quotesList: ServiceQuote[] = Array.from(serviceResults).map(
          (result) => {
            const getText = (tag: string) =>
              result.getElementsByTagName(tag)[0]?.textContent || "";
            const totalCost = result.getElementsByTagName("TotalCost")[0];
            const priceBreakdown = Array.from(
              result
                .getElementsByTagName("ServicePriceBreakdown")[0]
                ?.getElementsByTagName("PriceElement") || []
            ).map((elem) => ({
              Code: getText.call(elem, "Code"),
              Description: getText.call(elem, "Description"),
              Cost: parseFloat(getText.call(elem, "Cost")),
            }));
            const optionalExtras = Array.from(
              result
                .getElementsByTagName("OptionalExtras")[0]
                ?.getElementsByTagName("PriceElement") || []
            ).map((elem) => ({
              Code: getText.call(elem, "Code"),
              Description: getText.call(elem, "Description"),
              Cost: parseFloat(getText.call(elem, "Cost")),
            }));

            return {
              ServiceID: parseInt(getText("ServiceID")),
              ServiceName: getText("ServiceName"),
              CarrierName: getText("CarrierName"),
              ChargeableWeight: parseFloat(getText("ChargeableWeight")),
              TransitTimeEstimate: getText("TransitTimeEstimate"),
              SameDayCollectionCutOffTime: getText(
                "SameDayCollectionCutOffTime"
              ),
              IsWarehouseService: getText("IsWarehouseService") === "true",
              TotalCost: {
                TotalCostGrossWithCollection: parseFloat(
                  totalCost?.getElementsByTagName(
                    "TotalCostGrossWithCollection"
                  )[0]?.textContent || "0"
                ),
              },
              ServicePriceBreakdown: priceBreakdown,
              OptionalExtras: optionalExtras,
              SignatureRequiredAvailable:
                getText("SignatureRequiredAvailable") === "true",
              ServiceType: getText("ServiceType"),
            };
          }
        );

        setQuoteId(parseInt(quoteIdElement || "0"));
        setQuotes(quotesList);
        setStep(3);
      } else {
        setError(data.error || "Failed to fetch quotes");
      }
    } catch (err: any) {
      setError("Error fetching quotes: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (service: ServiceQuote) => {
    setSelectedService(service);
    handleBookShipment();
  };

  const handleBookShipment = async () => {
    if (!quoteId || !selectedService) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/book-shipment", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteId,
          selectedServiceId: selectedService.ServiceID,
          collectionDate,
          readyFrom,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Clear localStorage after successful booking
        localStorage.removeItem("bookingData");
        setStep(4);
      } else {
        setError(data.message || data.error || "Failed to book shipment");
      }
    } catch (err: any) {
      setError("Error booking shipment: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem("bookingData");
    setCollectionAddress(null);
    setDeliveryAddress(null);
    setPackageItems([]);
    setReasonForShipment("");
    setCollectionDate("");
    setReadyFrom("");
    setStep(1);
  };

  const steps = [
    {
      number: 1,
      title: "Address Details",
      description: "Collection & Delivery",
    },
    {
      number: 2,
      title: "Package Details",
      description: "Items & Collection Time",
    },
    {
      number: 3,
      title: "Select Service",
      description: "Choose Shipping Option",
    },
    { number: 4, title: "Confirmation", description: "Booking Complete" },
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Book Your Shipment
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get instant quotes and book your international shipping with our
              reliable services
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {steps.map((stepItem, index) => (
                <div key={stepItem.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step >= stepItem.number
                        ? "bg-sky-600 border-sky-600 text-white"
                        : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    {step > stepItem.number ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stepItem.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        step > stepItem.number ? "bg-sky-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">
                  {steps[step - 1].title}
                </h3>
                <p className="text-sm text-gray-500">
                  {steps[step - 1].description}
                </p>
              </div>
            </div>
          </div>

          {/* Clear Saved Data Button */}
          {step === 1 && localStorage.getItem("bookingData") && (
            <div className="mb-6 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSavedData}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Saved Data
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="p-8">
                <CardContent className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                  <p className="text-gray-700">Processing your request...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            {step === 1 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6 text-sky-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Address Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressForm
                    onSubmit={handleAddressSubmit}
                    initialCollection={collectionAddress}
                    initialDelivery={deliveryAddress}
                  />
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6 text-sky-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span>Package Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PackageDetailsForm
                    onSubmit={handlePackageDetailsSubmit}
                    onBack={() => setStep(1)}
                    initialItems={packageItems}
                    initialReason={reasonForShipment}
                    initialCollectionDate={collectionDate}
                    initialReadyFrom={readyFrom}
                  />
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <svg
                        className="w-6 h-6 text-sky-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Available Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quotes.length > 0 ? (
                      <div className="grid gap-6">
                        {quotes.map((quote) => (
                          <Card
                            key={quote.ServiceID}
                            className="border-2 hover:border-sky-300 transition-colors"
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {quote.ServiceName}
                                  </h3>
                                  <p className="text-gray-600">
                                    {quote.CarrierName}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-3xl font-bold text-sky-600">
                                    £
                                    {quote.TotalCost.TotalCostGrossWithCollection.toFixed(
                                      2
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {quote.TransitTimeEstimate} days
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-500">
                                    Service Type
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {quote.ServiceType}
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-500">
                                    Weight
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {quote.ChargeableWeight} kg
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-500">
                                    Collection Cut-off
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {quote.SameDayCollectionCutOffTime}
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-500">
                                    Signature
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {quote.SignatureRequiredAvailable
                                      ? "Required"
                                      : "Optional"}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3 mb-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Cost Breakdown:
                                  </p>
                                  <div className="space-y-1">
                                    {quote.ServicePriceBreakdown.map(
                                      (price, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between text-sm"
                                        >
                                          <span className="text-gray-600">
                                            {price.Description}
                                          </span>
                                          <span className="font-medium">
                                            £{price.Cost.toFixed(2)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {quote.OptionalExtras.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">
                                      Optional Extras:
                                    </p>
                                    <div className="space-y-1">
                                      {quote.OptionalExtras.map(
                                        (extra, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between text-sm"
                                          >
                                            <span className="text-gray-600">
                                              {extra.Description}
                                            </span>
                                            <span className="font-medium">
                                              £{extra.Cost.toFixed(2)}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-between items-center">
                                <div className="flex space-x-2">
                                  {quote.IsWarehouseService && (
                                    <Badge variant="secondary">
                                      Warehouse Service
                                    </Badge>
                                  )}
                                  <Badge variant="outline">
                                    {quote.ServiceType}
                                  </Badge>
                                </div>
                                <Button
                                  onClick={() => handleServiceSelect(quote)}
                                  className="bg-sky-600 hover:bg-sky-700"
                                >
                                  Select & Book
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-16 h-16 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                          />
                        </svg>
                        <p className="text-gray-500">
                          No services available for this shipment.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="mr-4"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <Card className="shadow-lg border-green-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-green-800">
                    Booking Confirmed!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <p className="text-green-600 font-medium">
                      Your shipment has been successfully booked!
                    </p>

                    <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Booking Details
                      </h4>
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">
                            {selectedService?.ServiceName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carrier:</span>
                          <span className="font-medium">
                            {selectedService?.CarrierName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-bold text-sky-600">
                            £
                            {selectedService?.TotalCost.TotalCostGrossWithCollection.toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transit Time:</span>
                          <span className="font-medium">
                            {selectedService?.TransitTimeEstimate} days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          setStep(1);
                          setQuotes([]);
                          setSelectedService(null);
                          setQuoteId(null);
                        }}
                        className="bg-sky-600 hover:bg-sky-700"
                      >
                        Book Another Shipment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
