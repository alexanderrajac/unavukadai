import React, { useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Bike, 
  ChevronRight, 
  ShoppingBag,
  Mail,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function MyOrdersModal({
  isOpen,
  onClose,
  orders = [],
  user,
  onSelectOrderToTrack,
  onViewFullOrdersPage,
  onOpenAuth
}) {
  if (!isOpen) return null;

  // Filter orders strictly for THIS individual user
  const userOrders = useMemo(() => {
    if (!user) return [];
    const normalizedUserEmail = user.email ? user.email.toLowerCase().trim() : '';
    const normalizedUserPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
    const normalizedUserName = user.name ? user.name.toLowerCase().trim() : '';

    return orders.filter(order => {
      const orderEmail = order.customerEmail ? order.customerEmail.toLowerCase().trim() : '';
      const orderPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '';
      const orderName = order.customerName ? order.customerName.toLowerCase().trim() : '';

      if (normalizedUserEmail && orderEmail) {
        return normalizedUserEmail === orderEmail;
      }
      if (normalizedUserPhone && orderPhone) {
        return normalizedUserPhone === orderPhone;
      }
      if (normalizedUserName && orderName) {
        return normalizedUserName === orderName;
      }
      return false;
    });
  }, [orders, user]);

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div 
        className="my-orders-modal-container animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-sheet-pull-handle" />
        
        {/* Header */}
        <div className="orders-modal-header">
          <div className="orders-header-title">
            <ShoppingBag size={22} className="icon-crimson" />
            <div>
              <h2>My Orders &amp; Live Tracking</h2>
              <span className="orders-header-sub">Individual Account Activity</span>
            </div>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* User Identity Banner (Prominently shows User's Email ID) */}
        {user ? (
          <div className="modal-user-identity-strip">
            <div className="user-strip-avatar">{user.avatar || '🍲'}</div>
            <div className="user-strip-info">
              <div className="user-strip-name-row">
                <strong>{user.name}</strong>
                <span className="user-strip-role-badge">
                  {user.role === 'admin' ? '👑 Master Admin' : '🍲 Customer'}
                </span>
              </div>
              <div className="user-strip-email-row">
                <Mail size={13} className="text-crimson" />
                <span className="user-strip-email">{user.email || user.phone}</span>
                <span className="user-strip-verified-tag">
                  <ShieldCheck size={12} />
                  <span>Verified</span>
                </span>
              </div>
            </div>
            {onViewFullOrdersPage && (
              <button 
                type="button" 
                className="btn-view-full-page-chip"
                onClick={() => {
                  onClose();
                  onViewFullOrdersPage();
                }}
                title="Open Dedicated Full Orders Page"
              >
                <span>Full Page</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="modal-user-guest-banner">
            <User size={16} />
            <span>You are browsing as Guest. </span>
            <button 
              type="button" 
              className="btn-guest-login-link"
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth('login');
              }}
            >
              Sign in with Email
            </button>
          </div>
        )}

        <div className="orders-modal-scrollable">
          {userOrders.length === 0 ? (
            <div className="empty-orders-view">
              <ShoppingBag size={48} className="text-muted" />
              <h3>No orders found for {user ? user.email : 'guest'}</h3>
              <p>When you place an order, live tracking, delivery OTPs, and past receipts will appear here.</p>
              {onViewFullOrdersPage && (
                <button 
                  className="btn-secondary mt-3"
                  onClick={() => {
                    onClose();
                    onViewFullOrdersPage();
                  }}
                >
                  <span>Open Account Orders Portal</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="orders-history-list">
              {userOrders.map((order) => {
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
                          <span className="dot-mini">•</span>
                          <span className="order-id-sub">#{order.orderId}</span>
                        </div>
                      </div>

                      <div className={`user-order-status-pill ${order.status.toLowerCase()}`}>
                        {isActive && <span className="live-dot-pulse mini"></span>}
                        <span>{order.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    {/* Email confirmation tag on order */}
                    <div className="order-user-email-tag">
                      <Mail size={12} className="text-muted" />
                      <span>Account: <strong>{order.customerEmail || user?.email}</strong></span>
                      {order.deliveryOtp && (
                        <span className="order-otp-mini">
                          OTP: <strong>{order.deliveryOtp}</strong>
                        </span>
                      )}
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
