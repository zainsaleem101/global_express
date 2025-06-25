"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import SiteLayout from "../../../../src/components/layout/site-layout";
import { useAuthStore } from "../../../../src/lib/store/useAuthStore";
import { Button } from "../../../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../src/components/ui/card";
import { Skeleton } from "../../../../src/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import type { Order } from "../../../../src/lib/types/order";

// Convert Base64 to Blob URL for PDF preview with enhanced error handling
const base64ToBlobUrl = (
  base64: string,
  type: string = "application/pdf"
): string | null => {
  try {
    // Remove any potential prefix (e.g., "data:application/pdf;base64," if present)
    const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, "");
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Error converting Base64 to Blob:", e);
    return null;
  }
};

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const router = useRouter();

  // Memoize the fetch function
  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching order details"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Don&apos;t do anything if still loading auth
    if (authLoading) {
      return;
    }

    // If not authenticated, let the Header component handle the redirect
    // Don&apos;t force redirect to login here as it conflicts with logout
    if (!isAuthenticated) {
      return;
    }

    // Fetch order details only if authenticated
    fetchOrderDetails();
  }, [isAuthenticated, authLoading, fetchOrderDetails]);

  // Format currency
  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : Number(value);
    if (isNaN(num)) return "N/A";
    return `£${num.toFixed(2)}`;
  };

  // Handle PDF load error
  const onPdfLoadError = (index: number, type: string) => {
    console.error(
      `PDF Load Error for ${type} ${index + 1}: Failed to load document`
    );
    setError(`Failed to load ${type} ${index + 1}. Check console for details.`);
  };

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

  return (
    <SiteLayout>
      <div className="container py-8 px-4 md:px-6">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2 pl-0 text-gray-600 hover:text-gray-900"
          onClick={() => router.push("/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Order Details
        </h1>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : order ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Order Reference:
                    </span>
                    <div className="text-gray-900 break-all">
                      {order.shipmentDetails?.OrderReference || "N/A"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Invoice Reference:
                    </span>
                    <div className="text-gray-900 break-all">
                      {order.shipmentDetails?.OrderInvoice?.InvoiceReference ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Total Amount:
                    </span>
                    <div className="text-gray-900 font-bold text-blue-700">
                      {formatCurrency(
                        order.shipmentDetails?.OrderInvoice?.TotalGross
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-3">
                    <span className="font-medium text-gray-700">
                      Created At:
                    </span>
                    <div className="text-gray-900">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "PPP 'at' p")
                        : "N/A"}
                    </div>
                  </div>
                  {order.shipmentDetails?.TrackingURL && (
                    <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-3">
                      <span className="font-medium text-gray-700">
                        Tracking URL:
                      </span>
                      <div className="text-gray-900 break-all">
                        <a
                          href={order.shipmentDetails.TrackingURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {order.shipmentDetails.TrackingURL}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {order.shipmentDetails?.OrderInvoice?.InvoiceItems
              ?.OrderInvoiceItem && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Invoice Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Item Description:
                    </span>
                    <div className="text-gray-900 whitespace-pre-line">
                      {order.shipmentDetails.OrderInvoice.InvoiceItems
                        .OrderInvoiceItem.ItemDescription || "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {order.shipmentDetails?.Labels?.Label && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-6 w-6 text-blue-600" />
                    Labels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.shipmentDetails.Labels.Label.map((label, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            Label {index + 1} ({label.LabelSize})
                          </h4>
                          {label.DownloadURL && (
                            <a
                              href={label.DownloadURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          )}
                        </div>
                        {label.LabelContent && (
                          <div className="mt-2">
                            <object
                              data={base64ToBlobUrl(label.LabelContent)}
                              type="application/pdf"
                              width="100%"
                              height="500px"
                              onError={() => onPdfLoadError(index, "Label")}
                            >
                              <p>
                                PDF preview not available.{" "}
                                <a
                                  href={label.DownloadURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download here
                                </a>
                                .
                              </p>
                            </object>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {order.shipmentDetails?.Documents?.Document && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(Array.isArray(order.shipmentDetails.Documents.Document)
                      ? order.shipmentDetails.Documents.Document
                      : [order.shipmentDetails.Documents.Document]
                    ).map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{doc.DocumentType}</h4>
                          {doc.DownloadURL && (
                            <a
                              href={doc.DownloadURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          )}
                        </div>
                        {doc.Content && (
                          <div className="mt-2">
                            <object
                              data={base64ToBlobUrl(doc.Content)}
                              type="application/pdf"
                              width="100%"
                              height="500px"
                              onError={() => onPdfLoadError(index, "Document")}
                            >
                              <p>
                                PDF preview not available.{" "}
                                <a
                                  href={doc.DownloadURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download here
                                </a>
                                .
                              </p>
                            </object>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
            <h3 className="mt-4 text-lg font-medium text-red-800">
              Order Not Found
            </h3>
            <p className="mt-2 text-red-700">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <Button
              className="mt-6 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push("/orders")}
            >
              Return to Orders
            </Button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
