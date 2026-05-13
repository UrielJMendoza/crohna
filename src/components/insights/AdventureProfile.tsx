"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Category {
  name: string;
  count: number;
}

interface AdventureProfileProps {
  categories: Category[];
  totalEvents: number;
  citiesVisited: number;
}

const CATEGORY_PALETTE: Record<string, string> = {
  travel: "#5C4033",
  career: "#9C7A5C",
  achievement: "#C4956A",
  life: "#7A5C4D",
  education: "#3D2E22",
};

const CATEGORY_COPY: Record<string, string> = {
  travel: "wandered far",
  career: "built things",
  achievement: "broke through",
  life: "lived fully",
  education: "learned forever",
};

function inferPersona(categories: Category[], cities: number): { label: string; description: string } {
  if (categories.length === 0) {
    return { label: "Blank Page", description: "A new chapter, waiting to be written." };
  }

  const top = [...categories].sort((a, b) => b.count - a.count)[0];
  const topName = top.name.toLowerCase();
  const isWellTraveled = cities >= 7;
  const variety = categories.filter((c) => c.count > 0).length;

  if (isWellTraveled && topName === "travel") {
    return { label: "Globetrotter", description: "Passport stamps and stories from every horizon." };
  }
  if (topName === "career" || topName === "achievement") {
    return { label: "Builder", description: "Crafting the kind of life that takes effort to make." };
  }
  if (topName === "life" && variety >= 3) {
    return { label: "Soul Collector", description: "Quietly gathering moments that feel like home." };
  }
  if (variety >= 4) {
    return { label: "Renaissance Soul", description: "Refusing to be just one thing." };
  }
  if (topName === "travel") {
    return { label: "Wanderer", description: "Always one map away from the next chapter." };
  }
  return { label: "Memory Keeper", description: "A quiet curator of the moments that matter." };
}

export default function AdventureProfile({ categories, totalEvents, citiesVisited }: AdventureProfileProps) {
  const persona = useMemo(() => inferPersona(categories, citiesVisited), [categories, citiesVisited]);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count),
    [categories]
  );
  const total = sorted.reduce((sum, c) => sum + c.count, 0) || 1;

  const segments = useMemo(() => {
    let cumulative = 0;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    return sorted.map((cat) => {
      const fraction = cat.count / total;
      const length = fraction * circumference;
      const offset = -cumulative * circumference;
      cumulative += fraction;
      return {
        name: cat.name,
        count: cat.count,
        fraction,
        length,
        offset,
        color: CATEGORY_PALETTE[cat.name.toLowerCase()] || "var(--chrono-accent)",
      };
    });
  }, [sorted, total]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--card-bg)] p-4 sm:p-6 md:p-8 border border-[var(--line-strong)]"
      role="img"
      aria-label={`Adventure profile: ${persona.label}. ${sorted.map((c) => `${c.name} ${c.count}`).join(", ")}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-display font-bold text-chrono-text">
          Your Adventure Profile
        </h3>
        <p className="text-xs font-body font-light italic text-chrono-muted mt-1">
          A portrait of how your time is spent.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="relative w-44 h-44 flex-shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r="56"
              fill="none"
              stroke="var(--line)"
              strokeWidth="14"
            />
            {segments.map((seg, i) => (
              <motion.circle
                key={seg.name}
                cx="70"
                cy="70"
                r="56"
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeLinecap="butt"
                strokeDasharray={`${seg.length} ${2 * Math.PI * 56}`}
                strokeDashoffset={seg.offset}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-3xl font-display font-bold text-chrono-text leading-none"
            >
              {totalEvents}
            </motion.div>
            <div className="text-[9px] font-body font-light uppercase tracking-[0.18em] text-chrono-muted mt-1.5">
              moments
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-4"
          >
            <div className="text-[10px] font-body font-light uppercase tracking-[0.2em] text-chrono-muted mb-1">
              You are a
            </div>
            <div className="text-2xl md:text-3xl font-display font-semibold text-chrono-text italic">
              {persona.label}
            </div>
            <div className="text-xs font-body font-light text-chrono-muted mt-1.5 leading-relaxed">
              {persona.description}
            </div>
          </motion.div>

          <ul className="space-y-2 mt-5">
            {sorted.map((cat, i) => {
              const pct = Math.round((cat.count / total) * 100);
              const color = CATEGORY_PALETTE[cat.name.toLowerCase()] || "var(--chrono-accent)";
              const verb = CATEGORY_COPY[cat.name.toLowerCase()] || "showed up";
              return (
                <motion.li
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-body font-normal text-chrono-text capitalize w-20 sm:w-24">
                    {cat.name}
                  </span>
                  <span className="text-xs font-body font-light italic text-chrono-muted flex-1 hidden sm:inline">
                    {verb}
                  </span>
                  <span className="text-xs font-body font-light text-chrono-muted tabular-nums">
                    {pct}%
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
