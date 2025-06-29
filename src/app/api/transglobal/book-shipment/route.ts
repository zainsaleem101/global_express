import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../src/lib/mongodb";
import Order from "../../../../../src/lib/models/Order";
import xml2js from "xml2js";
import { cookies } from "next/headers";
import { verifyTokenWithDetails } from "../../../../../src/lib/auth/jwt";

// Helper function to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenResult = verifyTokenWithDetails(token);
    if (!tokenResult.valid) {
      // Clear the invalid token cookie
      const response = NextResponse.json(
        {
          message: tokenResult.expired ? "Token expired" : "Invalid token",
        },
        { status: 401 }
      );

      response.cookies.set({
        name: "auth_token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0), // Set expiry to epoch time to delete the cookie
        sameSite: "strict",
        path: "/",
      });

      return response;
    }

    const { quoteId, selectedServiceId, collectionDate, readyFrom } =
      await request.json();

    // Validate required fields
    if (!quoteId || !selectedServiceId || !collectionDate || !readyFrom) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Construct the BookShipment request payload using QuoteSelection
    const bookShipmentRequest = {
      Credentials: {
        APIKey: process.env.TRANSGLOBAL_API_KEY_TEST || "5heQZ7Xrz3",
        Password: process.env.TRANSGLOBAL_API_PASSWORD_TEST || "bzHiFd?4Z2",
      },
      QuoteSelection: {
        QuoteID: quoteId,
      },
      BookDetails: {
        ServiceID: selectedServiceId,
        Collection: {
          CollectionDate: collectionDate,
          ReadyFrom: readyFrom,
          CollectionOptionID: 1, // Default or fetch from selected service if available
        },
      },
    };

    // Construct XML request body for QuoteSelection version
    const xmlBody = `
      <BookShipmentRequest xmlns="http://www.transglobalexpress.co.uk/API/V2" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
        <Credentials>
          <APIKey>${escapeXml(bookShipmentRequest.Credentials.APIKey)}</APIKey>
          <Password>${escapeXml(
            bookShipmentRequest.Credentials.Password
          )}</Password>
        </Credentials>
        <QuoteSelection>
          <QuoteID>${escapeXml(
            bookShipmentRequest.QuoteSelection.QuoteID.toString()
          )}</QuoteID>
        </QuoteSelection>
        <BookDetails>
          <ServiceID>${escapeXml(
            bookShipmentRequest.BookDetails.ServiceID.toString()
          )}</ServiceID>
          <Collection>
            <CollectionDate>${escapeXml(
              bookShipmentRequest.BookDetails.Collection.CollectionDate
            )}</CollectionDate>
            <ReadyFrom>${escapeXml(
              bookShipmentRequest.BookDetails.Collection.ReadyFrom
            )}</ReadyFrom>
            <CollectionOptionID>${
              bookShipmentRequest.BookDetails.Collection.CollectionOptionID
            }</CollectionOptionID>
          </Collection>
        </BookDetails>
      </BookShipmentRequest>
    `.trim();

    // Log the XML request body for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("BookShipment XML Request (QuoteSelection):", xmlBody);
    }

    // Make the API request to Transglobal Express
    const apiResponse = await fetch(
      "https://staging2.services3.transglobalexpress.co.uk/Book/V2/BookShipment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
          Accept: "application/xml",
        },
        body: xmlBody,
      }
    );

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status ${apiResponse.status}`);
    }

    const responseText = await apiResponse.text();

    // Log the full API response to the console (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("BookShipment API Response:", responseText);
    }

    // Parse XML response to JSON using xml2js
    const parser = new xml2js.Parser({ explicitArray: false, trim: true });
    const responseJson = await parser.parseStringPromise(responseText);

    // Validate the response structure
    const bookShipmentResponse = responseJson?.BookShipmentResponse;
    if (
      !bookShipmentResponse ||
      bookShipmentResponse.Status !== "SUCCESS" ||
      !bookShipmentResponse.OrderReference ||
      !bookShipmentResponse.OrderInvoice
    ) {
      // Extract error message from Notifications if present
      let errorMessage = "Failed to book shipment";
      const notifications = bookShipmentResponse?.Notifications?.Notification;
      if (notifications) {
        if (Array.isArray(notifications)) {
          errorMessage = notifications.map((n: any) => n.Message).join("; ");
        } else if (notifications.Message) {
          errorMessage = notifications.Message;
        }
      }
      console.error("Invalid response from BookShipment API:", {
        status: bookShipmentResponse?.Status,
        orderReference: bookShipmentResponse?.OrderReference,
        orderInvoice: bookShipmentResponse?.OrderInvoice,
        errorMessage,
      });
      return NextResponse.json(
        {
          message: errorMessage,
          response: responseText,
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Save the order to the database
    const order = new Order({
      userId: tokenResult.user!.id,
      shipmentDetails: bookShipmentResponse,
    });
    await order.save();

    return NextResponse.json(
      {
        message: "Shipment booked and order saved successfully",
        orderId: order._id,
        shipmentDetails: bookShipmentResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error booking shipment:", error);
    return NextResponse.json(
      { message: "Failed to book shipment", error: error.message },
      { status: 500 }
    );
  }
}
