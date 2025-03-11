import {format} from "@formkit/tempo";

type CourtAvailability = {
  id: string;
  permalink: string;
  name: string;
  state: string;
  logo_url: string;
  background_url: string;
  phone: string;
  has_beelup: boolean;
  has_integration_with_f1: boolean;
  sport_ids: string[];
  location: {
    zone: {
      name: string;
      timezone: string;
      country: {
        code: string;
        currency: string;
      };
    };
    name: string;
    lat: number;
    lng: number;
  };
  geohash: string;
  amenities: {
    id: string;
    name: string;
    icon_url: string;
  }[];
  rating: {
    stars: number;
    count: number;
  };
  date: string;
  business_hours: {
    day_of_week: string;
    open_time: string;
    close_time: string;
  }[];
  business_hours_for_given_date: {
    day_of_week: string;
    open_time: string;
    close_time: string;
  };
  available_courts: {
    id: string;
    name: string;
    surface_type: string;
    has_lighting: boolean;
    is_roofed: boolean;
    sport_ids: string[];
    available_slots: {
      start: string;
      duration: number;
      price: {
        cents: number;
        currency: string;
      };
    }[];
    is_beelup: boolean;
  }[];
};

export async function getCourts(field: string, date: string) {
  const data = await fetch(
    `https://alquilatucancha.com/api/v3/availability/sportclubs/${field}?date=${date}`,
  ).then((res) => res.json() as Promise<CourtAvailability>);

  const availableTimes: Record<string, {name: string; slots: string[]}> = {};

  for (const court of data.available_courts) {
    for (const slot of court.available_slots) {
      const slotStart = format({
        date: new Date(slot.start),
        format: "HH:mm",
        tz: "America/Argentina/Buenos_Aires",
      });

      // Initialize the court if it doesn't exist
      if (!availableTimes[court.id]) {
        availableTimes[court.id] = {
          name: court.name,
          slots: [],
        };
      }

      // Add the slot to the court
      availableTimes[court.id].slots.push(slotStart);
    }
  }

  // Return the available times
  return {
    name: data.name,
    courts: Object.values(availableTimes),
  };
}
