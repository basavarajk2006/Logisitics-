import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const supportedActions = new Set(['reroute', 'notify_buyer', 'mark_priority']);

export async function POST(request, { params }) {
  console.log("=== HIT ACTIONS API ===");
  try {
    const { id } = await params;
    const body = await request.json();
    const action = String(body.action || '').trim().toLowerCase();

    if (!supportedActions.has(action)) {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const updates = [];
    let patchData = {};

    if (action === 'reroute') {
      patchData = { riskScore: 'Medium' };
      updates.push({
        shipmentId: id,
        type: 'action',
        time: new Date().toLocaleTimeString(),
        message: 'Ops reroute action triggered for this lane',
      });
    }

    if (action === 'notify_buyer') {
      updates.push({
        shipmentId: id,
        type: 'action',
        time: new Date().toLocaleTimeString(),
        message: 'Buyer notified with proactive delay and ETA update',
      });
    }

    if (action === 'mark_priority') {
      patchData = { priority: 'Urgent' };
      updates.push({
        shipmentId: id,
        type: 'action',
        time: new Date().toLocaleTimeString(),
        message: 'Shipment priority elevated to urgent for mitigation',
      });
    }

    if (Object.keys(patchData).length > 0) {
      await prisma.shipment.update({
        where: { id },
        data: patchData,
      });
    }

    if (updates.length > 0) {
      await prisma.update.createMany({ data: updates });
    }

    return NextResponse.json({
      success: true,
      action,
      message: 'Action executed successfully',
    });
  } catch (error) {
    console.error('Error executing shipment action:', error);
    return NextResponse.json({ error: 'Failed to execute action' }, { status: 500 });
  }
}
