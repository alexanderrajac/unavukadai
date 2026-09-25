import React, { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, Crosshair, MapPin, Store, Navigation, Phone, Maximize2 } from 'lucide-react';
import { calculateDistanceKm } from '../utils/geolocation';

// Suburban coordinate lookups for Perungalathur, Vandalur & Mannivakkam
const SUBURB_COORDS = {
  'perungalathur': {
    restaurant: [12.9056, 80.0832], // GST Road Hub / SS Hyderabad Biryani
    customer: [12.9095, 80.0895]     // Peerkankaranai / Perungalathur East
  },
  'vandalur': {
    restaurant: [12.8893, 80.0815], // Opposite Zoo Gate / Ananda Bhavan
    customer: [12.8795, 80.0780]     // Crescent Campus Quarters
  },
  'mannivakkam': {
    restaurant: [12.8941, 80.0526], // Mudichur Rd Junction / Muniyandi Vilas
    customer: [12.8990, 80.0620]     // Sri Venkateswara Nagar
  }
};

export default function LiveDeliveryMap({
  order,
  riderLiveLocation,
  height = '240px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  // Simulation progress between 0 (restaurant) and 1 (customer) for live delivery
  const [simProgress, setSimProgress] = useState(0.45);

  // Determine base coordinates from locality or restaurant name, using exact GPS if available
  const coords = useMemo(() => {
    const loc = (order?.locality || '').toLowerCase();
    let base = SUBURB_COORDS['perungalathur'];
    if (loc.includes('vandalur')) base = SUBURB_COORDS['vandalur'];
    else if (loc.includes('mannivakkam')) base = SUBURB_COORDS['mannivakkam'];

    if (order?.deliveryCoords && Array.isArray(order.deliveryCoords) && order.deliveryCoords.length === 2 && !isNaN(order.deliveryCoords[0])) {
      return {
        restaurant: base.restaurant,
        customer: [Number(order.deliveryCoords[0]), Number(order.deliveryCoords[1])]
      };
    }
    return base;
  }, [order?.locality, order?.deliveryCoords]);

  // Derived current rider position (live GPS, status-based, or animated along route)
  const riderPos = useMemo(() => {
    const status = order?.status || 'PLACED';

    if (status === 'PLACED' || status === 'PREPARING') {
      return coords.restaurant;
    }

    if (status === 'DELIVERED') {
      return coords.customer;
    }

    // If out for delivery or ready for pickup
    if (riderLiveLocation?.lat && riderLiveLocation?.lng && !isNaN(riderLiveLocation.lat)) {
      return [Number(riderLiveLocation.lat), Number(riderLiveLocation.lng)];
    }

    // Interpolate along route based on simulation progress
    const [rLat, rLng] = coords.restaurant;
    const [cLat, cLng] = coords.customer;
    return [
      rLat + (cLat - rLat) * simProgress,
      rLng + (cLng - rLng) * simProgress
    ];
  }, [order?.status, riderLiveLocation, coords, simProgress]);

  // Simulated bike movement when OUT_FOR_DELIVERY and no live external GPS feed
  useEffect(() => {
    if (order?.status !== 'OUT_FOR_DELIVERY') return;
    if (riderLiveLocation?.lat && riderLiveLocation?.lng) return;

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 0.92) return 0.25; // Loop smoothly
        return Math.min(0.92, prev + 0.04);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.status, riderLiveLocation]);

  const restaurantName = order?.restaurantName ? order.restaurantName.split(' ')[0] : 'Kitchen';
  const riderName = order?.riderName || 'Murugan S.';
  const riderPhone = order?.riderPhone || '+91 98765 43210';
  const cleanPhone = riderPhone.replace(/\s+/g, '');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);

      // Restaurant Icon
      const restaurantIcon = L.divIcon({
        className: 'custom-map-pin restaurant-pin',
        html: `<div class="pin-bubble restaurant"><span>🏪</span></div><div class="pin-title">${restaurantName}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // Customer Doorstep Icon
      const customerIcon = L.divIcon({
        className: 'custom-map-pin customer-pin',
        html: `<div class="pin-bubble customer"><span>📍</span></div><div class="pin-title">You</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // Live Rider Icon
      const bikeIcon = L.divIcon({
        className: 'custom-map-pin bike-pin',
        html: `
          <div class="pin-bubble bike animate-pulse-halo">
            <span>🏍️</span>
          </div>
          <div class="pin-title rider-label">${riderName.split(' ')[0]}</div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      L.marker(coords.restaurant, { icon: restaurantIcon }).addTo(map);
      L.marker(coords.customer, { icon: customerIcon }).addTo(map);

      const riderMarker = L.marker(riderPos, { icon: bikeIcon }).addTo(map);
      riderMarkerRef.current = riderMarker;

      const routeLine = L.polyline([coords.restaurant, riderPos, coords.customer], {
        color: '#e23744',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '5, 8'
      }).addTo(map);
      routeLineRef.current = routeLine;

      map.fitBounds([coords.restaurant, coords.customer], {
        padding: [35, 35],
        maxZoom: 15
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, restaurantName, riderName]);

  // Update rider marker & route polyline when position changes
  useEffect(() => {
    if (mapInstanceRef.current && riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(riderPos);

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([coords.restaurant, riderPos, coords.customer]);
      }
    }
  }, [riderPos, coords]);

  const distanceToCustomer = calculateDistanceKm(riderPos[0], riderPos[1], coords.customer[0], coords.customer[1]);
  const estimatedMinsRemaining = Math.max(2, Math.round(distanceToCustomer * 3.2));

  // Map Controls
  const handleFocusRider = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(riderPos, 16, { animate: true });
    }
  };

  const handleFitRoute = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([coords.restaurant, coords.customer], {
        padding: [30, 30],
        animate: true
      });
    }
  };

  const handleFocusDoorstep = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(coords.customer, 16, { animate: true });
    }
  };

  return (
    <div className="live-delivery-map-wrapper animate-fade">
      {/* Map Header Status Banner */}
      <div className="map-meta-header">
        <div className="map-badge-live">
          <span className="live-dot-pulse"></span>
          <span>
            {order?.status === 'OUT_FOR_DELIVERY' 
              ? 'RIDER ON THE WAY' 
              : order?.status === 'READY_FOR_PICKUP'
              ? 'RIDER AT RESTAURANT'
              : order?.status === 'DELIVERED'
              ? 'DELIVERY COMPLETE'
              : 'LIVE GPS ROUTE'}
          </span>
        </div>

        <div className="map-eta-pill">
          <Bike size={14} className="text-crimson" />
          <strong>{distanceToCustomer} km away</strong>
          <span className="text-muted">• ~{estimatedMinsRemaining} mins</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
        className="leaflet-map-canvas"
      />

      {/* Map Action Controls & Legend */}
      <div className="map-bottom-controls-enhanced">
        <div className="map-legend-scroll">
          <span className="legend-node">🏪 {restaurantName}</span>
          <span className="legend-arrow">→</span>
          <span className="legend-node highlight-rider">
            🏍️ {riderName.split(' ')[0]} 
            {order?.status === 'OUT_FOR_DELIVERY' && <span className="speed-tag">28 km/h</span>}
          </span>
          <span className="legend-arrow">→</span>
          <span className="legend-node">📍 Doorstep</span>
        </div>

        <div className="map-action-btn-row">
          <button 
            type="button"
            className="btn-map-quick-ctrl" 
            onClick={handleFocusRider}
            title="Focus Rider"
          >
            <Crosshair size={13} />
            <span>Rider</span>
          </button>
          
          <button 
            type="button"
            className="btn-map-quick-ctrl" 
            onClick={handleFitRoute}
            title="View Full Route"
          >
            <Maximize2 size={13} />
            <span>Route</span>
          </button>

          <button 
            type="button"
            className="btn-map-quick-ctrl" 
            onClick={handleFocusDoorstep}
            title="Focus Doorstep"
          >
            <MapPin size={13} />
            <span>Door</span>
          </button>

          {order?.status === 'OUT_FOR_DELIVERY' && (
            <a 
              href={`tel:${cleanPhone}`}
              className="btn-call-rider-map"
              title="Call Rider"
            >
              <Phone size={12} />
              <span>Call</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
