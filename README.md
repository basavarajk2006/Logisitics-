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

## Backend Setup (Prisma + API Routes)

1. Add a `.env` file in project root:
```bash
DATABASE_URL="file:./dev.db"
```

2. Generate the Prisma client and sync schema:
```bash
npx prisma generate
npx prisma db push
```

3. Available API routes:
- `GET /api/shipments` - list all shipments (with recent updates/anomalies)
- `POST /api/shipments` - create shipment (`source`, `destination`, `cargoType`, `priority`)
- `GET /api/shipments/:id` - fetch one shipment with full history
- `PATCH /api/shipments/:id` - update shipment fields (`status`, `eta`, `riskScore`, etc.)
- `DELETE /api/shipments/:id` - delete shipment
- `GET /api/shipments/:id/updates` and `POST /api/shipments/:id/updates`
- `GET /api/shipments/:id/anomalies` and `POST /api/shipments/:id/anomalies`
- `GET /api/analytics` - dashboard metrics and risk distribution

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
