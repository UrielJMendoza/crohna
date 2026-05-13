"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FadeImage } from "@/components/ui/FadeImage";
import { TimelineEvent } from "@/data/demo";

interface MemoryPostcardProps {
  events: TimelineEvent[];
}

function formatLongDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MemoryPostcard({ events }: MemoryPostcardProps) {
  const candidates = useMemo(
    () => events.filter((e) => !!e.imageUrl && !!e.description),
    [events]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (candidates.length === 0) return;
    const stable = Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % candidates.length;
    setIndex(stable);
  }, [candidates.length]);

  if (candidates.length === 0) return null;
  const event = candidates[index];

  const handleNext = () => {
    setIndex((i) => (i + 1) % candidates.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 bg-[var(--card-bg)] border border-[var(--line-strong)] overflow-hidden">
        <div className="md:col-span-3 relative aspect-[4/3] md:aspect-auto md:min-h-[380px] overflow-hidden">
          <FadeImage
            src={event.imageUrl!}
            alt={event.title}
            fill
            unoptimized
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover archival-img"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
          />
          <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--line)] rounded-full">
            <span className="text-[10px] font-body font-light uppercase tracking-[0.2em] text-chrono-accent">
              Postcard
            </span>
          </div>
        </div>

        <div className="md:col-span-2 p-6 md:p-10 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {event.category && (
                <span className="text-[10px] font-body font-light uppercase tracking-[0.18em] text-chrono-muted">
                  {event.category}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-chrono-muted opacity-60" />
              <span className="text-[10px] font-body font-light uppercase tracking-[0.18em] text-chrono-muted">
                {formatLongDate(event.date)}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-semibold text-chrono-text leading-tight mb-3">
              {event.title}
            </h3>

            {event.location && (
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-3.5 h-3.5 text-chrono-accent"
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
                <span className="text-sm font-body font-light italic text-chrono-muted">
                  {event.location}
                </span>
              </div>
            )}

            <p className="text-sm font-body font-normal text-chrono-text leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
            <span className="text-[10px] font-body font-light uppercase tracking-[0.2em] text-chrono-muted">
              Memory {index + 1} of {candidates.length}
            </span>
            <button
              onClick={handleNext}
              className="group flex items-center gap-2 text-xs font-body font-light text-chrono-text hover:text-chrono-accent transition-colors"
              aria-label="Show another memory"
            >
              <span>Shuffle</span>
              <svg
                className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
