"use client";

import {useSearchParams} from "next/navigation";

import {FacilityCard} from "../FacilityCard";

import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {TabsContent} from "@/components/ui/tabs";
import {LocationWithCourts} from "@/lib/atc";
import {formatDate} from "@/lib/dates";

type DayData = {
  date: Date;
  locations: LocationWithCourts[];
};

interface CourtsAvailabilityProps {
  data: DayData[];
}

function FacilitySelector({
  facilities,
  selectedFacility,
}: {
  facilities: Set<string>;
  selectedFacility: string;
}) {
  const handleFacilityClick = (facility: string) => {
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.set("facility", facility);
    history.pushState(null, "", `/availability?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col items-start gap-6">
      <RadioGroup
        className="flex justify-center gap-4"
        defaultValue={selectedFacility}
        onValueChange={handleFacilityClick}
      >
        <div className="flex flex-wrap justify-center gap-4">
          <div className="relative">
            <RadioGroupItem className="peer sr-only" id="all" value="all" />
            <Label
              className={`cursor-pointer rounded-full px-4 py-2 transition-all ${
                selectedFacility === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              } peer-focus-visible:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:outline-none`}
              htmlFor="all"
            >
              All Facilities
            </Label>
          </div>

          {Array.from(facilities).map((facility) => (
            <div key={facility} className="relative">
              <RadioGroupItem className="peer sr-only" id={facility} value={facility} />
              <Label
                className={`cursor-pointer rounded-full px-4 py-2 transition-all ${
                  selectedFacility === facility
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                } peer-focus-visible:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:outline-none`}
                htmlFor={facility}
              >
                {facility}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}

export function CourtsAvailability({data}: CourtsAvailabilityProps) {
  const searchParams = useSearchParams();

  const selectedFacility = searchParams.get("facility") || "all";

  const facilities = new Set(data.flatMap((day) => day.locations.map((location) => location.name)));

  return (
    <>
      <FacilitySelector facilities={facilities} selectedFacility={selectedFacility} />

      {data.map((day) => (
        <TabsContent key={formatDate(day.date)} className="w-full" value={formatDate(day.date)}>
          <div className="grid w-full gap-6 md:grid-cols-2">
            {day.locations
              .filter(
                (location) => location.name === selectedFacility || selectedFacility === "all",
              )
              .map((location) => (
                <FacilityCard key={location.name} facility={location} />
              ))}
          </div>
        </TabsContent>
      ))}
    </>
  );
}
