import { Button } from "../components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export function GuestSelector() {
  const [guests, setGuests] = useState<GuestCount>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const updateGuests = (type: keyof GuestCount, increment: boolean) => {
    setGuests((prev) => ({
      ...prev,
      [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Adults</div>
          <div className="text-sm text-muted-foreground">Ages 13 or above</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("adults", false)}
            disabled={guests.adults === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{guests.adults}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("adults", true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Children</div>
          <div className="text-sm text-muted-foreground">Ages 2-12</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("children", false)}
            disabled={guests.children === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{guests.children}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("children", true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Infants</div>
          <div className="text-sm text-muted-foreground">Under 2</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("infants", false)}
            disabled={guests.infants === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{guests.infants}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("infants", true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Pets</div>
          <div className="text-sm text-muted-foreground underline cursor-pointer">
            Bringing a service animal?
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("pets", false)}
            disabled={guests.pets === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{guests.pets}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateGuests("pets", true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
