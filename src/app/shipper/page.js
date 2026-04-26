'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import MapLoader from '@/components/MapLoader';

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

export default function ShipperDashboard() {
  const [selectedRoute, setSelectedRoute] = useState('sea');
  const [newUpdate, setNewUpdate] = useState('');
  const [shipments, setShipments] = useState([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [updates, setUpdates] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [analytics, setAnalytics] = useState({
    widgets: [
      { title: 'Total Shipments', value: 0, change: null },
      { title: 'Active Shipments', value: 0, change: null },
      { title: 'Delayed Shipments', value: 0, change: null },
      { title: 'Risk Distribution', chart: true, riskData: [] },
    ],
    riskData: [],
  });
  const [shipmentForm, setShipmentForm] = useState({
    source: '',
    destination: '',
    cargoType: 'Electronics',
    priority: 'Standard',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [seedStatus, setSeedStatus] = useState('');
  const [storyMode, setStoryMode] = useState('normal');

  const routes = {
    air: { icon: PlaneIcon, name: 'Air', time: '2 days', cost: '$5000', co2: 'High' },
    sea: { icon: ShipIcon, name: 'Sea', time: '14 days', cost: '$2000', co2: 'Low' },
    road: { icon: TruckIcon, name: 'Road', time: '5 days', cost: '$3000', co2: 'Medium' },
    rail: { icon: TruckIcon, name: 'Rail', time: '7 days', cost: '$2500', co2: 'Low' },
    multi: { icon: TruckIcon, name: 'Multi-modal', time: '10 days', cost: '$3500', co2: 'Medium' }
  };

  const costVsTime = [
    { mode: 'Air', cost: 5000, time: 2 },
    { mode: 'Sea', cost: 2000, time: 14 },
    { mode: 'Road', cost: 3000, time: 5 },
    { mode: 'Rail', cost: 2500, time: 7 }
  ];

  const loadShipments = useCallback(async () => {
    try {
      const response = await fetch('/api/shipments');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch shipments');
      }
      setShipments(data);
      if (data.length > 0 && !selectedShipmentId) {
        setSelectedShipmentId(data[0].id);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [selectedShipmentId]);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
      setAnalytics(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, []);

  const loadShipmentDetails = useCallback(async (id) => {
    if (!id) return;
    try {
      const [updatesResponse, anomaliesResponse] = await Promise.all([
        fetch(`/api/shipments/${id}/updates`),
        fetch(`/api/shipments/${id}/anomalies`),
      ]);
      const updatesData = await updatesResponse.json();
      const anomaliesData = await anomaliesResponse.json();
      if (!updatesResponse.ok) {
        throw new Error(updatesData.error || 'Failed to fetch updates');
      }
      if (!anomaliesResponse.ok) {
        throw new Error(anomaliesData.error || 'Failed to fetch anomalies');
      }
      setUpdates(updatesData.updates ?? []);
      setAnomalies(anomaliesData.anomalies ?? []);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, []);

  useEffect(() => {
    loadShipments();
    loadAnalytics();
  }, [loadShipments, loadAnalytics]);

  useEffect(() => {
    loadShipmentDetails(selectedShipmentId);
  }, [selectedShipmentId, loadShipmentDetails]);

  const riskData = analytics.riskData?.length > 0
    ? analytics.riskData
    : [
      { name: 'Low', value: 0, color: '#10b981' },
      { name: 'Medium', value: 0, color: '#f59e0b' },
      { name: 'High', value: 0, color: '#ef4444' },
    ];

  const widgets = analytics.widgets || [];

  const handleAddUpdate = async () => {
    if (!selectedShipmentId) {
      setErrorMessage('Create a shipment first to add updates.');
      return;
    }
    if (newUpdate.trim()) {
      try {
        const response = await fetch(`/api/shipments/${selectedShipmentId}/updates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newUpdate, type: 'manual' }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to add update');
        }
        setUpdates((prev) => [data, ...prev]);
        setNewUpdate('');
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  };

  const handleCreateShipment = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create shipment');
      }
      setShipmentForm({
        source: '',
        destination: '',
        cargoType: 'Electronics',
        priority: 'Standard',
      });
      setShipments((prev) => [data, ...prev]);
      setSelectedShipmentId(data.id);
      setErrorMessage('');
      loadAnalytics();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSeedDemo = async (scenario = 'normal') => {
    try {
      const response = await fetch(`/api/demo/seed?scenario=${scenario}`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed demo data');
      }
      setStoryMode(data.scenario || scenario);
      setSeedStatus(`Story mode "${data.scenario || scenario}" loaded (${data.count} shipments).`);
      setErrorMessage('');
      await loadShipments();
      await loadAnalytics();
    } catch (error) {
      setSeedStatus('');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">SmartLogix AI - Shipper Dashboard</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">Logout</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Create/Manage Shipment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Create New Shipment</h2>
              <div className="mb-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSeedDemo('normal')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                >
                  Normal Story
                </button>
                <button
                  type="button"
                  onClick={() => handleSeedDemo('disruption')}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                >
                  Disruption Story
                </button>
                <button
                  type="button"
                  onClick={() => handleSeedDemo('recovery')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                >
                  Recovery Story
                </button>
                {seedStatus ? <p className="text-sm text-green-700">{seedStatus}</p> : null}
              </div>
              <p className="mb-3 text-xs text-gray-500">Current story mode: {storyMode}</p>
              <form onSubmit={handleCreateShipment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input type="text" value={shipmentForm.source} onChange={(e) => setShipmentForm((prev) => ({ ...prev, source: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter source city" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input type="text" value={shipmentForm.destination} onChange={(e) => setShipmentForm((prev) => ({ ...prev, destination: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter destination city" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
                  <select value={shipmentForm.cargoType} onChange={(e) => setShipmentForm((prev) => ({ ...prev, cargoType: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Electronics</option>
                    <option>Food</option>
                    <option>Chemicals</option>
                    <option>Textiles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                  <select value={shipmentForm.priority} onChange={(e) => setShipmentForm((prev) => ({ ...prev, priority: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Standard</option>
                    <option>Express</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    Create Shipment
                  </button>
                </div>
              </form>
            </div>

            {/* Route Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Route Selection</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(routes).map(([key, route]) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRoute(key)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedRoute === key ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-8 h-8 mb-2 text-gray-600" />
                      <h3 className="font-semibold">{route.name}</h3>
                      <p className="text-sm text-gray-600">Time: {route.time}</p>
                      <p className="text-sm text-gray-600">Cost: {route.cost}</p>
                      <p className="text-sm text-gray-600">CO2: {route.co2}</p>
                    </button>
                  );
                })}
              </div>
              {/* Route Preview */}
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-600">Route Preview: {routes[selectedRoute].name} route visualization</p>
              </div>
            </div>

            {/* Live Tracking */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Live Tracking - Multiple Shipments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg h-64 p-4 overflow-y-auto">
                  {shipments.length === 0 ? (
                    <p className="text-gray-600">No shipments yet. Create your first shipment above.</p>
                  ) : (
                    <div className="space-y-2">
                      {shipments.map((shipment) => (
                        <button
                          key={shipment.id}
                          type="button"
                          onClick={() => setSelectedShipmentId(shipment.id)}
                          className={`w-full text-left p-3 rounded-lg border ${selectedShipmentId === shipment.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                        >
                          <p className="font-medium text-gray-900">{shipment.source} to {shipment.destination}</p>
                          <p className="text-sm text-gray-600">Status: {shipment.status} | Risk: {shipment.riskScore}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-gray-100 rounded-lg h-64 relative overflow-hidden">
                  {(() => {
                    const selectedShipment = shipments.find(s => s.id === selectedShipmentId);
                    if (selectedShipment) {
                      return <MapLoader source={selectedShipment.source} destination={selectedShipment.destination} />;
                    }
                    return <div className="w-full h-full flex items-center justify-center text-gray-500">Select a shipment to view map</div>;
                  })()}
                </div>
              </div>
            </div>

            {/* Operational Insights */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Operational Insights</h2>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">On-time Projection</p>
                  <p className="text-xl font-bold text-blue-700">{analytics.metrics?.onTimeProjection ?? 0}%</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Avg Delay Prediction</p>
                  <p className="text-xl font-bold text-amber-700">{analytics.metrics?.avgDelayPrediction ?? 0}%</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Avg ETA</p>
                  <p className="text-xl font-bold text-emerald-700">{analytics.metrics?.avgEtaHours ?? 0}h</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Efficiency Score</h3>
                  <div className="text-4xl font-bold text-green-600 mb-2">{analytics.metrics?.onTimeProjection ?? 0}%</div>
                  <p className="text-sm text-gray-600">Projected on-time deliveries</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Cost vs Time Analysis</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={costVsTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mode" />
                      <YAxis yAxisId="cost" orientation="left" />
                      <YAxis yAxisId="time" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="cost" dataKey="cost" fill="#3b82f6" />
                      <Bar yAxisId="time" dataKey="time" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Route Optimization Suggestions</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Average ETA forecast: {analytics.metrics?.avgEtaHours ?? 0} hours</li>
                  <li>• Predicted delay risk index: {analytics.metrics?.avgDelayPrediction ?? 0}%</li>
                  <li>• Prioritize lanes with High risk score in the tracking panel</li>
                </ul>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">High-Risk Lanes (Top 5)</h3>
                <div className="space-y-2">
                  {(analytics.leaderboard || []).length === 0 ? (
                    <p className="text-sm text-gray-600">No lanes available.</p>
                  ) : (analytics.leaderboard || []).map((lane) => (
                    <div key={lane.id} className="p-2 rounded bg-gray-50 flex items-center justify-between text-sm">
                      <span>{lane.lane}</span>
                      <span className="font-semibold text-red-600">{lane.predictedDelayPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Internal Updates Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Internal Updates</h2>
              {errorMessage ? <p className="text-sm text-red-600 mb-3">{errorMessage}</p> : null}
              <div className="mb-4">
                <textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows="3"
                  placeholder="Enter update (e.g., 'Delay due to warehouse issue')"
                />
                <button
                  onClick={handleAddUpdate}
                  className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Add Update
                </button>
              </div>
              <div className="space-y-2">
                {updates.map((update) => (
                  <div key={update.id ?? `${update.message}-${update.time}`} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{update.message}</p>
                    <p className="text-xs text-gray-600">{update.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomaly Detection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Anomaly Detection</h2>
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <div key={anomaly.id ?? anomaly.message} className={`p-3 rounded-lg ${anomaly.severity === 'high' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-start">
                      <ExclamationIcon className={`w-5 h-5 mr-2 mt-0.5 ${anomaly.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{anomaly.message}</p>
                        <p className="text-xs text-gray-600 capitalize">{anomaly.severity} severity</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-2 gap-4">
              {widgets.map((widget, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{widget.title}</h3>
                  {widget.chart ? (
                    <ResponsiveContainer width="100%" height={60}>
                      <PieChart>
                        <Pie data={riskData} dataKey="value" cx="50%" cy="50%" innerRadius={15} outerRadius={25}>
                          {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{widget.value}</p>
                      {widget.change ? (
                        <p className={`text-sm ${widget.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{widget.change}</p>
                      ) : null}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}