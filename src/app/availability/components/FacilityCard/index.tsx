import {Calendar, Clock} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

function getColorsForTime(time: string) {
  const hour = parseInt(time.split(":")[0]);

  // Morning (before 12PM)
  if (hour < 12) {
    return "bg-blue-900 text-blue-100";
  }

  // Afternoon (12-6PM)
  if (hour >= 12 && hour < 18) {
    return "bg-amber-900 text-amber-100";
  }

  // Evening (after 6PM)
  return "bg-purple-900 text-purple-100";
}

function SlotBadge({slot}: {slot: string}) {
  const colorClasses = getColorsForTime(slot);

  return (
    <Badge className={`flex items-center gap-1 ${colorClasses}`}>
      <Clock className="h-3 w-3" />
      {slot}
    </Badge>
  );
}

interface FacilityCardProps {
  facility: {
    name: string;
    courts: {
      name: string;
      slots: string[];
    }[];
  };
}

export function FacilityCard({facility}: FacilityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {facility.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {facility.courts.map((court) => (
            <div key={court.name} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">{court.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {court.slots.length > 0 ? (
                    court.slots.map((slot) => <SlotBadge key={slot} slot={slot} />)
                  ) : (
                    <p className="text-muted-foreground text-sm">No available slots</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
