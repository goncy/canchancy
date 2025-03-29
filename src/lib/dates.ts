import {format} from "@formkit/tempo";

export {addDay} from "@formkit/tempo";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export function formatTime(date: Date) {
  return format({
    date: date,
    format: "HH:mm",
    tz: TIMEZONE,
  });
}

export function formatDate(date: Date) {
  return format({
    date: date,
    format: "YYYY-MM-DD",
    tz: "UTC",
  });
}

export function formatDateWithDay(date: Date) {
  return format({
    date: date,
    format: "ddd, DD",
    tz: "UTC",
  });
}
