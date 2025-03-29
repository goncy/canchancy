import {Suspense} from "react";
import {unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag} from "next/cache";

import {DayTabs} from "./components/DayTabs";

import {CourtsAvailability} from "@/app/availability/components/CourtsAvailability";
import {TabsList, TabsTrigger} from "@/components/ui/tabs";
import {addDay, formatDate, formatDateWithDay} from "@/lib/dates";
import {getLocations} from "@/lib/dincy";
import {getCourts} from "@/lib/atc";

/**
 * Show availability for today and the next 6 days
 */
const DAYS_TO_SHOW = 7;

async function getAvailabilityData(today: Date) {
  "use cache";

  cacheLife("minutes");
  cacheTag("availability");

  return Promise.all(
    Array.from({length: DAYS_TO_SHOW}, async (_, i) => {
      const date = addDay(today, i);
      const formattedDate = formatDate(date);

      const locations = await getLocations().then((locations) => {
        return Promise.all(locations.map((location) => getCourts(location.id, formattedDate)));
      });

      return {
        date,
        locations,
      };
    }),
  );
}

interface DaysListProps {
  searchParams: Promise<{date: string}>;
}

async function DaysList({searchParams}: DaysListProps) {
  const {date: dateFromSearchParams} = await searchParams;

  const today = new Date();

  const dateToDisplay = formatDate(dateFromSearchParams ? new Date(dateFromSearchParams) : today);

  return (
    <DayTabs className="w-full" dateToDisplay={dateToDisplay}>
      <TabsList className="grid grid-cols-7">
        {Array.from({length: DAYS_TO_SHOW}, (_, i) => {
          const date = addDay(today, i);

          return (
            <TabsTrigger key={formatDate(date)} value={formatDate(date)}>
              {formatDateWithDay(date)}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {getAvailabilityData(today).then((data) => (
        <CourtsAvailability data={data} />
      ))}
    </DayTabs>
  );
}

function Legend() {
  return (
    <div className="flex justify-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-blue-500" />
        <span>Mañana (antes de las 12PM)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <span>Tarde (12-6PM)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-purple-500" />
        <span>Noche (después de las 6PM)</span>
      </div>
    </div>
  );
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{date: string}>;
}) {
  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <h1 className="text-center text-3xl font-bold">Disponibilidad</h1>

      <Suspense fallback={<div className="text-center">Cargando datos de disponibilidad...</div>}>
        <DaysList searchParams={searchParams} />

        <Legend />
      </Suspense>
    </div>
  );
}
