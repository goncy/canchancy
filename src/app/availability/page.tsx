import {Suspense} from "react";
import {unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag} from "next/cache";

import {CourtsAvailability} from "@/app/availability/components/CourtsAvailability";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {addDay, formatDate, formatDateWithDay} from "@/lib/dates";
import {getLocations} from "@/lib/dincy";
import {getCourts} from "@/lib/atc";

/**
 * Show availability for today and the next 6 days
 */
const DAYS_TO_SHOW = 7;

export default async function AvailabilityPage() {
  "use cache";

  cacheLife("minutes");
  cacheTag("availability");

  const today = new Date();

  const availabilityData = Promise.all(
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

  return (
    <div className="flex min-h-screen w-full flex-col items-start gap-4">
      <h1 className="text-center text-3xl font-bold">Disponibilidad</h1>

      <Tabs className="flex w-full flex-col gap-6" defaultValue={formatDate(today)}>
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

        <Suspense fallback={<div className="text-center">Loading availability data...</div>}>
          {availabilityData.then((data) => (
            <CourtsAvailability data={data} />
          ))}
        </Suspense>
      </Tabs>
    </div>
  );
}
