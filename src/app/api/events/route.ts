import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getPrisma } from "@/lib/prisma";

// GET /api/events — returns all events for the authenticated user
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ events: [], total: 0 });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ events: [], total: 0 });
  }

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");

  const where: Record<string, unknown> = { userId: user.id };
  if (year) {
    const start = new Date(`${year}-01-01T00:00:00Z`);
    const end = new Date(`${Number(year) + 1}-01-01T00:00:00Z`);
    where.date = { gte: start, lt: end };
  }

  const dbEvents = await prisma.event.findMany({
    where,
    orderBy: { date: "desc" },
  });

  const events = dbEvents.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date.toISOString().split("T")[0],
    endDate: e.endDate ? e.endDate.toISOString().split("T")[0] : undefined,
    location: e.location ?? undefined,
    latitude: e.latitude ?? undefined,
    longitude: e.longitude ?? undefined,
    imageUrl: e.imageUrl ?? undefined,
    description: e.description ?? undefined,
    category: e.category ?? undefined,
    source: e.source,
  }));

  return NextResponse.json({ events, total: events.length });
}

// POST /api/events — create a new event
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, date, endDate, location, latitude, longitude, description, category, imageUrl } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      userId: user.id,
      title,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location: location ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      description: description ?? null,
      category: category ?? "life",
      imageUrl: imageUrl ?? null,
      source: "manual",
    },
  });

  return NextResponse.json({
    event: {
      id: event.id,
      title: event.title,
      date: event.date.toISOString().split("T")[0],
      endDate: event.endDate ? event.endDate.toISOString().split("T")[0] : undefined,
      location: event.location ?? undefined,
      latitude: event.latitude ?? undefined,
      longitude: event.longitude ?? undefined,
      imageUrl: event.imageUrl ?? undefined,
      description: event.description ?? undefined,
      category: event.category ?? undefined,
      source: event.source,
    },
  }, { status: 201 });
}
