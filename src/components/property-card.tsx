import { Card, CardContent } from "../components/ui/card";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "../components/ui/button";

interface PropertyCardProps {
  title: string;
  location: string;
  price: number;
  rating: number;
  imageUrl: string;
}

export function PropertyCard({
  title,
  location,
  price,
  rating,
  imageUrl,
}: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <div className="flex items-center gap-1">
            <span>★</span>
            <span>{rating.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-4">
          <span className="font-semibold">${price}</span>
          <span className="text-muted-foreground"> night</span>
        </p>
      </CardContent>
    </Card>
  );
}
