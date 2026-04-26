import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeShipmentIntelligence } from '@/lib/intelligence';

function isInvalidString(value) {
  return value !== undefined && (typeof value !== 'string' || value.trim().length === 0);
}

export async function GET(_request, context) {
  try {
    const { id } = await context.params;
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
        },
        anomalies: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...shipment,
      ...computeShipmentIntelligence(shipment),
    });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const allowedFields = ['status', 'eta', 'riskScore', 'source', 'destination', 'cargoType', 'priority'];
    const data = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (isInvalidString(body[field])) {
          return NextResponse.json(
            { error: `Field "${field}" must be a non-empty string` },
            { status: 400 },
          );
        }
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    const updated = await prisma.shipment.update({
      where: { id },
      data,
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        anomalies: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const intelligence = computeShipmentIntelligence(updated);
    await prisma.shipment.update({
      where: { id },
      data: {
        riskScore: intelligence.riskScore,
        eta: intelligence.eta,
      },
    });

    return NextResponse.json({
      ...updated,
      ...intelligence,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    console.error('Error updating shipment:', error);
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;
    await prisma.shipment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    console.error('Error deleting shipment:', error);
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
}
