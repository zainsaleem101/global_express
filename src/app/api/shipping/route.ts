import { NextResponse } from "next/server";

interface PackageData {
  weight: string;
  length: string;
  width: string;
  height: string;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Log the received data
    console.log("Received shipping form data:", JSON.stringify(data, null, 2));

    // Validate quantity and packages
    const quantity = Number.parseInt(data.quantity, 10);
    if (isNaN(quantity) || quantity !== data.packages.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity does not match the number of packages",
        },
        { status: 400 }
      );
    }

    // Validate country objects
    if (!data.fromCountry || !data.toCountry) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid country data",
        },
        { status: 400 }
      );
    }

    // Transform packages
    const packages = data.packages.map((pkg: PackageData) => ({
      Weight: Number.parseFloat(pkg.weight),
      Length: Number.parseFloat(pkg.length),
      Width: Number.parseFloat(pkg.width),
      Height: Number.parseFloat(pkg.height),
    }));

    // Construct API request payload
    const apiPayload = {
      Credentials: {
        APIKey: process.env.TRANSGLOBAL_API_KEY || "",
        Password: process.env.TRANSGLOBAL_API_PASSWORD || "",
      },
      Shipment: {
        Consignment: {
          ItemType: data.itemType, // Use the item type from the request
          Packages: packages,
        },
        CollectionAddress: {
          City: "", // Per Python example
          Postcode: data.fromPostcode || "", // Allow empty postal codes
          Country: {
            CountryID: data.fromCountry.CountryID,
            CountryCode: data.fromCountry.CountryCode,
          },
        },
        DeliveryAddress: {
          City: "", // Per Python example
          Postcode: data.toPostcode || "", // Allow empty postal codes
          Country: {
            CountryID: data.toCountry.CountryID,
            CountryCode: data.toCountry.CountryCode,
          },
        },
      },
    };

    // Make API request
    const apiResponse = await fetch(
      "https://services3.transglobalexpress.co.uk/Quote/V2/GetQuoteMinimal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      }
    );

    const apiData = await apiResponse.json();

    // Pass through the API response even if it has a FAIL status
    // This allows the frontend to handle specific error messages
    return NextResponse.json({
      success: apiData.Status === "SUCCESS",
      message:
        apiData.Status === "SUCCESS"
          ? "Shipping quote retrieved successfully"
          : "Failed to retrieve quote",
      data: apiData,
    });
  } catch (error) {
    console.error("Error processing shipping form:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing shipping information",
      },
      { status: 500 }
    );
  }
}
