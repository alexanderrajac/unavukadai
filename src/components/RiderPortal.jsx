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

  // Live GPS Broadcast State
  const [gpsActive, setGpsActive] = useState(true);
  const [gpsLat, setGpsLat] = useState(riderLocation?.lat || 12.9056);
  const [gpsLng, setGpsLng] = useState(riderLocation?.lng || 80.0832);

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
  const myActiveTrips = orders.filter(
    o => o.riderId === 'rider-1' && o.status !== 'DELIVERED'
  );

  // Background GPS Watcher
  React.useEffect(() => {
    if (!gpsActive || !isOnline) return;

    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed, heading } = pos.coords;
          setGpsLat(latitude);
          setGpsLng(longitude);
          if (onUpdateLocation) {
            onUpdateLocation({
              riderId: 'rider-1',
              riderName,
              lat: latitude,
              lng: longitude,
              speed: speed ? Math.round(speed * 3.6) : 26,
              heading: heading || 0,
              orderId: myActiveTrips[0]?.orderId || null
            });
          }
        },
        (err) => {
          console.warn('Browser GPS permission not granted:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [gpsActive, isOnline, myActiveTrips, onUpdateLocation, riderName]);

  // Route Simulation step (for laptop testing: nudges GPS position toward customer)
  const handleSimulateBikeMovement = () => {
    const nextLat = Number((gpsLat + (Math.random() * 0.001 - 0.0003)).toFixed(5));
    const nextLng = Number((gpsLng + (Math.random() * 0.001 - 0.0003)).toFixed(5));
    setGpsLat(nextLat);
    setGpsLng(nextLng);
    if (onUpdateLocation) {
      onUpdateLocation({
        riderId: 'rider-1',
        riderName,
        lat: nextLat,
        lng: nextLng,
        speed: 32,
        heading: 180,
        orderId: myActiveTrips[0]?.orderId || null
      });
    }
  };

  // Trips waiting for a rider
  const availableTrips = orders.filter(
    o => o.status === 'READY_FOR_PICKUP' && !o.riderId
  );

  // Completed trips
  const completedTrips = orders.filter(
    o => o.riderId === 'rider-1' && o.status === 'DELIVERED'
  );

  const todayEarnings = completedTrips.reduce((acc, t) => acc + (t.riderEarnings || 60), 0) + 180; // baseline demo

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

      {/* Rider Stats Bar */}
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
          title="Click to toggle GPS broadcast"
        >
          <Navigation size={14} className={gpsActive ? 'text-green' : 'text-muted'} />
          <span>Live GPS: <strong>{gpsActive ? `${gpsLat.toFixed(4)}, ${gpsLng.toFixed(4)}` : 'Paused'}</strong></span>
        </div>
        <button 
          className="btn-gps-nudge"
          onClick={handleSimulateBikeMovement}
          title="Simulate bike driving along GST road"
        >
          🛵 Move Bike (GPS Simulation)
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
                      onClick={() => onAcceptTrip(trip.orderId)}
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
