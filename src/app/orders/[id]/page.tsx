"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
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
import { pdfjs } from "react-pdf";
import { apiRequest } from "../../../../src/lib/utils/api";

// Initialize pdf.js worker with a compatible modern version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const [pdfPreviews, setPdfPreviews] = useState<{ [key: string]: string }>({});
  const [pdfUrls, setPdfUrls] = useState<{ [key: string]: string }>({});
  const [pdfErrors, setPdfErrors] = useState<{ [key: string]: string }>({});

  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await apiRequest(`/api/orders/${id}`);
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

  // Function to validate Base64, create Blob URL, and generate preview
  const createPdfPreview = useCallback(async (base64: string, type: string) => {
    try {
      // Validate input
      if (!base64 || typeof base64 !== "string") {
        throw new Error("Invalid Base64 data");
      }

      // Remove any data URI prefix and whitespace
      let cleanBase64 = base64
        .replace(/^data:application\/pdf;base64,/, "")
        .trim();

      // Ensure proper Base64 padding
      const paddingNeeded = cleanBase64.length % 4;
      if (paddingNeeded !== 0) {
        cleanBase64 += "=".repeat(4 - paddingNeeded);
      }

      // Validate Base64 format
      if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
        throw new Error("Malformed Base64 string");
      }

      // Additional validation: Check for reasonable Base64 length
      if (cleanBase64.length < 1000) {
        throw new Error("Base64 string too short, likely invalid PDF");
      }

      // Decode Base64
      let binary;
      try {
        binary = atob(cleanBase64);
      } catch (err) {
        throw new Error("Base64 decoding failed: Invalid data");
      }

      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }

      // Create Blob
      const blob = new Blob([array], { type: "application/pdf" });
      if (blob.size < 100) {
        throw new Error("PDF content is too small, likely invalid");
      }

      // Create Blob URL for download
      const url = URL.createObjectURL(blob);

      // Generate preview of the first page
      const pdf = await pdfjs.getDocument(url).promise;
      const page = await pdf.getPage(1); // Get only the first page
      const viewport = page.getViewport({ scale: 0.5 }); // Scale down for thumbnail

      // Create canvas for rendering
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context!,
        viewport,
      }).promise;

      // Convert canvas to image
      const previewUrl = canvas.toDataURL("image/png");

      return { url, previewUrl };
    } catch (err) {
      console.error(`Error creating PDF preview for ${type}:`, err);
      setPdfErrors((prev) => ({
        ...prev,
        [type]: `Failed to generate preview for ${type}: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Please try downloading again.`,
      }));
      return null;
    }
  }, []);

  // Generate PDF previews and URLs when order data is loaded
  useEffect(() => {
    if (order && order.shipmentDetails) {
      const newPdfUrls: { [key: string]: string } = {};
      const newPdfPreviews: { [key: string]: string } = {};
      const newPdfErrors: { [key: string]: string } = {};

      // Process Labels
      if (order.shipmentDetails.Labels?.Label) {
        const labels = Array.isArray(order.shipmentDetails.Labels.Label)
          ? order.shipmentDetails.Labels.Label
          : [order.shipmentDetails.Labels.Label];
        labels.forEach((label, index) => {
          if (label.LabelContent) {
            createPdfPreview(
              label.LabelContent,
              `Label ${index + 1} (${label.LabelSize})`
            ).then((result) => {
              if (result) {
                newPdfUrls[`label-${index}`] = result.url;
                newPdfPreviews[`label-${index}`] = result.previewUrl;
                setPdfUrls((prev) => ({
                  ...prev,
                  [`label-${index}`]: result.url,
                }));
                setPdfPreviews((prev) => ({
                  ...prev,
                  [`label-${index}`]: result.previewUrl,
                }));
              } else {
                newPdfErrors[
                  `label-${index}`
                ] = `Failed to generate preview for Label ${index + 1} (${
                  label.LabelSize
                }). Please try downloading again.`;
                setPdfErrors((prev) => ({
                  ...prev,
                  [`label-${index}`]: newPdfErrors[`label-${index}`],
                }));
              }
            });
          }
        });
      }

      // Process Documents
      if (order.shipmentDetails.Documents?.Document) {
        const documents = Array.isArray(
          order.shipmentDetails.Documents.Document
        )
          ? order.shipmentDetails.Documents.Document
          : [order.shipmentDetails.Documents.Document];
        documents.forEach((doc, index) => {
          if (doc.Content) {
            createPdfPreview(doc.Content, `${doc.DocumentType}`).then(
              (result) => {
                if (result) {
                  newPdfUrls[`document-${index}`] = result.url;
                  newPdfPreviews[`document-${index}`] = result.previewUrl;
                  setPdfUrls((prev) => ({
                    ...prev,
                    [`document-${index}`]: result.url,
                  }));
                  setPdfPreviews((prev) => ({
                    ...prev,
                    [`document-${index}`]: result.previewUrl,
                  }));
                } else {
                  newPdfErrors[
                    `document-${index}`
                  ] = `Failed to generate preview for ${doc.DocumentType}. Please try downloading again.`;
                  setPdfErrors((prev) => ({
                    ...prev,
                    [`document-${index}`]: newPdfErrors[`document-${index}`],
                  }));
                }
              }
            );
          }
        });
      }

      // Cleanup Blob URLs on component unmount
      return () => {
        Object.values(newPdfUrls).forEach((url) => URL.revokeObjectURL(url));
      };
    }
  }, [order, createPdfPreview]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchOrderDetails();
  }, [isAuthenticated, authLoading, fetchOrderDetails, router]);

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`;
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
          <ArrowLeft className="h-4 w-4" /> Back to Orders
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
                  <FileText className="h-6 w-6 text-blue-600" /> Order Summary
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
                    <FileText className="h-6 w-6 text-blue-600" /> Invoice Item
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
                    <Download className="h-6 w-6 text-blue-600" /> Labels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(Array.isArray(order.shipmentDetails.Labels.Label)
                      ? order.shipmentDetails.Labels.Label
                      : [order.shipmentDetails.Labels.Label]
                    ).map((label, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            Label {index + 1} ({label.LabelSize})
                          </h4>
                          {pdfUrls[`label-${index}`] ? (
                            <a
                              href={pdfUrls[`label-${index}`]}
                              download={`Label_${index + 1}_${
                                label.LabelSize
                              }.pdf`}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" /> Download
                            </a>
                          ) : (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Download className="h-4 w-4" /> Processing...
                            </span>
                          )}
                        </div>
                        {pdfErrors[`label-${index}`] ? (
                          <div className="text-red-600 text-center">
                            {pdfErrors[`label-${index}`]}
                          </div>
                        ) : pdfPreviews[`label-${index}`] ? (
                          <Image
                            src={pdfPreviews[`label-${index}`]}
                            alt={`Preview of Label ${index + 1} (${
                              label.LabelSize
                            })`}
                            width={300}
                            height={400}
                            unoptimized
                            className="w-full max-w-xs h-auto rounded-lg border"
                          />
                        ) : (
                          <div className="text-gray-500 text-center">
                            Generating preview...
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
                    <FileText className="h-6 w-6 text-blue-600" /> Documents
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
                          {pdfUrls[`document-${index}`] ? (
                            <a
                              href={pdfUrls[`document-${index}`]}
                              download={`${doc.DocumentType}.pdf`}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" /> Download
                            </a>
                          ) : (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Download className="h-4 w-4" /> Processing...
                            </span>
                          )}
                        </div>
                        {pdfErrors[`document-${index}`] ? (
                          <div className="text-red-600 text-center">
                            {pdfErrors[`document-${index}`]}
                          </div>
                        ) : pdfPreviews[`document-${index}`] ? (
                          <Image
                            src={pdfPreviews[`document-${index}`]}
                            alt={`Preview of ${doc.DocumentType}`}
                            width={300}
                            height={400}
                            unoptimized
                            className="w-full max-w-xs h-auto rounded-lg border"
                          />
                        ) : (
                          <div className="text-gray-500 text-center">
                            Generating preview...
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
