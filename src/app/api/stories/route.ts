import { NextRequest, NextResponse } from "next/server";
import { demoStories, demoEvents } from "@/data/demo";

// GET /api/stories — returns AI-generated life stories
export async function GET() {
  return NextResponse.json({
    stories: demoStories,
    total: demoStories.length,
  });
}

// POST /api/stories/generate — generate a new AI story for a given period
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { year, period } = body;

  // Filter events for the requested period
  let relevantEvents = demoEvents;
  if (year) {
    relevantEvents = demoEvents.filter(
      (e) => new Date(e.date).getFullYear() === year
    );
  }

  if (relevantEvents.length === 0) {
    return NextResponse.json(
      { error: "No events found for the specified period" },
      { status: 404 }
    );
  }

  // In production, this would call an AI model to generate the story
  // For demo, return a template-based story
  const cities = Array.from(new Set(relevantEvents.map((e) => e.location).filter(Boolean)));
  const categories = Array.from(new Set(relevantEvents.map((e) => e.category).filter(Boolean)));

  const story = {
    id: `story-${Date.now()}`,
    title: year ? `Your ${year}` : `Your ${period ?? "Life Story"}`,
    period: year?.toString() ?? period ?? "All Time",
    year: year ?? null,
    summary: `This period contained ${relevantEvents.length} notable events across ${cities.length} locations. Your activities spanned ${categories.join(", ")} categories, creating a rich tapestry of experiences that defined this chapter of your life.`,
    highlights: relevantEvents.slice(0, 5).map((e) => e.title),
    stats: {
      Events: relevantEvents.length,
      Locations: cities.length,
      Categories: categories.length,
    },
  };

  return NextResponse.json({ story }, { status: 201 });
}
