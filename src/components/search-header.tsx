"use client";

import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, CalendarDays, Users } from "lucide-react";
import { useState } from "react";
import { GuestSelector } from "./guest-selector";
import { format } from "date-fns";

export function SearchHeader() {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();

  return (
    <div className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Where are you going?"
                className="pl-10 h-12"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            </div>
          </div>

          <div className="flex gap-4 flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  {checkIn ? format(checkIn, "MMM dd") : "Check in"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  {checkOut ? format(checkOut, "MMM dd") : "Check out"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
                  <Users className="mr-2 h-5 w-5" />
                  Add guests
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <GuestSelector />
              </PopoverContent>
            </Popover>
          </div>

          <Button className="h-12 px-8">
            <Search className="mr-2 h-5 w-5" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
