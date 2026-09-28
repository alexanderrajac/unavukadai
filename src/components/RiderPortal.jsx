import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Send,
  Lock,
  AlertTriangle
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
  const [gpsMode, setGpsMode] = useState('simulation'); // 'hardware' | 'simulation'
  const [autoDriveActive, setAutoDriveActive] = useState(true);
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

  // Trips currently assigned to this rider
  const currentRiderId = 'rider-1';
  const myActiveTrips = orders.filter(
    o => (o.riderId === currentRiderId || o.riderName === riderName) && o.status !== 'DELIVERED'
  );

  // Available trips waiting for delivery partner pickup
  const availableTrips = orders.filter(
    o => (!o.riderId || o.riderId === '') && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  // Completed trips by this rider
  const completedTrips = orders.filter(
    o => (o.riderId === currentRiderId || o.riderName === riderName) && o.status === 'DELIVERED'
  );

  // Base earnings calculated from delivered trips
  const deliveredEarnings = completedTrips.reduce((acc, t) => acc + (t.riderEarnings || 65), 0);
  const todayEarnings = deliveredEarnings > 0 ? deliveredEarnings + 60 : 380;

  // Real-time Rider Wallet State (persisted in localStorage)
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_rider_wallet');
      return saved ? Number(saved) : 620;
    } catch {
      return 620;
    }
  });

  const [walletTransactions, setWalletTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_rider_txns');
      return saved ? JSON.parse(saved) : [
        { id: 'tx-1', title: 'Trip Payout #UK-4821', type: 'CREDIT', amount: 65, time: '12:35 PM', desc: 'Perungalathur to Peerkankaranai drop' },
        { id: 'tx-2', title: 'Monsoon Rain Incentive', type: 'CREDIT', amount: 35, time: '01:10 PM', desc: 'Peak weather surge bonus' },
        { id: 'tx-3', title: 'Customer Doorstep Tip', type: 'CREDIT', amount: 20, time: '01:45 PM', desc: 'Order #UK-4821 Tip' }
      ];
    } catch {
      return [];
    }
  });

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawUpiId, setWithdrawUpiId] = useState('8248651695@ybl');
  const [withdrawAmount, setWithdrawAmount] = useState('300');
  const [withdrawNotice, setWithdrawNotice] = useState('');

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

        // Instant credit to Rider Wallet & Ledger
        const newTx = {
          id: `tx-${Date.now()}`,
          title: `Trip Payout #${deliveredId}`,
          type: 'CREDIT',
          amount: earnings,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          desc: `Delivered to ${otpModalTrip.customerName || 'Customer'} (${otpModalTrip.locality || 'Chennai'})`
        };
        setWalletBalance(prev => {
          const updated = prev + earnings;
          localStorage.setItem('unavu_rider_wallet', String(updated));
          return updated;
        });
        setWalletTransactions(prev => {
          const updated = [newTx, ...prev];
          localStorage.setItem('unavu_rider_txns', JSON.stringify(updated));
          return updated;
        });

        setOtpModalTrip(null);
        alert(`🎉 Doorstep OTP Verified! Order #${deliveredId} delivered successfully. ₹${earnings} credited to your Rider Wallet.`);
      }, 500);
    } else {
      setOtpError(`Incorrect OTP! Please ask customer ${otpModalTrip.customerName} for the 4-digit PIN displayed on their live tracking screen.`);
    }
  };

  // Instant UPI Cash Out
  const handleWithdrawFunds = (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > walletBalance) {
      alert('Please enter a valid amount within your current wallet balance.');
      return;
    }
    const newTx = {
      id: `tx-${Date.now()}`,
      title: 'Instant UPI Withdrawal',
      type: 'DEBIT',
      amount: amt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      desc: `Transferred to ${withdrawUpiId}`
    };
    const updatedBalance = walletBalance - amt;
    setWalletBalance(updatedBalance);
    localStorage.setItem('unavu_rider_wallet', String(updatedBalance));

    const updatedTxns = [newTx, ...walletTransactions];
    setWalletTransactions(updatedTxns);
    localStorage.setItem('unavu_rider_txns', JSON.stringify(updatedTxns));

    setIsWithdrawModalOpen(false);
    setWithdrawNotice(`✅ Successfully transferred ₹${amt} to UPI ID: ${withdrawUpiId}!`);
    setTimeout(() => setWithdrawNotice(''), 5000);
  };

  // Background GPS Watcher (Hardware GPS with Mobile HTTP Simulation Fallback)
  useEffect(() => {
    if (!gpsActive || !isOnline) return;

    const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isSecure) {
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
          console.warn('Browser GPS permission not granted:', err.message);
          setGpsMode('simulation');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 4000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGpsMode('simulation');
    }
  }, [gpsActive, isOnline, myActiveTrips, onUpdateLocation, riderName]);

  // Route Simulation helper: moves smoothly towards customer drop
  const stepSimulatedPosition = useCallback(() => {
    setGpsLat((prevLat) => {
      setGpsLng((prevLng) => {
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
  useEffect(() => {
    if (!autoDriveActive || !isOnline) return;

    const interval = setInterval(() => {
      stepSimulatedPosition();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoDriveActive, isOnline, stepSimulatedPosition]);

  return (
    <div className="portal-page-container rider-theme">
      {/* Rider Header Hero Card */}
      <div className="portal-header-card rider-header-bg">
        <div className="portal-header-left">
          <div className="portal-badge-label rider-badge">
            <Bike size={14} />
            <span>FLEET PARTNER CAPTAIN APP</span>
          </div>
          <div className="rider-title-row">
            <h1 className="portal-main-heading">{riderName}</h1>
            <span className="rider-rating-pill">⭐ 4.9 (Top Rated Captain)</span>
          </div>
          <p className="portal-sub-location">
            <span>Primary Corridor: <strong>Chennai Metros &amp; Suburban Hubs</strong></span>
          </p>
        </div>

        <div className="portal-header-actions">
          {/* Always Online Shift Status */}
          <button 
            type="button"
            className={`rider-shift-toggle-btn ${isOnline ? 'online' : 'offline'}`}
            onClick={() => setIsOnline(!isOnline)}
            title="Rider is automatically set to ONLINE and accepting incoming trips"
          >
            <Power size={17} />
            <span>{isOnline ? '🟢 ALWAYS ONLINE & ACCEPTING' : '⚪ OFFLINE (ON BREAK)'}</span>
            {isOnline && <span className="auto-always-pill">Auto-Active</span>}
          </button>
        </div>
      </div>

      {/* Rider Telemetry Status Bar */}
      <div className="rider-status-bar">
        <div className="status-chip">
          <Zap size={14} className="text-orange" />
          <span>Vehicle: <strong>Hero Optima Electric (TN-19)</strong></span>
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
          <span>
            {gpsMode === 'simulation' ? '📡 Simulated GPS:' : '📍 Live GPS:'}{' '}
            <strong>{gpsActive ? `${gpsLat.toFixed(4)}, ${gpsLng.toFixed(4)}` : 'Paused'}</strong>
          </span>
        </div>

        {/* Auto-Drive Simulation Toggle */}
        <button 
          type="button"
          className={`btn-gps-nudge ${autoDriveActive ? 'active-autodrive' : ''}`}
          onClick={() => setAutoDriveActive(!autoDriveActive)}
          style={{
            backgroundColor: autoDriveActive ? '#16a34a' : 'rgba(226, 55, 68, 0.12)',
            color: autoDriveActive ? '#ffffff' : '#e23744',
            border: autoDriveActive ? '1px solid #15803d' : '1px solid rgba(226, 55, 68, 0.3)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Continuously broadcasts moving coordinates to customer live map every 3s"
        >
          {autoDriveActive ? '🟢 Auto-Drive Moving (3s)' : '🛵 Start Auto-Drive'}
        </button>

        <button 
          type="button"
          className="btn-gps-nudge"
          onClick={stepSimulatedPosition}
          title="Step bike GPS position once"
        >
          ⚡ Step GPS
        </button>
      </div>

      {/* Subnav Navigation Tabs */}
      <div className="rider-subnav-tabs">
        <button 
          type="button"
          className={`subnav-tab ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          <Bike size={17} />
          <span>Delivery Radar &amp; Trips</span>
          {availableTrips.length > 0 && (
            <span className="badge-pulse">{availableTrips.length} Available</span>
          )}
        </button>

        <button 
          type="button"
          className={`subnav-tab ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <CreditCard size={17} />
          <span>Rider Wallet &amp; Payouts</span>
          <span className="badge-earning">₹{walletBalance}</span>
        </button>

        <button 
          type="button"
          className={`subnav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={17} />
          <span>Shift History ({completedTrips.length})</span>
        </button>
      </div>

      {/* TAB 1: RADAR & DELIVERY TRIPS */}
      {activeTab === 'radar' && (
        <div className="rider-radar-body">
          {/* Active Trip in Progress Card */}
          {myActiveTrips.length > 0 && (
            <div className="active-trip-hero-card">
              <div className="active-trip-header">
                <div className="active-pulse-indicator">
                  <span className="live-dot-pulse"></span>
                  <span>ACTIVE TRIP IN PROGRESS</span>
                </div>
                <div className="active-trip-id">#{myActiveTrips[0].orderId}</div>
              </div>

              {/* Progress Milestones Tracker */}
              <div className="rider-order-steps-flow">
                <div className="flow-step done">
                  <span className="flow-step-icon">✓</span>
                  <span>Accepted</span>
                </div>
                <div className={`flow-step ${myActiveTrips[0].status === 'OUT_FOR_DELIVERY' ? 'done' : 'current'}`}>
                  <span className="flow-step-icon">🏪</span>
                  <span>Kitchen Pickup</span>
                </div>
                <div className={`flow-step ${myActiveTrips[0].status === 'OUT_FOR_DELIVERY' ? 'current' : ''}`}>
                  <span className="flow-step-icon">🛵</span>
                  <span>On the Way</span>
                </div>
                <div className="flow-step">
                  <span className="flow-step-icon">📍</span>
                  <span>Doorstep Hand-Off</span>
                </div>
              </div>

              <div className="trip-locations-flow">
                <div className="trip-flow-point">
                  <div className="point-icon pickup">🏪</div>
                  <div className="point-meta">
                    <small>PICKUP POINT (RESTAURANT)</small>
                    <strong>{myActiveTrips[0].restaurantName}</strong>
                    <span>{myActiveTrips[0].restaurantAddress || myActiveTrips[0].restaurantLocality}</span>
                  </div>
                </div>

                <div className="trip-flow-line"></div>

                <div className="trip-flow-point">
                  <div className="point-icon drop">📍</div>
                  <div className="point-meta">
                    <small>DELIVERY DESTINATION (CUSTOMER)</small>
                    <strong>{myActiveTrips[0].customerName} ({myActiveTrips[0].customerPhone || '+91 98401 23456'})</strong>
                    <span>{myActiveTrips[0].customerAddress || myActiveTrips[0].address}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="active-trip-action-bar">
                {(myActiveTrips[0].status === 'PLACED' || myActiveTrips[0].status === 'PREPARING') && (
                  <div className="kot-trip-prep-notice">
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b' }}>
                      👨‍🍳 Food is being freshly cooked. Ride towards {myActiveTrips[0].restaurantName}.
                    </p>
                    <button 
                      type="button"
                      className="btn-rider-step pickup"
                      onClick={() => onUpdateOrderStatus(myActiveTrips[0].orderId, 'OUT_FOR_DELIVERY')}
                    >
                      <Navigation size={18} />
                      <span>Food Picked Up from Kitchen → Start Delivery</span>
                    </button>
                  </div>
                )}

                {myActiveTrips[0].status === 'READY_FOR_PICKUP' && (
                  <button 
                    type="button"
                    className="btn-rider-step pickup"
                    onClick={() => onUpdateOrderStatus(myActiveTrips[0].orderId, 'OUT_FOR_DELIVERY')}
                  >
                    <Navigation size={18} />
                    <span>Confirm Food Picked Up from Kitchen → Start Delivery</span>
                  </button>
                )}

                {myActiveTrips[0].status === 'OUT_FOR_DELIVERY' && (
                  <button 
                    type="button"
                    className="btn-rider-step deliver"
                    onClick={() => handleOpenOtpModal(myActiveTrips[0])}
                  >
                    <CheckCircle2 size={18} />
                    <span>Customer Received Order → Collect OTP &amp; Mark Delivered</span>
                  </button>
                )}

                <button 
                  type="button"
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
                  <span>Call Customer</span>
                </a>
              </div>
            </div>
          )}

          {/* Available Delivery Requests Radar */}
          <div className="available-trips-section">
            <div className="section-title-row">
              <div>
                <h3>Available Orders for Pickup (Chennai Hubs)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Tap "Accept Delivery Trip" to lock the delivery and earn guaranteed payout.
                </p>
              </div>
              <span className="available-count-pill">{availableTrips.length} Requests Waiting</span>
            </div>

            {/* 1-Trip Concurrency Enforcement Banner */}
            {myActiveTrips.length > 0 && (
              <div className="active-trip-lock-banner animate-fade mb-3">
                <div className="lock-icon-circle">
                  <Lock size={18} />
                </div>
                <div className="lock-content">
                  <strong>Active Delivery in Progress (1-Trip Limit Enforced)</strong>
                  <p>
                    You are currently delivering Order <strong>#{myActiveTrips[0].orderId}</strong> for <strong>{myActiveTrips[0].restaurantName}</strong>. 
                    Finish this delivery and verify doorstep OTP before accepting additional trips.
                  </p>
                </div>
              </div>
            )}

            {!isOnline ? (
              <div className="rider-offline-state">
                <Power size={42} className="text-muted mb-2" />
                <h3>You are currently Offline</h3>
                <p>Toggle your status to ONLINE at the top right to start receiving order pickup pings.</p>
              </div>
            ) : availableTrips.length === 0 ? (
              <div className="rider-empty-trips">
                <Clock size={42} className="text-muted mb-2" />
                <h3>Scanning for Nearby Food Orders...</h3>
                <p>Live GPS pinging active restaurants across Chennai metro &amp; suburban kitchens.</p>
              </div>
            ) : (
              <div className="trips-grid">
                {availableTrips.map((trip) => (
                  <div key={trip.orderId} className={`trip-offer-card ${myActiveTrips.length > 0 ? 'card-locked' : ''}`}>
                    <div className="trip-offer-top">
                      <div className="trip-earning-pill">
                        <small>Guaranteed Payout</small>
                        <strong>₹{trip.riderEarnings || 65}</strong>
                      </div>
                      <span className="trip-distance-badge">~2.4 km distance</span>
                    </div>

                    <div className="trip-card-places">
                      <div className="place-row">
                        <MapPin size={15} className="text-orange" />
                        <div>
                          <strong>{trip.restaurantName}</strong>
                          <p>{trip.restaurantAddress || trip.locality}</p>
                        </div>
                      </div>
                      <div className="place-row">
                        <MapPin size={15} className="icon-crimson" />
                        <div>
                          <strong>Drop: {trip.locality} Hub</strong>
                          <p>{trip.customerAddress || trip.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="trip-items-preview">
                      <span>Order #{trip.orderId} • {trip.items?.length || 1} items (Bill: ₹{trip.grandTotal})</span>
                    </div>

                    <button 
                      type="button"
                      className={`btn-accept-trip ${myActiveTrips.length > 0 ? 'disabled' : ''}`}
                      disabled={myActiveTrips.length > 0}
                      onClick={() => {
                        if (myActiveTrips.length > 0) return;
                        onAcceptTrip(trip.orderId);
                      }}
                      title={myActiveTrips.length > 0 ? `Deliver trip #${myActiveTrips[0].orderId} first` : 'Accept this delivery'}
                    >
                      {myActiveTrips.length > 0 ? (
                        <>
                          <Lock size={15} />
                          <span>Locked: Trip #{myActiveTrips[0].orderId} Active</span>
                        </>
                      ) : (
                        <>
                          <span>Accept Delivery Trip</span>
                          <ChevronRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RIDER WALLET & FAST PAYOUTS */}
      {activeTab === 'earnings' && (
        <div className="rider-earnings-body">
          {/* Main Wallet Hero Card */}
          <div className="wallet-hero-card">
            <div className="wallet-hero-top">
              <div>
                <span className="earnings-hero-caption">💼 Live Captain Wallet Balance</span>
                <h2 className="earnings-hero-amount">₹{walletBalance}</h2>
                <small className="wallet-auto-sub">Instant Bank Payouts via UPI • Zero Platform Deductions</small>
              </div>
              <button 
                type="button" 
                className="btn-withdraw-upi"
                onClick={() => setIsWithdrawModalOpen(true)}
              >
                <Zap size={16} />
                <span>⚡ Instant UPI Cashout</span>
              </button>
            </div>

            <div className="earnings-breakdown-chips">
              <span className="chip">Delivered Today: {completedTrips.length} Trips</span>
              <span className="chip">Trip Fares: ₹{deliveredEarnings || 320}</span>
              <span className="chip">Rain Surge: ₹35</span>
              <span className="chip">Customer Tips: ₹20</span>
            </div>
          </div>

          {withdrawNotice && (
            <div className="withdraw-success-alert animate-fade">
              {withdrawNotice}
            </div>
          )}

          {/* Daily Milestone Target Progress */}
          <div className="daily-target-card">
            <div className="target-header">
              <span>Daily Target Progress (₹800 Goal)</span>
              <strong>{Math.min(100, Math.round((walletBalance / 800) * 100))}% Completed</strong>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, Math.round((walletBalance / 800) * 100))}%` }}
              ></div>
            </div>
            <small>Complete 2 more deliveries in your hub to unlock an extra ₹150 milestone bonus!</small>
          </div>

          {/* Wallet Transaction Ledger */}
          <div className="wallet-ledger-card">
            <div className="ledger-header">
              <div>
                <h3>📜 Wallet Activity &amp; Payout Statement</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Real-time credited trips and instant UPI withdrawals</span>
              </div>
              <span className="ledger-badge-count">{walletTransactions.length} Events</span>
            </div>

            <div className="ledger-transactions-list">
              {walletTransactions.map((tx) => (
                <div key={tx.id} className="ledger-row">
                  <div className="ledger-left">
                    <span className={`ledger-type-icon ${tx.type === 'CREDIT' ? 'credit' : 'debit'}`}>
                      {tx.type === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </span>
                    <div>
                      <strong>{tx.title}</strong>
                      <p>{tx.desc} • <small>{tx.time}</small></p>
                    </div>
                  </div>
                  <div className={`ledger-amount ${tx.type === 'CREDIT' ? 'credit' : 'debit'}`}>
                    <strong>{tx.type === 'CREDIT' ? `+₹${tx.amount}` : `-₹${tx.amount}`}</strong>
                    <span className="ledger-status-tag">Settled</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHIFT DELIVERY HISTORY */}
      {activeTab === 'history' && (
        <div className="rider-history-body">
          <div className="section-title-row mb-3">
            <div>
              <h3>Completed Deliveries Today</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                All trips verified at customer doorstep with OTP.
              </p>
            </div>
            <span className="badge-pulse green">{completedTrips.length} Delivered</span>
          </div>

          <div className="history-list">
            {completedTrips.length === 0 ? (
              <div className="kot-empty-state">
                <Clock size={40} className="text-muted mb-2" />
                <h4>No Completed Trips Yet</h4>
                <p>Accept an order from the radar and complete delivery to see your shift history.</p>
              </div>
            ) : (
              completedTrips.map((t) => (
                <div key={t.orderId} className="history-card">
                  <div className="history-main">
                    <strong>#{t.orderId} — {t.restaurantName}</strong>
                    <p>Delivered to: {t.customerAddress || t.address} ({t.locality})</p>
                    <small>Doorstep Verified • Customer Paid: ₹{t.grandTotal}</small>
                  </div>
                  <div className="history-payout">
                    <strong>+₹{t.riderEarnings || 65}</strong>
                    <span className="text-green">✓ Credited to Wallet</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Interactive Collect Delivery OTP Modal */}
      {otpModalTrip && (
        <div className="modal-backdrop animate-fade" onClick={() => setOtpModalTrip(null)}>
          <div className="collect-otp-modal animate-scale" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
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
                Ask customer <strong>{otpModalTrip.customerName}</strong> for the 4-digit PIN displayed on their live order screen.
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
                <span>{otpModalTrip.customerAddress || otpModalTrip.address}</span>
              </div>
              <div className="otp-summary-row highlight">
                <span>Captain Payout for Trip:</span>
                <strong className="text-green">+₹{otpModalTrip.riderEarnings || 65}</strong>
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
                <span>💡 Customer PIN: <strong>{otpModalTrip.deliveryOtp || '4821'}</strong> (Bypass: <strong>1234</strong>)</span>
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
                      <span>Verify OTP &amp; Mark Delivered</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instant UPI Cashout Modal */}
      {isWithdrawModalOpen && (
        <div className="modal-backdrop animate-fade" onClick={() => setIsWithdrawModalOpen(false)}>
          <div className="collect-otp-modal animate-scale" onClick={e => e.stopPropagation()}>
            <button 
              type="button"
              className="modal-close-icon" 
              onClick={() => setIsWithdrawModalOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="collect-otp-header">
              <div className="collect-otp-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.12)' }}>
                <Zap size={28} className="text-green" />
              </div>
              <h3>Instant Rider UPI Cashout</h3>
              <p className="collect-otp-subtitle">
                Transfer your earnings instantly to your bank account via UPI. Instant settlement, 0% fee.
              </p>
            </div>

            <form onSubmit={handleWithdrawFunds} className="collect-otp-form">
              <div className="form-group mb-2">
                <label className="field-label-bold">Available Balance to Cashout</label>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', margin: '4px 0 10px 0' }}>
                  ₹{walletBalance}
                </div>
              </div>

              {/* Quick Preset Amount Buttons */}
              <div className="quick-withdraw-chips mb-2">
                {[100, 250, 500].filter(v => v <= walletBalance).map(val => (
                  <button
                    key={val}
                    type="button"
                    className="quick-chip-btn"
                    onClick={() => setWithdrawAmount(String(val))}
                  >
                    ₹{val}
                  </button>
                ))}
                <button
                  type="button"
                  className="quick-chip-btn max"
                  onClick={() => setWithdrawAmount(String(walletBalance))}
                >
                  All (₹{walletBalance})
                </button>
              </div>

              <div className="form-group mb-2">
                <label className="field-label-bold">Your UPI ID / Virtual Payment Address</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="e.g. 8248651695@ybl or rider@okhdfcbank"
                  value={withdrawUpiId}
                  onChange={e => setWithdrawUpiId(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group mb-3">
                <label className="field-label-bold">Cashout Amount (₹)</label>
                <input 
                  type="number" 
                  className="styled-input" 
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  min={1}
                  max={walletBalance}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-secondary flex-1"
                  onClick={() => setIsWithdrawModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 btn-confirm-cashout"
                  disabled={!withdrawAmount || Number(withdrawAmount) > walletBalance}
                >
                  <Send size={16} />
                  <span>Transfer ₹{withdrawAmount || 0} to UPI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
