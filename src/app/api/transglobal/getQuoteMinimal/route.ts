import { NextResponse } from "next/server";
import { convertToUSD } from "../../../../../src/lib/utils/rate-conversion";

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
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Received shipping form data:",
        JSON.stringify(data, null, 2)
      );
    }

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
          ItemType: data.itemType,
          Packages: packages,
        },
        CollectionAddress: {
          City: "",
          Postcode: data.fromPostcode || "",
          Country: {
            CountryID: data.fromCountry.CountryID,
            CountryCode: data.fromCountry.CountryCode,
          },
        },
        DeliveryAddress: {
          City: "",
          Postcode: data.toPostcode || "",
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

    // Convert prices to USD
    // console.log(JSON.stringify(apiData));
    const convertedData = await convertToUSD(apiData);
    // const convertedData = apiData;

    // Pass through the converted response
    return NextResponse.json({
      success: apiData.Status === "SUCCESS",
      message:
        apiData.Status === "SUCCESS"
          ? "Shipping quote retrieved successfully (prices in USD)"
          : "Failed to retrieve quote",
      data: convertedData,
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
