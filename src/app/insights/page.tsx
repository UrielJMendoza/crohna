"use client";

import { Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { AIStory, demoEvents } from "@/data/demo";
import AIStorySummary from "@/components/timeline/AIStorySummary";
import StatCard from "@/components/insights/StatCard";
import YearChart from "@/components/insights/YearChart";
import CityChart from "@/components/insights/CityChart";
import FunFacts from "@/components/insights/FunFacts";
import ActivityHeatmap from "@/components/insights/ActivityHeatmap";
import AdventureProfile from "@/components/insights/AdventureProfile";
import MemoryPostcard from "@/components/insights/MemoryPostcard";
import ShareCard from "@/components/share/ShareCard";
import { AIStoryLoadingSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { useStories } from "@/hooks/useStories";
import { useInsights } from "@/hooks/useInsights";

function buildFunFacts(stats: {
  totalEvents: number;
  totalPhotos: number;
  citiesVisited: number;
  yearlyEvents: { year: number; count: number }[];
}) {
  const { totalEvents, totalPhotos, citiesVisited, yearlyEvents } = stats;
  const yearsTracked = Math.max(1, yearlyEvents.length);
  const daysPerEvent = totalEvents > 0 ? Math.round((yearsTracked * 365) / totalEvents) : 0;
  const photoAlbums = Math.max(1, Math.round(totalPhotos / 100));
  const avgPerYear = (totalEvents / yearsTracked).toFixed(1);

  return [
    {
      number: daysPerEvent.toString(),
      unit: "days",
      fact: `One memorable moment every ${daysPerEvent} days.`,
      detail: "The rhythm of a well-lived life.",
    },
    {
      number: photoAlbums.toString(),
      unit: "albums",
      fact: `Enough photos to fill ${photoAlbums} keepsake books.`,
      detail: `${totalPhotos.toLocaleString()} frames worth saving.`,
    },
    {
      number: citiesVisited.toString(),
      unit: "places",
      fact: `${citiesVisited} dot${citiesVisited === 1 ? "" : "s"} on your personal world map.`,
      detail: "Each one with its own weather and song.",
    },
    {
      number: avgPerYear,
      unit: "per yr",
      fact: `Roughly ${avgPerYear} highlights per orbit around the sun.`,
      detail: `${yearsTracked} year${yearsTracked === 1 ? "" : "s"} of intentional living.`,
    },
  ];
}

export default function InsightsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-32 flex items-center justify-center"><div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading insights...</div></div>}>
      <InsightsPage />
    </Suspense>
  );
}

function InsightsPage() {
  const { stories, isLoading: storiesLoading, isShowingDemo, mutate: mutateStories } = useStories();
  const { stats, isLoading: statsLoading } = useInsights();
  const { data: session } = useSession();
  const loading = storiesLoading || statsLoading;
  const [generating, setGenerating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStory, setShareStory] = useState<AIStory | null>(null);
  const [sharePayload, setSharePayload] = useState<{
    title: string;
    content: string;
    highlights: string[];
    stats?: Record<string, string | number>;
    type: "story" | "year-review";
  } | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [storyFilter, setStoryFilter] = useState<"all" | "year" | "chapter">("all");
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null);
  const [deletingStory, setDeletingStory] = useState(false);

  // Read sharing preference from the server, not localStorage — only the
  // server's view of preferences is authoritative across devices.
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    fetch("/api/user", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const prefs = data?.user?.preferences;
        if (prefs && typeof prefs === "object") {
          setSharingEnabled(prefs.shareableStories ?? true);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [session]);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const handleRegenerate = useCallback(async (storyId: string) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/stories/${storyId}`, { method: "PUT" });
      if (res.ok) {
        mutateStories();
      }
    } catch (err) {
      console.error("Failed to regenerate story:", err);
    } finally {
      setGenerating(false);
    }
  }, [mutateStories]);

  const handleShare = useCallback(async (story: AIStory) => {
    setShareStory(story);
    setShareLoading(true);
    setShareOpen(true);
    try {
      const res = await fetch(`/api/stories/${story.id}/share`);
      if (res.status === 403) {
        toast.error("Sharing is disabled. Enable it in Settings → Privacy.");
        setShareOpen(false);
        setShareStory(null);
        return;
      }
      if (!res.ok) {
        toast.error("Failed to prepare share payload");
        setShareOpen(false);
        setShareStory(null);
        return;
      }
      const data = await res.json();
      setSharePayload({
        title: data.share.title,
        content: data.share.content,
        highlights: data.share.highlights ?? [],
        stats: data.share.stats,
        type: data.share.type,
      });
    } catch {
      toast.error("Failed to prepare share payload");
      setShareOpen(false);
      setShareStory(null);
    } finally {
      setShareLoading(false);
    }
  }, []);

  const handleConfirmDeleteStory = useCallback(async () => {
    if (!deleteStoryId) return;
    setDeletingStory(true);
    try {
      const res = await fetch(`/api/stories/${deleteStoryId}`, { method: "DELETE" });
      if (res.ok) {
        mutateStories();
        toast.success("Story deleted");
      } else {
        toast.error("Failed to delete story");
      }
    } catch {
      toast.error("Failed to delete story");
    } finally {
      setDeletingStory(false);
      setDeleteStoryId(null);
    }
  }, [deleteStoryId, mutateStories]);

  const handleGenerateStory = useCallback(async (year?: number) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, period: year ? undefined : "All Time" }),
      });
      if (res.ok) {
        mutateStories();
        toast.success("Story generated!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to generate story");
      }
    } catch {
      toast.error("Failed to generate story");
    } finally {
      setGenerating(false);
    }
  }, [mutateStories]);

  const filteredStories = stories.filter((s) => {
    if (storyFilter === "year") return s.year !== undefined;
    if (storyFilter === "chapter") return !s.year;
    return true;
  }).filter((s) => {
    if (!searchQuery) return true;
    const searchable = `${s.title} ${s.summary} ${s.period}`.toLowerCase();
    return searchable.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-32 flex items-center justify-center">
        <div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading insights...</div>
      </div>
    );
  }

  if (!stats && !isShowingDemo) {
    return (
      <div className="min-h-screen pt-24 pb-32">
        <section className="relative py-16 md:py-28 px-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto text-center"
          >
            <span className="section-label mb-5 block">Discover</span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
              <em className="text-chrono-text">Insights</em>
            </h1>
          </motion.div>
        </section>
        <EmptyState
          icon="timeline"
          title="No insights yet"
          description="Add events to your timeline to unlock analytics, patterns, and stories about your life."
          actionLabel="Go to Timeline"
          onAction={() => window.location.href = "/timeline"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32">
      {isShowingDemo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="sticky top-16 z-40 backdrop-blur-xl bg-[var(--card-bg)]/80 border-b border-[var(--line-strong)] px-6 py-3"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-xs sm:text-sm font-body font-light text-chrono-muted">
              Sample insights &mdash; your life data will generate real patterns
            </p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/insights" })}
              className="px-4 py-1.5 text-xs font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all whitespace-nowrap ml-4"
            >
              Start yours
            </button>
          </div>
        </motion.div>
      )}

      <section className="relative py-16 md:py-28 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="section-label mb-5 block">
            Discover
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-chrono-text">Insights</em>
          </h1>
          <p className="text-base md:text-lg font-body font-light text-chrono-muted max-w-xl mx-auto leading-relaxed">
            Your life, told in numbers, patterns, and the kind of small details
            that make you say <em className="text-chrono-accent not-italic">huh, that&apos;s actually me.</em>
          </p>
        </motion.div>
      </section>

      {stats && (<StatsAndCharts stats={stats} isShowingDemo={isShowingDemo} />)}

      {stories.length > 0 && (
        <section className="px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="section-label mb-4 block">Your Narratives</span>
              <h2 className="text-3xl md:text-4xl font-display font-light mb-4 tracking-tight">
                Life Stories
              </h2>
              <p className="text-sm font-body font-light text-chrono-muted max-w-md mx-auto">
                Emotional, crafted narratives about your life chapters and milestones.
              </p>
            </motion.div>

            {!isShowingDemo && (
              <div className="flex items-center justify-center gap-3 mb-8">
                <button
                  onClick={() => handleGenerateStory(new Date().getFullYear())}
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {generating && (
                    <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  )}
                  Generate {new Date().getFullYear()} Story
                </button>
                <button
                  onClick={() => handleGenerateStory()}
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-body font-light text-chrono-muted border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-chrono-text rounded-full transition-all disabled:opacity-50"
                >
                  Generate All-Time Story
                </button>
              </div>
            )}

            <div className="flex justify-center gap-2 mb-10">
              {[
                { id: "all" as const, label: "All Stories" },
                { id: "year" as const, label: "By Year" },
                { id: "chapter" as const, label: "By Chapter" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStoryFilter(tab.id)}
                  className={`px-4 py-2 text-xs font-body font-light transition-all duration-300 rounded-full ${
                    storyFilter === tab.id
                      ? "bg-[var(--muted)] border border-[var(--line-hover)] text-chrono-accent"
                      : "text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {searchQuery && (
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-body font-light text-chrono-muted border border-[var(--line)] rounded-full">
                  {filteredStories.length} stor{filteredStories.length !== 1 ? "ies" : "y"} matching &ldquo;{searchQuery}&rdquo;
                </span>
              </div>
            )}

            {filteredStories.length === 0 && searchQuery && (
              <div className="text-center py-16">
                <p className="text-sm font-body font-extralight text-chrono-muted italic">
                  No stories matching &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}

            <div className="space-y-10">
              <AnimatePresence mode="wait">
                {generating && <AIStoryLoadingSkeleton />}
              </AnimatePresence>

              {filteredStories.map((story, i) => (
                <div key={story.id} className="relative">
                  <AIStorySummary story={story} index={i} />

                  {!isShowingDemo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-end gap-2 mt-3 px-2"
                    >
                      <button
                        onClick={() => handleRegenerate(story.id)}
                        disabled={generating}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body font-light text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all disabled:opacity-40"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                        Regenerate
                      </button>
                      {sharingEnabled && (
                        <button
                          onClick={() => handleShare(story)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body font-light text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                          </svg>
                          Share
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(story.summary);
                            toast.success("Copied to clipboard");
                          } catch {
                            toast.error("Failed to copy to clipboard");
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body font-light text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={() => setDeleteStoryId(story.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body font-light text-red-400/60 hover:text-red-400 border border-[var(--line-strong)] hover:border-red-400/30 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isShowingDemo && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-20 mb-10">
          <div className="inline-flex flex-col items-center gap-6">
            <p className="text-lg font-display font-light italic text-chrono-muted">What will your life data reveal?</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/insights" })}
              className="px-8 py-3 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all duration-500"
            >
              Discover Your Insights
            </button>
          </div>
        </motion.div>
      )}

      {shareStory && !isShowingDemo && sharePayload && !shareLoading && (
        <ShareCard
          isOpen={shareOpen}
          onClose={() => { setShareOpen(false); setShareStory(null); setSharePayload(null); }}
          type={sharePayload.type}
          title={sharePayload.title}
          content={sharePayload.content}
          stats={sharePayload.stats}
          highlights={sharePayload.highlights}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteStoryId}
        onClose={() => setDeleteStoryId(null)}
        onConfirm={handleConfirmDeleteStory}
        title="Delete story?"
        description="This story will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deletingStory}
      />
    </div>
  );
}

interface StatsAndChartsProps {
  stats: {
    totalEvents: number;
    totalPhotos: number;
    citiesVisited: number;
    mostActiveYear: number;
    mostVisitedCity: string;
    topCategory: string;
    longestActiveRun: string;
    categories: { name: string; count: number; color: string }[];
    yearlyEvents: { year: number; count: number }[];
    cityVisits: { city: string; count: number }[];
  };
  isShowingDemo: boolean;
}

function StatsAndCharts({ stats, isShowingDemo }: StatsAndChartsProps) {
  const funFacts = useMemo(() => buildFunFacts(stats), [stats]);
  const yearCounts = useMemo(
    () => stats.yearlyEvents.map((y) => y.count),
    [stats.yearlyEvents]
  );

  return (
    <>
      <section className="px-6 mb-20" aria-labelledby="life-in-numbers-heading">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="section-label mb-4 block">Life in numbers</span>
            <h2
              id="life-in-numbers-heading"
              className="text-2xl md:text-4xl font-display font-light tracking-tight"
            >
              The headlines from <em className="text-chrono-accent">your story</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--line)] border border-[var(--line-strong)]">
            <StatCard
              label="Memories captured"
              value={stats.totalEvents}
              caption="Each one deliberately remembered."
              spark={yearCounts}
              delay={0}
            />
            <StatCard
              label="Photos held onto"
              value={stats.totalPhotos}
              caption="A scrapbook that won't fade."
              delay={0.1}
            />
            <StatCard
              label="Places that became part of you"
              value={stats.citiesVisited}
              caption="Each one with its own weather."
              delay={0.2}
            />
            <StatCard
              label="Brightest year so far"
              value={stats.mostActiveYear.toString()}
              caption="The year you couldn't stop showing up."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <section className="px-6 mb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <span className="section-label mb-3 block">Did you know</span>
            <h2 className="text-xl md:text-2xl font-display font-light italic text-chrono-muted">
              Fun ways to look at all of this
            </h2>
          </motion.div>

          <FunFacts facts={funFacts} />
        </div>
      </section>

      {isShowingDemo && (
        <section className="px-6 mb-24" aria-labelledby="postcard-heading">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <span className="section-label mb-3 block">From the archive</span>
              <h2
                id="postcard-heading"
                className="text-2xl md:text-3xl font-display font-light tracking-tight"
              >
                A postcard from <em className="text-chrono-accent">your timeline</em>
              </h2>
            </motion.div>

            <MemoryPostcard events={demoEvents} />
          </div>
        </section>
      )}

      <section className="px-6 mb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="section-label mb-3 block">Who you are, on paper</span>
            <h2 className="text-2xl md:text-3xl font-display font-light tracking-tight">
              Your <em className="text-chrono-accent">adventure profile</em>
            </h2>
          </motion.div>

          <AdventureProfile
            categories={stats.categories}
            totalEvents={stats.totalEvents}
            citiesVisited={stats.citiesVisited}
          />
        </div>
      </section>

      {isShowingDemo && (
        <section className="px-6 mb-24" aria-labelledby="heatmap-heading">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-10"
            >
              <span className="section-label mb-3 block">The shape of your years</span>
              <h2
                id="heatmap-heading"
                className="text-2xl md:text-3xl font-display font-light tracking-tight"
              >
                When the <em className="text-chrono-accent">good stuff</em> happened
              </h2>
            </motion.div>

            <ActivityHeatmap events={demoEvents} />
          </div>
        </section>
      )}

      <section className="px-6 mb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="section-label mb-3 block">By the data</span>
            <h2 className="text-2xl md:text-3xl font-display font-light tracking-tight">
              The <em className="text-chrono-accent">when</em> and <em className="text-chrono-accent">where</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <YearChart data={stats.yearlyEvents} />
            </div>
            <div className="lg:col-span-2">
              <CityChart data={stats.cityVisits.slice(0, 8)} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[var(--line)] border border-[var(--line-strong)]">
            {[
              { label: "Headquarters", value: stats.mostVisitedCity, hint: "Where most of your story unfolds." },
              { label: "Signature genre", value: stats.topCategory, hint: "The category you keep coming back to." },
              { label: "Best run", value: stats.longestActiveRun, hint: "Your longest streak of being present." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="bg-chrono-bg p-8 text-center card-hover"
              >
                <div className="text-xl md:text-2xl font-display font-medium text-chrono-text mb-2">
                  {item.value}
                </div>
                <div className="section-label mb-2">{item.label}</div>
                <div className="text-xs font-body font-light italic text-chrono-muted">
                  {item.hint}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
