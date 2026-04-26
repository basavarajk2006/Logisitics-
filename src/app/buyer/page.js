'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import MapLoader from '@/components/MapLoader';

// Custom Icon Components
const ExclamationIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);

export default function BuyerDashboard() {
  const [shipmentData, setShipmentData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [riskTrend, setRiskTrend] = useState([
    { time: 'Now', risk: 10 },
    { time: '+2h', risk: 10 },
    { time: '+4h', risk: 10 },
  ]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [actionStatus, setActionStatus] = useState('');
  
  // New State for Killer Features
  const [simulating, setSimulating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLog, setChatLog] = useState([{ sender: 'ai', text: 'Hi! I am LogiChat. Ask me about your shipments or risk metrics.' }]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const [smsMock, setSmsMock] = useState(null);

  const deliveryTrends = [
    { month: 'Jan', time: 5.2 }, { month: 'Feb', time: 4.8 }, { month: 'Mar', time: 6.1 },
    { month: 'Apr', time: 5.5 }, { month: 'May', time: 4.9 }, { month: 'Jun', time: 5.3 }
  ];

  const delayFrequency = [
    { cause: 'Weather', count: 12 }, { cause: 'Traffic', count: 8 }, { cause: 'Equipment', count: 5 }, { cause: 'Human Error', count: 3 }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const shipmentsResponse = await fetch('/api/shipments');
        const shipments = await shipmentsResponse.json();
        if (!shipmentsResponse.ok) throw new Error(shipments.error || 'Failed to fetch shipments');

        const activeShipment = shipments[0];
        if (!activeShipment) {
          setShipmentData(null);
          setAlerts([]);
          return;
        }

        setShipmentData({
          id: activeShipment.id,
          source: activeShipment.source || 'N/A',
          status: activeShipment.status,
          eta: activeShipment.eta || 'N/A',
          riskScore: activeShipment.riskScore,
          destination: activeShipment.destination || 'N/A',
          predictedDelayPercent: activeShipment.predictedDelayPercent ?? 0,
          explainability: activeShipment.explainability || [],
          recommendations: activeShipment.recommendations || [],
        });

        const updatesResponse = await fetch(`/api/shipments/${activeShipment.id}/updates`);
        const updatesData = await updatesResponse.json();
        if (updatesResponse.ok) setAlerts((updatesData.updates || []).slice(0, 5));

        const riskMap = { low: 20, medium: 55, high: 85 };
        const riskValue = riskMap[String(activeShipment.riskScore || '').toLowerCase()] ?? 30;
        setRiskTrend([
          { time: 'Now', risk: riskValue },
          { time: '+2h', risk: Math.min(100, riskValue + 8) },
          { time: '+4h', risk: Math.min(100, riskValue + 15) },
        ]);

        const analyticsResponse = await fetch('/api/analytics');
        if (analyticsResponse.ok) setAnalytics(await analyticsResponse.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, chatOpen]);

  const runAction = async (action) => {
    if (!shipmentData?.id) return;
    try {
      const response = await fetch(`/api/shipments/${shipmentData.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setActionStatus(data.message);
      
      const updatesResponse = await fetch(`/api/shipments/${shipmentData.id}/updates`);
      if (updatesResponse.ok) setAlerts(((await updatesResponse.json()).updates || []).slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setShipmentData(prev => ({
        ...prev,
        riskScore: 'High',
        predictedDelayPercent: 92,
        explainability: ['Simulated: Severe blizzard on I-80', 'Simulated: Traffic bottleneck at routing hub'],
        recommendations: ['Reroute via Southern corridor', 'Inform customer of 14hr delay']
      }));
      setRiskTrend([{ time: 'Now', risk: 92 }, { time: '+2h', risk: 95 }, { time: '+4h', risk: 88 }]);
      setSmsMock({
        message: "🚨 SmartLogix Alert: Shipment to " + (shipmentData?.destination || 'Destination') + " delayed by weather. AI recommends rerouting via South corridor. Reply YES to approve.",
        time: new Date().toLocaleTimeString()
      });
    }, 300);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newChat = [...chatLog, { sender: 'user', text: chatInput }];
    setChatLog(newChat);
    setChatInput('');
    
    setTimeout(() => {
      let reply = "I'm monitoring the situation.";
      const lower = newChat[newChat.length - 1].text.toLowerCase();
      if (lower.includes('risk')) reply = `The current delay risk for shipment ${shipmentData?.id?.substring(0,6) || 'Unknown'} is ${shipmentData?.riskScore || 'Low'}.`;
      if (lower.includes('delay') || lower.includes('why')) reply = "Delays are typically caused by weather and traffic. " + (shipmentData?.explainability?.[0] || "");
      if (lower.includes('hi') || lower.includes('hello')) reply = "Hello! How can I help you manage your logistics today?";
      setChatLog(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative pb-10">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">SmartLogix AI</h1>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Logout</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Interactive Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Live Interactive Map
                </h2>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border">Live Telemetry</div>
              </div>
              <div className="h-[400px] w-full bg-gray-100 relative">
                <MapLoader source={shipmentData?.source} destination={shipmentData?.destination} />
                {/* Mock Weather Layer Overlay */}
                {shipmentData?.riskScore === 'High' && (
                  <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000]">
                    <div className="w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Scenario Simulator */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Digital Twin Simulator</h2>
                <p className="text-sm text-gray-600 mb-4">Test how the AI intelligence engine reacts to dynamic supply chain disruptions.</p>
                <div className="space-y-3">
                  <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border">
                    <option>Severe Weather Event</option>
                    <option>Port Strike / Labor Issue</option>
                    <option>Traffic Bottleneck</option>
                  </select>
                  <button 
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow transition-all flex justify-center items-center gap-2"
                  >
                    {simulating ? <span className="animate-pulse">Simulating...</span> : 'Inject Anomaly Event'}
                  </button>
                </div>
              </div>

              {/* Sustainability Tracker */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10"></div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sustainability Tracker</h2>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-bold text-green-600">2.4</span>
                  <span className="text-sm text-gray-500 mb-1">tons CO₂</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Estimated emissions for current route</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <p className="text-xs font-medium text-green-700">🌱 AI Reroute can save 0.3 tons of CO₂</p>
              </div>
            </div>

            {/* Historical Data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Historical Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-600">Delivery Time Trends</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={deliveryTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="time" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-600">Delay Frequency Causes</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={delayFrequency}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="cause" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                      <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Intelligence Panels */}
          <div className="space-y-6">
            
            {/* AI Prediction Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">AI Risk Prediction</h2>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl mb-4">
                <span className={`text-sm font-medium px-3 py-1 rounded-full mb-3 ${shipmentData?.riskScore === 'Low' ? 'bg-green-100 text-green-700' : shipmentData?.riskScore === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {shipmentData?.riskScore || 'Low'} Risk
                </span>
                <div className="flex items-end gap-1">
                  <span className={`text-5xl font-bold ${shipmentData?.riskScore === 'High' ? 'text-red-600' : 'text-gray-900'}`}>
                    {shipmentData?.predictedDelayPercent ?? riskTrend[0].risk}
                  </span>
                  <span className="text-xl font-semibold text-gray-500 mb-1">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Delay Probability Confidence</p>
              </div>
            </div>

            {/* Simulated SMS Alert Toast */}
            {smsMock && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 relative animate-[slideIn_0.3s_ease-out]">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">SMS Sent</p>
                      <p className="text-xs text-gray-500">{smsMock.time}</p>
                    </div>
                  </div>
                  <button onClick={() => setSmsMock(null)} className="text-gray-400 hover:text-gray-600">×</button>
                </div>
                <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg border border-gray-200">{smsMock.message}</p>
              </div>
            )}

            {/* Explainable Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Explainable Insights</h2>
              <ul className="space-y-3">
                {(shipmentData?.explainability?.length ? shipmentData.explainability : ['Awaiting telemetry...']).map((insight, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Action Recommendations</h2>
              <ul className="space-y-2 mb-5">
                {(shipmentData?.recommendations?.length ? shipmentData.recommendations : ['Hold route until updates']).map((rec, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                    {rec}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <button onClick={() => runAction('reroute')} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors">
                  Execute Reroute
                </button>
              </div>
              {actionStatus && <p className="mt-3 text-sm font-medium text-green-600 text-center">{actionStatus}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chat Copilot */}
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all ${chatOpen ? 'h-[400px]' : 'h-14'}`}>
        {chatOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-[380px] mb-4 flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold text-sm">LogiChat Copilot</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-gray-200">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about risk or ETA..."
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-full py-2 px-4 text-sm transition-colors"
              />
            </form>
          </div>
        )}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-gray-900 hover:bg-black text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
        >
          {chatOpen ? <span className="text-xl">×</span> : <ChatIcon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}