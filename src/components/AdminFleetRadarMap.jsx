import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, Navigation, MapPin } from 'lucide-react';

export default function AdminFleetRadarMap({
  riderLocations = {},
  orders = [],
  height = '420px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.8970, 80.0720], // Center of Perungalathur-Vandalur-Mannivakkam
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when rider locations or orders change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Plot Restaurant Hubs
    const hubs = [
      { name: 'SS Hyderabad (Perungalathur)', coords: [12.9056, 80.0832], type: 'res' },
      { name: 'Hotel Ananda Bhavan (Vandalur)', coords: [12.8893, 80.0815], type: 'res' },
      { name: 'Muniyandi Vilas (Mannivakkam)', coords: [12.8941, 80.0526], type: 'res' }
    ];

    hubs.forEach(h => {
      const icon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div class="pin-bubble restaurant"><span>🏪</span></div><div class="pin-title">${h.name.split(' ')[0]}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      L.marker(h.coords, { icon })
        .bindPopup(`<strong>${h.name}</strong><br/>Suburban Restaurant Hub`)
        .addTo(markersLayerRef.current);
    });

    // 2. Plot Active Riders
    Object.values(riderLocations).forEach(rider => {
      if (!rider.lat || !rider.lng) return;

      const icon = L.divIcon({
        className: 'custom-map-pin bike-pin',
        html: `<div class="pin-bubble bike animate-pulse-halo"><span>🏍️</span></div><div class="pin-title">${rider.riderName || 'Rider'}</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      L.marker([rider.lat, rider.lng], { icon })
        .bindPopup(`
          <strong>${rider.riderName} (ID: ${rider.riderId})</strong><br/>
          Speed: ${rider.speed || 24} km/h • Heading: ${rider.heading || 0}°<br/>
          Zone: ${rider.locality || 'Suburban Belt'}
        `)
        .addTo(markersLayerRef.current);

      // If rider has an active trip, draw route line to customer drop
      const activeOrder = orders.find(o => o.riderId === rider.riderId && o.status === 'OUT_FOR_DELIVERY');
      if (activeOrder) {
        // Drop coordinates based on locality
        let dropCoords = [12.9095, 80.0895];
        if (activeOrder.locality === 'Vandalur') dropCoords = [12.8795, 80.0780];
        if (activeOrder.locality === 'Mannivakkam') dropCoords = [12.8990, 80.0620];

        L.polyline([[rider.lat, rider.lng], dropCoords], {
          color: '#10b981',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.85
        }).addTo(markersLayerRef.current);

        const dropIcon = L.divIcon({
          className: 'custom-map-pin customer-pin',
          html: `<div class="pin-bubble customer"><span>📍</span></div><div class="pin-title">${activeOrder.orderId}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker(dropCoords, { icon: dropIcon })
          .bindPopup(`<strong>Delivering Order #${activeOrder.orderId}</strong><br/>${activeOrder.customerAddress}`)
          .addTo(markersLayerRef.current);
      }
    });

  }, [riderLocations, orders]);

  const activeRidersList = Object.values(riderLocations);

  return (
    <div className="admin-fleet-radar-container animate-fade">
      <div className="fleet-radar-header-bar">
        <div className="fleet-radar-title">
          <Navigation size={18} className="text-crimson" />
          <h3>Suburban Fleet GPS Radar (OpenStreetMap)</h3>
          <span className="live-dot-pulse"></span>
        </div>
        <div className="fleet-radar-metrics">
          <span className="fleet-metric-pill">
            <Bike size={13} />
            <strong>{activeRidersList.length} Riders Online</strong>
          </span>
          <span className="fleet-metric-pill">
            <MapPin size={13} />
            <span>Perungalathur • Vandalur • Mannivakkam Belt</span>
          </span>
        </div>
      </div>

      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%', borderRadius: 'var(--radius-md)' }}
        className="leaflet-fleet-map"
      />

      {/* Fleet Status Grid */}
      <div className="fleet-riders-ledger-grid">
        {activeRidersList.map(r => (
          <div key={r.riderId} className="fleet-rider-card">
            <div className="fleet-rider-avatar">🏍️</div>
            <div className="fleet-rider-details">
              <strong>{r.riderName} ({r.riderId})</strong>
              <span>GPS: {Number(r.lat).toFixed(4)}, {Number(r.lng).toFixed(4)} • Speed: {r.speed || 24} km/h</span>
              <small className="text-green">● Active in {r.locality || 'Corridor'}</small>
            </div>
            <button 
              className="btn-inspect-rider"
              onClick={() => {
                if (mapInstanceRef.current && r.lat && r.lng) {
                  mapInstanceRef.current.setView([r.lat, r.lng], 16, { animate: true });
                }
              }}
            >
              Zoom
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
