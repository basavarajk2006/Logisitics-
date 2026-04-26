'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js + Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// A component to recenter the map dynamically when coordinates change
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0])) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({ source, destination }) {
  const [sourceCoords, setSourceCoords] = useState([40.7128, -74.0060]); // Default NY
  const [destCoords, setDestCoords] = useState([34.0522, -118.2437]); // Default LA
  const [routePath, setRoutePath] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(true);

  useEffect(() => {
    async function geocode(city) {
      if (!city) return null;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      } catch (err) {
        console.error("Geocoding failed for", city, err);
      }
      return null;
    }

    async function fetchRoute() {
      try {
        // 1. Geocode source and destination
        let sCoords = await geocode(source) || [40.7128, -74.0060];
        let dCoords = await geocode(destination) || [34.0522, -118.2437];
        
        setSourceCoords(sCoords);
        setDestCoords(dCoords);

        // 2. Fetch the actual driving route from OSRM (Open Source Routing Machine) API
        // OSRM format: lon,lat;lon,lat
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${sCoords[1]},${sCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          // GeoJSON coordinates are [longitude, latitude], Leaflet expects [latitude, longitude]
          const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePath(coordinates);
        } else {
          setRoutePath([]);
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
        setRoutePath([]);
      } finally {
        setLoadingRoute(false);
      }
    }

    fetchRoute();
  }, [source, destination]);

  // Calculate center of the map based on route
  const center = [(sourceCoords[0] + destCoords[0]) / 2, (sourceCoords[1] + destCoords[1]) / 2];

  // Calculate a mock "current position" somewhere along the route
  const currentPosIndex = Math.floor(routePath.length * 0.4); // 40% of the way there
  const currentPos = routePath.length > 0 ? routePath[currentPosIndex] : center;

  return (
    <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }}>
      <MapUpdater center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | Routing by OSRM'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      <Marker position={sourceCoords} icon={icon}>
        <Popup>Source: {source || 'New York'}</Popup>
      </Marker>
      
      <Marker position={destCoords} icon={icon}>
        <Popup>Destination: {destination || 'Los Angeles'}</Popup>
      </Marker>

      {routePath.length > 0 && (
        <Marker position={currentPos} icon={icon}>
          <Popup>Current Location (In Transit)</Popup>
        </Marker>
      )}

      {/* Draw the legit road route */}
      {routePath.length > 0 ? (
        <Polyline positions={routePath} color="#3b82f6" weight={5} opacity={0.7} />
      ) : (
        // Fallback straight line if routing fails (e.g. crossing oceans where roads don't exist)
        <Polyline positions={[sourceCoords, currentPos, destCoords]} color="#9ca3af" dashArray="5, 10" />
      )}
    </MapContainer>
  );
}
