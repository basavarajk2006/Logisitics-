# SmartLogix AI – Real-Time Logistics Intelligence Platform

A modern, professional web application UI for logistics intelligence, built with Next.js and JavaScript.

## Features

- **Landing Page**: Hero section with animated background and call-to-action buttons
- **Login/Role Selection**: Simple authentication with buyer and shipper roles
- **Buyer Dashboard**: Live shipment tracking, AI predictions, insights, and analytics
- **Shipper Dashboard**: Shipment management, route selection, anomaly detection, and operational insights

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Heroicons
- **Animations**: CSS animations and transitions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.js              # Landing page
│   ├── login/
│   │   └── page.js          # Login/Role selection
│   ├── buyer/
│   │   └── page.js          # Buyer dashboard
│   └── shipper/
│       └── page.js          # Shipper dashboard
├── globals.css              # Global styles
└── layout.js                # Root layout
```

## UI Design

- Clean, futuristic design with light theme
- Blue/teal accent colors and subtle gradients
- Responsive design optimized for desktop
- Interactive elements with hover effects and animations
- Data-driven dashboard with charts and widgets

## Mock Features

- Simulated real-time shipment tracking
- AI prediction panels with confidence scores
- Anomaly detection alerts
- Historical analytics with trend charts
- Route optimization suggestions
- Internal update system for shippers

## Navigation Flow

1. Landing Page → Login Page
2. Login → Buyer Dashboard or Shipper Dashboard
3. Dashboards include logout links back to landing page
