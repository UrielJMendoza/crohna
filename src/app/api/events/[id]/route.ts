import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getPrisma } from "@/lib/prisma";

// PUT /api/events/[id] — update an event
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const existing = await prisma.event.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, date, endDate, location, latitude, longitude, description, category, imageUrl } = body;

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(location !== undefined && { location: location ?? null }),
      ...(latitude !== undefined && { latitude: latitude ?? null }),
      ...(longitude !== undefined && { longitude: longitude ?? null }),
      ...(description !== undefined && { description: description ?? null }),
      ...(category !== undefined && { category: category ?? null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl ?? null }),
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
  });
}

// DELETE /api/events/[id] — delete an event
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const existing = await prisma.event.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
