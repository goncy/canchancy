"use client";

import {useSearchParams} from "next/navigation";

import {FacilityCard} from "../FacilityCard";

import {Badge} from "@/components/ui/badge";
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
      <div className="flex justify-center gap-4">
        <Badge
          className={`cursor-pointer px-4 py-2 ${selectedFacility === "all" ? "bg-primary" : "bg-secondary"}`}
          onClick={() => handleFacilityClick("all")}
        >
          All Facilities
        </Badge>
        {Array.from(facilities).map((facility) => (
          <Badge
            key={facility}
            className={`cursor-pointer px-4 py-2 ${selectedFacility === facility ? "bg-primary" : "bg-secondary"}`}
            onClick={() => handleFacilityClick(facility)}
          >
            {facility}
          </Badge>
        ))}
      </div>
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
