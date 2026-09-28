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
  Check
} from 'lucide-react';

export default function UserOrdersPage({
  user,
  orders = [],
  onSelectOrderToTrack,
  onReorder,
  onBackToMenu,
  onOpenAuth,
  onSwitchUser
}) {
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

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

      // Match by verified email first, or phone, or name
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

  // Derived metrics for this individual user
  const metrics = useMemo(() => {
    const total = userOrders.length;
    const active = userOrders.filter(o => o.status !== 'DELIVERED').length;
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
      if (filterStatus === 'ACTIVE' && order.status === 'DELIVERED') return false;
      if (filterStatus === 'COMPLETED' && order.status !== 'DELIVERED') return false;

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

  // If user is guest / not logged in
  if (!user) {
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
            {user.avatar || '🍲'}
          </div>
          <div className="user-main-meta">
            <div className="user-name-role-row">
              <h1 className="user-full-name">{user.name}</h1>
              <span className={`user-role-badge ${user.role || 'customer'}`}>
                {user.role === 'admin' ? '👑 Master Admin' : user.role === 'restaurant' ? '👨‍🍳 Merchant' : user.role === 'rider' ? '🛵 Fleet Captain' : '🍲 Foodie Customer'}
              </span>
            </div>

            {/* Email ID Display */}
            <div className="user-email-display-pill" title="Verified Account Email">
              <Mail size={15} className="email-icon" />
              <strong className="user-email-text">{user.email || 'No email registered'}</strong>
              <span className="verified-check-tag">
                <ShieldCheck size={13} />
                <span>Verified Account</span>
              </span>
              <button 
                type="button" 
                className="copy-email-btn" 
                onClick={handleCopyEmail}
                title="Copy Email Address"
              >
                {copiedEmail ? <Check size={13} className="text-green" /> : <Copy size={13} />}
              </button>
            </div>

            <div className="user-secondary-details">
              <span className="user-phone-tag">
                <Phone size={13} />
                <span>{user.phone || '+91 98401 23456'}</span>
              </span>
              <span className="user-registered-tag">
                <UserCheck size={13} />
                <span>Active Member • South Chennai</span>
              </span>
            </div>
          </div>
        </div>

        {/* Account Switcher / Sign Out */}
        <div className="user-profile-card-right">
          <div className="quick-switch-label">Active Account</div>
          <button 
            type="button"
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => onOpenAuth ? onOpenAuth('login') : null}
          >
            <span>Switch Account / Sign In</span>
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
              const isActive = order.status !== 'DELIVERED';

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
                    <button 
                      className={`btn-order-action ${isActive ? 'btn-track-live-primary' : 'btn-view-receipt'}`}
                      onClick={() => onSelectOrderToTrack && onSelectOrderToTrack(order)}
                    >
                      <Bike size={15} />
                      <span>{isActive ? 'Track Live on Map' : 'View Full Receipt'}</span>
                      <ChevronRight size={14} />
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
