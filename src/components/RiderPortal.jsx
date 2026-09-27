import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Battery, 
  Zap, 
  Power,
  ChevronRight,
  KeyRound,
  X
} from 'lucide-react';

export default function RiderPortal({
  orders,
  onAcceptTrip,
  onUpdateOrderStatus,
  riderName = 'Murugan S.',
  riderLocation,
  onUpdateLocation
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'earnings' | 'history'

  // Live GPS Broadcast State & Telemetry Mode
  const [gpsActive, setGpsActive] = useState(true);
  const [gpsMode, setGpsMode] = useState('detecting'); // 'hardware' | 'simulation'
  const [autoDriveActive, setAutoDriveActive] = useState(false);
  const [gpsLat, setGpsLat] = useState(() => {
    const lat = parseFloat(riderLocation?.lat);
    return isFinite(lat) && lat !== 0 ? lat : 12.9056;
  });
  const [gpsLng, setGpsLng] = useState(() => {
    const lng = parseFloat(riderLocation?.lng);
    return isFinite(lng) && lng !== 0 ? lng : 80.0832;
  });

  // Collect OTP Verification Modal State
  const [otpModalTrip, setOtpModalTrip] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleOpenOtpModal = (trip) => {
    setOtpModalTrip(trip);
    setEnteredOtp('');
    setOtpError('');
  };

  const handleVerifyOtpAndDeliver = (e) => {
    e.preventDefault();
    if (!otpModalTrip) return;

    const expectedOtp = otpModalTrip.deliveryOtp || '4821';
    const cleanEntered = enteredOtp.trim();

    if (cleanEntered === expectedOtp || cleanEntered === '1234') {
      setIsVerifyingOtp(true);
      setTimeout(() => {
        setIsVerifyingOtp(false);
        onUpdateOrderStatus(otpModalTrip.orderId, 'DELIVERED');
        const deliveredId = otpModalTrip.orderId;
        const earnings = otpModalTrip.riderEarnings || 65;
        setOtpModalTrip(null);
        alert(`🎉 Doorstep OTP Verified! Order #${deliveredId} delivered successfully. ₹${earnings} credited to your ledger.`);
      }, 500);
    } else {
      setOtpError(`Incorrect OTP! Please ask customer ${otpModalTrip.customerName} for the 4-digit PIN displayed on their live tracking screen.`);
    }
  };

  // Trips currently assigned to this rider
  const currentRiderId = 'rider-1';
  const myActiveTrips = orders.filter(
    o => (o.riderId === currentRiderId || o.riderName === riderName) && o.status !== 'DELIVERED'
  );

  // Background GPS Watcher (Hardware GPS with Mobile HTTP Simulation Fallback)
  React.useEffect(() => {
    if (!gpsActive || !isOnline) return;

    const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isSecure) {
      // Mobile HTTP blocks navigator.geolocation - automatically activate simulation mode
      setGpsMode('simulation');
      return;
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed, heading } = pos.coords;
          if (isFinite(latitude) && isFinite(longitude)) {
            setGpsMode('hardware');
            setGpsLat(latitude);
            setGpsLng(longitude);
            if (onUpdateLocation) {
              onUpdateLocation({
                riderId: currentRiderId,
                riderName,
                lat: latitude,
                lng: longitude,
                speed: speed ? Math.round(speed * 3.6) : 26,
                heading: heading || 0,
                orderId: myActiveTrips[0]?.orderId || null
              });
            }
          }
        },
        (err) => {
          console.warn('Browser GPS permission not granted or non-secure origin:', err.message);
          // Fall back gracefully to simulation mode so app continues working seamlessly
          setGpsMode('simulation');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 4000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGpsMode('simulation');
    }
  }, [gpsActive, isOnline, myActiveTrips, onUpdateLocation, riderName]);

  // Route Simulation helper: moves smoothly towards customer drop or along GST road
  const stepSimulatedPosition = React.useCallback(() => {
    setGpsLat((prevLat) => {
      setGpsLng((prevLng) => {
        // Small realistic GPS delta (~35-45 meters per step)
        const dLat = (Math.random() * 0.0006) - 0.0001;
        const dLng = (Math.random() * 0.0006) - 0.0001;
        const nextLat = Number((prevLat + dLat).toFixed(5));
        const nextLng = Number((prevLng + dLng).toFixed(5));

        if (onUpdateLocation) {
          onUpdateLocation({
            riderId: currentRiderId,
            riderName,
            lat: nextLat,
            lng: nextLng,
            speed: Math.floor(24 + Math.random() * 8),
            heading: 185,
            orderId: myActiveTrips[0]?.orderId || null
          });
        }
        return nextLng;
      });
      return prevLat;
    });
  }, [currentRiderId, myActiveTrips, onUpdateLocation, riderName]);

  // Auto-Drive Telemetry Loop: emits live simulated GPS every 3 seconds
  React.useEffect(() => {
    if (!autoDriveActive || !isOnline) return;

    const interval = setInterval(() => {
      stepSimulatedPosition();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoDriveActive, isOnline, stepSimulatedPosition]);

  // Manual Nudge GPS button
  const handleSimulateBikeMovement = () => {
    stepSimulatedPosition();
  };

  return (
    <div className="portal-page-container rider-theme">
      {/* Rider Header */}
      <div className="portal-header-card rider-header-bg">
        <div className="portal-header-left">
          <div className="portal-badge-label rider-badge">
            <Bike size={14} />
            <span>DELIVERY PARTNER FLEET APP</span>
          </div>
          <h1 className="portal-main-heading">{riderName}</h1>
          <p className="portal-sub-location">
            <span>Primary Zone: <strong>Perungalathur • Vandalur • Mannivakkam Belt</strong></span>
          </p>
        </div>

        <div className="portal-header-actions">
          {/* Online/Offline Toggle */}
          <button 
            className={`rider-shift-toggle-btn ${isOnline ? 'online' : 'offline'}`}
            onClick={() => setIsOnline(!isOnline)}
          >
            <Power size={16} />
            <span>{isOnline ? 'ONLINE & ACCEPTING TRIPS' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* Rider Stats Bar with Live Telemetry Mode */}
      <div className="rider-status-bar">
        <div className="status-chip">
          <Zap size={14} className="text-orange" />
          <span>Vehicle: <strong>Hero Electric Optima (TN-19)</strong></span>
        </div>
        <div className="status-chip">
          <Battery size={14} className="text-green" />
          <span>Battery: <strong>88% (Good for 60 km)</strong></span>
        </div>
        <div 
          className="status-chip" 
          onClick={() => setGpsActive(!gpsActive)}
          style={{ cursor: 'pointer' }}
          title="Click to pause or resume GPS broadcast"
        >
          <Navigation size={14} className={gpsActive ? 'text-green' : 'text-muted'} />
          <span>
            {gpsMode === 'simulation' ? '📡 Simulated GPS:' : '📍 Live GPS:'}{' '}
            <strong>{gpsActive ? `${gpsLat.toFixed(4)}, ${gpsLng.toFixed(4)}` : 'Paused'}</strong>
          </span>
        </div>

        {/* Auto-Drive Real-time Telemetry Toggle */}
        <button 
          type="button"
          className={`btn-gps-nudge ${autoDriveActive ? 'active-autodrive' : ''}`}
          onClick={() => setAutoDriveActive(!autoDriveActive)}
          style={{
            backgroundColor: autoDriveActive ? '#16a34a' : 'rgba(226, 55, 68, 0.12)',
            color: autoDriveActive ? '#ffffff' : '#e23744',
            border: autoDriveActive ? '1px solid #15803d' : '1px solid rgba(226, 55, 68, 0.3)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Continuously broadcasts moving coordinates to customer live map every 3s"
        >
          {autoDriveActive ? '🟢 Auto-Drive Active (3s ping)' : '🛵 Start Auto-Drive'}
        </button>

        <button 
          type="button"
          className="btn-gps-nudge"
          onClick={handleSimulateBikeMovement}
          title="Step bike GPS position once"
        >
          ⚡ Step GPS
        </button>
      </div>

      {/* Tabs */}
      <div className="rider-subnav-tabs">
        <button 
          className={`subnav-tab ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          <span>Delivery Trips Radar</span>
          {availableTrips.length > 0 && (
            <span className="badge-pulse">{availableTrips.length} New</span>
          )}
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <span>Today's Earnings</span>
          <span className="badge-earning">₹{todayEarnings}</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>Shift History ({completedTrips.length})</span>
        </button>
      </div>

      {activeTab === 'radar' && (
        <div className="rider-radar-body">
          {/* Active Trip currently in progress */}
          {myActiveTrips.length > 0 && (
            <div className="active-trip-hero-card">
              <div className="active-trip-header">
                <div className="active-pulse-indicator">
                  <span className="live-dot-pulse"></span>
                  <span>ACTIVE DELIVERY IN PROGRESS</span>
                </div>
                <div className="active-trip-id">#{myActiveTrips[0].orderId}</div>
              </div>

              <div className="trip-locations-flow">
                <div className="trip-flow-point">
                  <div className="point-icon pickup">🏪</div>
                  <div className="point-meta">
                    <small>PICKUP POINT (HOTEL)</small>
                    <strong>{myActiveTrips[0].restaurantName}</strong>
                    <span>{myActiveTrips[0].restaurantAddress}</span>
                  </div>
                </div>

                <div className="trip-flow-line"></div>

                <div className="trip-flow-point">
                  <div className="point-icon drop">📍</div>
                  <div className="point-meta">
                    <small>DELIVERY DESTINATION (CUSTOMER)</small>
                    <strong>{myActiveTrips[0].customerName} ({myActiveTrips[0].customerPhone})</strong>
                    <span>{myActiveTrips[0].customerAddress}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="active-trip-action-bar">
                {myActiveTrips[0].status === 'READY_FOR_PICKUP' && (
                  <button 
                    className="btn-rider-step pickup"
                    onClick={() => onUpdateOrderStatus(myActiveTrips[0].orderId, 'OUT_FOR_DELIVERY')}
                  >
                    <Navigation size={18} />
                    <span>Confirm Food Picked Up from Kitchen → Start Delivery</span>
                  </button>
                )}

                {myActiveTrips[0].status === 'OUT_FOR_DELIVERY' && (
                  <button 
                    className="btn-rider-step deliver"
                    onClick={() => handleOpenOtpModal(myActiveTrips[0])}
                  >
                    <CheckCircle2 size={18} />
                    <span>Customer Received Order → Collect OTP & Mark Delivered</span>
                  </button>
                )}

                <button 
                  className="btn-rider-nav"
                  onClick={() => {
                    const trip = myActiveTrips[0];
                    let dest = encodeURIComponent(trip.customerAddress || (trip.locality + ', Chennai'));
                    if (trip.deliveryCoords && Array.isArray(trip.deliveryCoords) && trip.deliveryCoords.length === 2) {
                      dest = `${trip.deliveryCoords[0]},${trip.deliveryCoords[1]}`;
                    }
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                  }}
                >
                  <Navigation size={15} />
                  <span>Google Maps Directions</span>
                </button>

                <a 
                  href={`tel:${(myActiveTrips[0].customerPhone || '+919840123456').replace(/\s+/g, '')}`}
                  className="btn-rider-call"
                  style={{ textDecoration: 'none' }}
                >
                  <Phone size={15} />
                  <span>Call Customer ({myActiveTrips[0].customerPhone})</span>
                </a>
              </div>
            </div>
          )}

          {/* Available Delivery Requests Radar */}
          <div className="available-trips-section">
            <div className="section-title-row">
              <h3>Available Orders for Pickup in Perungalathur &amp; Vandalur</h3>
              <span>{availableTrips.length} requests waiting</span>
            </div>

            {!isOnline ? (
              <div className="rider-offline-state">
                <Power size={36} className="text-muted" />
                <h3>You are currently Offline</h3>
                <p>Toggle your status to ONLINE at the top right to start receiving delivery requests.</p>
              </div>
            ) : availableTrips.length === 0 ? (
              <div className="rider-empty-trips">
                <Clock size={36} className="text-muted" />
                <h3>Searching for nearby food orders...</h3>
                <p>GPS pinging restaurants across Perungalathur, Vandalur, and Mannivakkam corridor.</p>
              </div>
            ) : (
              <div className="trips-grid">
                {availableTrips.map((trip) => (
                  <div key={trip.orderId} className="trip-offer-card">
                    <div className="trip-offer-top">
                      <div className="trip-earning-pill">
                        <small>Guaranteed Payout</small>
                        <strong>₹{trip.riderEarnings || 60}</strong>
                      </div>
                      <span className="trip-distance-badge">~2.4 km distance</span>
                    </div>

                    <div className="trip-card-places">
                      <div className="place-row">
                        <MapPin size={14} className="text-orange" />
                        <div>
                          <strong>{trip.restaurantName}</strong>
                          <p>{trip.restaurantAddress}</p>
                        </div>
                      </div>
                      <div className="place-row">
                        <MapPin size={14} className="icon-crimson" />
                        <div>
                          <strong>Drop: {trip.locality} Hub</strong>
                          <p>{trip.customerAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="trip-items-preview">
                      <span>Order #{trip.orderId} • {trip.items.length} items (₹{trip.grandTotal})</span>
                    </div>

                    <button 
                      className="btn-accept-trip"
                      onClick={() => {
                        if (trip.status !== 'READY_FOR_PICKUP') {
                          alert(`⚠️ Cannot accept order #${trip.orderId}. Kitchen must first mark the order as READY_FOR_PICKUP.`);
                          return;
                        }
                        onAcceptTrip(trip.orderId);
                      }}
                    >
                      <span>Accept Delivery Trip</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Earnings View */}
      {activeTab === 'earnings' && (
        <div className="rider-earnings-body">
          <div className="earnings-hero-card">
            <span className="earnings-hero-caption">Today's Total Shift Earnings</span>
            <h2 className="earnings-hero-amount">₹{todayEarnings}</h2>
            <div className="earnings-breakdown-chips">
              <span className="chip">Trip Fares: ₹{todayEarnings - 50}</span>
              <span className="chip">Surge Bonus: ₹30</span>
              <span className="chip">Customer Tips: ₹20</span>
            </div>
          </div>

          <div className="daily-target-card">
            <div className="target-header">
              <span>Daily Target Progress (₹800 goal)</span>
              <strong>{Math.round((todayEarnings / 800) * 100)}%</strong>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, Math.round((todayEarnings / 800) * 100))}%` }}
              ></div>
            </div>
            <small>Complete 3 more trips in Vandalur/Mannivakkam to earn an extra ₹150 daily milestone bonus!</small>
          </div>
        </div>
      )}

      {/* Trip History View */}
      {activeTab === 'history' && (
        <div className="rider-history-body">
          <h3>Completed Trips Today</h3>
          <div className="history-list">
            {completedTrips.map((t) => (
              <div key={t.orderId} className="history-card">
                <div className="history-main">
                  <strong>#{t.orderId} - {t.restaurantName}</strong>
                  <p>Delivered to: {t.customerAddress} ({t.locality})</p>
                  <small>Completed • Paid via UPI</small>
                </div>
                <div className="history-payout">
                  <strong>+₹{t.riderEarnings || 60}</strong>
                  <span className="text-green">Delivered on-time</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Collect Delivery OTP Modal */}
      {otpModalTrip && (
        <div className="modal-backdrop animate-fade" onClick={() => setOtpModalTrip(null)}>
          <div className="collect-otp-modal animate-scale" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-icon" 
              onClick={() => setOtpModalTrip(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="collect-otp-header">
              <div className="collect-otp-icon-wrap">
                <KeyRound size={28} className="text-crimson" />
              </div>
              <h3>Collect Delivery OTP</h3>
              <p className="collect-otp-subtitle">
                Ask customer <strong>{otpModalTrip.customerName}</strong> for the 4-digit PIN displayed on their live order tracking screen.
              </p>
            </div>

            <div className="collect-otp-order-summary">
              <div className="otp-summary-row">
                <span>Order ID:</span>
                <strong>#{otpModalTrip.orderId}</strong>
              </div>
              <div className="otp-summary-row">
                <span>Customer Contact:</span>
                <strong>{otpModalTrip.customerPhone || '+91 98401 23456'}</strong>
              </div>
              <div className="otp-summary-row">
                <span>Delivery Address:</span>
                <span>{otpModalTrip.customerAddress}</span>
              </div>
              <div className="otp-summary-row highlight">
                <span>Rider Earnings for Trip:</span>
                <strong className="text-green">+₹{otpModalTrip.riderEarnings || 60}</strong>
              </div>
            </div>

            <form onSubmit={handleVerifyOtpAndDeliver} className="collect-otp-form">
              <label className="otp-input-label">Enter 4-Digit Customer OTP</label>
              <div className="otp-input-wrapper">
                <input 
                  type="text" 
                  maxLength={4}
                  autoFocus
                  placeholder="• • • •"
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value.replace(/\D/g, ''));
                    setOtpError('');
                  }}
                  className="collect-otp-input"
                />
              </div>

              {otpError && <p className="otp-verify-error animate-shake">{otpError}</p>}

              {/* Zero External SMS Help & Auto-fill hint */}
              <div className="otp-bypass-hint">
                <span>💡 Customer's PIN on screen: <strong>{otpModalTrip.deliveryOtp || '4821'}</strong> (Master bypass: <strong>1234</strong>)</span>
                <button 
                  type="button" 
                  className="btn-quick-fill-rider-otp"
                  onClick={() => setEnteredOtp(otpModalTrip.deliveryOtp || '4821')}
                >
                  ⚡ Auto-fill PIN
                </button>
              </div>

              <div className="collect-otp-actions">
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setOtpModalTrip(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 btn-confirm-deliver"
                  disabled={enteredOtp.length < 4 || isVerifyingOtp}
                >
                  {isVerifyingOtp ? (
                    <div className="spinner-loader"></div>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Verify OTP & Mark Delivered</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
