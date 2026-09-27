import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Crosshair, 
  Navigation, 
  Check, 
  X, 
  Store, 
  Compass, 
  Loader2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  calculateDistanceKm, 
  findNearestSuburb, 
  reverseGeocodeOSM, 
  SUBURB_CENTERS,
  calculateDeliveryFee 
} from '../utils/geolocation';

export default function InteractiveAddressPinMap({
  isOpen,
  onClose,
  initialCoords = [12.9056, 80.0832],
  restaurantCoords = [12.9056, 80.0832],
  restaurantName = 'Restaurant Hub',
  itemTotal = 0,
  onConfirmLocation
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  // Current selected drop coordinates
  const [coords, setCoords] = useState(() => {
    if (Array.isArray(initialCoords) && initialCoords.length === 2 && !isNaN(initialCoords[0])) {
      return [Number(initialCoords[0]), Number(initialCoords[1])];
    }
    return [12.9056, 80.0832];
  });

  const [addressDetails, setAddressDetails] = useState({
    street: '',
    locality: 'Perungalathur',
    displayName: 'Detecting address...',
    suburb: SUBURB_CENTERS[0]
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Lock body scroll on mobile when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Calculate live distance between restaurant and customer pin
  const distanceKm = useMemo(() => {
    if (!restaurantCoords || !coords) return 1.5;
    return calculateDistanceKm(restaurantCoords[0], restaurantCoords[1], coords[0], coords[1]);
  }, [restaurantCoords, coords]);

  const deliveryFee = useMemo(() => {
    return calculateDeliveryFee(distanceKm, itemTotal);
  }, [distanceKm, itemTotal]);

  // Geocode coords into human-readable street/locality
  const updateAddressFromCoords = useCallback(async (lat, lng) => {
    setIsGeocoding(true);
    const nearestSuburb = findNearestSuburb(lat, lng);
    
    try {
      const osm = await reverseGeocodeOSM(lat, lng);
      if (osm && osm.displayName) {
        setAddressDetails({
          street: osm.road || `${nearestSuburb.name} Main Road`,
          locality: osm.locality || nearestSuburb.locality,
          displayName: osm.displayName,
          suburb: nearestSuburb
        });
      } else {
        setAddressDetails({
          street: `${nearestSuburb.name} Hub`,
          locality: nearestSuburb.locality,
          displayName: `${nearestSuburb.name}, South Chennai`,
          suburb: nearestSuburb
        });
      }
    } catch {
      setAddressDetails({
        street: `${nearestSuburb.name} Area`,
        locality: nearestSuburb.locality,
        displayName: `${nearestSuburb.name}, South Chennai`,
        suburb: nearestSuburb
      });
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Update pin position when user clicks or drags
  const handleUpdatePosition = useCallback((lat, lng, shouldPan = false) => {
    const roundedLat = Math.round(lat * 100000) / 100000;
    const roundedLng = Math.round(lng * 100000) / 100000;
    const newCoords = [roundedLat, roundedLng];
    
    setCoords(newCoords);

    if (dropMarkerRef.current) {
      dropMarkerRef.current.setLatLng(newCoords);
    }

    if (routeLineRef.current && restaurantCoords) {
      routeLineRef.current.setLatLngs([restaurantCoords, newCoords]);
    }

    if (shouldPan && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(newCoords, { animate: true });
    }

    updateAddressFromCoords(roundedLat, roundedLng);
  }, [restaurantCoords, updateAddressFromCoords]);

  // Initialize or re-render map when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: coords,
          zoom: 15,
          zoomControl: false,
          attributionControl: false
        });

        // High quality OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Restaurant Pin
        if (restaurantCoords) {
          const resIcon = L.divIcon({
            className: 'custom-map-pin pin-restaurant-fixed',
            html: `
              <div class="pin-bubble restaurant">
                <span>🏪</span>
              </div>
              <div class="pin-title">${restaurantName.split(' ')[0]}</div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });
          L.marker(restaurantCoords, { icon: resIcon, interactive: false }).addTo(map);
        }

        // Draggable Customer Pin
        const customerIcon = L.divIcon({
          className: 'custom-map-pin pin-customer-draggable',
          html: `
            <div class="draggable-pin-container">
              <div class="pin-radar-ring"></div>
              <div class="pin-bubble customer-drop shadow-elevated">
                <span>📍</span>
              </div>
              <div class="pin-badge-drag">DRAG ME</div>
            </div>
          `,
          iconSize: [44, 52],
          iconAnchor: [22, 46]
        });

        const dropMarker = L.marker(coords, {
          icon: customerIcon,
          draggable: true,
          autoPan: true
        }).addTo(map);

        // Drag events
        dropMarker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          handleUpdatePosition(pos.lat, pos.lng, false);
        });

        // Click anywhere on map to reposition pin
        map.on('click', (e) => {
          handleUpdatePosition(e.latlng.lat, e.latlng.lng, true);
        });

        dropMarkerRef.current = dropMarker;

        // Route line connecting restaurant to drop pin
        if (restaurantCoords) {
          const line = L.polyline([restaurantCoords, coords], {
            color: '#e23744',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '6, 8'
          }).addTo(map);
          routeLineRef.current = line;
        }

        mapInstanceRef.current = map;
        updateAddressFromCoords(coords[0], coords[1]);
      }

      const triggerMapResize = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      };

      triggerMapResize();
      setTimeout(triggerMapResize, 150);
      setTimeout(triggerMapResize, 450);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Snap to Device GPS location
  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setTimeout(() => setGpsError(''), 4000);
      return;
    }

    setIsGpsLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLocating(false);
        const { latitude, longitude } = pos.coords;
        handleUpdatePosition(latitude, longitude, true);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.2 });
        }
      },
      (err) => {
        setIsGpsLocating(false);
        setGpsError(err.message || 'GPS request timed out or denied.');
        setTimeout(() => setGpsError(''), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Quick Suburb snap
  const handleSelectSuburb = (suburb) => {
    handleUpdatePosition(suburb.lat, suburb.lng, true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([suburb.lat, suburb.lng], 15, { duration: 1 });
    }
  };

  // Zoom controls for touch/mobile
  const handleZoom = (delta) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  const handleConfirm = () => {
    if (onConfirmLocation) {
      onConfirmLocation({
        coords,
        street: addressDetails.street,
        locality: addressDetails.locality,
        displayName: addressDetails.displayName,
        suburb: addressDetails.suburb,
        distanceKm,
        deliveryFee
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="pin-map-modal-backdrop animate-fade" onClick={onClose}>
      <div 
        className="pin-map-modal-container animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="pin-map-header">
          <div className="pin-header-title-group">
            <div className="pin-title-icon-box">
              <MapPin size={20} className="icon-crimson" />
            </div>
            <div>
              <h3>Pinpoint Exact Delivery Location</h3>
              <p className="pin-header-sub">Drag the pin to your exact building, tower, or gate</p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close-pin-modal" 
            onClick={onClose}
            aria-label="Close Map"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Suburb Hub Snaps */}
        <div className="suburb-quick-strip">
          <span className="strip-label">Quick Snap:</span>
          {SUBURB_CENTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`suburb-pill-btn ${addressDetails.suburb?.id === s.id ? 'active' : ''}`}
              onClick={() => handleSelectSuburb(s)}
            >
              📍 {s.name}
            </button>
          ))}
        </div>

        {/* Map Viewport Area */}
        <div className="pin-map-canvas-wrapper">
          <div ref={mapContainerRef} className="pin-leaflet-canvas" />

          {/* Floating Instruction Banner */}
          <div className="pin-map-floating-tip">
            <span>👆 Tap anywhere or drag the red pin to your exact doorstep</span>
          </div>

          {/* Map Quick Controls (GPS + Zoom) */}
          <div className="pin-map-floating-controls">
            <button 
              type="button"
              className="map-ctrl-btn gps-btn" 
              onClick={handleLocateMe}
              disabled={isGpsLocating}
              title="Detect My Device GPS"
            >
              {isGpsLocating ? (
                <Loader2 size={18} className="spin-icon text-crimson" />
              ) : (
                <Crosshair size={18} className="icon-crimson" />
              )}
            </button>
            <div className="map-zoom-group">
              <button type="button" className="map-ctrl-btn" onClick={() => handleZoom(1)} title="Zoom In">+</button>
              <button type="button" className="map-ctrl-btn" onClick={() => handleZoom(-1)} title="Zoom Out">−</button>
            </div>
          </div>

          {gpsError && (
            <div className="map-floating-error animate-fade">
              ⚠️ {gpsError}
            </div>
          )}
        </div>

        {/* Bottom Location Preview Card & Sticky Confirm */}
        <div className="pin-map-bottom-sheet">
          <div className="location-detail-card">
            <div className="loc-card-header">
              <div className="loc-tag">
                <MapPin size={14} className="icon-crimson" />
                <span>DROP DESTINATION</span>
              </div>
              {isGeocoding ? (
                <span className="geocoding-spinner">
                  <Loader2 size={12} className="spin-icon" /> Resolving address...
                </span>
              ) : (
                <span className="gps-acc-badge">
                  📍 {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                </span>
              )}
            </div>

            <div className="loc-street-heading">
              <strong>{addressDetails.street || `${addressDetails.suburb?.name} Hub`}</strong>
              <p className="loc-full-text">{addressDetails.displayName}</p>
            </div>

            {/* Dynamic Real-time Calculations */}
            <div className="loc-metrics-row">
              <div className="metric-pill">
                <Store size={14} className="text-muted" />
                <span>From: <strong>{restaurantName.slice(0, 18)}</strong></span>
              </div>
              <div className="metric-pill highlight">
                <Navigation size={14} className="text-crimson" />
                <span>Distance: <strong>{distanceKm} km</strong></span>
              </div>
              <div className="metric-pill fee">
                <span>Fee: <strong>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</strong></span>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Friendly Confirm Action */}
          <div className="pin-confirm-action-row">
            <button
              type="button"
              className="btn-confirm-pin-location"
              onClick={handleConfirm}
            >
              <Check size={18} />
              <span>Confirm & Use This Location</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
