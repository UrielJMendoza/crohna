"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface HeatmapEvent {
  date: string;
  title?: string;
}

interface ActivityHeatmapProps {
  events: HeatmapEvent[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface CellInfo {
  count: number;
  titles: string[];
}

export default function ActivityHeatmap({ events }: ActivityHeatmapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { years, grid, peak, totalActiveMonths } = useMemo(() => {
    const map = new Map<string, CellInfo>();
    const yearSet = new Set<number>();

    for (const event of events) {
      const d = new Date(event.date);
      if (isNaN(d.getTime())) continue;
      const y = d.getFullYear();
      const m = d.getMonth();
      yearSet.add(y);
      const key = `${y}-${m}`;
      const existing = map.get(key) || { count: 0, titles: [] };
      existing.count += 1;
      if (event.title) existing.titles.push(event.title);
      map.set(key, existing);
    }

    const years = Array.from(yearSet).sort();
    const peak = Math.max(1, ...Array.from(map.values()).map((v) => v.count));
    const totalActiveMonths = map.size;

    return { years, grid: map, peak, totalActiveMonths };
  }, [events]);

  const intensity = (count: number) => {
    if (count === 0) return 0;
    return Math.min(1, count / peak);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--card-bg)] p-4 sm:p-6 md:p-8 border border-[var(--line-strong)]"
      role="img"
      aria-label={`Activity heatmap across ${years.length} year${years.length === 1 ? "" : "s"}, ${totalActiveMonths} active month${totalActiveMonths === 1 ? "" : "s"} total`}
    >
      <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-display font-bold text-chrono-text">
            Memory Constellation
          </h3>
          <p className="text-xs font-body font-light italic text-chrono-muted mt-1">
            Each square is a month. Brighter means more memories made.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-body font-light uppercase tracking-wider text-chrono-muted">
          <span>Quiet</span>
          <div className="flex gap-[3px]">
            {[0.15, 0.4, 0.7, 1].map((op) => (
              <div
                key={op}
                className="w-3 h-3 rounded-[3px]"
                style={{ background: "var(--chrono-accent)", opacity: op }}
              />
            ))}
          </div>
          <span>Vibrant</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
        <table className="w-full" role="presentation">
          <thead>
            <tr>
              <th className="w-10" />
              {MONTHS.map((m) => (
                <th
                  key={m}
                  className="text-[10px] font-body font-light text-chrono-muted uppercase tracking-wider pb-2 text-center"
                >
                  {m[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year}>
                <td className="text-[11px] font-body font-light text-chrono-muted pr-3 align-middle">
                  {year}
                </td>
                {MONTHS.map((_, monthIdx) => {
                  const key = `${year}-${monthIdx}`;
                  const cell = grid.get(key);
                  const count = cell?.count ?? 0;
                  const op = intensity(count);
                  const isHovered = hovered === key;
                  return (
                    <td key={monthIdx} className="p-[2px] relative">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.02 * monthIdx + 0.15 * years.indexOf(year),
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        onMouseEnter={() => count > 0 && setHovered(key)}
                        onMouseLeave={() => setHovered(null)}
                        className={`aspect-square rounded-[3px] border border-[var(--line)] cursor-pointer transition-transform duration-200 ${
                          count > 0 ? "hover:scale-125" : ""
                        }`}
                        style={{
                          background:
                            count > 0
                              ? `color-mix(in srgb, var(--chrono-accent) ${Math.round(op * 100)}%, transparent)`
                              : "transparent",
                        }}
                        aria-label={
                          count > 0
                            ? `${MONTHS[monthIdx]} ${year}: ${count} memor${count === 1 ? "y" : "ies"}`
                            : undefined
                        }
                      />
                      {isHovered && cell && (
                        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap pointer-events-none">
                          <div className="bg-chrono-text text-chrono-bg text-[11px] font-body font-light px-3 py-1.5 rounded-md shadow-lg">
                            {MONTHS[monthIdx]} {year} · {cell.count} memor{cell.count === 1 ? "y" : "ies"}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-5 border-t border-[var(--line)] flex flex-wrap gap-x-8 gap-y-2 text-xs font-body font-light text-chrono-muted">
        <span>
          <span className="text-chrono-text font-normal">{totalActiveMonths}</span> active month{totalActiveMonths === 1 ? "" : "s"}
        </span>
        <span>
          <span className="text-chrono-text font-normal">{years.length}</span> year{years.length === 1 ? "" : "s"} tracked
        </span>
        <span>
          Peak month: <span className="text-chrono-text font-normal">{peak} memor{peak === 1 ? "y" : "ies"}</span>
        </span>
      </div>
    </motion.div>
  );
}
