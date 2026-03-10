"use client";

import { motion } from "framer-motion";
import { demoStories, insightStats } from "@/data/demo";
import AIStorySummary from "@/components/timeline/AIStorySummary";
import StatCard from "@/components/insights/StatCard";
import CategoryChart from "@/components/insights/CategoryChart";
import YearChart from "@/components/insights/YearChart";
import CityChart from "@/components/insights/CityChart";

export default function InsightsPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Page header */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-chrono-accent/[0.03] via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
            AI-Powered
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            <span className="gradient-text">Insights</span>
          </h1>
          <p className="text-lg text-chrono-text-secondary max-w-xl mx-auto">
            Discover patterns, highlights, and stories hidden in your
            life&apos;s timeline, revealed by AI.
          </p>
        </motion.div>
      </section>

      {/* Stats overview */}
      <section className="px-6 mb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Events"
            value={insightStats.totalEvents}
            delay={0}
          />
          <StatCard
            label="Photos Captured"
            value={insightStats.totalPhotos}
            color="#f9a8d4"
            delay={0.1}
          />
          <StatCard
            label="Cities Visited"
            value={insightStats.citiesVisited}
            color="#67e8f9"
            delay={0.2}
          />
          <StatCard
            label="Most Active Year"
            value={insightStats.mostActiveYear.toString()}
            color="#fbbf24"
            delay={0.3}
          />
        </div>
      </section>

      {/* Highlight stats */}
      <section className="px-6 mb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-chrono-card/60 rounded-2xl p-6 border border-chrono-border/40 text-center">
              <div className="text-4xl mb-3">🏙</div>
              <div className="text-xl font-display font-bold text-chrono-text mb-1">
                {insightStats.mostVisitedCity}
              </div>
              <div className="text-xs text-chrono-muted uppercase tracking-widest">
                Most Visited City
              </div>
            </div>
            <div className="bg-chrono-card/60 rounded-2xl p-6 border border-chrono-border/40 text-center">
              <div className="text-4xl mb-3">✈</div>
              <div className="text-xl font-display font-bold text-chrono-text mb-1">
                {insightStats.topCategory}
              </div>
              <div className="text-xs text-chrono-muted uppercase tracking-widest">
                Top Category
              </div>
            </div>
            <div className="bg-chrono-card/60 rounded-2xl p-6 border border-chrono-border/40 text-center">
              <div className="text-4xl mb-3">🔥</div>
              <div className="text-xl font-display font-bold text-chrono-text mb-1">
                {insightStats.longestStreak}
              </div>
              <div className="text-xs text-chrono-muted uppercase tracking-widest">
                Longest Active Streak
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Charts */}
      <section className="px-6 mb-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-bold mb-8 text-center"
          >
            Data Visualizations
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CategoryChart categories={insightStats.categories} />
            <YearChart data={insightStats.yearlyEvents} />
          </div>
          <CityChart data={insightStats.cityVisits} />
        </div>
      </section>

      {/* AI Stories */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
              Generated for You
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              AI Life Stories
            </h2>
          </motion.div>

          <div className="space-y-8">
            {demoStories.map((story, i) => (
              <AIStorySummary key={story.id} story={story} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
