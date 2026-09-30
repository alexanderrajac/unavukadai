import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Bike, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  RotateCcw, 
  ExternalLink,
  Sparkles,
  Receipt,
  UserCheck,
  CreditCard,
  Copy,
  Check,
  X,
  MessageSquare,
  KeyRound,
  ChefHat,
  Package,
  Zap,
  Share2
} from 'lucide-react';

export default function UserOrdersPage({
  user,
  orders = [],
  onSelectOrderToTrack,
  onReorder,
  onBackToMenu,
  onOpenAuth,
  onSwitchUser,
  onCancelOrder
}) {
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const ACTIVE_STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'];

  // Helper for WhatsApp Order Receipt Share
  const handleShareReceiptWhatsApp = (order) => {
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
  };

  const getStatusAdvice = (status, riderName) => {
    switch (status) {
      case 'PLACED':
        return 'Order received! Sending to restaurant kitchen...';
      case 'CONFIRMED':
        return 'Restaurant confirmed order. Chef is preparing the kitchen.';
      case 'PREPARING':
        return '👨‍🍳 Chef is cooking fresh hot food in the kitchen.';
      case 'READY_FOR_PICKUP':
        return '📦 Food is packed! Rider is picking up parcel from counter.';
      case 'OUT_FOR_DELIVERY':
        return `🚀 ${riderName ? `${riderName} is` : 'Captain is'} on the way to your doorstep!`;
      case 'DELIVERED':
        return '✅ Order successfully delivered. Bon Appétit!';
      default:
        return 'Order is processing.';
    }
  };

  const getStatusIndex = (status) => {
    const steps = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (status === 'READY_FOR_PICKUP') return 2;
    const idx = steps.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

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

  // Derived metrics for this individual user
  const metrics = useMemo(() => {
    const total = userOrders.length;
    const active = userOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;
    const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    
    // Top locality
    const localities = userOrders.map(o => o.locality).filter(Boolean);
    const topLocality = localities.length > 0 ? localities[0] : 'South Chennai Hub';

    return { total, active, totalSpent, topLocality };
  }, [userOrders]);

  // Filtered list based on status and search query
  const displayedOrders = useMemo(() => {
    return userOrders.filter(order => {
      // Status filter
      if (filterStatus === 'ACTIVE' && !ACTIVE_STATUSES.includes(order.status)) return false;
      if (filterStatus === 'COMPLETED' && ACTIVE_STATUSES.includes(order.status)) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = order.orderId?.toLowerCase().includes(query);
        const matchesHotel = order.restaurantName?.toLowerCase().includes(query);
        const matchesItem = order.items?.some(i => i.name?.toLowerCase().includes(query));
        return matchesId || matchesHotel || matchesItem;
      }
      return true;
    });
  }, [userOrders, filterStatus, searchTerm]);

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // If user is guest and has NO orders placed on this device, prompt to sign in
  if (!user && userOrders.length === 0) {
    return (
      <div className="user-orders-page-wrapper container py-5">
        <div className="user-orders-not-logged-card animate-scale">
          <div className="orders-guest-icon-box">
            <ShoppingBag size={48} className="icon-crimson" />
          </div>
          <h2>Individual Orders Portal</h2>
          <p className="guest-prompt-desc">
            Sign in to view your individual order history, real-time live GPS tracking, delivery receipts, and verified account information.
          </p>
          <div className="guest-action-buttons">
            <button 
              className="btn-primary" 
              onClick={() => onOpenAuth ? onOpenAuth('login') : null}
            >
              <Mail size={16} />
              <span>Sign in with Google / Mobile</span>
            </button>
            <button 
              className="btn-secondary" 
              onClick={onBackToMenu}
            >
              <ArrowLeft size={16} />
              <span>Browse Restaurant Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active display profile (supports guest users who placed orders on this browser)
  const activeUser = user || {
    name: 'Guest Customer',
    email: 'Device Session Orders',
    phone: '+91 Delivery Contact',
    role: 'customer'
  };

  return (
    <div className="user-orders-page-wrapper container py-4 animate-fade">
      {/* Top Navigation Bar */}
      <div className="user-orders-nav-header">
        <button className="back-to-menu-btn" onClick={onBackToMenu}>
          <ArrowLeft size={16} />
          <span>Back to Restaurants</span>
        </button>
        <div className="user-portal-status-badge">
          <span className="live-dot-pulse mini" />
          <span>Live Account Directory</span>
        </div>
      </div>

      {/* User Identity & Profile Showcase Card */}
      <section className="user-individual-profile-card">
        <div className="user-profile-card-left">
          <div className="user-main-avatar">
            {activeUser.avatar || '🍲'}
          </div>
          <div className="user-main-meta">
            <div className="user-name-role-row">
              <h1 className="user-full-name">{activeUser.name}</h1>
              <span className={`user-role-badge ${activeUser.role || 'customer'}`}>
                {activeUser.role === 'admin' ? '👑 Master Admin' : activeUser.role === 'restaurant' ? '👨‍🍳 Merchant' : activeUser.role === 'rider' ? '🛵 Fleet Captain' : '🍲 Foodie Customer'}
              </span>
            </div>

            {/* Email ID Display */}
            <div className="user-email-display-pill" title="Account Email">
              <Mail size={15} className="email-icon" />
              <strong className="user-email-text">{activeUser.email || 'Guest Session'}</strong>
              <span className="verified-check-tag">
                <ShieldCheck size={13} />
                <span>{user ? 'Verified Account' : 'Device Session'}</span>
              </span>
              {user?.email && (
                <button 
                  type="button" 
                  className="copy-email-btn" 
                  onClick={handleCopyEmail}
                  title="Copy Email Address"
                >
                  {copiedEmail ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                </button>
              )}
            </div>

            <div className="user-secondary-details">
              <span className="user-phone-tag">
                <Phone size={13} />
                <span>{activeUser.phone || '+91 Delivery Contact'}</span>
              </span>
              <span className="user-registered-tag">
                <UserCheck size={13} />
                <span>{user ? 'Active Member • South Chennai' : 'Guest Browser Session'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Account Switcher / Sign Out */}
        <div className="user-profile-card-right">
          <div className="quick-switch-label">{user ? 'Active Account' : 'Guest Mode'}</div>
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => onOpenAuth ? onOpenAuth('login') : null}
          >
            <RotateCcw size={13} />
            <span>{user ? 'Switch User' : 'Sign In with Google'}</span>
          </button>
        </div>
      </section>

      {/* Individual Order Metrics Row */}
      <section className="user-order-metrics-grid">
        <div className="metric-box">
          <div className="metric-icon bg-primary-subtle">
            <ShoppingBag size={20} className="icon-crimson" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Orders Placed</span>
            <strong className="metric-val">{metrics.total} Orders</strong>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon bg-green-subtle">
            <CreditCard size={20} className="text-green" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Food Spend</span>
            <strong className="metric-val">₹{metrics.totalSpent}</strong>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon bg-amber-subtle">
            <Bike size={20} className="text-amber" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active In-Flight Deliveries</span>
            <strong className="metric-val">{metrics.active} Ongoing</strong>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon bg-blue-subtle">
            <MapPin size={20} className="text-blue" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Favorite Hub</span>
            <strong className="metric-val">{metrics.topLocality}</strong>
          </div>
        </div>
      </section>

      {/* Search & Status Filters */}
      <section className="orders-filter-control-bar">
        <div className="orders-status-segmented-tabs">
          <button 
            className={`status-tab-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            <span>All Orders</span>
            <span className="tab-bubble-count">{userOrders.length}</span>
          </button>
          <button 
            className={`status-tab-btn ${filterStatus === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ACTIVE')}
          >
            <span className="live-dot-pulse mini" />
            <span>Active Ongoing</span>
            <span className="tab-bubble-count">{metrics.active}</span>
          </button>
          <button 
            className={`status-tab-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('COMPLETED')}
          >
            <CheckCircle2 size={14} className="text-green" />
            <span>Delivered &amp; Past</span>
            <span className="tab-bubble-count">{userOrders.length - metrics.active}</span>
          </button>
        </div>

        <div className="orders-search-input-box">
          <Search size={16} className="search-icon-adornment" />
          <input 
            type="text" 
            placeholder="Search your orders by dish, restaurant, or #UNV ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Orders List Section */}
      <section className="individual-orders-list-section">
        {displayedOrders.length === 0 ? (
          <div className="empty-orders-card animate-fade">
            <div className="empty-orders-illustration">🍲</div>
            <h3>No orders found for {user.email}</h3>
            <p>
              {searchTerm 
                ? `No orders matched your search query "${searchTerm}".`
                : filterStatus === 'ACTIVE'
                ? 'You do not have any active ongoing deliveries right now.'
                : 'You have not placed any orders yet with this account.'}
            </p>
            <button className="btn-primary" onClick={onBackToMenu}>
              <ShoppingBag size={16} />
              <span>Explore Delicious Dishes</span>
            </button>
          </div>
        ) : (
          <div className="individual-orders-grid">
            {displayedOrders.map(order => {
              const isActive = ACTIVE_STATUSES.includes(order.status);

              return (
                <div 
                  key={order.orderId} 
                  className={`individual-order-card ${isActive ? 'active-border' : ''} animate-slide-up`}
                >
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-header-primary">
                      <div className="restaurant-title-row">
                        <h3 className="order-restaurant-title">{order.restaurantName}</h3>
                        <span className="order-hub-badge">
                          <MapPin size={11} />
                          <span>{order.locality} Hub</span>
                        </span>
                      </div>
                      <div className="order-meta-info-sub">
                        <span className="order-id-tag">Order #{order.orderId}</span>
                        <span className="dot-separator">•</span>
                        <span className="order-time-tag">
                          <Clock size={12} />
                          <span>{order.placedAt}</span>
                        </span>
                      </div>
                    </div>

                    <div className={`order-status-pill-badge ${order.status.toLowerCase()}`}>
                      {isActive && <span className="live-dot-pulse mini" />}
                      <span>{order.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Customer Identity Banner on Order */}
                  <div className="order-customer-identity-strip">
                    <div className="identity-email-tag">
                      <Mail size={13} className="text-crimson" />
                      <span>Account: <strong>{order.customerEmail || user.email}</strong></span>
                    </div>
                    {order.deliveryOtp && (
                      <div className="order-secret-otp-pill" title="Share this code with rider on doorstep delivery">
                        <span>Secret Delivery OTP:</span>
                        <strong>{order.deliveryOtp}</strong>
                      </div>
                    )}
                  </div>

                  {/* Live Progress Bar & PIN Card for Active Orders */}
                  {isActive && (
                    <div className="live-customer-tracker-card animate-fade">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="live-dot-pulse mini" />
                          <span>LIVE STATUS TRACKER</span>
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>ETA: ~{order.etaMins || 25} mins</span>
                      </div>

                      <div className="live-order-lifecycle-bar">
                        {['Placed', 'Accepted', 'Cooking', 'On the Way', 'Delivered'].map((label, stepIdx) => {
                          const currentStep = getStatusIndex(order.status);
                          const isDone = stepIdx < currentStep;
                          const isCurrent = stepIdx === currentStep;

                          return (
                            <div key={label} className="live-order-step-node">
                              <div className={`step-node-dot ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>
                                {isDone ? '✓' : stepIdx + 1}
                              </div>
                              <span className={`step-node-label ${isCurrent ? 'active' : ''}`}>{label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic', textAlign: 'center' }}>
                        "{getStatusAdvice(order.status, order.riderName)}"
                      </p>

                      {/* Large Doorstep PIN Card */}
                      {order.deliveryOtp && (
                        <div className="live-customer-pin-strip">
                          <div className="pin-info-left">
                            <span className="pin-label-small">🔑 YOUR DELIVERY PIN</span>
                            <span className="pin-subtext-small">Share with rider at doorstep</span>
                          </div>
                          <div className="pin-badge-giant">{order.deliveryOtp}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery Location Details */}
                  <div className="order-delivery-address-row">
                    <MapPin size={14} className="address-icon" />
                    <span className="address-text">
                      {order.customerAddress || 'South Chennai Delivery Hub'}
                    </span>
                  </div>

                  {/* Ordered Items Breakdown */}
                  <div className="order-items-breakdown-box">
                    <div className="items-list">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <span className="item-qty-badge">{item.quantity}x</span>
                          <span className="item-dish-name">{item.name}</span>
                          <span className="item-dish-price">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-pricing-summary-row">
                      <div className="order-payment-info">
                        <span className="payment-mode-tag">
                          💳 {order.paymentMethod || 'UPI'} • {order.paymentStatus || 'PAID'}
                        </span>
                      </div>
                      <div className="order-grand-total-amount">
                        <span className="total-label">Grand Total:</span>
                        <strong className="total-value">₹{order.grandTotal}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Live Fleet Rider Details (If assigned) */}
                  {order.riderName && (
                    <div className="order-assigned-rider-bar">
                      <div className="rider-avatar-circle">🛵</div>
                      <div className="rider-info-text">
                        <span className="rider-name-tag">{order.riderName}</span>
                        <span className="rider-role-tag">Fleet Delivery Captain</span>
                      </div>
                      <a href={`tel:${order.riderPhone?.replace(/\s+/g, '')}`} className="btn-call-rider-mini">
                        <Phone size={13} />
                        <span>Call Captain</span>
                      </a>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="order-card-action-bar">
                    {order.status === 'PLACED' && onCancelOrder && (
                      <button 
                        className="btn-order-action btn-cancel-order"
                        style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.06)' }}
                        onClick={() => {
                          if (window.confirm(`Cancel order #${order.orderId}?`)) {
                            onCancelOrder(order.orderId);
                          }
                        }}
                      >
                        <X size={14} />
                        <span>Cancel</span>
                      </button>
                    )}

                    <button 
                      className={`btn-order-action ${isActive ? 'btn-track-live-primary' : 'btn-view-receipt'}`}
                      onClick={() => onSelectOrderToTrack && onSelectOrderToTrack(order)}
                    >
                      <Bike size={15} />
                      <span>{isActive ? 'Track Live on Map' : 'View Full Receipt'}</span>
                      <ChevronRight size={14} />
                    </button>

                    <button 
                      className="btn-order-action btn-share-whatsapp"
                      onClick={() => handleShareReceiptWhatsApp(order)}
                      title="Share receipt via WhatsApp"
                    >
                      <MessageSquare size={14} style={{ color: '#22c55e' }} />
                      <span>WhatsApp Bill</span>
                    </button>

                    {onReorder && (
                      <button 
                        className="btn-order-action btn-reorder"
                        onClick={() => onReorder(order)}
                        title="Reorder these items"
                      >
                        <RotateCcw size={14} />
                        <span>Reorder</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
