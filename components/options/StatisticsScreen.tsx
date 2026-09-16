"use client";

import { McSettingRow, McSettingsScroll } from "@/components/mc/McMenuGrid";
import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";

export default function StatisticsScreen({ statistics }: { statistics: Portfolio["statistics"] }) {
  return (
    <McMenuScreen title="Video Settings">
      <McSettingsScroll>
        {statistics.map((stat) => (
          <McSettingRow key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </McSettingsScroll>
    </McMenuScreen>
  );
}
