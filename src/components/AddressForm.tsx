import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { Button } from "../../src/components/ui/button";
import type { ICountry } from "../../src/lib/models/Country";
import type { Address } from "../../src/lib/types/shipping";
import { fetchCountries, useCountries } from "../../src/lib/utils/api";

interface AddressFormProps {
  onSubmit: (collection: Address, delivery: Address) => void;
  initialCollection?: Address | null;
  initialDelivery?: Address | null;
}

export default function AddressForm({
  onSubmit,
  initialCollection = null,
  initialDelivery = null,
}: AddressFormProps) {
  // Use props directly for form values instead of local state
  const [collection, setCollection] = useState<Partial<Address>>(
    initialCollection || {}
  );
  const [delivery, setDelivery] = useState<Partial<Address>>(
    initialDelivery || {}
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Use the custom hook to fetch and cache countries
  const { data: countries = [], isError, error } = useCountries();

  // Update form when initial values change - force complete replacement
  useEffect(() => {
    console.log("AddressForm: initialCollection changed", initialCollection);
    console.log("AddressForm: initialDelivery changed", initialDelivery);

    if (initialCollection) {
      setCollection(initialCollection);
    } else {
      setCollection({});
    }
    if (initialDelivery) {
      setDelivery(initialDelivery);
    } else {
      setDelivery({});
    }
  }, [initialCollection, initialDelivery]);

  // Debug: Log current form state
  useEffect(() => {
    console.log("AddressForm: Current collection state", collection);
    console.log("AddressForm: Current delivery state", delivery);
  }, [collection, delivery]);

  // Helper function to get CountryID from CountryCode
  const getCountryIdFromCode = (countryCode: string) => {
    if (!countryCode) return "";
    const country = countries.find((c) => c.CountryCode === countryCode);
    return country ? country.CountryID.toString() : "";
  };

  // Helper function to get CountryCode from CountryID
  const getCountryCodeFromId = (countryId: string) => {
    if (!countryId) return "";
    const country = countries.find((c) => c.CountryID.toString() === countryId);
    return country ? country.CountryCode : "";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!collection.forename)
      newErrors.collectionForename = "Forename is required";
    if (!collection.surname)
      newErrors.collectionSurname = "Surname is required";
    if (!collection.email) newErrors.collectionEmail = "Email is required";
    if (!collection.phone) newErrors.collectionPhone = "Phone is required";
    if (!collection.addressLine1)
      newErrors.collectionAddressLine1 = "Address Line 1 is required";
    if (!collection.city) newErrors.collectionCity = "City is required";
    if (!collection.countryState)
      newErrors.collectionCountryState = "State is required";
    if (!collection.postcode)
      newErrors.collectionPostcode = "Postcode is required";
    if (!collection.country)
      newErrors.collectionCountry = "Country is required";

    if (!delivery.forename) newErrors.deliveryForename = "Forename is required";
    if (!delivery.surname) newErrors.deliverySurname = "Surname is required";
    if (!delivery.email) newErrors.deliveryEmail = "Email is required";
    if (!delivery.phone) newErrors.deliveryPhone = "Phone is required";
    if (!delivery.addressLine1)
      newErrors.deliveryAddressLine1 = "Address Line 1 is required";
    if (!delivery.city) newErrors.deliveryCity = "City is required";
    if (!delivery.countryState)
      newErrors.deliveryCountryState = "State is required";
    if (!delivery.postcode) newErrors.deliveryPostcode = "Postcode is required";
    if (!delivery.country) newErrors.deliveryCountry = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(collection as Address, delivery as Address);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors";
  const errorClass = "text-red-500 text-sm mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Collection Address Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-sky-600"
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
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Collection Address
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forename *
            </label>
            <input
              type="text"
              className={inputClass}
              value={collection.forename || ""}
              onChange={(e) =>
                setCollection({ ...collection, forename: e.target.value })
              }
            />
            {errors.collectionForename && (
              <p className={errorClass}>{errors.collectionForename}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surname *
            </label>
            <input
              type="text"
              className={inputClass}
              value={collection.surname || ""}
              onChange={(e) =>
                setCollection({ ...collection, surname: e.target.value })
              }
            />
            {errors.collectionSurname && (
              <p className={errorClass}>{errors.collectionSurname}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              className={inputClass}
              value={collection.email || ""}
              onChange={(e) =>
                setCollection({ ...collection, email: e.target.value })
              }
            />
            {errors.collectionEmail && (
              <p className={errorClass}>{errors.collectionEmail}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              className={inputClass}
              value={collection.phone || ""}
              onChange={(e) =>
                setCollection({ ...collection, phone: e.target.value })
              }
            />
            {errors.collectionPhone && (
              <p className={errorClass}>{errors.collectionPhone}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              className={inputClass}
              value={collection.companyName || ""}
              onChange={(e) =>
                setCollection({ ...collection, companyName: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              className={inputClass}
              value={collection.addressLine1 || ""}
              onChange={(e) =>
                setCollection({ ...collection, addressLine1: e.target.value })
              }
            />
            {errors.collectionAddressLine1 && (
              <p className={errorClass}>{errors.collectionAddressLine1}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              className={inputClass}
              value={collection.addressLine2 || ""}
              onChange={(e) =>
                setCollection({ ...collection, addressLine2: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              className={inputClass}
              value={collection.city || ""}
              onChange={(e) =>
                setCollection({ ...collection, city: e.target.value })
              }
            />
            {errors.collectionCity && (
              <p className={errorClass}>{errors.collectionCity}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              className={inputClass}
              value={collection.countryState || ""}
              onChange={(e) =>
                setCollection({ ...collection, countryState: e.target.value })
              }
            />
            {errors.collectionCountryState && (
              <p className={errorClass}>{errors.collectionCountryState}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode *
            </label>
            <input
              type="text"
              className={`${inputClass} ${initialCollection?.postcode ? "bg-gray-100 cursor-not-allowed" : ""}`}
              value={collection.postcode || ""}
              onChange={(e) =>
                setCollection({ ...collection, postcode: e.target.value })
              }
              readOnly={!!initialCollection?.postcode}
            />
            {errors.collectionPostcode && (
              <p className={errorClass}>{errors.collectionPostcode}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <Select
              value={getCountryIdFromCode(collection.country || "")}
              onValueChange={(value) => {
                const selectedCountry = countries.find(
                  (country) => country.CountryID.toString() === value
                );
                setCollection({
                  ...collection,
                  country: selectedCountry?.CountryCode || "",
                });
              }}
              disabled={!!initialCollection?.country}
            >
              <SelectTrigger
                className={`${inputClass} ${initialCollection?.country ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
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
            {errors.collectionCountry && (
              <p className={errorClass}>{errors.collectionCountry}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Delivery Address
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forename *
            </label>
            <input
              type="text"
              className={inputClass}
              value={delivery.forename || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, forename: e.target.value })
              }
            />
            {errors.deliveryForename && (
              <p className={errorClass}>{errors.deliveryForename}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surname *
            </label>
            <input
              type="text"
              className={inputClass}
              value={delivery.surname || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, surname: e.target.value })
              }
            />
            {errors.deliverySurname && (
              <p className={errorClass}>{errors.deliverySurname}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              className={inputClass}
              value={delivery.email || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, email: e.target.value })
              }
            />
            {errors.deliveryEmail && (
              <p className={errorClass}>{errors.deliveryEmail}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              className={inputClass}
              value={delivery.phone || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, phone: e.target.value })
              }
            />
            {errors.deliveryPhone && (
              <p className={errorClass}>{errors.deliveryPhone}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              className={inputClass}
              value={delivery.companyName || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, companyName: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              className={inputClass}
              value={delivery.addressLine1 || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, addressLine1: e.target.value })
              }
            />
            {errors.deliveryAddressLine1 && (
              <p className={errorClass}>{errors.deliveryAddressLine1}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              className={inputClass}
              value={delivery.addressLine2 || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, addressLine2: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              className={inputClass}
              value={delivery.city || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, city: e.target.value })
              }
            />
            {errors.deliveryCity && (
              <p className={errorClass}>{errors.deliveryCity}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              className={inputClass}
              value={delivery.countryState || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, countryState: e.target.value })
              }
            />
            {errors.deliveryCountryState && (
              <p className={errorClass}>{errors.deliveryCountryState}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode *
            </label>
            <input
              type="text"
              className={`${inputClass} ${initialDelivery?.postcode ? "bg-gray-100 cursor-not-allowed" : ""}`}
              value={delivery.postcode || ""}
              onChange={(e) =>
                setDelivery({ ...delivery, postcode: e.target.value })
              }
              readOnly={!!initialDelivery?.postcode}
            />
            {errors.deliveryPostcode && (
              <p className={errorClass}>{errors.deliveryPostcode}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <Select
              value={getCountryIdFromCode(delivery.country || "")}
              onValueChange={(value) => {
                const selectedCountry = countries.find(
                  (country) => country.CountryID.toString() === value
                );
                setDelivery({
                  ...delivery,
                  country: selectedCountry?.CountryCode || "",
                });
              }}
              disabled={!!initialDelivery?.country}
            >
              <SelectTrigger
                className={`${inputClass} ${initialDelivery?.country ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
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
            {errors.deliveryCountry && (
              <p className={errorClass}>{errors.deliveryCountry}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700 px-8">
          Continue to Package Details
        </Button>
      </div>
    </form>
  );
}
