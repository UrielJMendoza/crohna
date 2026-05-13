"use client";

import { motion } from "framer-motion";

interface FunFact {
  number: string;
  unit: string;
  fact: string;
  detail?: string;
}

export default function FunFacts({ facts }: { facts: FunFact[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--line)] border border-[var(--line-strong)]"
      role="list"
      aria-label="Fun facts about your timeline"
    >
      {facts.map((fact, i) => (
        <motion.div
          key={fact.fact}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.7 }}
          className="bg-chrono-bg p-7 md:p-8 relative group overflow-hidden card-hover"
          role="listitem"
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-12 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
            style={{ background: "var(--chrono-glow)" }}
          />

          <div className="relative">
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-3xl md:text-4xl font-display font-bold text-chrono-text leading-none">
                {fact.number}
              </span>
              <span className="text-xs font-body font-light tracking-wider uppercase text-chrono-muted">
                {fact.unit}
              </span>
            </div>

            <p className="text-sm font-body font-normal text-chrono-text leading-snug mb-1">
              {fact.fact}
            </p>

            {fact.detail && (
              <p className="text-xs font-body font-light italic text-chrono-muted leading-relaxed">
                {fact.detail}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
