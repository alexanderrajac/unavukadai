import React from 'react';
import { 
  X, 
  MapPin, 
  Bike, 
  ChevronRight, 
  ShoppingBag
} from 'lucide-react';

export default function MyOrdersModal({
  isOpen,
  onClose,
  orders,
  onSelectOrderToTrack
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div 
        className="my-orders-modal-container animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-sheet-pull-handle" />
        <div className="orders-modal-header">
          <div className="orders-header-title">
            <ShoppingBag size={22} className="icon-crimson" />
            <h2>My Orders &amp; Live Tracking</h2>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="orders-modal-scrollable">
          {orders.length === 0 ? (
            <div className="empty-orders-view">
              <ShoppingBag size={48} className="text-muted" />
              <h3>No orders placed yet</h3>
              <p>When you place an order, live tracking and past receipts will appear here.</p>
            </div>
          ) : (
            <div className="orders-history-list">
              {orders.map((order) => {
                const isActive = order.status !== 'DELIVERED';
                return (
                  <div 
                    key={order.orderId} 
                    className={`user-order-card ${isActive ? 'active-order-border' : ''}`}
                  >
                    <div className="user-order-top-row">
                      <div>
                        <div className="order-hotel-name">{order.restaurantName}</div>
                        <div className="order-locality-sub">
                          <MapPin size={12} />
                          <span>{order.locality} Hub</span>
                        </div>
                      </div>

                      <div className={`user-order-status-pill ${order.status.toLowerCase()}`}>
                        {isActive && <span className="live-dot-pulse mini"></span>}
                        <span>{order.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="user-order-items-snippet">
                      {order.items.map((i, idx) => (
                        <span key={idx} className="item-snippet-chip">
                          {i.quantity}x {i.name}
                        </span>
                      ))}
                    </div>

                    <div className="user-order-footer-row">
                      <div className="order-financials">
                        <span className="order-grand-total">₹{order.grandTotal}</span>
                        <span className="order-placed-time">{order.placedAt}</span>
                      </div>

                      <div className="order-cta-group">
                        {order.riderName && (
                          <div className="order-rider-name-tag">
                            <Bike size={13} />
                            <span>{order.riderName}</span>
                          </div>
                        )}

                        <button 
                          className="btn-track-order"
                          onClick={() => {
                            onSelectOrderToTrack(order);
                            onClose();
                          }}
                        >
                          <span>{isActive ? 'Track Live' : 'View Receipt'}</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
