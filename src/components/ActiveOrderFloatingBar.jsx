import React from 'react';
import { Clock, Bike, ChefHat, ArrowRight, KeyRound } from 'lucide-react';

export default function ActiveOrderFloatingBar({
  activeOrder,
  onOpenTracker
}) {
  const ACTIVE_STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'];
  if (!activeOrder || !ACTIVE_STATUSES.includes(activeOrder.status)) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PLACED': return <Clock size={16} className="text-orange" />;
      case 'PREPARING': return <ChefHat size={16} className="text-orange" />;
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY': return <Bike size={16} className="text-green" />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="active-order-floating-bar animate-fade" onClick={onOpenTracker}>
      <div className="floating-bar-content">
        <div className="floating-bar-icon-wrap">
          {getStatusIcon(activeOrder.status)}
        </div>
        <div className="floating-bar-info">
          <div className="floating-bar-title-row">
            <strong>Active Order #{activeOrder.orderId}</strong>
            <span className={`status-badge-mini ${activeOrder.status.toLowerCase()}`}>
              {activeOrder.status.replace(/_/g, ' ')}
            </span>
            {activeOrder.deliveryOtp && (
              <span className="floating-otp-pill">
                <KeyRound size={11} />
                <span>OTP: {activeOrder.deliveryOtp}</span>
              </span>
            )}
          </div>
          <span className="floating-bar-subtitle">
            {activeOrder.restaurantName} • {activeOrder.items.length} items • Delivering to {activeOrder.locality}
          </span>
        </div>
      </div>

      <button className="floating-bar-cta">
        <span>Track Live Status</span>
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
