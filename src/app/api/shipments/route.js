import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeShipmentIntelligence } from '@/lib/intelligence';

function formatShipment(shipment) {
  const intelligence = computeShipmentIntelligence(shipment);
  return {
    ...shipment,
    riskScore: intelligence.riskScore,
    eta: intelligence.eta,
    predictedDelayPercent: intelligence.predictedDelayPercent,
    explainability: intelligence.explainability,
    recommendations: intelligence.recommendations,
    updates: shipment.updates ?? [],
    anomalies: shipment.anomalies ?? [],
  };
}

function normalizeInput(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export async function GET() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        anomalies: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(shipments.map(formatShipment));
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const source = normalizeInput(body.source);
    const destination = normalizeInput(body.destination);
    const cargoType = normalizeInput(body.cargoType);
    const priority = normalizeInput(body.priority);
    const requiredFields = ['source', 'destination', 'cargoType', 'priority'];
    const normalized = { source, destination, cargoType, priority };
    const missingField = requiredFields.find((field) => !normalized[field]);

    if (missingField) {
      return NextResponse.json(
        { error: `Missing required field: ${missingField}` },
        { status: 400 },
      );
    }

    if ([source, destination, cargoType, priority].some((item) => item.length > 80)) {
      return NextResponse.json({ error: 'Input values exceed allowed length' }, { status: 400 });
    }

    const newShipment = await prisma.shipment.create({
      data: {
        source,
        destination,
        cargoType,
        priority,
        status: 'In Transit',
        riskScore: 'Low',
        eta: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16),
      },
      include: {
        updates: true,
        anomalies: true,
      },
    });

    const intelligence = computeShipmentIntelligence(newShipment);
    await prisma.shipment.update({
      where: { id: newShipment.id },
      data: {
        riskScore: intelligence.riskScore,
        eta: intelligence.eta,
      },
    });

    return NextResponse.json(formatShipment({ ...newShipment, ...intelligence }), { status: 201 });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
