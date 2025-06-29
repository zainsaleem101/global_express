import type { Address, PackageItem } from "../../src/lib/types/shipping";
import { useShippingStore, formatWeight } from "../lib/store/useShippingStore";

interface SummaryPageProps {
  collectionAddress: Address;
  deliveryAddress: Address;
  packageItems: PackageItem[];
  reasonForShipment: string;
  collectionDate: string;
  readyFrom: string;
  selectedService: any;
  onBack: () => void;
  onProceed: () => void;
}

export default function SummaryPage({
  collectionAddress,
  deliveryAddress,
  packageItems,
  reasonForShipment,
  collectionDate,
  readyFrom,
  selectedService,
  onBack,
  onProceed,
}: SummaryPageProps) {
  const { measurementUnit } = useShippingStore();

  const handleBookShipment = async () => {
    const payload = {
      collectionAddress,
      deliveryAddress,
      packageItems,
      reasonForShipment,
      collectionDate,
      readyFrom,
      selectedService,
    };

    try {
      const response = await fetch("/api/transglobal/book-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Shipment booked successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to book shipment: ${error.message}`);
      }
    } catch (error) {
      alert(`Error booking shipment: ${error.message}`);
    }
  };

  // Extract price breakdown for price, surcharge, and VAT
  const priceBreakdown = selectedService.ServicePriceBreakdown || [];
  const price =
    priceBreakdown.find((item: any) =>
      item.Description.toLowerCase().includes("price")
    )?.Cost || 0;
  const surcharge =
    priceBreakdown.find((item: any) =>
      item.Description.toLowerCase().includes("surcharge")
    )?.Cost || 0;
  const vat =
    priceBreakdown.find((item: any) =>
      item.Description.toLowerCase().includes("vat")
    )?.Cost || 0;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Booking Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700">
              Collection Address
            </h3>
            <p>
              {collectionAddress.forename} {collectionAddress.surname}
            </p>
            {collectionAddress.companyName && (
              <p>{collectionAddress.companyName}</p>
            )}
            <p>{collectionAddress.addressLine1}</p>
            {collectionAddress.addressLine2 && (
              <p>{collectionAddress.addressLine2}</p>
            )}
            <p>
              {collectionAddress.city}, {collectionAddress.countryState}{" "}
              {collectionAddress.postcode}
            </p>
            <p>{collectionAddress.country}</p>
            <p>Email: {collectionAddress.email}</p>
            <p>Phone: {collectionAddress.phone}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700">
              Delivery Address
            </h3>
            <p>
              {deliveryAddress.forename} {deliveryAddress.surname}
            </p>
            {deliveryAddress.companyName && (
              <p>{deliveryAddress.companyName}</p>
            )}
            <p>{deliveryAddress.addressLine1}</p>
            {deliveryAddress.addressLine2 && (
              <p>{deliveryAddress.addressLine2}</p>
            )}
            <p>
              {deliveryAddress.city}, {deliveryAddress.countryState}{" "}
              {deliveryAddress.postcode}
            </p>
            <p>{deliveryAddress.country}</p>
            <p>Email: {deliveryAddress.email}</p>
            <p>Phone: {deliveryAddress.phone}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">
          Collection Details
        </h3>
        <p>
          <strong>Collection Date:</strong> {collectionDate}
        </p>
        <p>
          <strong>Ready From:</strong> {readyFrom}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Package Details</h3>
        <p>
          <strong>Reason for Shipment:</strong> {reasonForShipment}
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Commodity Code</th>
              <th className="p-2 text-left">Country of Origin</th>
              <th className="p-2 text-left">Quantity</th>
              <th className="p-2 text-left">Value ($)</th>
              <th className="p-2 text-left">Weight (kg)</th>
              <th className="p-2 text-left">Length (cm)</th>
              <th className="p-2 text-left">Width (cm)</th>
              <th className="p-2 text-left">Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            {packageItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{item.description}</td>
                <td className="p-2">{item.commodityCode}</td>
                <td className="p-2">{item.countryOfOrigin}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{item.valuePerItem}</td>
                <td className="p-2">{item.weightPerItem}</td>
                <td className="p-2">{item.length}</td>
                <td className="p-2">{item.width}</td>
                <td className="p-2">{item.height}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Total Goods Value:</strong> $
          {packageItems
            .reduce((sum, item) => sum + item.valuePerItem * item.quantity, 0)
            .toFixed(2)}
        </p>
        <p>
          <strong>Total Weight:</strong>{" "}
          {packageItems
            .reduce((sum, item) => sum + item.weightPerItem * item.quantity, 0)
            .toFixed(2)}
          kg
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Service Details</h3>
        <p>
          <strong>Carrier:</strong> {selectedService.CarrierName || "N/A"}
        </p>
        <p>
          <strong>Service:</strong> {selectedService.ServiceName || "N/A"}
        </p>
        <p>
          <strong>Chargeable Weight:</strong>{" "}
          {selectedService.ChargeableWeight
            ? formatWeight(selectedService.ChargeableWeight, measurementUnit)
            : "N/A"}
        </p>
        <p>
          <strong>Price:</strong> ${price.toFixed(2)}
        </p>
        <p>
          <strong>Surcharge:</strong> ${surcharge.toFixed(2)}
        </p>
        <p>
          <strong>VAT:</strong> ${vat.toFixed(2)}
        </p>
        <p>
          <strong>Total:</strong> $
          {(
            selectedService.TotalCost?.TotalCostGrossWithCollection || 0
          ).toFixed(2)}
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onProceed}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Proceed to Payment
        </button>
        <button
          type="button"
          onClick={handleBookShipment}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Book Shipment
        </button>
      </div>
    </div>
  );
}
