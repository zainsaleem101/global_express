"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SiteLayout from "../../../src/components/layout/site-layout";
import { useAuthStore } from "../../../src/lib/store/useAuthStore";
import { Button } from "../../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../src/components/ui/tabs";
import { Skeleton } from "../../../src/components/ui/skeleton";
import { Package, Truck, Calendar, ShoppingBag } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Order } from "../../../src/lib/types/order";
import { apiRequest } from "../../../src/lib/utils/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const router = useRouter();

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data: { orders: Order[] } = await apiRequest("/api/orders");
      setOrders(data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't do anything if still loading auth
    if (authLoading) {
      return;
    }

    // If not authenticated, let the Header component handle the redirect
    // Don't force redirect to login here as it conflicts with logout
    if (!isAuthenticated) {
      return;
    }

    // Fetch orders directly in the effect to avoid double calls
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const data: { orders: Order[] } = await apiRequest("/api/orders");
        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, authLoading]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Remove all tabs except one "Orders" tab and remove usage of order.status
  // Filter orders (no need to filter by status anymore)
  const filteredOrders = orders;

  // Helper function to safely format currency
  const formatCurrency = (num: any) => {
    // Convert to number and handle null/undefined/string cases
    const numberValue = typeof num === "number" ? num : parseFloat(num) || 0;
    return `$${numberValue.toFixed(2)}`;
  };

  // Helper to get carrier from ItemDescription
  const getCarrierFromItemDescription = (order: Order) => {
    const item =
      order.shipmentDetails?.OrderInvoice?.InvoiceItems?.OrderInvoiceItem;
    if (!item || !item.ItemDescription) return "Not specified";
    // If OrderInvoiceItem is an array, use the first one
    const desc =
      Array.isArray(item) && item.length > 0
        ? item[0].ItemDescription
        : item.ItemDescription;
    return desc.split("\n")[0].trim();
  };

  return (
    <SiteLayout>
      <div className="container py-8 px-4 md:px-6 flex flex-col items-center">
        <div className="mb-8 w-full max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="mt-2 text-gray-600">
            View and track all your shipping orders
          </p>
        </div>

        {error && (
          <div className="mb-4 text-red-600 w-full max-w-2xl">{error}</div>
        )}

        <div className="w-full max-w-2xl">
          <Tabs defaultValue="orders" value="orders" className="w-full">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-0">
              {loading ? (
                // Loading skeletons
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="overflow-hidden max-w-xl mx-auto rounded-xl shadow-md border border-gray-200"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="mt-2 h-4 w-1/4" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                // No orders message
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                  <div className="rounded-full bg-gray-100 p-3">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No orders found
                  </h3>
                  <p className="mt-1 text-gray-500">
                    You haven&apos;t placed any orders yet.
                  </p>
                  <Button
                    className="mt-6 bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/")}
                  >
                    Place your first order
                  </Button>
                </div>
              ) : (
                // Orders list
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <Card
                      key={order._id}
                      className="overflow-hidden max-w-xl mx-auto rounded-xl shadow-md border border-gray-200 transition hover:shadow-lg"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="text-lg">
                            Order #{order._id.substring(order._id.length - 8)}
                          </CardTitle>
                          {/* Removed status badge */}
                        </div>
                        <CardDescription>
                          Placed{" "}
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Order Date:</span>
                              <span>
                                {format(new Date(order.createdAt), "PPP")}
                              </span>
                            </div>
                            {order.shipmentDetails.Labels?.[0]
                              ?.AirWaybillReference && (
                              <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  Tracking Number:
                                </span>
                                <span>
                                  {
                                    order.shipmentDetails.Labels[0]
                                      .AirWaybillReference
                                  }
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Carrier:</span>
                              <span>
                                {getCarrierFromItemDescription(order)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2 flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Total Amount:</span>
                              <span className="font-bold text-blue-700">
                                {formatCurrency(
                                  order.shipmentDetails.OrderInvoice.TotalGross
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 px-6 py-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/orders/${order._id}`)}
                        >
                          View Order Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  );
}
