"use client";

import {Tabs} from "@/components/ui/tabs";

export function DayTabs({
  dateToDisplay,
  children,
}: {
  dateToDisplay: string;
  children: React.ReactNode;
}) {
  return (
    <Tabs
      defaultValue={dateToDisplay}
      onValueChange={(value) => {
        const searchParams = new URLSearchParams(window.location.search);

        searchParams.set("date", value);

        history.pushState(null, "", `/availability?${searchParams.toString()}`);
      }}
    >
      {children}
    </Tabs>
  );
}
