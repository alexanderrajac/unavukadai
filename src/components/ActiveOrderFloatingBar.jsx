import React from 'react';
import { Clock, Bike, ChefHat, ArrowRight, KeyRound, X } from 'lucide-react';

export default function ActiveOrderFloatingBar({
  activeOrder,
  onOpenTracker,
  onDismiss
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

  const itemCount = Array.isArray(activeOrder.items) && activeOrder.items.length > 0
    ? activeOrder.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)
    : 1;

  const restaurantName = activeOrder.restaurantName || 'Restaurant';
  const destination = activeOrder.locality || activeOrder.customerAddress || 'Your location';

  return (
    <div 
      className="active-order-floating-bar animate-fade" 
      onClick={() => onOpenTracker?.(activeOrder)}
      role="region"
      aria-label={`Active Order ${activeOrder.orderId}`}
    >
      <div className="floating-bar-content">
        <div className="floating-bar-icon-wrap">
          {getStatusIcon(activeOrder.status)}
        </div>
        <div className="floating-bar-info">
          <div className="floating-bar-title-row">
            <strong>Active Order #{activeOrder.orderId}</strong>
            <span className={`status-badge-mini ${String(activeOrder.status).toLowerCase()}`}>
              {String(activeOrder.status).replace(/_/g, ' ')}
            </span>
            {activeOrder.deliveryOtp && (
              <span className="floating-otp-pill">
                <KeyRound size={11} />
                <span>OTP: {activeOrder.deliveryOtp}</span>
              </span>
            )}
          </div>
          <span className="floating-bar-subtitle">
            {restaurantName} • {itemCount} {itemCount === 1 ? 'item' : 'items'} • Delivering to {destination}
          </span>
        </div>
      </div>

      <div className="floating-bar-actions">
        <button 
          type="button" 
          className="floating-bar-cta"
          onClick={(e) => {
            e.stopPropagation();
            onOpenTracker?.(activeOrder);
          }}
        >
          <span>Track Live</span>
          <ArrowRight size={15} />
        </button>

        {onDismiss && (
          <button
            type="button"
            className="floating-bar-dismiss-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(activeOrder.orderId);
            }}
            aria-label="Dismiss tracking bar"
            title="Dismiss bar"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

