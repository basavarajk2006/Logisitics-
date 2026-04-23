import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-teal-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-blue-300 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-10 w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
        {/* Simple route lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600">
          <path d="M100,200 Q300,150 500,200 T800,250" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" fill="none" className="animate-pulse">
            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M200,400 Q400,350 600,400 T900,450" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="2" fill="none" className="animate-pulse">
            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="4s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            SmartLogix AI
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold text-blue-600 mb-8">
            Predict. Detect. Optimize Logistics
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Revolutionize your logistics operations with real-time tracking, AI-powered predictions, and intelligent anomaly detection. Make data-driven decisions for seamless supply chain management.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/login?role=buyer" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg">
              Login as Buyer
            </Link>
            <Link href="/login?role=shipper" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg">
              Login as Shipper
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
