import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ stats: null });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ stats: null });
  }

  const events = await prisma.event.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  if (events.length === 0) {
    return NextResponse.json({ stats: null });
  }

  // Calculate stats from real data
  const totalEvents = events.length;

  // Cities visited
  const cities = new Set(events.map((e) => e.location).filter(Boolean));
  const citiesVisited = cities.size;

  // Category counts
  const categoryMap: Record<string, number> = {};
  for (const e of events) {
    const cat = e.category || "uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count, color: "rgba(255,255,255,0.7)" }))
    .sort((a, b) => b.count - a.count);

  const topCategory = categories[0]?.name || "None";

  // Yearly events
  const yearMap: Record<number, number> = {};
  for (const e of events) {
    const year = e.date.getFullYear();
    yearMap[year] = (yearMap[year] || 0) + 1;
  }
  const yearlyEvents = Object.entries(yearMap)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  const mostActiveYear = yearlyEvents.reduce((a, b) => (b.count > a.count ? b : a), yearlyEvents[0])?.year || new Date().getFullYear();

  // City visits
  const cityMap: Record<string, number> = {};
  for (const e of events) {
    if (e.location) {
      cityMap[e.location] = (cityMap[e.location] || 0) + 1;
    }
  }
  const cityVisits = Object.entries(cityMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);

  const mostVisitedCity = cityVisits[0]?.city || "None";

  return NextResponse.json({
    stats: {
      totalEvents,
      totalPhotos: events.filter((e) => e.imageUrl).length,
      citiesVisited,
      mostActiveYear,
      mostVisitedCity,
      topCategory,
      longestStreak: "—",
      categories,
      yearlyEvents,
      cityVisits,
    },
  });
}
