import { NextRequest, NextResponse } from "next/server";
import { demoEvents } from "@/data/demo";

// GET /api/events — returns all events, optionally filtered by year
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");

  let events = demoEvents;
  if (year) {
    events = events.filter(
      (e) => new Date(e.date).getFullYear().toString() === year
    );
  }

  return NextResponse.json({
    events,
    total: events.length,
  });
}

// POST /api/events — create a new event
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { title, date, location, description, category } = body;

  if (!title || !date) {
    return NextResponse.json(
      { error: "Title and date are required" },
      { status: 400 }
    );
  }

  // In production, this would save to the database
  const newEvent = {
    id: `event-${Date.now()}`,
    title,
    date,
    location: location ?? null,
    description: description ?? null,
    category: category ?? "life",
    source: "manual",
    imageUrl: null,
    latitude: null,
    longitude: null,
  };

  return NextResponse.json({ event: newEvent }, { status: 201 });
}
