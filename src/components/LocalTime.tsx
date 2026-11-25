"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

/** Live Bishkek time. Renders a stable placeholder on the server to avoid hydration drift. */
export default function LocalTime({ seconds = false }: { seconds?: boolean }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: site.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, seconds ? 1000 : 15000);
    return () => window.clearInterval(id);
  }, [seconds]);

  return (
    <time suppressHydrationWarning className="tabular-nums">
      {time ?? (seconds ? "--:--:--" : "--:--")}
    </time>
  );
}
