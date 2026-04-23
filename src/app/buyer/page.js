'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Custom Icon Components
const TruckIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 18h-2v-4h2v4zM20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-5 0h3.83L18 12h-3V8z" />
  </svg>
);

const ShipIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14l4 4v-4h2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2z" />
  </svg>
);

const PlaneIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10.18 9L5 6.5L7 4L10.18 6L16.18 0H19L13 6L15 8L10.18 9ZM19 15L15 8L13 10L18 15H19ZM3 13L8 15L3 17V13Z" />
  </svg>
);

const ExclamationIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

export default function BuyerDashboard() {
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // New York
  const [progress, setProgress] = useState(65);

  // Mock data
  const shipmentData = {
    id: 'SLX-2024-001',
    status: 'In Transit',
    eta: '2024-03-30 14:00',
    riskScore: 'Medium',
    destination: 'Los Angeles, CA'
  };

  const insights = [
    'Heavy rainfall expected',
    'Port congestion detected',
    'Late dispatch from origin'
  ];

  const recommendations = [
    'Reroute via alternate port',
    'Delay unloading schedule',
    'Switch to road transport for last mile'
  ];

  const alerts = [
    { message: 'Shipment delayed by 2 hours', time: '10:30 AM' },
    { message: 'Congestion detected ahead', time: '9:15 AM' }
  ];

  const deliveryTrends = [
    { month: 'Jan', time: 5.2 },
    { month: 'Feb', time: 4.8 },
    { month: 'Mar', time: 6.1 },
    { month: 'Apr', time: 5.5 },
    { month: 'May', time: 4.9 },
    { month: 'Jun', time: 5.3 }
  ];

  const delayFrequency = [
    { cause: 'Weather', count: 12 },
    { cause: 'Traffic', count: 8 },
    { cause: 'Equipment', count: 5 },
    { cause: 'Human Error', count: 3 }
  ];

  const performanceMetrics = [
    { name: 'On-Time Delivery', value: 94 },
    { name: 'Cost Efficiency', value: 87 },
    { name: 'Customer Satisfaction', value: 92 }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 0.5, 100));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">SmartLogix AI - Buyer Dashboard</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">Logout</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Map and Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Shipment Tracking */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Live Shipment Tracking</h2>
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                {/* Simple World Map Placeholder */}
                <svg viewBox="0 0 1000 500" className="w-full h-full">
                  <rect width="1000" height="500" fill="#e5e7eb" />
                  {/* Simple continents */}
                  <path d="M200,150 L300,120 L400,150 L350,200 L250,180 Z" fill="#d1d5db" />
                  <path d="M500,100 L600,80 L700,120 L650,180 L550,160 Z" fill="#d1d5db" />
                  <path d="M100,300 L200,280 L250,350 L150,370 Z" fill="#d1d5db" />
                  {/* Animated route */}
                  <path d="M250,180 Q400,150 550,160" stroke="#3b82f6" strokeWidth="3" fill="none">
                    <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" repeatCount="indefinite" />
                  </path>
                  {/* Moving marker */}
                  <circle r="8" fill="#ef4444" className="animate-pulse">
                    <animateMotion dur="10s" repeatCount="indefinite">
                      <path d="M250,180 Q400,150 550,160" />
                    </animateMotion>
                  </circle>
                </svg>
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded p-2 text-sm">
                  <p>Current: New York, NY</p>
                  <p>Destination: {shipmentData.destination}</p>
                  <p>Progress: {progress.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Shipment Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Shipment Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Shipment ID</p>
                  <p className="font-semibold">{shipmentData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p className={`font-semibold ${shipmentData.status === 'In Transit' ? 'text-blue-600' : 'text-green-600'}`}>{shipmentData.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ETA</p>
                  <p className="font-semibold">{shipmentData.eta}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delay Risk Score</p>
                  <p className={`font-semibold ${shipmentData.riskScore === 'Low' ? 'text-green-600' : shipmentData.riskScore === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>{shipmentData.riskScore}</p>
                </div>
              </div>
            </div>

            {/* Historical Data */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Historical Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Delivery Time Trends</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={deliveryTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Delay Frequency</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={delayFrequency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cause" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Panels */}
          <div className="space-y-8">
            {/* AI Prediction Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">AI Prediction</h2>
              <div className="text-center">
                <p className="text-lg font-medium text-red-600 mb-2">Delay Prediction: High Risk</p>
                <p className="text-3xl font-bold text-red-600 mb-2">78%</p>
                <p className="text-sm text-gray-600">Confidence</p>
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={[{ time: 'Now', risk: 78 }, { time: '+2h', risk: 85 }, { time: '+4h', risk: 92 }]}>
                    <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} />
                    <XAxis dataKey="time" />
                    <YAxis hide />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explainable Insights */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Explainable Insights</h2>
              <p className="text-sm text-gray-600 mb-2">Delay likely due to:</p>
              <ul className="space-y-1">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Recommendations</h2>
              <p className="text-sm text-gray-600 mb-2">Suggested Actions:</p>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Real-time Alerts</h2>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                    <ExclamationIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-600">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}