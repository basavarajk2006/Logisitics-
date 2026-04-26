import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const validSeverities = new Set(['low', 'medium', 'high']);

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const anomalies = await prisma.anomaly.findMany({
      where: { shipmentId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ anomalies });
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const severity = typeof body.severity === 'string' ? body.severity.toLowerCase() : '';

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }
    if (body.message.trim().length > 300) {
      return NextResponse.json({ error: 'message too long (max 300 chars)' }, { status: 400 });
    }

    if (!validSeverities.has(severity)) {
      return NextResponse.json(
        { error: 'severity must be one of: low, medium, high' },
        { status: 400 },
      );
    }

    const anomaly = await prisma.anomaly.create({
      data: {
        shipmentId: id,
        message: body.message.trim(),
        severity,
      },
    });

    return NextResponse.json(anomaly, { status: 201 });
  } catch (error) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    console.error('Error creating anomaly:', error);
    return NextResponse.json({ error: 'Failed to create anomaly' }, { status: 500 });
  }
}
