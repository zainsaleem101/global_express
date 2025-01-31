"use client";

import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Search, CalendarDays, Users, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import Image from "next/image";

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

export interface SearchFilters {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  propertyType: string[];
  bedrooms: number;
  bathrooms: number;
  hasPool: boolean;
}

interface Listing {
  "Listing ID": string | number;
  "Listing Type": string | null;
  Name: string;
  Title: string;
  "Average Rating": string;
  "Discounted Price": string;
  "Original Price": string;
  "Total Price": string;
  Picture: string;
  Website: string;
  Price: number;
  "Listing URL"?: string;
}

interface SearchResult {
  airbnb?: {
    cheapest: Listing;
  };
  booking?: {
    cheapest: Listing;
  };
}

const propertyTypeMapping = {
  Casa: "house",
  Apartamento: "apartment",
  "Casa de huéspedes": "guesthouse",
  Hotel: "hotel",
};

const generateWhatsAppLink = (listing: Listing, filters: SearchFilters) => {
  const totalGuests = filters.guests.adults + filters.guests.children;
  const checkInDate = filters.checkIn
    ? format(filters.checkIn, "MM/dd/yyyy")
    : "";
  const checkOutDate = filters.checkOut
    ? format(filters.checkOut, "MM/dd/yyyy")
    : "";

  const message =
    `Hola%2C%20acepto%20la%20oferta%3A%0A` +
    `-%20Precio%20Total%3A%20${listing["Total Price"]}.%0A` +
    `-%20Ubicación%3A%20${filters.destination}.%0A` +
    `-%20Fechas%3A%20del%20${checkInDate}%20al%20${checkOutDate}.%0A` +
    `-%20Tipo%20de%20propiedad%3A%20${
      listing["Listing Type"] || "No especificado"
    }.%0A` +
    `-%20Piscina%3A%20${filters.hasPool ? "Sí" : "No"}.%0A` +
    `-%20Número%20de%20habitaciones%3A%20${filters.bedrooms}.%0A` +
    `-%20Huéspedes%20totales%3A%20${totalGuests}.%20(Adultos%20%3D%20${filters.guests.adults}%2C%20Niños%20%3D%20${filters.guests.children})%0A` +
    `-%20Mascotas%20%3D%20${filters.guests.pets}%0A` +
    `-%20Enlace%20de%20la%20propiedad%20%3D%20${encodeURIComponent(
      listing["Listing URL"] || ""
    )}`;

  return `https://api.whatsapp.com/send?phone=34910916791&text=${message}`;
};

export function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    destination: "",
    checkIn: undefined,
    checkOut: undefined,
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
    },
    propertyType: [],
    bedrooms: 1,
    bathrooms: 1,
    hasPool: false,
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateSelection, setDateSelection] = useState<"start" | "end">("start");

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (
      filters.checkIn &&
      filters.checkOut &&
      isAfter(filters.checkIn, filters.checkOut)
    ) {
      setFilters((prev) => ({ ...prev, checkOut: undefined }));
    }
  }, [filters.checkIn, filters.checkOut]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (dateSelection === "start" || !filters.checkIn) {
      setFilters((prev) => ({ ...prev, checkIn: date, checkOut: undefined }));
      setDateSelection("end");
    } else {
      if (isBefore(date, filters.checkIn)) {
        setFilters((prev) => ({
          ...prev,
          checkIn: date,
          checkOut: prev.checkIn,
        }));
      } else {
        setFilters((prev) => ({ ...prev, checkOut: date }));
        setCalendarOpen(false);
      }
      setDateSelection("start");
    }
  };

  const handleQuickSelect = (days: number) => {
    const today = new Date();
    setFilters((prev) => ({
      ...prev,
      checkIn: today,
      checkOut: addDays(today, days),
    }));
    setCalendarOpen(false);
    setDateSelection("start");
  };

  const handleSearch = async () => {
    try {
      onSearch(filters);

      const translatedPropertyTypes = filters.propertyType.map(
        (type) =>
          propertyTypeMapping[type as keyof typeof propertyTypeMapping] || type
      );

      const payload = {
        ...filters,
        propertyType: translatedPropertyTypes,
        bathrooms: filters.bathrooms,
        checkIn: filters.checkIn
          ? {
              full: format(filters.checkIn, "yyyy-MM-dd"),
              month: filters.checkIn.getMonth() + 1,
              day: filters.checkIn.getDate(),
              year: filters.checkIn.getFullYear(),
            }
          : null,
        checkOut: filters.checkOut
          ? {
              full: format(filters.checkOut, "yyyy-MM-dd"),
              month: filters.checkOut.getMonth() + 1,
              day: filters.checkOut.getDate(),
              year: filters.checkOut.getFullYear(),
            }
          : null,
      };

      const response = await fetch("/api/search-filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send filter data");
      }

      const data = await response.json();
      console.log(data);

      const results: SearchResult = {
        airbnb: data.results?.airbnb,
        booking: data.results?.booking,
      };

      setSearchResults([results]);
      onSearch(filters);
    } catch (error) {
      console.error("Error sending filter data:", error);
      onSearch(filters);
    }
  };

  const propertyTypes = ["Casa", "Apartamento", "Casa de huéspedes", "Hotel"];

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="destination" className="text-sm font-medium">
                  Destino
                </label>
                <Input
                  id="destination"
                  placeholder="¿A dónde vas?"
                  value={filters.destination}
                  onChange={(e) =>
                    setFilters({ ...filters, destination: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label id="date-range-label" className="text-sm font-medium">
                  Fechas
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10"
                      aria-labelledby="date-range-label"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {filters.checkIn ? (
                        <>
                          {format(filters.checkIn, "MMM dd")}
                          {filters.checkOut
                            ? ` - ${format(filters.checkOut, "MMM dd")}`
                            : " - Seleccionar fecha"}
                        </>
                      ) : (
                        "Seleccionar fechas"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-gray-50 border shadow-md"
                    align="start"
                  >
                    <div className="p-4">
                      <Tabs defaultValue="dates">
                        <TabsList className="mb-4">
                          <TabsTrigger value="dates">Fechas</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <div className="flex gap-4">
                        <Calendar
                          mode="single"
                          selected={filters.checkIn}
                          onSelect={handleDateSelect}
                          numberOfMonths={2}
                          defaultMonth={filters.checkIn || new Date()}
                          fromDate={new Date()}
                          modifiers={{
                            selected: [
                              filters.checkIn,
                              filters.checkOut,
                            ].filter(Boolean) as Date[],
                            range:
                              filters.checkIn && filters.checkOut
                                ? {
                                    from: filters.checkIn,
                                    to: filters.checkOut,
                                  }
                                : undefined,
                          }}
                          modifiersStyles={{
                            selected: {
                              backgroundColor: "black",
                              color: "white",
                              fontWeight: "bold",
                            },
                            range: {
                              backgroundColor: "rgb(229 231 235)",
                              borderRadius: "0",
                            },
                          }}
                          className="bg-white"
                        />
                      </div>
                      <div className="mt-4 flex gap-2 overflow-x-auto py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSelect(1)}
                        >
                          ± 1 día
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSelect(2)}
                        >
                          ± 2 días
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSelect(3)}
                        >
                          ± 3 días
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSelect(7)}
                        >
                          ± 7 días
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSelect(14)}
                        >
                          ± 14 días
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label id="guests-label" className="text-sm font-medium">
                  Huéspedes
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10"
                      aria-labelledby="guests-label"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {filters.guests.adults + filters.guests.children}{" "}
                      huéspedes
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-gray-50 border shadow-md">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Adultos</div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                guests: {
                                  ...filters.guests,
                                  adults: Math.max(
                                    1,
                                    filters.guests.adults - 1
                                  ),
                                },
                              })
                            }
                          >
                            -
                          </Button>
                          <span>{filters.guests.adults}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                guests: {
                                  ...filters.guests,
                                  adults: filters.guests.adults + 1,
                                },
                              })
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Niños</div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                guests: {
                                  ...filters.guests,
                                  children: Math.max(
                                    0,
                                    filters.guests.children - 1
                                  ),
                                },
                              })
                            }
                          >
                            -
                          </Button>
                          <span>{filters.guests.children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                guests: {
                                  ...filters.guests,
                                  children: filters.guests.children + 1,
                                },
                              })
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Mascotas</div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                guests: {
                                  ...filters.guests,
                                  pets: Math.max(0, filters.guests.pets - 1),
                                },
                              })
                            }
                          >
                            -
                          </Button>
                          <span>{filters.guests.pets}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                guests: {
                                  ...filters.guests,
                                  pets: filters.guests.pets + 1,
                                },
                              })
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="property-type" className="text-sm font-medium">
                  Tipo de Propiedad
                </label>
                <Select
                  value={filters.propertyType.join(",")}
                  onValueChange={(value) =>
                    setFilters({ ...filters, propertyType: value.split(",") })
                  }
                >
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Seleccionar tipo de propiedad" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50 border shadow-md">
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="bedrooms" className="text-sm font-medium">
                  Habitaciones
                </label>
                <Select
                  value={filters.bedrooms.toString()}
                  onValueChange={(value) =>
                    setFilters({ ...filters, bedrooms: Number.parseInt(value) })
                  }
                >
                  <SelectTrigger id="bedrooms">
                    <SelectValue placeholder="Seleccionar número de habitaciones" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50 border shadow-md">
                    <SelectItem value="0">Cualquiera</SelectItem>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="bathrooms" className="text-sm font-medium">
                  Baños
                </label>
                <Select
                  value={filters.bathrooms.toString()}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      bathrooms: Number.parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="bathrooms">
                    <SelectValue placeholder="Seleccionar número de baños" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50 border shadow-md">
                    <SelectItem value="0">Cualquiera</SelectItem>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-8 flex items-center">
                <Checkbox
                  id="pool"
                  checked={filters.hasPool}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, hasPool: checked as boolean })
                  }
                />
                <label
                  htmlFor="pool"
                  className="text-sm font-medium ml-2 cursor-pointer"
                >
                  Piscina
                </label>
              </div>
            </div>

            <Button
              className="w-full md:w-auto bg-gray-800 text-white"
              size="lg"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Propiedades
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Loading content */}
          <div className="relative z-50 bg-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-gray-800" />
            <p className="text-lg font-medium text-gray-800">
              Espere mientras encontramos la mejor propiedad para usted...
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {!isLoading && searchResults.length > 0 ? (
        <div className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 max-w-[1000px] mx-auto">
            {/* Airbnb Listing */}
            {searchResults[0].airbnb && searchResults[0].airbnb.cheapest ? (
              <div className="max-w-[600px] justify-self-center w-full">
                <h2 className="text-2xl font-bold mb-4">Listado de Airbnb</h2>
                <Card className="overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white px-4 py-2 z-10">
                      Mejor Oferta de Airbnb
                    </div>
                    <div className="aspect-video relative">
                      {searchResults[0].airbnb.cheapest["Picture"] ? (
                        <Image
                          src={searchResults[0].airbnb.cheapest["Picture"]}
                          alt={
                            searchResults[0].airbnb.cheapest["Name"] ||
                            "Imagen no disponible"
                          }
                          className="object-cover w-full h-full"
                          layout="fill"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span>Imagen no disponible</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {searchResults[0].airbnb.cheapest["Name"] && (
                      <h3 className="font-semibold text-lg mb-2">
                        {searchResults[0].airbnb.cheapest["Name"]}
                      </h3>
                    )}
                    {searchResults[0].airbnb.cheapest["Title"] && (
                      <p className="text-sm text-gray-600 mb-2">
                        {searchResults[0].airbnb.cheapest["Title"]}
                      </p>
                    )}
                    {searchResults[0].airbnb.cheapest["Average Rating"] && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">
                          Calificación:{" "}
                          {searchResults[0].airbnb.cheapest["Average Rating"]}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 mb-2">
                      {searchResults[0].airbnb.cheapest["Discounted Price"] && (
                        <span className="text-green-600 font-medium">
                          Descuento:{" "}
                          {searchResults[0].airbnb.cheapest["Discounted Price"]}
                        </span>
                      )}
                      {searchResults[0].airbnb.cheapest["Original Price"] && (
                        <span className="text-gray-500 line-through">
                          Original:{" "}
                          {searchResults[0].airbnb.cheapest["Original Price"]}
                        </span>
                      )}
                      {searchResults[0].airbnb.cheapest["Total Price"] && (
                        <span className="font-bold text-lg">
                          Total:{" "}
                          {searchResults[0].airbnb.cheapest["Total Price"]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 space-x-2">
                      <div className="flex space-x-2">
                        {searchResults[0].airbnb.cheapest["Listing URL"] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                searchResults[0].airbnb.cheapest["Listing URL"],
                                "_blank"
                              )
                            }
                          >
                            Ver en Airbnb
                          </Button>
                        )}
                        {searchResults[0].airbnb.cheapest["Picture"] && (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2 bg-green-500 text-white border border-green-600 hover:bg-green-600"
                            onClick={() =>
                              window.open(
                                generateWhatsAppLink(
                                  searchResults[0].airbnb.cheapest,
                                  filters
                                ),
                                "_blank"
                              )
                            }
                          >
                            <Image
                              src="/whatsapp-icon.svg"
                              alt="WhatsApp"
                              className="h-4 w-4"
                              width={16}
                              height={16}
                            />
                            Confirmar Reserva
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="max-w-[600px] justify-self-center w-full">
                <h2 className="text-2xl font-bold mb-4">Listado de Airbnb</h2>
                <p>
                  No se encontraron propiedades en Airbnb, intenta cambiar los
                  filtros o vuelve a intentarlo, gracias.
                </p>
              </div>
            )}

            {/* Booking.com Listing */}
            {searchResults[0].booking ? (
              <div className="max-w-[600px] justify-self-center w-full">
                <h2 className="text-2xl font-bold mb-4">
                  Listado de Booking.com
                </h2>
                <Card className="overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white px-4 py-2 z-10">
                      Mejor Oferta de Booking.com
                    </div>
                    <div className="aspect-video relative">
                      {searchResults[0].booking.cheapest["Picture"] ? (
                        <Image
                          src={searchResults[0].booking.cheapest["Picture"]}
                          alt={
                            searchResults[0].booking.cheapest["Name"] ||
                            "Imagen no disponible"
                          }
                          className="object-cover w-full h-full"
                          layout="fill"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span>Imagen no disponible</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {searchResults[0].booking.cheapest["Name"] && (
                      <h3 className="font-semibold text-lg mb-2">
                        {searchResults[0].booking.cheapest["Name"]}
                      </h3>
                    )}
                    {searchResults[0].booking.cheapest["Title"] && (
                      <p className="text-sm text-gray-600 mb-2">
                        {searchResults[0].booking.cheapest["Title"]}
                      </p>
                    )}
                    {searchResults[0].booking.cheapest["Average Rating"] && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">
                          Calificación:{" "}
                          {searchResults[0].booking.cheapest["Average Rating"]}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 mb-2">
                      {searchResults[0].booking.cheapest[
                        "Discounted Price"
                      ] && (
                        <span className="text-green-600 font-medium">
                          Descuento:{" "}
                          {
                            searchResults[0].booking.cheapest[
                              "Discounted Price"
                            ]
                          }
                        </span>
                      )}
                      {searchResults[0].booking.cheapest["Original Price"] && (
                        <span className="text-gray-500 line-through">
                          Original:{" "}
                          {searchResults[0].booking.cheapest["Original Price"]}
                        </span>
                      )}
                      {searchResults[0].booking.cheapest["Total Price"] && (
                        <span className="font-bold text-lg">
                          Total:{" "}
                          {searchResults[0].booking.cheapest["Total Price"]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 space-x-2">
                      <div className="flex space-x-2">
                        {searchResults[0].booking.cheapest["Listing URL"] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                searchResults[0].booking.cheapest[
                                  "Listing URL"
                                ],
                                "_blank"
                              )
                            }
                          >
                            Ver en Booking.com
                          </Button>
                        )}
                        {searchResults[0].booking.cheapest["Picture"] && (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2 bg-green-500 text-white border border-green-600 hover:bg-green-600"
                            onClick={() =>
                              window.open(
                                generateWhatsAppLink(
                                  searchResults[0].booking.cheapest,
                                  filters
                                ),
                                "_blank"
                              )
                            }
                          >
                            <Image
                              src="/whatsapp-icon.svg"
                              alt="WhatsApp"
                              className="h-4 w-4"
                              width={16}
                              height={16}
                            />
                            Confirmar Reserva
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="max-w-[600px] justify-self-center w-full">
                <h2 className="text-2xl font-bold mb-4">
                  Listado de Booking.com
                </h2>
                <p>
                  No se encontraron propiedades en Booking.com, intenta cambiar
                  los filtros o vuelve a intentarlo, gracias.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <p>
            No se encontraron propiedades, intente cambiar los filtros o vuelva
            a intentarlo, gracias.
          </p>
        </div>
      )}
    </>
  );
}
