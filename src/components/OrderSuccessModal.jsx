import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bike, 
  Phone, 
  ChefHat, 
  X,
  PackageCheck,
  AlertCircle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import LiveDeliveryMap from './LiveDeliveryMap';

export default function OrderSuccessModal({ 
  order, 
  onClose,
  orders = [],
  onCancelOrder,
  riderLiveLocation
}) {
  if (!order) return null;

  // Retrieve the latest reactive order state from the shared orders store
  const liveOrder = orders.find(o => o.orderId === order.orderId) || order;

  // Map real status to progress step:
  // 'PLACED' -> 1
  // 'PREPARING' -> 2
  // 'READY_FOR_PICKUP' -> 3
  // 'OUT_FOR_DELIVERY' -> 4
  // 'DELIVERED' -> 5
  const getStepNumber = (status) => {
    switch (status) {
      case 'PLACED': return 1;
      case 'PREPARING': return 2;
      case 'READY_FOR_PICKUP': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  const currentStep = getStepNumber(liveOrder.status);

  const steps = [
    { 
      num: 1, 
      label: 'Order Confirmed', 
      desc: liveOrder.status === 'PLACED' ? 'Sent to restaurant kitchen' : 'Kitchen received order', 
      icon: PackageCheck 
    },
    { 
      num: 2, 
      label: 'Kitchen Preparing', 
      desc: liveOrder.status === 'PREPARING' ? 'Chef is actively cooking dishes' : (currentStep > 2 ? 'Dishes prepared' : 'Waiting for kitchen to accept'), 
      icon: ChefHat 
    },
    { 
      num: 3, 
      label: 'Food Ready for Pickup', 
      desc: liveOrder.riderName ? `Assigned to ${liveOrder.riderName}` : 'Packaged in kitchen • Finding nearby rider', 
      icon: Bike 
    },
    { 
      num: 4, 
      label: 'Out for Delivery', 
      desc: liveOrder.status === 'OUT_FOR_DELIVERY' ? 'Rider is on the way to your address' : (currentStep > 4 ? 'Arrived at your doorstep' : 'Pending rider pickup'), 
      icon: Clock 
    }
  ];

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="order-success-modal animate-scale" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Celebration Header */}
        <div className="order-success-header">
          <div className={`success-icon-bounce ${liveOrder.status === 'DELIVERED' ? 'delivered-glow' : ''}`}>
            <CheckCircle2 size={48} className="icon-success-circle" />
          </div>
          <h2>
            {liveOrder.status === 'DELIVERED' 
              ? 'Order Delivered Successfully!' 
              : 'Order Placed & Live Tracking'}
          </h2>
          <p className="order-id-code">Order ID: #{liveOrder.orderId}</p>
        </div>

        {/* Real-time Order Tracker Card */}
        <div className="live-tracker-card">
          <div className="tracker-eta-header">
            <div>
              <span className="eta-caption">Delivery SLA Status</span>
              <div className="eta-time-highlight">
                <Clock size={20} className="icon-crimson" />
                <span>
                  {liveOrder.status === 'DELIVERED' 
                    ? 'Delivered' 
                    : `${liveOrder.etaMins || 25} Mins Estimated`}
                </span>
              </div>
            </div>
            <div className={`eta-badge-live ${liveOrder.status === 'DELIVERED' ? 'delivered' : ''}`}>
              {liveOrder.status !== 'DELIVERED' && <span className="live-dot-pulse"></span>}
              <span>{liveOrder.status.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="tracker-steps-flow">
            {steps.map((st) => {
              const Icon = st.icon;
              const isDone = currentStep > st.num || liveOrder.status === 'DELIVERED';
              const isCurrent = currentStep === st.num && liveOrder.status !== 'DELIVERED';

              return (
                <div 
                  key={st.num} 
                  className={`tracker-step-item ${isDone ? 'completed' : ''} ${isCurrent ? 'in-progress' : ''}`}
                >
                  <div className="tracker-step-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div className="tracker-step-text">
                    <span className="tracker-step-title">{st.label}</span>
                    <span className="tracker-step-desc">{st.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time OpenStreetMap Delivery Route & Live Rider Bike */}
          <LiveDeliveryMap 
            order={liveOrder} 
            riderLiveLocation={riderLiveLocation}
            height="220px"
          />

          {/* Doorstep Delivery Verification OTP (Collect OTP) */}
          {liveOrder.status !== 'DELIVERED' ? (
            <div className={`delivery-otp-card animate-fade ${liveOrder.status === 'OUT_FOR_DELIVERY' ? 'active-highlight' : ''}`}>
              <div className="otp-card-header">
                <div className="otp-badge-tag">
                  <KeyRound size={14} className="icon-crimson" />
                  <span>DOORSTEP VERIFICATION PIN</span>
                </div>
                <span className="otp-security-pill">
                  <ShieldCheck size={12} />
                  <span>Collect OTP</span>
                </span>
              </div>
              <div className="otp-display-row">
                <div className="otp-digits-boxes">
                  {(liveOrder.deliveryOtp || '4821').split('').map((digit, i) => (
                    <span key={i} className="otp-digit-pill">{digit}</span>
                  ))}
                </div>
              </div>
              <p className="otp-explainer-text">
                Share this 4-digit code with delivery partner <strong>{liveOrder.riderName || 'Partner'}</strong> at your doorstep to verify order handoff.
              </p>
            </div>
          ) : (
            <div className="delivery-verified-banner animate-fade">
              <CheckCircle2 size={16} className="text-green" />
              <span>Doorstep OTP Verified • Food handed over successfully</span>
            </div>
          )}

          {/* Delivery Partner Profile (Only shown when a REAL rider is assigned) */}
          {liveOrder.riderName ? (
            <div className="delivery-partner-badge animate-fade">
              <div className="driver-avatar">🏍️</div>
              <div className="driver-info">
                <strong>{liveOrder.riderName}</strong>
                <span>Vaccinated • Standard Temperature Checked</span>
                <small className="driver-phone-sub">Contact: {liveOrder.riderPhone || '+91 98765 43210'}</small>
              </div>
              <a 
                href={`tel:${(liveOrder.riderPhone || '+919876543210').replace(/\s+/g, '')}`}
                className="call-driver-btn" 
                style={{ textDecoration: 'none' }}
              >
                <Phone size={14} />
                <span>Call Rider</span>
              </a>
            </div>
          ) : (
            <div className="awaiting-rider-notice">
              <Clock size={15} />
              <span>
                {liveOrder.status === 'PLACED' 
                  ? 'Kitchen is reviewing your order ticket...' 
                  : 'Dispatching nearest rider in ' + liveOrder.locality + '...'}
              </span>
            </div>
          )}

          {/* Real-time Production Workflow Hint */}
          <div className="production-sync-hint">
            <AlertCircle size={14} />
            <span>
              <strong>Real-Time Ecosystem Sync:</strong> Status updates live as Hotel accepts/cooks or Rider picks up.
            </span>
          </div>
        </div>

        {/* Order Summary Recap */}
        <div className="order-recap-box">
          <div className="recap-header">
            <h4>Delivering To</h4>
            <div className="recap-address">
              <MapPin size={14} />
              <span>{liveOrder.customerAddress || liveOrder.address}</span>
            </div>
          </div>

          <div className="recap-items-list">
            {liveOrder.items.map(item => (
              <div key={item.id} className="recap-item-row">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="recap-total-row">
            <span>Total Amount Paid</span>
            <strong>₹{liveOrder.grandTotal}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-modal-actions-row">
          {liveOrder.status === 'PLACED' && onCancelOrder && (
            <button 
              className="btn-outline text-crimson"
              onClick={() => onCancelOrder(liveOrder.orderId)}
            >
              Cancel Order
            </button>
          )}

          <button className="btn-primary flex-1" onClick={onClose}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
