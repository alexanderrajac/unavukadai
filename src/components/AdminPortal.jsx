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
  CheckCircle2
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
  onResetOrders
}) {
  const [filterLocality, setFilterLocality] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'promos' | 'restaurants' | 'fleet' | 'settings'

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
    </div>
  );
}
