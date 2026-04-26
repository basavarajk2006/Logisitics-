import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeShipmentIntelligence } from '@/lib/intelligence';

export async function GET() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        updates: true,
        anomalies: true,
      },
    });
    const enriched = shipments.map((shipment) => ({
      ...shipment,
      ...computeShipmentIntelligence(shipment),
    }));

    const totalShipments = enriched.length;
    const activeShipments = enriched.filter((shipment) => shipment.status === 'In Transit').length;
    const delayedShipments = enriched.filter((shipment) => shipment.riskScore === 'High').length;

    const lowRisk = enriched.filter((shipment) => shipment.riskScore === 'Low').length;
    const mediumRisk = enriched.filter((shipment) => shipment.riskScore === 'Medium').length;
    const highRisk = enriched.filter((shipment) => shipment.riskScore === 'High').length;
    const avgDelayPrediction = totalShipments === 0
      ? 0
      : Math.round(enriched.reduce((acc, item) => acc + item.predictedDelayPercent, 0) / totalShipments);
    const avgEtaHours = totalShipments === 0
      ? 0
      : Math.round(enriched.reduce((acc, item) => acc + item.etaHours, 0) / totalShipments);
    const onTimeProjection = Math.max(0, 100 - avgDelayPrediction);

    const riskData = [
      { name: 'Low', value: lowRisk, color: '#10b981' },
      { name: 'Medium', value: mediumRisk, color: '#f59e0b' },
      { name: 'High', value: highRisk, color: '#ef4444' },
    ];

    const widgets = [
      { title: 'Total Shipments', value: totalShipments, change: null, unit: 'count' },
      { title: 'Active Shipments', value: activeShipments, change: null, unit: 'count' },
      { title: 'Delayed Shipments', value: delayedShipments, change: null, unit: 'count' },
      { title: 'Risk Distribution', chart: true, riskData },
    ];

    return NextResponse.json({
      widgets,
      metrics: {
        totalShipments,
        activeShipments,
        delayedShipments,
        avgDelayPrediction,
        avgEtaHours,
        onTimeProjection,
      },
      riskData,
      leaderboard: enriched
        .sort((a, b) => b.predictedDelayPercent - a.predictedDelayPercent)
        .slice(0, 5)
        .map((shipment) => ({
          id: shipment.id,
          lane: `${shipment.source || 'N/A'} -> ${shipment.destination || 'N/A'}`,
          riskScore: shipment.riskScore,
          predictedDelayPercent: shipment.predictedDelayPercent,
        })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
