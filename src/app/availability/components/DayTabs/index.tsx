"use client";

import {Tabs} from "@/components/ui/tabs";

export function DayTabs({
  dateToDisplay,
  children,
  className,
}: {
  dateToDisplay: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tabs
      className={className}
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
