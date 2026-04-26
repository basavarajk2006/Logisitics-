import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  console.log("=== HIT UPDATES API ===");
  try {
    const { id } = await params;
    const updates = await prisma.update.findMany({
      where: { shipmentId: id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ updates });
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, time, type } = body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }
    if (message.trim().length > 300) {
      return NextResponse.json({ error: 'message too long (max 300 chars)' }, { status: 400 });
    }

    const newUpdate = await prisma.update.create({
      data: {
        shipmentId: id,
        message: message.trim(),
        time: time || new Date().toLocaleTimeString(),
        type: type || 'manual',
      },
    });

    return NextResponse.json(newUpdate, { status: 201 });
  } catch (error) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    console.error('Error creating update:', error);
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  }
}
