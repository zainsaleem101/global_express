import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

export interface Listing {
  listingId: string;
  listingType: string;
  name: string;
  title: string;
  averageRating: string;
  discountedPrice: string | null;
  originalPrice: string | null;
  totalPrice: string;
  url: string;
  pictureUrl: string;
  website: string;
}

interface SearchResult {
  title: string;
  listing: Listing;
}

interface PropertyResultsProps {
  searchResults: SearchResult[];
}

export function PropertyResults({ searchResults }: PropertyResultsProps) {
  const airbnbListings = searchResults.filter(
    (result) => result.listing.website?.toLowerCase() === "airbnb"
  );

  return (
    <div className="mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Airbnb Listings</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {airbnbListings.map((result, index) => (
            <Card
              key={`${result.listing.listingId}-${index}`}
              className="overflow-hidden"
            >
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white px-4 py-2 z-10">
                  {index === 0 && "Cheapest Listing"}
                  {index === 1 && "Highest Rated"}
                  {index === 2 && "Recommended"}
                </div>

                <div className="aspect-video relative">
                  <Image
                    src={result.listing.pictureUrl}
                    alt={result.listing.name}
                    className="object-cover w-full h-full rounded-t-lg"
                    layout="fill"
                  />
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {result.listing.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {result.listing.title}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">
                    Rating: {result.listing.averageRating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {result.listing.totalPrice}
                    </span>
                    {result.listing.discountedPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {result.listing.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.listing.url, "_blank")}
                    className="flex items-center gap-2"
                  >
                    View Details
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
