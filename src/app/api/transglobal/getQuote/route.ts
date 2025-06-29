import { NextRequest, NextResponse } from "next/server";

// Helper function to escape XML special characters
function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: NextRequest) {
  try {
    const {
      collectionAddress,
      deliveryAddress,
      packageItems,
      reasonForShipment,
    } = await request.json();

    // Construct the GetQuote request payload
    const getQuoteRequest = {
      Credentials: {
        APIKey: process.env.TRANSGLOBAL_API_KEY_TEST || "5heQZ7Xrz3",
        Password: process.env.TRANSGLOBAL_API_PASSWORD_TEST || "bzHiFd?4Z2",
      },
      Shipment: {
        Consignment: {
          ItemType: "Parcel",
          ItemsAreStackable: true,
          ConsignmentSummary: reasonForShipment,
          ConsignmentValue: packageItems.reduce(
            (sum: number, item: any) => sum + item.valuePerItem * item.quantity,
            0
          ),
          Packages: packageItems.map((item: any) => ({
            Weight: item.weightPerItem * item.quantity,
            Length: item.length,
            Width: item.width,
            Height: item.height,
            CommodityDetails: {
              CommodityLine: [
                {
                  CommodityCode: item.commodityCode,
                  CommodityDescription: item.description,
                  CountryOfOrigin: {
                    CountryCode: item.countryOfOrigin,
                  },
                  NumberOfUnits: item.quantity,
                  UnitValue: item.valuePerItem,
                  UnitWeight: item.weightPerItem,
                },
              ],
            },
          })),
        },
        CollectionAddress: {
          Forename: collectionAddress.forename,
          Surname: collectionAddress.surname,
          EmailAddress: collectionAddress.email,
          TelephoneNumber: collectionAddress.phone,
          CompanyName: collectionAddress.companyName || "",
          AddressLineOne: collectionAddress.addressLine1,
          AddressLineTwo: collectionAddress.addressLine2 || "",
          City: collectionAddress.city,
          County: collectionAddress.countryState || "NY", // Default to NY for US
          Postcode: collectionAddress.postcode,
          Country: {
            CountryCode: collectionAddress.country,
          },
        },
        DeliveryAddress: {
          Forename: deliveryAddress.forename,
          Surname: deliveryAddress.surname,
          EmailAddress: deliveryAddress.email,
          TelephoneNumber: deliveryAddress.phone,
          CompanyName: deliveryAddress.companyName || "",
          AddressLineOne: deliveryAddress.addressLine1,
          AddressLineTwo: deliveryAddress.addressLine2 || "",
          City: deliveryAddress.city,
          County: deliveryAddress.countryState || "Punjab", // Default to Punjab for Pakistan
          Postcode: deliveryAddress.postcode,
          Country: {
            CountryCode: deliveryAddress.country,
          },
        },
      },
    };

    // Construct XML request body for GetQuote
    const xmlBody = `
      <GetQuoteRequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.transglobalexpress.co.uk/API/V2">
        <Credentials>
          <APIKey>${escapeXml(getQuoteRequest.Credentials.APIKey)}</APIKey>
          <Password>${escapeXml(
            getQuoteRequest.Credentials.Password
          )}</Password>
        </Credentials>
        <Shipment>
          <Consignment>
            <ItemType>${escapeXml(
              getQuoteRequest.Shipment.Consignment.ItemType
            )}</ItemType>
            <ItemsAreStackable>${
              getQuoteRequest.Shipment.Consignment.ItemsAreStackable
            }</ItemsAreStackable>
            <ConsignmentSummary>${escapeXml(
              getQuoteRequest.Shipment.Consignment.ConsignmentSummary
            )}</ConsignmentSummary>
            <ConsignmentValue>${
              getQuoteRequest.Shipment.Consignment.ConsignmentValue
            }</ConsignmentValue>
            <Packages>
              ${getQuoteRequest.Shipment.Consignment.Packages.map(
                (pkg: any) => `
                <Package>
                  <Weight>${pkg.Weight}</Weight>
                  <Length>${pkg.Length}</Length>
                  <Width>${pkg.Width}</Width>
                  <Height>${pkg.Height}</Height>
                  <CommodityDetails>
                    ${pkg.CommodityDetails.CommodityLine.map(
                      (line: any) => `
                      <CommodityLine>
                        <CommodityCode>${escapeXml(
                          line.CommodityCode
                        )}</CommodityCode>
                        <CommodityDescription>${escapeXml(
                          line.CommodityDescription
                        )}</CommodityDescription>
                        <CountryOfOrigin>
                          <CountryCode>${escapeXml(
                            line.CountryOfOrigin.CountryCode
                          )}</CountryCode>
                        </CountryOfOrigin>
                        <NumberOfUnits>${line.NumberOfUnits}</NumberOfUnits>
                        <UnitValue>${line.UnitValue}</UnitValue>
                        <UnitWeight>${line.UnitWeight}</UnitWeight>
                      </CommodityLine>
                    `
                    ).join("")}
                  </CommodityDetails>
                </Package>
              `
              ).join("")}
            </Packages>
          </Consignment>
          <CollectionAddress>
            <Forename>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.Forename
            )}</Forename>
            <Surname>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.Surname
            )}</Surname>
            <EmailAddress>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.EmailAddress
            )}</EmailAddress>
            <TelephoneNumber>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.TelephoneNumber
            )}</TelephoneNumber>
            <CompanyName>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.CompanyName
            )}</CompanyName>
            <AddressLineOne>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.AddressLineOne
            )}</AddressLineOne>
            <AddressLineTwo>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.AddressLineTwo
            )}</AddressLineTwo>
            <City>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.City
            )}</City>
            <County>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.County
            )}</County>
            <Postcode>${escapeXml(
              getQuoteRequest.Shipment.CollectionAddress.Postcode
            )}</Postcode>
            <Country>
              <CountryCode>${escapeXml(
                getQuoteRequest.Shipment.CollectionAddress.Country.CountryCode
              )}</CountryCode>
            </Country>
          </CollectionAddress>
          <DeliveryAddress>
            <Forename>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.Forename
            )}</Forename>
            <Surname>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.Surname
            )}</Surname>
            <EmailAddress>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.EmailAddress
            )}</EmailAddress>
            <TelephoneNumber>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.TelephoneNumber
            )}</TelephoneNumber>
            <CompanyName>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.CompanyName
            )}</CompanyName>
            <AddressLineOne>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.AddressLineOne
            )}</AddressLineOne>
            <AddressLineTwo>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.AddressLineTwo
            )}</AddressLineTwo>
            <City>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.City
            )}</City>
            <County>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.County
            )}</County>
            <Postcode>${escapeXml(
              getQuoteRequest.Shipment.DeliveryAddress.Postcode
            )}</Postcode>
            <Country>
              <CountryCode>${escapeXml(
                getQuoteRequest.Shipment.DeliveryAddress.Country.CountryCode
              )}</CountryCode>
            </Country>
          </DeliveryAddress>
        </Shipment>
      </GetQuoteRequest>
    `.trim();

    // Determine the endpoint URL based on credentials
    const isTestCredentials =
      getQuoteRequest.Credentials.APIKey ===
        (process.env.TRANSGLOBAL_API_KEY_TEST || "5heQZ7Xrz3") &&
      getQuoteRequest.Credentials.Password ===
        (process.env.TRANSGLOBAL_API_PASSWORD_TEST || "bzHiFd?4Z2");

    const endpointUrl = isTestCredentials
      ? "https://staging2.services3.transglobalexpress.co.uk/Quote/V2/GetQuote"
      : "https://services3.transglobalexpress.co.uk/Quote/V2/GetQuote";

    // Log the XML request body for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("GetQuote XML Request:", xmlBody);
      console.log("Using endpoint:", endpointUrl);
    }

    // Make the API request to Transglobal Express GetQuote endpoint
    const apiResponse = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        Accept: "application/xml",
      },
      body: xmlBody,
    });

    const responseText = await apiResponse.text();

    // Log the full API response to the console
    if (process.env.NODE_ENV === "development") {
      console.log("GetQuote API Response:", responseText);
    }

    return NextResponse.json(
      { message: "Quote retrieved successfully", response: responseText },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error retrieving quote:", error);
    return NextResponse.json(
      { message: "Failed to retrieve quote", error: error.message },
      { status: 500 }
    );
  }
}
