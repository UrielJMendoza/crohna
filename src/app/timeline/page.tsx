"use client";

import { motion } from "framer-motion";
import { demoEvents, getEventsByYear } from "@/data/demo";
import YearSection from "@/components/timeline/YearSection";

export default function TimelinePage() {
  const eventsByYear = getEventsByYear(demoEvents);
  const years = Object.keys(eventsByYear);

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Page header */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-chrono-accent/[0.03] via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
            Your Journey
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            <span className="gradient-text">Timeline</span>
          </h1>
          <p className="text-lg text-chrono-text-secondary max-w-xl mx-auto">
            Every moment that shaped your story, beautifully organized
            and brought to life.
          </p>
        </motion.div>

        {/* Year navigation pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center gap-3 mt-12"
        >
          {years.map((year, i) => (
            <motion.button
              key={year}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="px-5 py-2 rounded-full text-sm font-medium glass hover:bg-chrono-accent/10 hover:border-chrono-accent/30 transition-all"
            >
              {year}
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="px-6">
        <div className="space-y-32">
          {years.map((year, i) => (
            <YearSection
              key={year}
              year={year}
              events={eventsByYear[year]}
              yearIndex={i}
            />
          ))}
        </div>
      </section>

      {/* End marker */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-32"
      >
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-chrono-accent/50" />
          <p className="text-sm text-chrono-muted font-display italic">
            Your story continues...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
