"use client";

import { motion } from "framer-motion";

interface YearData {
  year: number;
  count: number;
}

export default function YearChart({ data }: { data: YearData[] }) {
  const maxCount = data.length === 0 ? 1 : Math.max(...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const peakYear = data.length === 0 ? null : data.find((d) => d.count === maxCount)?.year;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--card-bg)] p-4 sm:p-6 md:p-8 border border-[var(--line-strong)]"
      role="img"
      aria-label={`Events by year: ${data.map((d) => `${d.year} ${d.count}`).join(", ")}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-display font-bold text-chrono-text">
          Years of You
        </h3>
        <p className="text-xs font-body font-light italic text-chrono-muted mt-1">
          {total} memor{total === 1 ? "y" : "ies"} across {data.length} year{data.length === 1 ? "" : "s"}
          {peakYear ? `. The brightest one shines below.` : "."}
        </p>
      </div>

      <div className="flex items-end gap-3 sm:gap-5 h-56 px-1 pt-2">
        {data.map((item, i) => {
          const heightPct = (item.count / maxCount) * 100;
          const prev = i > 0 ? data[i - 1] : null;
          const delta = prev ? item.count - prev.count : 0;
          const isPeak = item.year === peakYear;

          return (
            <div key={item.year} className="flex-1 flex flex-col items-center gap-2 group h-full">
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
                className={`text-sm font-display font-semibold tabular-nums ${
                  isPeak ? "text-chrono-accent" : "text-chrono-text"
                }`}
              >
                {item.count}
              </motion.span>

              {prev && delta !== 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.15 }}
                  className={`text-[10px] font-body font-light tabular-nums ${
                    delta > 0 ? "text-chrono-accent" : "text-chrono-muted"
                  }`}
                  aria-hidden="true"
                >
                  {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}
                </motion.span>
              )}

              <div className="w-full relative flex-1 min-h-[20px]">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${heightPct}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    delay: 0.3 + i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute bottom-0 left-0 right-0 rounded-t-sm overflow-hidden"
                  style={{
                    background: isPeak
                      ? "linear-gradient(to top, var(--chrono-accent), color-mix(in srgb, var(--chrono-accent) 50%, transparent))"
                      : "linear-gradient(to top, color-mix(in srgb, var(--chrono-accent) 60%, transparent), color-mix(in srgb, var(--chrono-accent) 15%, transparent))",
                  }}
                >
                  {isPeak && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.5 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.4, duration: 1.2 }}
                      className="absolute inset-x-0 top-0 h-px bg-chrono-text"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              </div>

              <span
                className={`text-xs font-body tabular-nums transition-colors duration-300 ${
                  isPeak ? "text-chrono-accent font-normal" : "text-chrono-muted font-light"
                }`}
              >
                {item.year}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
