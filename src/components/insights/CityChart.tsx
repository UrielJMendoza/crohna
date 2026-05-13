"use client";

import { motion } from "framer-motion";

interface CityData {
  city: string;
  count: number;
}

export default function CityChart({ data }: { data: CityData[] }) {
  const maxCount = data.length === 0 ? 1 : Math.max(...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--card-bg)] p-4 sm:p-6 md:p-8 border border-[var(--line-strong)]"
      role="img"
      aria-label={`Most visited cities: ${data.map((d) => `${d.city} ${d.count}`).join(", ")}`}
    >
      <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-display font-bold text-chrono-text">
            Where Your Story Unfolded
          </h3>
          <p className="text-xs font-body font-light italic text-chrono-muted mt-1">
            {data.length} place{data.length === 1 ? "" : "s"} on the map.
          </p>
        </div>
      </div>

      <ol className="space-y-3.5">
        {data.map((item, i) => {
          const widthPct = (item.count / maxCount) * 100;
          const sharePct = Math.round((item.count / total) * 100);
          const rank = i + 1;

          return (
            <motion.div
              key={item.city}
              role="listitem"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="grid grid-cols-[2rem_minmax(6rem,12rem)_1fr_auto] items-center gap-3 sm:gap-4 group"
            >
              <span className="text-[10px] font-body font-light text-chrono-muted tabular-nums tracking-widest text-right pr-1">
                {String(rank).padStart(2, "0")}
              </span>

              <div className="flex items-center gap-2 min-w-0">
                <svg
                  className={`w-3 h-3 flex-shrink-0 transition-colors ${
                    rank === 1 ? "text-chrono-accent" : "text-chrono-muted"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span
                  className="text-sm font-body font-normal text-chrono-text truncate"
                  title={item.city}
                >
                  {item.city}
                </span>
              </div>

              <div className="h-[3px] bg-chrono-bg overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${widthPct}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: 0.3 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: rank === 1
                      ? "linear-gradient(to right, var(--chrono-accent), color-mix(in srgb, var(--chrono-accent) 60%, transparent))"
                      : "linear-gradient(to right, color-mix(in srgb, var(--chrono-accent) 55%, transparent), color-mix(in srgb, var(--chrono-accent) 25%, transparent))",
                  }}
                />
              </div>

              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-sm font-body font-normal text-chrono-text">
                  {item.count}
                </span>
                <span className="text-[10px] font-body font-light text-chrono-muted w-9 text-right">
                  {sharePct}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </ol>
    </motion.div>
  );
}
