import React, { useState } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  ShoppingBag, 
  Bike, 
  Percent, 
  Check, 
  Plus, 
  SlidersHorizontal,
  MapPin,
  CreditCard,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Users,
  UserCheck,
  UserX,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { COUPONS, RESTAURANTS } from '../data/mockData';
import AdminFleetRadarMap from './AdminFleetRadarMap';

export default function AdminPortal({
  orders,
  onUpdateOrderStatus,
  onAddCoupon,
  couponsList = COUPONS,
  riderLocations = {},
  settings = { merchantUpi: '8248651695-3@ybl', merchantName: 'Unavukadai Express' },
  onUpdateSettings,
  onResetOrders,
  usersList = [],
  onUpdateUserRole = () => {},
  onToggleUserStatus = () => {},
  currentUser,
  onSwitchPortal = () => {}
}) {
  const [filterLocality, setFilterLocality] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'promos' | 'restaurants' | 'fleet' | 'settings' | 'users'

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'customer' | 'restaurant' | 'rider' | 'admin'
  const [statusFilterUser, setStatusFilterUser] = useState('ALL');
  const [roleChangeSuccessMsg, setRoleChangeSuccessMsg] = useState('');

  // Settings State
  const [upiIdInput, setUpiIdInput] = useState(settings?.merchantUpi || '8248651695-3@ybl');
  const [merchantNameInput, setMerchantNameInput] = useState(settings?.merchantName || 'Unavukadai Express');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings({
        merchantUpi: upiIdInput.trim(),
        merchantName: merchantNameInput.trim()
      });
    }
    setSettingsSavedMsg('✅ Merchant UPI updated successfully!');
    setTimeout(() => setSettingsSavedMsg(''), 3000);
  };

  const handleConfirmReset = () => {
    if (onResetOrders) {
      onResetOrders();
    }
    setIsResetConfirmOpen(false);
    setResetSuccessMsg('🧹 All test orders successfully cleared. System ready for Sunday launch!');
    setTimeout(() => setResetSuccessMsg(''), 4500);
  };

  // Promo code form state
  const [newCode, setNewCode] = useState('');
  const [newRegion, setNewRegion] = useState('Perungalathur');
  const [newDiscount, setNewDiscount] = useState(50);
  const [newMaxDiscount, setNewMaxDiscount] = useState(120);

  // Platform metrics
  const totalGMV = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const platformRevenue = Math.round(totalGMV * 0.15) + (orders.length * 5); // 15% commission + ₹5 platform fee
  const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED').length;

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchLoc = filterLocality === 'ALL' ? true : o.locality === filterLocality;
    const matchStat = statusFilter === 'ALL' ? true : o.status === statusFilter;
    return matchLoc && matchStat;
  });

  // Filtered users for master governance
  const filteredUsers = usersList.filter(u => {
    const q = userSearch.toLowerCase().trim();
    const matchQuery = !q || (
      u.name?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q) || 
      u.phone?.toLowerCase().includes(q)
    );
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilterUser === 'ALL' || u.status === statusFilterUser;
    return matchQuery && matchRole && matchStatus;
  });

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    onAddCoupon({
      code: newCode.trim().toUpperCase(),
      region: newRegion,
      discountPercent: Number(newDiscount),
      maxDiscount: Number(newMaxDiscount),
      minOrder: 199,
      label: `${newDiscount}% OFF up to ₹${newMaxDiscount} (${newRegion})`
    });
    setNewCode('');
  };

  return (
    <div className="portal-page-container admin-theme">
      {/* Admin Header */}
      <div className="portal-header-card admin-header-bg">
        <div className="portal-header-left">
          <div className="portal-badge-label admin-badge">
            <ShieldAlert size={14} />
            <span>UNAVUKADAI SUPER ADMIN CONSOLE</span>
          </div>
          <h1 className="portal-main-heading">Platform Governance &amp; Regional Dispatcher</h1>
          <p className="portal-sub-location">
            <span>Operating Hubs: <strong>Perungalathur • Vandalur • Mannivakkam Suburban Network</strong></span>
          </p>
        </div>

        <div className="portal-header-actions">
          <div className="admin-status-pill">
            <span className="live-dot-pulse"></span>
            <span>All Systems Operational (99.98% Uptime)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="portal-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-green-subtle">
            <TrendingUp size={22} className="text-green" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Gross Merchandise Value (GMV)</span>
            <h3 className="kpi-value">₹{totalGMV}</h3>
            <span className="kpi-trend text-green">+24.8% vs last week</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-purple-subtle">
            <Percent size={22} className="text-purple" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Platform Net Commission</span>
            <h3 className="kpi-value">₹{platformRevenue}</h3>
            <span className="kpi-trend">15% Take Rate + ₹5 Fee</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-orange-subtle">
            <ShoppingBag size={22} className="text-orange" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Suburban Orders</span>
            <h3 className="kpi-value">{activeOrdersCount}</h3>
            <span className="kpi-trend text-orange">Across 3 Hubs</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-blue-subtle">
            <Bike size={22} className="text-blue" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">On-Duty Fleet</span>
            <h3 className="kpi-value">18 Riders</h3>
            <span className="kpi-trend text-blue">Avg 19 min Delivery SLA</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="rider-subnav-tabs">
        <button 
          className={`subnav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span>Live Orders Dispatcher ({orders.length})</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'promos' ? 'active' : ''}`}
          onClick={() => setActiveTab('promos')}
        >
          <span>Regional Offers &amp; Promo Codes</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          <span>Suburban Restaurant Partners ({RESTAURANTS.length})</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          <span>🛰️ Live Fleet GPS Radar</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span>👥 Master Users &amp; Roles ({usersList.length})</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span>⚙️ Launch &amp; Payment Settings</span>
        </button>
      </div>

      {/* Tab: Orders Dispatcher */}
      {activeTab === 'orders' && (
        <div className="admin-orders-section">
          {/* Controls Bar */}
          <div className="admin-filter-bar">
            <div className="filter-group">
              <SlidersHorizontal size={15} />
              <span>Zone Filter:</span>
              <select 
                value={filterLocality} 
                onChange={(e) => setFilterLocality(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Suburban Zones</option>
                <option value="Perungalathur">Perungalathur Hub</option>
                <option value="Vandalur">Vandalur Hub</option>
                <option value="Mannivakkam">Mannivakkam Hub</option>
              </select>
            </div>

            <div className="filter-group">
              <span>Status Filter:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer &amp; Zone</th>
                  <th>Restaurant</th>
                  <th>Items &amp; Bill</th>
                  <th>Status</th>
                  <th>Assigned Rider</th>
                  <th>Dispatch Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong className="order-id-highlight">#{order.orderId}</strong>
                      <div className="order-time-sub">{order.placedAt}</div>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <div className="order-zone-chip">
                        <MapPin size={11} />
                        <span>{order.locality}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{order.restaurantName}</strong>
                    </td>
                    <td>
                      <div>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                      <strong>₹{order.grandTotal}</strong>
                    </td>
                    <td>
                      <span className={`admin-status-tag ${order.status.toLowerCase()}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {order.riderName ? (
                        <div className="admin-rider-chip">
                          <Bike size={13} />
                          <span>{order.riderName}</span>
                        </div>
                      ) : (
                        <span className="unassigned-badge">Awaiting Rider</span>
                      )}
                    </td>
                    <td>
                      <select 
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.orderId, e.target.value)}
                        className="admin-status-override"
                      >
                        <option value="PLACED">Placed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Promo Codes */}
      {activeTab === 'promos' && (
        <div className="admin-promos-section">
          {/* Create Promo Form */}
          <div className="create-promo-card">
            <h3>⚡ Generate Hyper-Local Promo Code</h3>
            <form className="promo-form-grid" onSubmit={handleCreateCoupon}>
              <div className="form-group">
                <label>Promo Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. GSTFEST50" 
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Target Suburb</label>
                <select value={newRegion} onChange={(e) => setNewRegion(e.target.value)}>
                  <option value="Perungalathur">Perungalathur</option>
                  <option value="Vandalur">Vandalur</option>
                  <option value="Mannivakkam">Mannivakkam</option>
                  <option value="All Zones">All Zones</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount %</label>
                <input 
                  type="number" 
                  value={newDiscount} 
                  onChange={(e) => setNewDiscount(e.target.value)} 
                  min={10} 
                  max={80} 
                />
              </div>

              <div className="form-group">
                <label>Max Cap (₹)</label>
                <input 
                  type="number" 
                  value={newMaxDiscount} 
                  onChange={(e) => setNewMaxDiscount(e.target.value)} 
                  min={50} 
                  max={500} 
                />
              </div>

              <button type="submit" className="btn-create-promo">
                <Plus size={15} />
                <span>Launch Offer</span>
              </button>
            </form>
          </div>

          {/* Active Promos List */}
          <div className="active-promos-grid">
            {couponsList.map((coupon) => (
              <div key={coupon.code} className="admin-coupon-card">
                <div className="coupon-card-header">
                  <span className="coupon-code-badge">{coupon.code}</span>
                  <span className="coupon-active-badge">
                    <Check size={12} /> Active
                  </span>
                </div>
                <div className="coupon-card-body">
                  <strong>{coupon.label}</strong>
                  <p>Target Zone: {coupon.region || 'All Suburban Hubs'}</p>
                  <small>Min Order: ₹{coupon.minOrder || 199}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Restaurants */}
      {activeTab === 'restaurants' && (
        <div className="admin-restaurants-grid">
          {RESTAURANTS.map((r) => (
            <div key={r.id} className="admin-hotel-card">
              <img src={r.image} alt={r.name} className="admin-hotel-thumb" />
              <div className="admin-hotel-details">
                <div className="hotel-title-row">
                  <h4>{r.name}</h4>
                  <span className="rating-badge-mini">{r.rating} ★</span>
                </div>
                <p className="hotel-region-sub">📍 {r.region} Hub • {r.address}</p>
                <div className="hotel-stats-chips">
                  <span>{r.menu.length} Dishes</span>
                  <span>{r.ratingCount} reviews</span>
                  <span>Safety: {r.safetyScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Live Fleet Radar */}
      {activeTab === 'fleet' && (
        <AdminFleetRadarMap 
          riderLocations={riderLocations}
          orders={orders}
        />
      )}

      {/* Tab: Launch & Payment Settings */}
      {activeTab === 'settings' && (
        <div className="admin-settings-container animate-fade">
          {settingsSavedMsg && (
            <div className="alert-banner-success">
              <CheckCircle2 size={16} />
              <span>{settingsSavedMsg}</span>
            </div>
          )}

          {resetSuccessMsg && (
            <div className="alert-banner-success">
              <CheckCircle2 size={16} />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          <div className="settings-cards-grid">
            {/* Merchant UPI Configuration Card */}
            <div className="admin-card settings-card">
              <div className="card-header-styled">
                <div className="card-icon-wrap bg-purple-subtle">
                  <CreditCard size={20} className="text-purple" />
                </div>
                <div>
                  <h3 className="card-title">Merchant UPI Payment Gateway</h3>
                  <p className="card-subtitle">Configure the real UPI VPA where customer QR payments will be deposited</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="settings-form">
                <div className="form-field-group">
                  <label className="field-label">Primary Merchant UPI ID (VPA) *</label>
                  <input 
                    type="text" 
                    className="field-input-styled"
                    placeholder="e.g. unavukadai@upi or 9840123456@okaxis"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    required
                  />
                  <small className="field-hint">
                    This UPI ID is embedded dynamically into the GPay/PhonePe QR code at checkout.
                  </small>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Merchant / Business Display Name</label>
                  <input 
                    type="text" 
                    className="field-input-styled"
                    placeholder="e.g. Unavukadai Express"
                    value={merchantNameInput}
                    onChange={(e) => setMerchantNameInput(e.target.value)}
                  />
                </div>

                <div className="settings-preview-box">
                  <span className="preview-label">Live UPI Intent Preview:</span>
                  <code>{`upi://pay?pa=${upiIdInput.trim()}&pn=${encodeURIComponent(merchantNameInput.trim())}&cu=INR`}</code>
                </div>

                <button type="submit" className="btn-primary-admin">
                  <span>Save Merchant Payment Settings</span>
                </button>
              </form>
            </div>

            {/* Sunday Production Launch Reset Card */}
            <div className="admin-card settings-card danger-boundary">
              <div className="card-header-styled">
                <div className="card-icon-wrap bg-red-subtle">
                  <AlertTriangle size={20} className="text-red" />
                </div>
                <div>
                  <h3 className="card-title text-red">Sunday Production Clean Launch</h3>
                  <p className="card-subtitle">Wipe test orders from database before going live to real customers</p>
                </div>
              </div>

              <div className="danger-card-body">
                <p className="danger-explainer">
                  Currently you have <strong>{orders.length} order(s)</strong> in the system database. 
                  Before opening the store on Sunday morning, click this button to clear all simulated / test tickets so that hotels, riders, and dispatchers start with an empty, fresh ledger.
                </p>

                {!isResetConfirmOpen ? (
                  <button 
                    type="button" 
                    className="btn-danger-admin"
                    onClick={() => setIsResetConfirmOpen(true)}
                  >
                    <Trash2 size={16} />
                    <span>⚠️ Reset All Orders for Sunday Launch</span>
                  </button>
                ) : (
                  <div className="reset-confirm-box animate-scale">
                    <p className="confirm-warning-text">
                      <strong>Are you sure?</strong> This will erase all current orders from memory and server database. This action cannot be undone.
                    </p>
                    <div className="confirm-btn-actions">
                      <button 
                        type="button"
                        className="btn-confirm-delete"
                        onClick={handleConfirmReset}
                      >
                        Yes, Clear All Orders Now
                      </button>
                      <button 
                        type="button"
                        className="btn-cancel-action"
                        onClick={() => setIsResetConfirmOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Master Users & Roles Governance */}
      {activeTab === 'users' && (
        <div className="admin-users-section animate-fade">
          {/* Role Stats Row */}
          <div className="users-stats-grid">
            <div className="user-stat-card">
              <div className="user-stat-icon bg-blue-subtle text-blue">
                <Users size={20} />
              </div>
              <div className="user-stat-info">
                <span className="user-stat-label">Total Accounts</span>
                <span className="user-stat-val">{usersList.length}</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon bg-orange-subtle text-orange">
                <span style={{ fontSize: '1.25rem' }}>👨‍🍳</span>
              </div>
              <div className="user-stat-info">
                <span className="user-stat-label">Merchants / Kitchens</span>
                <span className="user-stat-val">{usersList.filter(u => u.role === 'restaurant').length}</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon bg-green-subtle text-green">
                <span style={{ fontSize: '1.25rem' }}>🛵</span>
              </div>
              <div className="user-stat-info">
                <span className="user-stat-label">Fleet Riders</span>
                <span className="user-stat-val">{usersList.filter(u => u.role === 'rider').length}</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon bg-purple-subtle text-purple">
                <span style={{ fontSize: '1.25rem' }}>🍲</span>
              </div>
              <div className="user-stat-info">
                <span className="user-stat-label">Foodie Customers</span>
                <span className="user-stat-val">{usersList.filter(u => u.role === 'customer').length}</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon bg-red-subtle text-red">
                <ShieldCheck size={20} />
              </div>
              <div className="user-stat-info">
                <span className="user-stat-label">Master Admins</span>
                <span className="user-stat-val">{usersList.filter(u => u.role === 'admin').length}</span>
              </div>
            </div>
          </div>

          {/* Flash Feedback Message */}
          {roleChangeSuccessMsg && (
            <div className="admin-success-banner animate-fade" style={{ marginBottom: '1rem' }}>
              <CheckCircle2 size={18} />
              <span>{roleChangeSuccessMsg}</span>
            </div>
          )}

          {/* User Filter Controls Bar */}
          <div className="admin-filter-bar users-filter-bar">
            <div className="users-search-input-wrap">
              <Search size={16} className="search-icon" />
              <input 
                type="text"
                placeholder="Search by name, email or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="users-search-input"
              />
              {userSearch && (
                <button type="button" className="clear-search-btn" onClick={() => setUserSearch('')}>
                  &times;
                </button>
              )}
            </div>

            <div className="role-filter-pills">
              <button 
                type="button" 
                className={`filter-pill-btn ${roleFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setRoleFilter('ALL')}
              >
                All Roles ({usersList.length})
              </button>
              <button 
                type="button" 
                className={`filter-pill-btn ${roleFilter === 'restaurant' ? 'active' : ''}`}
                onClick={() => setRoleFilter('restaurant')}
              >
                👨‍🍳 Merchants ({usersList.filter(u => u.role === 'restaurant').length})
              </button>
              <button 
                type="button" 
                className={`filter-pill-btn ${roleFilter === 'rider' ? 'active' : ''}`}
                onClick={() => setRoleFilter('rider')}
              >
                🛵 Riders ({usersList.filter(u => u.role === 'rider').length})
              </button>
              <button 
                type="button" 
                className={`filter-pill-btn ${roleFilter === 'customer' ? 'active' : ''}`}
                onClick={() => setRoleFilter('customer')}
              >
                🍲 Customers ({usersList.filter(u => u.role === 'customer').length})
              </button>
              <button 
                type="button" 
                className={`filter-pill-btn ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setRoleFilter('admin')}
              >
                🛡️ Admins ({usersList.filter(u => u.role === 'admin').length})
              </button>
            </div>

            <div className="status-select-wrap">
              <select 
                value={statusFilterUser}
                onChange={(e) => setStatusFilterUser(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Accounts</option>
                <option value="SUSPENDED">Suspended Accounts</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-table-container">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User &amp; Contact</th>
                  <th>Contact Info</th>
                  <th>Assigned Portal Role</th>
                  <th>Account Status</th>
                  <th>Portal Access Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table-cell">
                      <div className="empty-table-state">
                        <Users size={32} />
                        <p>No registered users found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser && (currentUser.id === u.id || currentUser.email?.toLowerCase() === u.email?.toLowerCase());
                    const roleBadgeClass = 
                      u.role === 'admin' ? 'role-badge-admin' :
                      u.role === 'restaurant' ? 'role-badge-merchant' :
                      u.role === 'rider' ? 'role-badge-rider' : 'role-badge-customer';

                    const roleLabel = 
                      u.role === 'admin' ? '🛡️ Master Admin' :
                      u.role === 'restaurant' ? '👨‍🍳 Merchant' :
                      u.role === 'rider' ? '🛵 Rider' : '🍲 Customer';

                    const portalTarget = 
                      u.role === 'restaurant' ? 'hotel' :
                      u.role === 'rider' ? 'rider' :
                      u.role === 'admin' ? 'admin' : 'customer';

                    return (
                      <tr key={u.id} className={u.status === 'SUSPENDED' ? 'row-suspended' : ''}>
                        {/* User info */}
                        <td>
                          <div className="user-profile-cell">
                            <div className="user-avatar-circle">
                              {u.role === 'restaurant' ? '👨‍🍳' : u.role === 'rider' ? '🛵' : u.role === 'admin' ? '🛡️' : '🍲'}
                            </div>
                            <div className="user-identity-text">
                              <span className="user-full-name">
                                {u.name}
                                {isSelf && <span className="self-tag">(You)</span>}
                              </span>
                              <span className="user-email-text">{u.email}</span>
                              <span className="user-created-date">Registered: {u.createdAt || 'Recent'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td>
                          <div className="user-contact-cell">
                            <span className="contact-phone">{u.phone || 'No phone registered'}</span>
                            <span className="contact-badge-subtext">Verified ID: {u.id}</span>
                          </div>
                        </td>

                        {/* Role Dropdown */}
                        <td>
                          <div className="role-change-control">
                            <select 
                              value={u.role}
                              onChange={(e) => {
                                const newR = e.target.value;
                                onUpdateUserRole(u.id, newR);
                                setRoleChangeSuccessMsg(`✅ Role for ${u.name} updated to ${newR.toUpperCase()}! Portal permissions synchronized.`);
                                setTimeout(() => setRoleChangeSuccessMsg(''), 4000);
                              }}
                              className={`role-select-input ${roleBadgeClass}`}
                            >
                              <option value="customer">🍲 Customer (Foodie App)</option>
                              <option value="restaurant">👨‍🍳 Merchant (Kitchen App)</option>
                              <option value="rider">🛵 Fleet Rider (Captain App)</option>
                              <option value="admin">🛡️ Master Admin (HQ Console)</option>
                            </select>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <div className="status-cell-wrap">
                            <span className={`status-pill-badge ${u.status === 'ACTIVE' ? 'pill-active' : 'pill-suspended'}`}>
                              {u.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                              <span>{u.status}</span>
                            </span>
                            {!isSelf && (
                              <button 
                                type="button" 
                                className="btn-toggle-status"
                                onClick={() => {
                                  onToggleUserStatus(u.id);
                                  setRoleChangeSuccessMsg(`Status updated for ${u.name}`);
                                  setTimeout(() => setRoleChangeSuccessMsg(''), 3000);
                                }}
                              >
                                {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Launch Portal */}
                        <td>
                          <button 
                            type="button"
                            className="btn-launch-portal"
                            onClick={() => onSwitchPortal(portalTarget)}
                            title={`Inspect ${roleLabel} Portal`}
                          >
                            <span>Inspect {roleLabel}</span>
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Security & Access Isolation Note */}
          <div className="admin-card role-security-explainer" style={{ marginTop: '2rem' }}>
            <div className="card-header-styled">
              <div className="card-icon-wrap bg-blue-subtle">
                <ShieldAlert size={20} className="text-blue" />
              </div>
              <div>
                <h3 className="card-title">Role-Based Access Control (RBAC) &amp; Trip Concurrency Rules</h3>
                <p className="card-subtitle">Active security and isolation policies enforced platform-wide</p>
              </div>
            </div>
            <div className="role-explainer-grid">
              <div className="explainer-item">
                <strong>🔒 Strict Role Isolation:</strong>
                <p>When merchants sign up or log in, they are locked exclusively into the Restaurant Kitchen Portal. Riders are restricted to the Delivery Captain Portal, and customers to the Food Delivery App. Only Master Admin accounts have platform-wide portal switching authority.</p>
              </div>
              <div className="explainer-item">
                <strong>🛵 Rider 1-Trip Concurrency Enforcement:</strong>
                <p>Riders can only have one active trip at any time. When a trip is accepted, all other available orders are instantly locked with warning banners until the current order is marked DELIVERED.</p>
              </div>
              <div className="explainer-item">
                <strong>⚡ Instant Role Re-assignment:</strong>
                <p>Changing any user's role in this table immediately updates their live session and isolates their permissions in real time.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
