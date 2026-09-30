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
  Sparkles,
  MessageSquare
} from 'lucide-react';

export default function MyOrdersModal({
  isOpen,
  onClose,
  orders = [],
  user,
  onSelectOrderToTrack,
  onViewFullOrdersPage,
  onOpenAuth,
  onCancelOrder
}) {
  // Filter orders for THIS user (by email, phone, name, OR placed on this device)
  const userOrders = useMemo(() => {
    let deviceOrderIds = [];
    try {
      deviceOrderIds = JSON.parse(localStorage.getItem('unavu_my_placed_order_ids') || '[]');
    } catch {}

    const normalizedUserEmail = user?.email ? user.email.toLowerCase().trim() : '';
    const normalizedUserPhone = user?.phone ? user.phone.replace(/\D/g, '') : '';
    const normalizedUserName = user?.name ? user.name.toLowerCase().trim() : '';

    return orders.filter(order => {
      // 1. Device match: if placed on this device, it always belongs to this user
      if (order.orderId && deviceOrderIds.includes(order.orderId)) {
        return true;
      }

      // 2. Profile match if user is logged in
      if (user) {
        const orderEmail = order.customerEmail ? order.customerEmail.toLowerCase().trim() : '';
        const orderPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '';
        const orderName = order.customerName ? order.customerName.toLowerCase().trim() : '';

        if (normalizedUserEmail && orderEmail && normalizedUserEmail === orderEmail) {
          return true;
        }
        if (normalizedUserPhone && orderPhone && normalizedUserPhone === orderPhone) {
          return true;
        }
        if (normalizedUserName && orderName && normalizedUserName === orderName) {
          return true;
        }
      }

      return false;
    });
  }, [orders, user]);

  if (!isOpen) return null;

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
                const ACTIVE_STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'];
                const isActive = ACTIVE_STATUSES.includes(order.status);
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

                        {order.status === 'PLACED' && onCancelOrder && (
                          <button
                            type="button"
                            className="btn-cancel-mini"
                            style={{
                              color: '#ef4444',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Cancel order #${order.orderId}?`)) {
                                onCancelOrder(order.orderId);
                              }
                            }}
                          >
                            <X size={13} />
                            <span>Cancel</span>
                          </button>
                        )}

                        <button 
                          type="button"
                          className="btn-wa-bill-mini"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(34,197,94,0.12)',
                            color: '#4ade80',
                            border: '1px solid rgba(34,197,94,0.3)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const itemsSummary = order.items?.map(i => `• ${i.quantity}x ${i.name} - ₹${i.price * i.quantity}`).join('\n') || '';
                            const pinPart = order.deliveryOtp ? `\n🔑 *Delivery PIN:* ${order.deliveryOtp}` : '';
                            const text = 
                              `🍲 *UNAVUKADAI ORDER RECEIPT*\n` +
                              `━━━━━━━━━━━━━━━━━━━\n` +
                              `📦 *Order ID:* #${order.orderId}\n` +
                              `🏨 *Restaurant:* ${order.restaurantName} (${order.locality} Hub)\n` +
                              `📊 *Status:* ${order.status.replace(/_/g, ' ')}\n` +
                              `${pinPart}\n\n` +
                              `📋 *Items Ordered:*\n${itemsSummary}\n\n` +
                              `💰 *Grand Total:* ₹${order.grandTotal} (${order.paymentMethod || 'UPI'})\n` +
                              `📍 *Delivery Address:* ${order.customerAddress || order.locality}\n` +
                              `━━━━━━━━━━━━━━━━━━━\n` +
                              `🚀 *Track Live:* ${window.location.origin}`;

                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          title="Share receipt via WhatsApp"
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </button>

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
