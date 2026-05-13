"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  color?: string;
  delay?: number;
  caption?: string;
  spark?: number[];
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1.8;
          const startTime = Date.now();
          const step = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 100;
  const height = 24;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-6 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
      aria-hidden="true"
    >
      <motion.polyline
        fill="none"
        stroke="var(--chrono-accent)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export default function StatCard({ label, value, suffix, delay = 0, caption, spark }: StatCardProps) {
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
      aria-label={`${label}: ${value}${suffix || ""}${caption ? ` (${caption})` : ""}`}
    >
      <div className="relative bg-chrono-bg p-8 md:p-10 card-hover overflow-hidden border border-[var(--line-strong)]">
        <div
          className="absolute inset-x-0 top-0 h-px opacity-40 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: "linear-gradient(90deg, transparent, var(--chrono-accent), transparent)" }}
          aria-hidden="true"
        />

        <div className="text-4xl md:text-5xl font-display font-bold text-chrono-text mb-3" aria-hidden="true">
          {isNumeric ? <AnimatedNumber value={value} suffix={suffix} /> : value}
        </div>

        <div className="section-label">{label}</div>

        {caption && (
          <div className="mt-3 text-xs font-body font-light italic text-chrono-muted leading-snug">
            {caption}
          </div>
        )}

        {spark && spark.length > 1 && (
          <div className="mt-4 -mx-1">
            <Sparkline values={spark} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
