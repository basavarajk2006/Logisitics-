import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeShipmentIntelligence } from '@/lib/intelligence';

const normalScenario = [
  {
    source: 'Mumbai',
    destination: 'Delhi',
    cargoType: 'Electronics',
    priority: 'Express',
    status: 'In Transit',
    updates: [
      { message: 'Dispatch completed from Mumbai hub', type: 'ops', time: '08:30 AM' },
      { message: 'Entering Nashik corridor', type: 'tracking', time: '11:20 AM' },
    ],
    anomalies: [{ message: 'Highway congestion detected', severity: 'medium' }],
  },
  {
    source: 'Chennai',
    destination: 'Kolkata',
    cargoType: 'Chemicals',
    priority: 'Urgent',
    status: 'In Transit',
    updates: [
      { message: 'Loading completed with compliance checks', type: 'ops', time: '07:10 AM' },
      { message: 'Unexpected weather disruption on route', type: 'weather', time: '01:05 PM' },
    ],
    anomalies: [
      { message: 'Storm watch warning in transit zone', severity: 'high' },
      { message: 'Container temperature variance', severity: 'medium' },
    ],
  },
  {
    source: 'Pune',
    destination: 'Hyderabad',
    cargoType: 'Textiles',
    priority: 'Standard',
    status: 'In Transit',
    updates: [{ message: 'Route stable and on schedule', type: 'tracking', time: '09:45 AM' }],
    anomalies: [],
  },
];

const disruptionScenario = [
  {
    source: 'Jaipur',
    destination: 'Guwahati',
    cargoType: 'Chemicals',
    priority: 'Urgent',
    status: 'In Transit',
    updates: [
      { message: 'Emergency dispatch with hazard clearance', type: 'ops', time: '06:45 AM' },
      { message: 'Flood alert triggered on primary corridor', type: 'weather', time: '12:15 PM' },
    ],
    anomalies: [
      { message: 'Severe weather disruption in east corridor', severity: 'high' },
      { message: 'Route deviation due to road closure', severity: 'high' },
    ],
  },
  {
    source: 'Ahmedabad',
    destination: 'Bhubaneswar',
    cargoType: 'Food',
    priority: 'Express',
    status: 'In Transit',
    updates: [{ message: 'Cold-chain sensor shows rising temperature', type: 'sensor', time: '11:00 AM' }],
    anomalies: [{ message: 'Temperature threshold crossed for 20 minutes', severity: 'high' }],
  },
  {
    source: 'Nagpur',
    destination: 'Patna',
    cargoType: 'Electronics',
    priority: 'Urgent',
    status: 'In Transit',
    updates: [{ message: 'Traffic standstill on ring-road approach', type: 'traffic', time: '10:10 AM' }],
    anomalies: [{ message: 'Major traffic bottleneck detected', severity: 'medium' }],
  },
];

const recoveryScenario = [
  {
    source: 'Mumbai',
    destination: 'Delhi',
    cargoType: 'Electronics',
    priority: 'Express',
    status: 'In Transit',
    updates: [
      { message: 'Reroute successful, corridor now clear', type: 'action', time: '02:10 PM' },
      { message: 'ETA improved after mitigation plan', type: 'ops', time: '03:00 PM' },
    ],
    anomalies: [{ message: 'Minor congestion remains near destination', severity: 'low' }],
  },
  {
    source: 'Chennai',
    destination: 'Kolkata',
    cargoType: 'Chemicals',
    priority: 'Urgent',
    status: 'In Transit',
    updates: [
      { message: 'Weather normalized, vessel resumed planned speed', type: 'weather', time: '01:30 PM' },
    ],
    anomalies: [{ message: 'Residual compliance check delay', severity: 'medium' }],
  },
  {
    source: 'Pune',
    destination: 'Hyderabad',
    cargoType: 'Textiles',
    priority: 'Standard',
    status: 'In Transit',
    updates: [{ message: 'Shipment fully back on schedule', type: 'tracking', time: '09:45 AM' }],
    anomalies: [],
  },
];

export async function POST(request) {
  try {
    const scenario = new URL(request.url).searchParams.get('scenario');
    const selectedScenario = scenario === 'disruption'
      ? disruptionScenario
      : scenario === 'recovery'
        ? recoveryScenario
        : normalScenario;

    await prisma.anomaly.deleteMany();
    await prisma.update.deleteMany();
    await prisma.shipment.deleteMany();

    for (const item of selectedScenario) {
      const created = await prisma.shipment.create({
        data: {
          source: item.source,
          destination: item.destination,
          cargoType: item.cargoType,
          priority: item.priority,
          status: item.status,
          riskScore: 'Low',
          eta: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16),
        },
      });

      if (item.updates.length > 0) {
        await prisma.update.createMany({
          data: item.updates.map((update) => ({
            ...update,
            shipmentId: created.id,
          })),
        });
      }

      if (item.anomalies.length > 0) {
        await prisma.anomaly.createMany({
          data: item.anomalies.map((anomaly) => ({
            ...anomaly,
            shipmentId: created.id,
          })),
        });
      }

      const fullShipment = await prisma.shipment.findUnique({
        where: { id: created.id },
        include: { updates: true, anomalies: true },
      });

      const intelligence = computeShipmentIntelligence(fullShipment);
      await prisma.shipment.update({
        where: { id: created.id },
        data: {
          riskScore: intelligence.riskScore,
          eta: intelligence.eta,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo dataset seeded successfully',
      scenario: scenario || 'normal',
      count: selectedScenario.length,
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json({ error: 'Failed to seed demo data' }, { status: 500 });
  }
}
