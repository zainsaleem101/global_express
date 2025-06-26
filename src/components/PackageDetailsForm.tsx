import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import type { ICountry } from "../../src/lib/models/Country";
import type { PackageItem } from "../../src/lib/types/shipping";

interface PackageDetailsFormProps {
  onSubmit: (
    items: PackageItem[],
    reason: string,
    collectionDate: string,
    readyFrom: string
  ) => void;
  onBack: () => void;
  initialItems?: PackageItem[];
  initialReason?: string;
  initialCollectionDate?: string;
  initialReadyFrom?: string;
}

const fetchCountries = async (): Promise<ICountry[]> => {
  const response = await fetch("/api/countries");
  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }
  return response.json();
};

export default function PackageDetailsForm({
  onSubmit,
  onBack,
  initialItems = [],
  initialReason = "",
  initialCollectionDate = "",
  initialReadyFrom = "",
}: PackageDetailsFormProps) {
  const [items, setItems] = useState<PackageItem[]>(initialItems);
  const [newItem, setNewItem] = useState<Partial<PackageItem>>({
    quantity: 1,
    valuePerItem: 0,
    weightPerItem: 0,
    length: 0,
    width: 0,
    height: 0,
  });
  const [reason, setReason] = useState<string>(initialReason);
  const [collectionDate, setCollectionDate] = useState<string>(
    initialCollectionDate
  );
  const [readyFrom, setReadyFrom] = useState<string>(initialReadyFrom);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const {
    data: countries = [],
    isError,
    error,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 3,
  });

  // Update form when initial values change
  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
    if (initialReason) {
      setReason(initialReason);
    }
    if (initialCollectionDate) {
      setCollectionDate(initialCollectionDate);
    }
    if (initialReadyFrom) {
      setReadyFrom(initialReadyFrom);
    }
  }, [initialItems, initialReason, initialCollectionDate, initialReadyFrom]);

  // Helper function to get CountryID from CountryCode
  const getCountryIdFromCode = (countryCode: string) => {
    const country = countries.find((c) => c.CountryCode === countryCode);
    return country ? country.CountryID.toString() : "";
  };

  const validateItem = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newItem.description) newErrors.description = "Description is required";
    if (!newItem.commodityCode)
      newErrors.commodityCode = "Commodity Code is required";
    if (!newItem.countryOfOrigin)
      newErrors.countryOfOrigin = "Country of Origin is required";
    if (!newItem.quantity || newItem.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (!newItem.valuePerItem || newItem.valuePerItem <= 0)
      newErrors.valuePerItem = "Value must be greater than 0";
    if (!newItem.weightPerItem || newItem.weightPerItem <= 0)
      newErrors.weightPerItem = "Weight must be greater than 0";
    if (!newItem.length || newItem.length <= 0)
      newErrors.length = "Length must be greater than 0";
    if (!newItem.width || newItem.width <= 0)
      newErrors.width = "Width must be greater than 0";
    if (!newItem.height || newItem.height <= 0)
      newErrors.height = "Height must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!reason) newErrors.reason = "Reason for shipment is required";
    if (!collectionDate)
      newErrors.collectionDate = "Collection date is required";
    if (!readyFrom) newErrors.readyFrom = "Ready from time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (validateItem()) {
      const updatedItems = [...items, newItem as PackageItem];
      setItems(updatedItems);
      setNewItem({
        quantity: 1,
        valuePerItem: 0,
        weightPerItem: 0,
        length: 0,
        width: 0,
        height: 0,
      });
      setErrors({});
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.weightMatch;
      return newErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(items, reason, collectionDate, readyFrom);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors";
  const errorClass = "text-red-500 text-sm mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shipment Details Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Shipment Details
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Shipment *
          </label>
          <select
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">Please specify</option>
            <option value="GIFT">Gift</option>
            <option value="INTERCOMPANY_DATA">Intercompany Data</option>
            <option value="SALES">Sales</option>
            <option value="SAMPLE">Sample</option>
            <option value="REPAIR">Repair</option>
            <option value="RETURN">Return</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.reason && <p className={errorClass}>{errors.reason}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Date *
            </label>
            <input
              type="date"
              className={inputClass}
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
            />
            {errors.collectionDate && (
              <p className={errorClass}>{errors.collectionDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ready From Time *
            </label>
            <input
              type="time"
              className={inputClass}
              value={readyFrom}
              onChange={(e) => setReadyFrom(e.target.value)}
            />
            {errors.readyFrom && (
              <p className={errorClass}>{errors.readyFrom}</p>
            )}
          </div>
        </div>
      </div>

      {/* Package Items Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-600"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Package Items
            </h3>
          </div>
          {items.length > 0 && (
            <Badge variant="secondary">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Add New Item Form */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h4 className="font-medium text-gray-900">Add New Item</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                className={inputClass}
                value={newItem.description || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
              {errors.description && (
                <p className={errorClass}>{errors.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commodity Code *
              </label>
              <input
                type="text"
                className={inputClass}
                value={newItem.commodityCode || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, commodityCode: e.target.value })
                }
              />
              {errors.commodityCode && (
                <p className={errorClass}>{errors.commodityCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Origin *
              </label>
              <Select
                value={getCountryIdFromCode(newItem.countryOfOrigin || "")}
                onValueChange={(value) => {
                  const selectedCountry = countries.find(
                    (country) => country.CountryID.toString() === value
                  );
                  setNewItem({
                    ...newItem,
                    countryOfOrigin: selectedCountry?.CountryCode || "",
                  });
                }}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem
                      key={country.CountryID}
                      value={country.CountryID.toString()}
                    >
                      {country.Title} ({country.CountryCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.countryOfOrigin && (
                <p className={errorClass}>{errors.countryOfOrigin}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={newItem.quantity || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: parseInt(e.target.value) })
                }
              />
              {errors.quantity && (
                <p className={errorClass}>{errors.quantity}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value per Item (£) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={newItem.valuePerItem || ""}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    valuePerItem: parseFloat(e.target.value),
                  })
                }
              />
              {errors.valuePerItem && (
                <p className={errorClass}>{errors.valuePerItem}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight per Item (kg) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={newItem.weightPerItem || ""}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    weightPerItem: parseFloat(e.target.value),
                  })
                }
              />
              {errors.weightPerItem && (
                <p className={errorClass}>{errors.weightPerItem}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Value: £
                {(
                  (newItem.quantity || 0) * (newItem.valuePerItem || 0)
                ).toFixed(2)}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Weight:{" "}
                {(
                  (newItem.quantity || 0) * (newItem.weightPerItem || 0)
                ).toFixed(2)}{" "}
                kg
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (cm) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className={inputClass}
                value={newItem.length || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, length: parseFloat(e.target.value) })
                }
              />
              {errors.length && <p className={errorClass}>{errors.length}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className={inputClass}
                value={newItem.width || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, width: parseFloat(e.target.value) })
                }
              />
              {errors.width && <p className={errorClass}>{errors.width}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className={inputClass}
                value={newItem.height || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, height: parseFloat(e.target.value) })
                }
              />
              {errors.height && <p className={errorClass}>{errors.height}</p>}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAddItem}
              className="bg-sky-600 hover:bg-sky-700"
            >
              Add Item
            </Button>
          </div>
        </div>

        {/* Existing Items List */}
        {items.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Added Items</h4>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">
                        {item.description}
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Qty:</span>{" "}
                          {item.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Value:</span> £
                          {(item.quantity * item.valuePerItem).toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Weight:</span>{" "}
                          {(item.quantity * item.weightPerItem).toFixed(2)} kg
                        </div>
                        <div>
                          <span className="font-medium">Dimensions:</span>{" "}
                          {item.length}×{item.width}×{item.height} cm
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Address Details
        </Button>
        <Button
          type="submit"
          className="bg-sky-600 hover:bg-sky-700 px-8"
          disabled={items.length === 0}
        >
          Get Quotes
        </Button>
      </div>
    </form>
  );
}
