import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bike, MapPin, Phone, Navigation, CheckCircle2, Clock, Battery, Zap, Power,
  ChevronRight, KeyRound, X, CreditCard, ArrowDownLeft, ArrowUpRight,
  TrendingUp, Award, ShieldCheck, Send, Lock, AlertTriangle, Bell,
  Package, Star, User, FileText, HelpCircle, MessageSquare, Flame,
  Gift, Shield, Home, History, Wallet, Map, Settings, MoreVertical,
  ChevronLeft, Headphones, Siren, PhoneCall, Car, CheckSquare, Camera,
  BarChart2, Target, Trophy, IndianRupee, Loader2, Volume2, Radio, Locate
} from 'lucide-react';

// ─── Kilambakkam–Vandalur–Otteri Demand Heatmap Data ──────────────────────────
const DEMAND_ZONES = [
  { name: 'Kilambakkam', demand: 'HIGH', orders: 14, color: '#ef4444', lat: 12.8906, lng: 80.0741 },
  { name: 'Vandalur', demand: 'HIGH', orders: 11, color: '#ef4444', lat: 12.8867, lng: 80.0836 },
  { name: 'Perungalathur', demand: 'MEDIUM', orders: 8, color: '#f97316', lat: 12.9044, lng: 80.0756 },
  { name: 'Tambaram', demand: 'HIGH', orders: 18, color: '#ef4444', lat: 12.9249, lng: 80.1000 },
  { name: 'Chromepet', demand: 'MEDIUM', orders: 9, color: '#f97316', lat: 12.9516, lng: 80.1462 },
  { name: 'Otteri', demand: 'LOW', orders: 4, color: '#22c55e', lat: 13.0827, lng: 80.2707 },
  { name: 'Peerkankaranai', demand: 'MEDIUM', orders: 7, color: '#f97316', lat: 12.9100, lng: 80.0944 },
  { name: 'Mudichur', demand: 'LOW', orders: 3, color: '#22c55e', lat: 12.8756, lng: 80.0467 },
];

const INCENTIVE_TARGETS = [
  { id: 'i1', title: 'Complete 5 deliveries', reward: 75, current: 3, target: 5, icon: '🎯', type: 'DAILY' },
  { id: 'i2', title: 'Complete 10 deliveries', reward: 150, current: 3, target: 10, icon: '🚀', type: 'DAILY' },
  { id: 'i3', title: 'Complete 3 deliveries in peak hours (12–2 PM)', reward: 80, current: 1, target: 3, icon: '⚡', type: 'PEAK' },
  { id: 'i4', title: 'Maintain 4.8+ rating this week', reward: 200, current: 4.9, target: 4.8, icon: '⭐', type: 'WEEKLY', isStar: true },
  { id: 'i5', title: 'Zero cancellations today', reward: 50, current: 0, target: 0, icon: '🛡️', type: 'DAILY', isZero: true },
];

const SUPPORT_FAQS = [
  { q: 'My GPS is not updating', a: 'Ensure location permission is "Always Allow" in phone Settings. Restart the app if GPS is stuck.' },
  { q: 'Customer is not reachable', a: 'Try calling 2–3 times. If unreachable, tap "Support" and raise a ticket — we will handle it.' },
  { q: 'Order was wrong or incomplete', a: 'Do not leave. Call restaurant and customer. Raise a support ticket with photo proof.' },
  { q: 'I need to cancel an accepted order', a: 'Contact support immediately. Repeat cancellations will affect your rating and incentives.' },
  { q: 'When will my earnings be credited?', a: 'Wallet is credited instantly after OTP verification. UPI cashout usually settles in 2–5 minutes.' },
];

export default function RiderPortal({
  orders,
  onAcceptTrip,
  onUpdateOrderStatus,
  riderName = 'Murugan S.',
  riderLocation,
  onUpdateLocation
}) {
  // ── Core State ────────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // ── GPS / Simulation ──────────────────────────────────────────────────────
  const [gpsActive, setGpsActive] = useState(true);
  const [gpsMode, setGpsMode] = useState('simulation');
  const [autoDriveActive, setAutoDriveActive] = useState(true);
  const [gpsLat, setGpsLat] = useState(() => parseFloat(riderLocation?.lat) || 12.9056);
  const [gpsLng, setGpsLng] = useState(() => parseFloat(riderLocation?.lng) || 80.0832);

  // ── OTP Modal ─────────────────────────────────────────────────────────────
  const [otpModalTrip, setOtpModalTrip] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // ── New Order Alert ───────────────────────────────────────────────────────
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [alertCountdown, setAlertCountdown] = useState(30);
  const alertTimerRef = useRef(null);
  const prevAvailableRef = useRef([]);

  // ── SOS ───────────────────────────────────────────────────────────────────
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const sosTimerRef = useRef(null);

  // ── Withdraw ──────────────────────────────────────────────────────────────
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawUpiId, setWithdrawUpiId] = useState('8248651695@ybl');
  const [withdrawAmount, setWithdrawAmount] = useState('300');
  const [withdrawNotice, setWithdrawNotice] = useState('');

  // ── Support ───────────────────────────────────────────────────────────────
  const [supportTicket, setSupportTicket] = useState({ subject: '', message: '' });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // ── Computed Order Buckets ─────────────────────────────────────────────────
  const currentRiderId = 'rider-1';
  const myActiveTrips = orders.filter(
    o => (o.riderId === currentRiderId || o.riderName === riderName) && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  const availableTrips = orders.filter(
    o => (!o.riderId || o.riderId === '') && o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED'
  );
  const completedTrips = orders.filter(
    o => (o.riderId === currentRiderId || o.riderName === riderName) && o.status === 'DELIVERED'
  );

  // ── Earnings ──────────────────────────────────────────────────────────────
  const deliveredEarnings = completedTrips.reduce((acc, t) => acc + (t.riderEarnings || 65), 0);
  const todayEarnings = deliveredEarnings > 0 ? deliveredEarnings + 60 : 380;

  const [walletBalance, setWalletBalance] = useState(() => {
    try { return Number(localStorage.getItem('unavu_rider_wallet')) || 620; } catch { return 620; }
  });
  const [walletTransactions, setWalletTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_rider_txns');
      return saved ? JSON.parse(saved) : [
        { id: 'tx-1', title: 'Trip Payout #UK-4821', type: 'CREDIT', amount: 65, time: '12:35 PM', desc: 'Perungalathur to Peerkankaranai drop' },
        { id: 'tx-2', title: 'Monsoon Rain Incentive', type: 'CREDIT', amount: 35, time: '01:10 PM', desc: 'Peak weather surge bonus' },
        { id: 'tx-3', title: 'Customer Doorstep Tip', type: 'CREDIT', amount: 20, time: '01:45 PM', desc: 'Order #UK-4821 Tip' }
      ];
    } catch { return []; }
  });

  // ── GPS Hardware + Simulation ─────────────────────────────────────────────
  const stepSimulatedPosition = useCallback(() => {
    setGpsLat(prev => {
      const next = Number((prev + (Math.random() * 0.0006 - 0.0001)).toFixed(5));
      setGpsLng(lng => {
        const nextLng = Number((lng + (Math.random() * 0.0006 - 0.0001)).toFixed(5));
        if (onUpdateLocation) {
          onUpdateLocation({
            riderId: currentRiderId, riderName,
            lat: next, lng: nextLng,
            speed: Math.floor(24 + Math.random() * 8),
            heading: 185,
            orderId: myActiveTrips[0]?.orderId || null
          });
        }
        return nextLng;
      });
      return next;
    });
  }, [myActiveTrips, onUpdateLocation, riderName]);

  useEffect(() => {
    if (!gpsActive || !isOnline) return;
    const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
    if (isSecure && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          if (isFinite(lat) && isFinite(lng)) {
            setGpsMode('hardware'); setGpsLat(lat); setGpsLng(lng);
            if (onUpdateLocation) onUpdateLocation({ riderId: currentRiderId, riderName, lat, lng, orderId: myActiveTrips[0]?.orderId || null });
          }
        },
        () => setGpsMode('simulation'),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 4000 }
      );
      return () => navigator.geolocation.clearWatch(id);
    } else setGpsMode('simulation');
  }, [gpsActive, isOnline]);

  useEffect(() => {
    if (!autoDriveActive || !isOnline) return;
    const iv = setInterval(stepSimulatedPosition, 3000);
    return () => clearInterval(iv);
  }, [autoDriveActive, isOnline, stepSimulatedPosition]);

  // ── New Order Alert Pop-up ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || myActiveTrips.length > 0) return;
    const prevIds = prevAvailableRef.current.map(o => o.orderId);
    const newOnes = availableTrips.filter(o => !prevIds.includes(o.orderId));
    if (newOnes.length > 0 && !newOrderAlert) {
      setNewOrderAlert(newOnes[0]);
      setAlertCountdown(30);
    }
    prevAvailableRef.current = availableTrips;
  }, [availableTrips, isOnline, myActiveTrips.length]);

  useEffect(() => {
    if (!newOrderAlert) return;
    if (alertCountdown <= 0) { setNewOrderAlert(null); return; }
    alertTimerRef.current = setTimeout(() => setAlertCountdown(c => c - 1), 1000);
    return () => clearTimeout(alertTimerRef.current);
  }, [newOrderAlert, alertCountdown]);

  // ── SOS Countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sosTriggered) return;
    if (sosCountdown <= 0) {
      setSosTriggered(false);
      setSosModalOpen(false);
      alert('🚨 SOS Alert Sent! Unavukadai Safety Team has been notified. Help is on the way. Emergency services alerted to your GPS location.');
      return;
    }
    sosTimerRef.current = setTimeout(() => setSosCountdown(c => c - 1), 1000);
    return () => clearTimeout(sosTimerRef.current);
  }, [sosTriggered, sosCountdown]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVerifyOtpAndDeliver = (e) => {
    e.preventDefault();
    if (!otpModalTrip) return;
    const expected = otpModalTrip.deliveryOtp || '4821';
    if (enteredOtp.trim() === expected) {
      setIsVerifyingOtp(true);
      setTimeout(() => {
        setIsVerifyingOtp(false);
        onUpdateOrderStatus(otpModalTrip.orderId, 'DELIVERED');
        const earnings = otpModalTrip.riderEarnings || 65;
        const newTx = {
          id: `tx-${Date.now()}`, title: `Trip Payout #${otpModalTrip.orderId}`, type: 'CREDIT', amount: earnings,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          desc: `Delivered to ${otpModalTrip.customerName || 'Customer'}`
        };
        setWalletBalance(prev => { const v = prev + earnings; localStorage.setItem('unavu_rider_wallet', v); return v; });
        setWalletTransactions(prev => { const v = [newTx, ...prev]; localStorage.setItem('unavu_rider_txns', JSON.stringify(v)); return v; });
        setOtpModalTrip(null);
      }, 700);
    } else {
      setOtpError(`Incorrect OTP! Ask customer ${otpModalTrip.customerName} for the 4-digit PIN.`);
    }
  };

  const handleWithdrawFunds = (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt > walletBalance) { alert('Invalid amount'); return; }
    const tx = { id: `tx-${Date.now()}`, title: 'Instant UPI Withdrawal', type: 'DEBIT', amount: amt, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), desc: `To ${withdrawUpiId}` };
    const bal = walletBalance - amt;
    setWalletBalance(bal); localStorage.setItem('unavu_rider_wallet', bal);
    setWalletTransactions(prev => { const v = [tx, ...prev]; localStorage.setItem('unavu_rider_txns', JSON.stringify(v)); return v; });
    setIsWithdrawModalOpen(false);
    setWithdrawNotice(`✅ ₹${amt} transferred to ${withdrawUpiId}`);
    setTimeout(() => setWithdrawNotice(''), 5000);
  };

  const handleAcceptAlert = () => {
    if (newOrderAlert) { onAcceptTrip(newOrderAlert.orderId); setNewOrderAlert(null); setActiveTab('home'); }
  };

  const handleRejectAlert = () => setNewOrderAlert(null);

  const triggerSos = () => { setSosTriggered(true); setSosCountdown(5); };
  const cancelSos = () => { setSosTriggered(false); clearTimeout(sosTimerRef.current); };

  // ── Helper: Current Trip Status Banner ────────────────────────────────────
  const getStatusStep = (status) => {
    const steps = ['PLACED','CONFIRMED','PREPARING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED'];
    return steps.indexOf(status);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="rp-shell">
      {/* ── New Order Alert Overlay ─────────────────────────────────────── */}
      {newOrderAlert && (
        <div className="rp-order-alert-overlay" onClick={handleRejectAlert}>
          <div className="rp-order-alert-card" onClick={e => e.stopPropagation()}>
            <div className="rp-alert-top">
              <div className="rp-alert-ping-ring" />
              <div className="rp-alert-ping-ring delay" />
              <Bell size={28} className="rp-alert-bell" />
              <div className="rp-alert-timer-ring">
                <span>{alertCountdown}s</span>
              </div>
            </div>
            <h3 className="rp-alert-title">🍲 New Delivery Order!</h3>
            <div className="rp-alert-earning">
              <IndianRupee size={20} />
              <span>{newOrderAlert.riderEarnings || 65}</span>
              <small>Guaranteed</small>
            </div>
            <div className="rp-alert-route">
              <div className="rp-alert-point">
                <span className="rp-dot orange" />
                <div>
                  <strong>{newOrderAlert.restaurantName}</strong>
                  <small>{newOrderAlert.restaurantAddress || newOrderAlert.locality}</small>
                </div>
              </div>
              <div className="rp-alert-vline" />
              <div className="rp-alert-point">
                <span className="rp-dot crimson" />
                <div>
                  <strong>{newOrderAlert.customerName}</strong>
                  <small>{newOrderAlert.customerAddress || newOrderAlert.address}</small>
                </div>
              </div>
            </div>
            <div className="rp-alert-meta">
              <span>📦 {newOrderAlert.items?.length || 1} items</span>
              <span>~2.4 km</span>
              <span>~18 min</span>
            </div>
            <div className="rp-alert-actions">
              <button className="rp-btn-reject" onClick={handleRejectAlert}>
                <X size={16} /> Reject
              </button>
              <button className="rp-btn-accept" onClick={handleAcceptAlert}>
                <CheckCircle2 size={16} /> Accept Trip
              </button>
            </div>
            <div className="rp-alert-progress">
              <div className="rp-alert-progress-fill" style={{ width: `${(alertCountdown / 30) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── SOS Modal ──────────────────────────────────────────────────── */}
      {sosModalOpen && (
        <div className="rp-sos-backdrop" onClick={() => { if (!sosTriggered) setSosModalOpen(false); }}>
          <div className="rp-sos-modal" onClick={e => e.stopPropagation()}>
            <div className={`rp-sos-pulse-ring ${sosTriggered ? 'triggered' : ''}`} />
            <Siren size={40} className="rp-sos-icon" />
            <h2>Emergency SOS</h2>
            <p>Your GPS location will be shared with Unavukadai Safety Team & emergency services.</p>
            <div className="rp-sos-quick">
              <a href="tel:112" className="rp-sos-quick-btn red"><PhoneCall size={18}/> Police (112)</a>
              <a href="tel:108" className="rp-sos-quick-btn orange"><PhoneCall size={18}/> Ambulance (108)</a>
              <a href="tel:18004251234" className="rp-sos-quick-btn blue"><Headphones size={18}/> Unavu Support</a>
            </div>
            {!sosTriggered ? (
              <button className="rp-sos-send-btn" onClick={triggerSos}>
                <Shield size={20}/> SEND SOS (hold to confirm)
              </button>
            ) : (
              <div className="rp-sos-countdown">
                <div className="rp-sos-count-ring">
                  <span>{sosCountdown}</span>
                </div>
                <p>Sending SOS in {sosCountdown}s…</p>
                <button className="rp-btn-cancel-sos" onClick={cancelSos}>✕ Cancel</button>
              </div>
            )}
            {!sosTriggered && <button className="rp-sos-dismiss" onClick={() => setSosModalOpen(false)}>Dismiss</button>}
          </div>
        </div>
      )}

      {/* ── OTP Modal ──────────────────────────────────────────────────── */}
      {otpModalTrip && (
        <div className="modal-backdrop animate-fade" onClick={() => setOtpModalTrip(null)}>
          <div className="collect-otp-modal animate-scale" onClick={e => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setOtpModalTrip(null)}><X size={20}/></button>
            <div className="collect-otp-header">
              <div className="collect-otp-icon-wrap"><KeyRound size={28} className="text-crimson"/></div>
              <h3>Collect Delivery OTP</h3>
              <p className="collect-otp-subtitle">
                Ask customer <strong>{otpModalTrip.customerName}</strong> for the 4-digit PIN on their tracking screen.
              </p>
            </div>
            <div className="collect-otp-order-summary">
              <div className="otp-summary-row"><span>Order ID:</span><strong>#{otpModalTrip.orderId}</strong></div>
              <div className="otp-summary-row"><span>Customer:</span><strong>{otpModalTrip.customerPhone || '+91 98401 23456'}</strong></div>
              <div className="otp-summary-row"><span>Address:</span><span>{otpModalTrip.customerAddress || otpModalTrip.address}</span></div>
              <div className="otp-summary-row highlight"><span>Your Payout:</span><strong className="text-green">+₹{otpModalTrip.riderEarnings || 65}</strong></div>
            </div>
            <form onSubmit={handleVerifyOtpAndDeliver} className="collect-otp-form">
              <label className="otp-input-label">Enter 4-Digit Customer OTP</label>
              <div className="otp-input-wrapper">
                <input
                  type="text" maxLength={4} autoFocus placeholder="• • • •"
                  value={enteredOtp}
                  onChange={e => { setEnteredOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  className="collect-otp-input"
                />
              </div>
              {otpError && <p className="otp-verify-error animate-shake">{otpError}</p>}
              <div className="collect-otp-actions">
                <button type="button" className="btn-outline" onClick={() => setOtpModalTrip(null)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1 btn-confirm-deliver" disabled={enteredOtp.length < 4 || isVerifyingOtp}>
                  {isVerifyingOtp ? <Loader2 size={18} className="spin"/> : <><CheckCircle2 size={18}/><span>Verify & Mark Delivered</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Withdraw Modal ─────────────────────────────────────────────── */}
      {isWithdrawModalOpen && (
        <div className="modal-backdrop animate-fade" onClick={() => setIsWithdrawModalOpen(false)}>
          <div className="collect-otp-modal animate-scale" onClick={e => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setIsWithdrawModalOpen(false)}><X size={20}/></button>
            <div className="collect-otp-header">
              <div className="collect-otp-icon-wrap" style={{ background: 'rgba(34,197,94,0.12)' }}><Zap size={28} className="text-green"/></div>
              <h3>Instant UPI Cashout</h3>
              <p className="collect-otp-subtitle">Transfer earnings to bank. Zero fee. Settles in 2–5 minutes.</p>
            </div>
            <form onSubmit={handleWithdrawFunds} className="collect-otp-form">
              <div style={{ fontSize:'28px', fontWeight:900, color:'#16a34a', margin:'4px 0 12px' }}>₹{walletBalance}</div>
              <div className="quick-withdraw-chips mb-2">
                {[100,250,500].filter(v => v <= walletBalance).map(val => (
                  <button key={val} type="button" className="quick-chip-btn" onClick={() => setWithdrawAmount(String(val))}>₹{val}</button>
                ))}
                <button type="button" className="quick-chip-btn max" onClick={() => setWithdrawAmount(String(walletBalance))}>All</button>
              </div>
              <div className="form-group mb-2">
                <label className="field-label-bold">UPI ID</label>
                <input type="text" className="styled-input" value={withdrawUpiId} onChange={e => setWithdrawUpiId(e.target.value)} required/>
              </div>
              <div className="form-group mb-3">
                <label className="field-label-bold">Amount (₹)</label>
                <input type="number" className="styled-input" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} min={1} max={walletBalance} required/>
              </div>
              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" className="btn-secondary flex-1" onClick={() => setIsWithdrawModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={!withdrawAmount || Number(withdrawAmount) > walletBalance}>
                  <Send size={16}/> Transfer ₹{withdrawAmount || 0}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Header Bar ─────────────────────────────────────────────────── */}
      <div className="rp-header">
        <div className="rp-header-left">
          <div className="rp-avatar">
            {riderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="rp-rider-name">{riderName}</div>
            <div className="rp-rider-sub">⭐ 4.9 · Fleet Captain · TN-19</div>
          </div>
        </div>
        <div className="rp-header-right">
          <button
            className={`rp-online-toggle ${isOnline ? 'online' : 'offline'}`}
            onClick={() => setIsOnline(o => !o)}
          >
            <Power size={15}/>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
          <button className="rp-sos-fab" onClick={() => setSosModalOpen(true)} title="Emergency SOS">
            <Siren size={18}/>
          </button>
        </div>
      </div>

      {/* ── GPS Status Strip ────────────────────────────────────────────── */}
      <div className="rp-gps-strip">
        <Locate size={12} className={gpsActive ? 'text-green' : 'text-muted'}/>
        <span>{gpsMode === 'hardware' ? '📍 Live GPS' : '📡 Simulated'}: {gpsLat.toFixed(4)}, {gpsLng.toFixed(4)}</span>
        <button
          className={`rp-gps-pill ${autoDriveActive ? 'active' : ''}`}
          onClick={() => setAutoDriveActive(a => !a)}
        >
          {autoDriveActive ? '🟢 Auto-Drive ON' : '⚪ Auto-Drive OFF'}
        </button>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="rp-tabs">
        {[
          { id: 'home', icon: <Home size={18}/>, label: 'Home' },
          { id: 'radar', icon: <Radio size={18}/>, label: 'Orders', badge: availableTrips.length || null },
          { id: 'navigate', icon: <Map size={18}/>, label: 'Navigate' },
          { id: 'earnings', icon: <Wallet size={18}/>, label: 'Wallet', badge: walletBalance > 0 ? `₹${walletBalance}` : null },
          { id: 'history', icon: <History size={18}/>, label: 'History' },
          { id: 'heatmap', icon: <Flame size={18}/>, label: 'Heatmap' },
          { id: 'incentives', icon: <Gift size={18}/>, label: 'Incentives' },
          { id: 'support', icon: <Headphones size={18}/>, label: 'Support' },
          { id: 'profile', icon: <User size={18}/>, label: 'Profile' },
        ].map(t => (
          <button
            key={t.id}
            className={`rp-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge && <span className="rp-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      <div className="rp-content">

        {/* ══ HOME TAB ══════════════════════════════════════════════════ */}
        {activeTab === 'home' && (
          <div className="rp-home">
            {/* Earnings Hero */}
            <div className="rp-earnings-hero">
              <div className="rp-earnings-label">Today's Earnings</div>
              <div className="rp-earnings-big">₹{todayEarnings}</div>
              <div className="rp-earnings-chips">
                <span>{completedTrips.length} deliveries</span>
                <span>+₹35 surge</span>
                <span>+₹20 tips</span>
              </div>
              {withdrawNotice && <div className="rp-withdraw-notice">{withdrawNotice}</div>}
            </div>

            {/* Status Cards Grid */}
            <div className="rp-stat-grid">
              <div className="rp-stat-card">
                <Clock size={20} className="rp-stat-icon orange"/>
                <div className="rp-stat-val">{myActiveTrips.length}</div>
                <div className="rp-stat-label">Active</div>
              </div>
              <div className="rp-stat-card">
                <CheckCircle2 size={20} className="rp-stat-icon green"/>
                <div className="rp-stat-val">{completedTrips.length}</div>
                <div className="rp-stat-label">Done Today</div>
              </div>
              <div className="rp-stat-card">
                <Star size={20} className="rp-stat-icon yellow"/>
                <div className="rp-stat-val">4.9</div>
                <div className="rp-stat-label">Rating</div>
              </div>
              <div className="rp-stat-card">
                <Wallet size={20} className="rp-stat-icon purple"/>
                <div className="rp-stat-val">₹{walletBalance}</div>
                <div className="rp-stat-label">Wallet</div>
              </div>
            </div>

            {/* Active Trip Panel */}
            {myActiveTrips.length > 0 ? (
              <div className="rp-active-trip">
                <div className="rp-active-trip-header">
                  <div className="rp-live-dot"/><span>ACTIVE TRIP</span>
                  <span className="rp-trip-id">#{myActiveTrips[0].orderId}</span>
                </div>

                {/* Step flow */}
                <div className="rp-step-flow">
                  {['Accepted','At Kitchen','Picked Up','Delivered'].map((step, i) => {
                    const statusStep = getStatusStep(myActiveTrips[0].status);
                    const done = i < statusStep;
                    const curr = i === statusStep || (i === 1 && statusStep >= 2 && statusStep < 5) || (i === 2 && statusStep >= 5);
                    return (
                      <div key={step} className={`rp-step ${done ? 'done' : curr ? 'current' : ''}`}>
                        <div className="rp-step-dot">{done ? '✓' : i+1}</div>
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Route */}
                <div className="rp-route-block">
                  <div className="rp-route-point">
                    <span className="rp-dot orange"/>
                    <div>
                      <strong>{myActiveTrips[0].restaurantName}</strong>
                      <small>{myActiveTrips[0].restaurantAddress || myActiveTrips[0].restaurantLocality}</small>
                    </div>
                  </div>
                  <div className="rp-route-vline"/>
                  <div className="rp-route-point">
                    <span className="rp-dot crimson"/>
                    <div>
                      <strong>{myActiveTrips[0].customerName}</strong>
                      <small>{myActiveTrips[0].customerAddress || myActiveTrips[0].address}</small>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="rp-trip-actions">
                  {(myActiveTrips[0].status === 'PLACED' || myActiveTrips[0].status === 'CONFIRMED' || myActiveTrips[0].status === 'PREPARING') && (
                    <div className="rp-info-notice">
                      👨‍🍳 Food being prepared. Head towards {myActiveTrips[0].restaurantName}.
                    </div>
                  )}
                  {myActiveTrips[0].status === 'READY_FOR_PICKUP' && (
                    <button className="rp-btn-pickup" onClick={() => onUpdateOrderStatus(myActiveTrips[0].orderId, 'OUT_FOR_DELIVERY')}>
                      <Package size={18}/> Confirm Picked Up → Start Delivery
                    </button>
                  )}
                  {myActiveTrips[0].status === 'OUT_FOR_DELIVERY' && (
                    <button className="rp-btn-deliver" onClick={() => { setOtpModalTrip(myActiveTrips[0]); setEnteredOtp(''); setOtpError(''); }}>
                      <KeyRound size={18}/> Collect OTP & Mark Delivered
                    </button>
                  )}
                  <div className="rp-nav-actions">
                    <button className="rp-btn-nav" onClick={() => {
                      const trip = myActiveTrips[0];
                      const dest = trip.deliveryCoords?.length === 2
                        ? `${trip.deliveryCoords[0]},${trip.deliveryCoords[1]}`
                        : encodeURIComponent(trip.customerAddress || trip.locality + ', Chennai');
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                    }}>
                      <Navigation size={15}/> Google Maps
                    </button>
                    <a href={`tel:${(myActiveTrips[0].customerPhone || '+919840123456').replace(/\s+/g, '')}`} className="rp-btn-call">
                      <Phone size={15}/> Call Customer
                    </a>
                    {myActiveTrips[0].restaurantPhone && (
                      <a href={`tel:${myActiveTrips[0].restaurantPhone.replace(/\s+/g, '')}`} className="rp-btn-call" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                        <Phone size={15}/> Call Restaurant
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rp-idle-state">
                {isOnline ? (
                  <>
                    <div className="rp-idle-radar">
                      <div className="rp-radar-ring r1"/>
                      <div className="rp-radar-ring r2"/>
                      <div className="rp-radar-ring r3"/>
                      <Bike size={32} className="rp-radar-icon"/>
                    </div>
                    <h3>Scanning for orders…</h3>
                    <p>You'll receive an alert when a new order is nearby. Stay in Kilambakkam–Vandalur zone for best demand.</p>
                    {availableTrips.length > 0 && (
                      <button className="rp-btn-primary" onClick={() => setActiveTab('radar')}>
                        View {availableTrips.length} Available Order{availableTrips.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Power size={36} className="text-muted"/>
                    <h3>You are Offline</h3>
                    <p>Toggle to Online to start receiving orders and earning.</p>
                    <button className="rp-btn-primary" onClick={() => setIsOnline(true)}>
                      Go Online
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ RADAR (ORDERS) TAB ════════════════════════════════════════ */}
        {activeTab === 'radar' && (
          <div className="rp-radar-body">
            <div className="rp-section-header">
              <h3>Available Orders</h3>
              <span className="rp-count-pill">{availableTrips.length} waiting</span>
            </div>

            {myActiveTrips.length > 0 && (
              <div className="rp-lock-banner">
                <Lock size={16}/> Delivering #{myActiveTrips[0].orderId} — finish first before accepting new orders.
              </div>
            )}

            {!isOnline ? (
              <div className="rp-empty-state"><Power size={40}/><p>Go online to see orders</p></div>
            ) : availableTrips.length === 0 ? (
              <div className="rp-empty-state"><Clock size={40}/><p>No orders nearby right now. Try repositioning to Kilambakkam or Tambaram area.</p></div>
            ) : (
              <div className="rp-order-cards">
                {availableTrips.map(trip => (
                  <div key={trip.orderId} className={`rp-order-card ${myActiveTrips.length > 0 ? 'locked' : ''}`}>
                    <div className="rp-order-card-top">
                      <div className="rp-earning-badge">
                        <IndianRupee size={14}/><strong>{trip.riderEarnings || 65}</strong>
                        <small>guaranteed</small>
                      </div>
                      <div className="rp-order-meta-chips">
                        <span>~2.4 km</span>
                        <span>~18 min</span>
                      </div>
                    </div>
                    <div className="rp-order-route">
                      <div className="rp-route-point">
                        <span className="rp-dot orange"/>
                        <div><strong>{trip.restaurantName}</strong><small>{trip.restaurantAddress || trip.locality}</small></div>
                      </div>
                      <div className="rp-route-vline"/>
                      <div className="rp-route-point">
                        <span className="rp-dot crimson"/>
                        <div><strong>Drop: {trip.locality}</strong><small>{trip.customerAddress || trip.address}</small></div>
                      </div>
                    </div>
                    <div className="rp-order-foot">
                      <span>#{trip.orderId} · {trip.items?.length || 1} items · ₹{trip.grandTotal}</span>
                    </div>
                    <button
                      className={`rp-btn-accept-trip ${myActiveTrips.length > 0 ? 'disabled' : ''}`}
                      disabled={myActiveTrips.length > 0}
                      onClick={() => { if (!myActiveTrips.length) { onAcceptTrip(trip.orderId); setActiveTab('home'); } }}
                    >
                      {myActiveTrips.length > 0 ? (<><Lock size={14}/> Locked</>) : (<>Accept Trip <ChevronRight size={16}/></>)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ NAVIGATE TAB ═════════════════════════════════════════════ */}
        {activeTab === 'navigate' && (
          <div className="rp-navigate-body">
            <div className="rp-section-header">
              <h3>Navigation</h3>
              <span className="rp-gps-badge">{gpsMode === 'hardware' ? '📍 Live GPS' : '📡 Simulated'}</span>
            </div>

            {myActiveTrips.length > 0 ? (
              <>
                <div className="rp-nav-card">
                  <div className="rp-nav-status">
                    <div className="rp-nav-status-dot"/>
                    <span>Active Delivery #{myActiveTrips[0].orderId}</span>
                  </div>

                  <div className="rp-nav-waypoints">
                    <div className="rp-nav-wp">
                      <div className="rp-nav-wp-icon pickup">🏪</div>
                      <div>
                        <div className="rp-nav-wp-label">PICKUP</div>
                        <div className="rp-nav-wp-name">{myActiveTrips[0].restaurantName}</div>
                        <div className="rp-nav-wp-addr">{myActiveTrips[0].restaurantAddress || myActiveTrips[0].restaurantLocality}</div>
                      </div>
                    </div>
                    <div className="rp-nav-wp-line"/>
                    <div className="rp-nav-wp">
                      <div className="rp-nav-wp-icon drop">📍</div>
                      <div>
                        <div className="rp-nav-wp-label">DROP</div>
                        <div className="rp-nav-wp-name">{myActiveTrips[0].customerName}</div>
                        <div className="rp-nav-wp-addr">{myActiveTrips[0].customerAddress || myActiveTrips[0].address}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rp-nav-btns">
                    <button className="rp-nav-maps-btn" onClick={() => {
                      const dest = encodeURIComponent(myActiveTrips[0].customerAddress || myActiveTrips[0].locality + ', Chennai');
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                    }}>
                      <Navigation size={18}/> Open in Google Maps
                    </button>
                    <button className="rp-nav-maps-btn" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }} onClick={() => {
                      const dest = encodeURIComponent(myActiveTrips[0].restaurantAddress || myActiveTrips[0].restaurantLocality + ', Chennai');
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                    }}>
                      <MapPin size={18}/> Navigate to Restaurant
                    </button>
                  </div>
                </div>

                <div className="rp-gps-telemetry">
                  <div className="rp-telem-row">
                    <span>Current Position</span>
                    <strong>{gpsLat.toFixed(5)}, {gpsLng.toFixed(5)}</strong>
                  </div>
                  <div className="rp-telem-row">
                    <span>GPS Mode</span>
                    <strong>{gpsMode === 'hardware' ? '📍 Hardware GPS' : '📡 Simulated'}</strong>
                  </div>
                  <div className="rp-telem-row">
                    <span>Auto-Drive</span>
                    <button className={`rp-gps-pill ${autoDriveActive ? 'active' : ''}`} onClick={() => setAutoDriveActive(a => !a)}>
                      {autoDriveActive ? 'ON (3s broadcast)' : 'OFF'}
                    </button>
                  </div>
                  <div className="rp-telem-row">
                    <span>Manual Step</span>
                    <button className="rp-btn-step" onClick={stepSimulatedPosition}>⚡ Step GPS</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rp-empty-state">
                <Map size={40}/>
                <p>Accept an order to see navigation details.</p>
                <button className="rp-btn-primary" onClick={() => setActiveTab('radar')}>View Orders</button>
              </div>
            )}
          </div>
        )}

        {/* ══ EARNINGS/WALLET TAB ══════════════════════════════════════ */}
        {activeTab === 'earnings' && (
          <div className="rp-earnings-body">
            <div className="rp-wallet-hero">
              <div>
                <div className="rp-wallet-label">💼 Rider Wallet Balance</div>
                <div className="rp-wallet-amount">₹{walletBalance}</div>
                <div className="rp-wallet-sub">Instant UPI · Zero deductions</div>
              </div>
              <button className="rp-btn-cashout" onClick={() => setIsWithdrawModalOpen(true)}>
                <Zap size={16}/> Cashout
              </button>
            </div>

            {withdrawNotice && <div className="rp-withdraw-notice">{withdrawNotice}</div>}

            <div className="rp-wallet-chips">
              <span>{completedTrips.length} trips today</span>
              <span>Fares: ₹{deliveredEarnings || 320}</span>
              <span>Surge: ₹35</span>
              <span>Tips: ₹20</span>
            </div>

            <div className="rp-daily-target">
              <div className="rp-target-header">
                <span>Daily Target: ₹800</span>
                <strong>{Math.min(100, Math.round((walletBalance / 800) * 100))}%</strong>
              </div>
              <div className="rp-progress-track">
                <div className="rp-progress-fill" style={{ width: `${Math.min(100, Math.round((walletBalance / 800) * 100))}%` }}/>
              </div>
              <small>₹{Math.max(0, 800 - walletBalance)} more to hit daily goal 🎯</small>
            </div>

            <div className="rp-ledger">
              <div className="rp-ledger-header">
                <span>📜 Transaction History</span>
                <span>{walletTransactions.length} events</span>
              </div>
              {walletTransactions.map(tx => (
                <div key={tx.id} className="rp-ledger-row">
                  <div className={`rp-ledger-icon ${tx.type === 'CREDIT' ? 'credit' : 'debit'}`}>
                    {tx.type === 'CREDIT' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                  </div>
                  <div className="rp-ledger-info">
                    <strong>{tx.title}</strong>
                    <span>{tx.desc} · {tx.time}</span>
                  </div>
                  <div className={`rp-ledger-amount ${tx.type === 'CREDIT' ? 'credit' : 'debit'}`}>
                    {tx.type === 'CREDIT' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ HISTORY TAB ══════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="rp-history-body">
            <div className="rp-section-header">
              <h3>Completed Deliveries</h3>
              <span className="rp-count-pill green">{completedTrips.length} done</span>
            </div>

            {completedTrips.length === 0 ? (
              <div className="rp-empty-state">
                <History size={40}/>
                <p>No deliveries yet today. Accept orders and complete them to see history here.</p>
              </div>
            ) : (
              <div className="rp-history-list">
                {completedTrips.map(t => (
                  <div key={t.orderId} className="rp-history-card">
                    <div className="rp-history-left">
                      <div className="rp-history-icon">✓</div>
                      <div>
                        <strong>#{t.orderId} — {t.restaurantName}</strong>
                        <span>{t.customerAddress || t.address}</span>
                        <small>OTP verified · ₹{t.grandTotal} bill</small>
                      </div>
                    </div>
                    <div className="rp-history-right">
                      <strong className="text-green">+₹{t.riderEarnings || 65}</strong>
                      <span>Settled</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedTrips.length > 0 && (
              <div className="rp-history-summary">
                <div className="rp-summary-row"><span>Total deliveries</span><strong>{completedTrips.length}</strong></div>
                <div className="rp-summary-row"><span>Total earned</span><strong className="text-green">₹{deliveredEarnings + 55}</strong></div>
                <div className="rp-summary-row"><span>Average per trip</span><strong>₹{completedTrips.length > 0 ? Math.round((deliveredEarnings + 55) / completedTrips.length) : 0}</strong></div>
              </div>
            )}
          </div>
        )}

        {/* ══ DEMAND HEATMAP TAB ═══════════════════════════════════════ */}
        {activeTab === 'heatmap' && (
          <div className="rp-heatmap-body">
            <div className="rp-section-header">
              <h3>🔥 Demand Heatmap</h3>
              <span className="rp-count-pill orange">Live · 5 min refresh</span>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Reposition to high-demand zones to maximize order frequency and surge bonuses.
            </p>

            <div className="rp-heatmap-legend">
              <span className="rp-legend-dot red"/>High Demand
              <span className="rp-legend-dot orange" style={{ marginLeft: '12px' }}/>Medium
              <span className="rp-legend-dot green" style={{ marginLeft: '12px' }}/>Low
            </div>

            <div className="rp-heatmap-zones">
              {DEMAND_ZONES.sort((a, b) => b.orders - a.orders).map(zone => (
                <div key={zone.name} className="rp-zone-card" style={{ borderLeft: `4px solid ${zone.color}` }}>
                  <div className="rp-zone-left">
                    <div className="rp-zone-name">{zone.name}</div>
                    <div className="rp-zone-coords">{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</div>
                  </div>
                  <div className="rp-zone-right">
                    <div className="rp-zone-orders" style={{ color: zone.color }}>{zone.orders}</div>
                    <div className="rp-zone-label">orders</div>
                    <div className="rp-zone-demand-pill" style={{ background: zone.color + '22', color: zone.color }}>
                      {zone.demand}
                    </div>
                  </div>
                  <button className="rp-zone-nav-btn" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${zone.lat},${zone.lng}`, '_blank')}>
                    <Navigation size={13}/> Go
                  </button>
                </div>
              ))}
            </div>

            <div className="rp-heatmap-tip">
              💡 <strong>Tip:</strong> Kilambakkam and Tambaram have the highest active demand right now. Move within 1 km of these zones for faster order assignments.
            </div>
          </div>
        )}

        {/* ══ INCENTIVES TAB ═══════════════════════════════════════════ */}
        {activeTab === 'incentives' && (
          <div className="rp-incentives-body">
            <div className="rp-section-header">
              <h3>🎁 Incentives & Bonuses</h3>
              <span className="rp-count-pill purple">Today</span>
            </div>

            <div className="rp-incentive-total">
              <Trophy size={24} className="rp-trophy-icon"/>
              <div>
                <div className="rp-incentive-total-label">Potential Bonus Today</div>
                <div className="rp-incentive-total-val">
                  ₹{INCENTIVE_TARGETS.reduce((s, i) => s + i.reward, 0)}
                </div>
              </div>
            </div>

            {INCENTIVE_TARGETS.map(inc => {
              const pct = inc.isZero ? 100 : inc.isStar
                ? (inc.current >= inc.target ? 100 : Math.round((inc.current / inc.target) * 100))
                : Math.min(100, Math.round((inc.current / inc.target) * 100));
              const done = inc.isZero ? inc.current === 0 : inc.isStar ? inc.current >= inc.target : inc.current >= inc.target;

              return (
                <div key={inc.id} className={`rp-incentive-card ${done ? 'done' : ''}`}>
                  <div className="rp-incentive-top">
                    <span className="rp-incentive-emoji">{inc.icon}</span>
                    <div className="rp-incentive-info">
                      <strong>{inc.title}</strong>
                      <span className="rp-incentive-type-pill">{inc.type}</span>
                    </div>
                    <div className="rp-incentive-reward">
                      <span>+₹{inc.reward}</span>
                      {done && <CheckCircle2 size={16} className="text-green"/>}
                    </div>
                  </div>
                  <div className="rp-inc-progress">
                    <div className="rp-inc-track">
                      <div className="rp-inc-fill" style={{ width: `${pct}%`, background: done ? '#22c55e' : '#f97316' }}/>
                    </div>
                    <span className="rp-inc-pct">
                      {inc.isZero ? 'Maintaining ✓' : inc.isStar ? `${inc.current} / ${inc.target}★` : `${inc.current} / ${inc.target}`}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="rp-incentive-notice">
              ⏰ All daily incentives reset at midnight. Peak-hour bonuses apply 12–2 PM and 7–9 PM.
            </div>
          </div>
        )}

        {/* ══ SUPPORT TAB ══════════════════════════════════════════════ */}
        {activeTab === 'support' && (
          <div className="rp-support-body">
            <div className="rp-section-header">
              <h3>🎧 Rider Support</h3>
            </div>

            <div className="rp-support-quick">
              <a href="tel:18004251234" className="rp-support-quick-card">
                <PhoneCall size={20} className="text-green"/>
                <span>Call Support</span>
                <small>24/7 Helpline</small>
              </a>
              <button className="rp-support-quick-card" onClick={() => window.open('https://wa.me/918248651695?text=Hi+Unavu+Rider+Support', '_blank')}>
                <MessageSquare size={20} className="text-green"/>
                <span>WhatsApp</span>
                <small>Instant Chat</small>
              </button>
              <button className="rp-support-quick-card" onClick={() => setSosModalOpen(true)}>
                <Siren size={20} className="text-crimson"/>
                <span>SOS Emergency</span>
                <small>Safety Alert</small>
              </button>
            </div>

            {/* FAQ */}
            <div className="rp-faq-section">
              <h4>Frequently Asked Questions</h4>
              {SUPPORT_FAQS.map((faq, i) => (
                <div key={i} className="rp-faq-item" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                  <div className="rp-faq-q">
                    <span>{faq.q}</span>
                    <ChevronRight size={16} className={`rp-faq-arrow ${expandedFaq === i ? 'open' : ''}`}/>
                  </div>
                  {expandedFaq === i && <div className="rp-faq-a">{faq.a}</div>}
                </div>
              ))}
            </div>

            {/* Ticket Form */}
            <div className="rp-ticket-section">
              <h4>🎫 Raise a Support Ticket</h4>
              {ticketSubmitted ? (
                <div className="rp-ticket-success">
                  <CheckCircle2 size={28} className="text-green"/>
                  <p>Ticket submitted! Our team will respond within 30 minutes.</p>
                  <button className="rp-btn-primary" onClick={() => { setTicketSubmitted(false); setSupportTicket({ subject: '', message: '' }); }}>
                    Raise Another
                  </button>
                </div>
              ) : (
                <form className="rp-ticket-form" onSubmit={e => { e.preventDefault(); if (supportTicket.subject && supportTicket.message) setTicketSubmitted(true); }}>
                  <div className="form-group mb-2">
                    <label className="field-label-bold">Issue Type</label>
                    <select className="styled-input" value={supportTicket.subject} onChange={e => setSupportTicket(s => ({ ...s, subject: e.target.value }))} required>
                      <option value="">Select issue…</option>
                      <option>Order problem</option>
                      <option>Payment / wallet issue</option>
                      <option>GPS not working</option>
                      <option>Customer complaint</option>
                      <option>Accident or safety issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group mb-3">
                    <label className="field-label-bold">Describe your issue</label>
                    <textarea className="styled-input" rows={4} placeholder="Describe what happened…" value={supportTicket.message} onChange={e => setSupportTicket(s => ({ ...s, message: e.target.value }))} required/>
                  </div>
                  {myActiveTrips.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                      📦 Active order #{myActiveTrips[0].orderId} will be auto-attached to this ticket.
                    </div>
                  )}
                  <button type="submit" className="rp-btn-primary" style={{ width: '100%' }}>
                    <Send size={16}/> Submit Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ══ PROFILE TAB ══════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="rp-profile-body">
            <div className="rp-profile-hero">
              <div className="rp-profile-avatar">
                {riderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="rp-profile-name">{riderName}</div>
              <div className="rp-profile-meta">⭐ 4.9 · Fleet Captain · Since Jan 2025</div>
              <div className="rp-profile-id">Rider ID: rider-001 · TN-19 Zone</div>
            </div>

            <div className="rp-profile-stats">
              <div className="rp-pstat"><strong>{completedTrips.length + 142}</strong><span>Total Deliveries</span></div>
              <div className="rp-pstat"><strong>4.9</strong><span>Avg Rating</span></div>
              <div className="rp-pstat"><strong>98%</strong><span>Completion Rate</span></div>
              <div className="rp-pstat"><strong>₹{(walletBalance + 8420).toLocaleString()}</strong><span>Total Earned</span></div>
            </div>

            <div className="rp-profile-section">
              <h4>🪪 Documents & Verification</h4>
              <div className="rp-doc-list">
                {[
                  { name: 'Aadhaar Card', status: 'VERIFIED' },
                  { name: 'Driving Licence', status: 'VERIFIED' },
                  { name: 'Vehicle RC', status: 'VERIFIED' },
                  { name: 'Insurance', status: 'PENDING' },
                  { name: 'Profile Photo', status: 'VERIFIED' },
                ].map(doc => (
                  <div key={doc.name} className="rp-doc-row">
                    <FileText size={16} className="text-muted"/>
                    <span>{doc.name}</span>
                    <span className={`rp-doc-badge ${doc.status === 'VERIFIED' ? 'verified' : 'pending'}`}>
                      {doc.status === 'VERIFIED' ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rp-profile-section">
              <h4>🏍️ Vehicle Details</h4>
              <div className="rp-vehicle-card">
                <div className="rp-vehicle-row"><span>Vehicle</span><strong>Hero Optima Electric</strong></div>
                <div className="rp-vehicle-row"><span>Reg. Number</span><strong>TN 19 BK 4821</strong></div>
                <div className="rp-vehicle-row"><span>Battery</span><strong>88% · ~60 km range</strong></div>
                <div className="rp-vehicle-row"><span>Zone</span><strong>Kilambakkam–Vandalur–Tambaram</strong></div>
              </div>
            </div>

            <div className="rp-profile-section">
              <h4>⚙️ Preferences</h4>
              <div className="rp-pref-row">
                <span>GPS Auto-Broadcast</span>
                <button className={`rp-toggle-pill ${autoDriveActive ? 'on' : 'off'}`} onClick={() => setAutoDriveActive(a => !a)}>
                  {autoDriveActive ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="rp-pref-row">
                <span>Online Status</span>
                <button className={`rp-toggle-pill ${isOnline ? 'on' : 'off'}`} onClick={() => setIsOnline(o => !o)}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>
              <div className="rp-pref-row">
                <span>Default UPI</span>
                <strong style={{ fontSize: '13px' }}>{withdrawUpiId}</strong>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
