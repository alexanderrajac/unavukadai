import React, { useState, useMemo } from 'react';
import {
  ShieldAlert, TrendingUp, ShoppingBag, Bike, Percent, Check, Plus,
  SlidersHorizontal, MapPin, CreditCard, Trash2, AlertTriangle,
  CheckCircle2, Users, UserCheck, UserX, Search, ArrowRight,
  ExternalLink, ShieldCheck, UserPlus, Bell, BarChart2, Settings,
  Home, Package, X, ChevronDown, RefreshCw, Eye, Edit3,
  IndianRupee, Zap, Activity, Power, Store, Tag, Sparkles, Camera
} from 'lucide-react';
import { COUPONS, RESTAURANTS } from '../data/mockData';
import AdminFleetRadarMap from './AdminFleetRadarMap';
import EditRestaurantModal from './EditRestaurantModal';

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
  onSwitchPortal = () => {},
  restaurantsList = RESTAURANTS,
  onOpenRegisterRestaurant = () => {},
  onApproveRestaurant = () => {},
  onRejectRestaurant = () => {},
  onUpdateRestaurantDetails = () => {},
  onDeleteRestaurant = () => {},
  onApproveAllRestaurants = () => {},
  onOpenRegisterRider = () => {}
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterLocality, setFilterLocality] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilterUser, setStatusFilterUser] = useState('ALL');
  const [roleMsg, setRoleMsg] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('ALL');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [restaurantApprovalMsg, setRestaurantApprovalMsg] = useState('');
  const [upiIdInput, setUpiIdInput] = useState(settings?.merchantUpi || '8248651695-3@ybl');
  const [merchantNameInput, setMerchantNameInput] = useState(settings?.merchantName || 'Unavukadai Express');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [isResetConfirm, setIsResetConfirm] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newRegion, setNewRegion] = useState('Perungalathur');
  const [newDiscount, setNewDiscount] = useState(50);
  const [newMaxDiscount, setNewMaxDiscount] = useState(120);
  const [orderSearch, setOrderSearch] = useState('');

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalGMV = orders.reduce((a, o) => a + (o.grandTotal || 0), 0);
  const platformRevenue = Math.round(totalGMV * 0.15) + orders.length * 5;
  const activeOrdersCount = orders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status)).length;
  const completedToday = orders.filter(o => o.status === 'DELIVERED').length;

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => orders.filter(o => {
    const ml = filterLocality === 'ALL' || o.locality === filterLocality;
    const ms = statusFilter === 'ALL' || o.status === statusFilter;
    const mq = !orderSearch.trim() || o.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerName?.toLowerCase().includes(orderSearch.toLowerCase());
    return ml && ms && mq;
  }), [orders, filterLocality, statusFilter, orderSearch]);

  const filteredUsers = useMemo(() => usersList.filter(u => {
    const q = userSearch.toLowerCase().trim();
    const mq = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.replace(/\D/g,'').includes(q);
    const mr = roleFilter === 'ALL' || u.role === roleFilter;
    const ms = statusFilterUser === 'ALL' || u.status === statusFilterUser;
    return mq && mr && ms;
  }), [usersList, userSearch, roleFilter, statusFilterUser]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (onUpdateSettings) onUpdateSettings({ merchantUpi: upiIdInput.trim(), merchantName: merchantNameInput.trim() });
    setSettingsSavedMsg('✅ Merchant UPI updated!');
    setTimeout(() => setSettingsSavedMsg(''), 3000);
  };

  const handleConfirmReset = () => {
    if (onResetOrders) onResetOrders();
    setIsResetConfirm(false);
    setResetMsg('🧹 All orders cleared. Ready for launch!');
    setTimeout(() => setResetMsg(''), 4500);
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    onAddCoupon({ code: newCode.trim().toUpperCase(), region: newRegion, discountPercent: Number(newDiscount), maxDiscount: Number(newMaxDiscount), minOrder: 199, label: `${newDiscount}% OFF up to ₹${newMaxDiscount} (${newRegion})` });
    setNewCode('');
  };

  const statusColor = (s) => ({ PLACED:'#f97316', PREPARING:'#3b82f6', READY_FOR_PICKUP:'#8b5cf6', OUT_FOR_DELIVERY:'#10b981', DELIVERED:'#22c55e', CANCELLED:'#ef4444' }[s] || '#64748b');

  const TABS = [
    { id: 'dashboard', icon: <Home size={17}/>, label: 'Dashboard' },
    { id: 'orders', icon: <Package size={17}/>, label: 'Orders', badge: activeOrdersCount || null },
    { id: 'users', icon: <Users size={17}/>, label: 'Users', badge: usersList.length || null },
    { id: 'restaurants', icon: <Store size={17}/>, label: 'Partners' },
    { id: 'fleet', icon: <Bike size={17}/>, label: 'Fleet' },
    { id: 'promos', icon: <Tag size={17}/>, label: 'Promos' },
    { id: 'settings', icon: <Settings size={17}/>, label: 'Settings' },
  ];

  return (
    <div className="adm-shell">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="adm-header">
        <div className="adm-header-left">
          <div className="adm-brand">
            <div className="adm-brand-icon"><ShieldAlert size={16}/></div>
            <div>
              <div className="adm-brand-name">Unavu Admin</div>
              <div className="adm-brand-sub">Super Console · HQ</div>
            </div>
          </div>
        </div>
        <div className="adm-header-right">
          <div className="adm-live-pill"><span className="adm-live-dot"/><span>Live</span></div>
          {currentUser && <div className="adm-user-chip">🛡️ {currentUser.name?.split(' ')[0]}</div>}
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="adm-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`adm-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon}
            <span>{t.label}</span>
            {t.badge ? <span className="adm-tab-badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {(settingsSavedMsg || resetMsg || roleMsg) && (
        <div className="adm-toast animate-fade">{settingsSavedMsg || resetMsg || roleMsg}</div>
      )}

      <div className="adm-content">

        {/* ══════════════════════════════════════════════════════════════════
            DASHBOARD
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="adm-dashboard">
            {/* KPI Grid */}
            <div className="adm-kpi-grid">
              {[
                { label:'Total GMV', value:`₹${totalGMV}`, sub:`${orders.length} orders`, icon:<IndianRupee size={20}/>, color:'green' },
                { label:'Platform Revenue', value:`₹${platformRevenue}`, sub:'15% + ₹5/order', icon:<Percent size={20}/>, color:'purple' },
                { label:'Active Orders', value:activeOrdersCount, sub:'Live now', icon:<Zap size={20}/>, color:'orange' },
                { label:'Fleet Riders', value:'18', sub:'Avg 19 min SLA', icon:<Bike size={20}/>, color:'blue' },
              ].map(k => (
                <div key={k.label} className={`adm-kpi-card kpi-${k.color}`}>
                  <div className={`adm-kpi-icon ${k.color}`}>{k.icon}</div>
                  <div>
                    <div className="adm-kpi-val">{k.value}</div>
                    <div className="adm-kpi-label">{k.label}</div>
                    <div className="adm-kpi-sub">{k.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order pipeline status */}
            <div className="adm-section-title">Order Pipeline</div>
            <div className="adm-pipeline">
              {[
                ['🆕 New', orders.filter(o=>o.status==='PLACED').length, '#f97316'],
                ['🍳 Cooking', orders.filter(o=>o.status==='PREPARING').length, '#3b82f6'],
                ['📦 Ready', orders.filter(o=>o.status==='READY_FOR_PICKUP').length, '#8b5cf6'],
                ['🛵 En Route', orders.filter(o=>o.status==='OUT_FOR_DELIVERY').length, '#10b981'],
                ['✅ Done', completedToday, '#22c55e'],
              ].map(([l,v,c]) => (
                <div key={l} className="adm-pipe-card" style={{ borderTop:`3px solid ${c}` }}>
                  <div className="adm-pipe-val" style={{ color:c }}>{v}</div>
                  <div className="adm-pipe-label">{l}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="adm-section-title">Quick Actions</div>
            <div className="adm-qa-grid">
              {[
                { label:'Live Orders', icon:<Package size={18}/>, tab:'orders', badge: activeOrdersCount },
                { label:'Users', icon:<Users size={18}/>, tab:'users', badge: usersList.length },
                { label:'Fleet GPS', icon:<Bike size={18}/>, tab:'fleet' },
                { label:'Promos', icon:<Tag size={18}/>, tab:'promos' },
                { label:'Partners', icon:<Store size={18}/>, tab:'restaurants' },
                { label:'Settings', icon:<Settings size={18}/>, tab:'settings' },
              ].map(qa => (
                <button key={qa.label} className="adm-qa-card" onClick={() => setActiveTab(qa.tab)}>
                  <div className="adm-qa-icon">{qa.icon}</div>
                  <span>{qa.label}</span>
                  {qa.badge > 0 && <span className="adm-qa-badge">{qa.badge}</span>}
                </button>
              ))}
            </div>

            {/* Recent orders preview */}
            <div className="adm-section-title">Recent Orders</div>
            <div className="adm-recent-list">
              {orders.slice(0,6).map(o => (
                <div key={o.orderId} className="adm-recent-row" onClick={() => setActiveTab('orders')}>
                  <div className="adm-recent-left">
                    <strong>#{o.orderId}</strong>
                    <span>{o.customerName} · {o.restaurantName}</span>
                  </div>
                  <div className="adm-recent-right">
                    <span className="adm-status-pill" style={{ background: statusColor(o.status)+'22', color: statusColor(o.status) }}>{o.status.replace(/_/g,' ')}</span>
                    <strong>₹{o.grandTotal}</strong>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <div className="adm-empty"><Package size={32}/><p>No orders yet</p></div>}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ORDERS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="adm-orders-page">
            {/* Toolbar */}
            <div className="adm-toolbar">
              <div className="adm-search-wrap">
                <Search size={15} className="adm-search-icon"/>
                <input className="adm-search-input" placeholder="Search order or customer…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}/>
              </div>
              <div className="adm-filter-row">
                <select className="adm-select" value={filterLocality} onChange={e => setFilterLocality(e.target.value)}>
                  <option value="ALL">All Zones</option>
                  <option value="Perungalathur">Perungalathur</option>
                  <option value="Vandalur">Vandalur</option>
                  <option value="Mannivakkam">Mannivakkam</option>
                </select>
                <select className="adm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="PLACED">Placed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY_FOR_PICKUP">Ready</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="adm-empty"><Package size={36}/><p>No orders match your filters</p></div>
            ) : (
              <div className="adm-order-cards">
                {filteredOrders.map(order => {
                  const c = statusColor(order.status);
                  return (
                    <div key={order.orderId} className="adm-order-card" style={{ borderLeft:`3px solid ${c}` }}>
                      <div className="adm-oc-top">
                        <div>
                          <div className="adm-oc-id">#{order.orderId}</div>
                          <div className="adm-oc-time">{order.placedAt}</div>
                        </div>
                        <div className="adm-oc-right">
                          <span className="adm-status-pill" style={{ background:c+'22', color:c }}>{order.status.replace(/_/g,' ')}</span>
                          <div className="adm-oc-amt">₹{order.grandTotal}</div>
                        </div>
                      </div>
                      <div className="adm-oc-info">
                        <span><strong>{order.customerName}</strong></span>
                        <span className="adm-zone-chip"><MapPin size={11}/> {order.locality}</span>
                        <span>🏠 {order.restaurantName}</span>
                      </div>
                      <div className="adm-oc-items">{order.items?.map(i => `${i.quantity}× ${i.name}`).join(' · ')}</div>
                      <div className="adm-oc-footer">
                        <span className="adm-rider-chip">{order.riderName ? `🛵 ${order.riderName}` : '⏳ Awaiting rider'}</span>
                        <select className="adm-status-select" value={order.status} onChange={e => onUpdateOrderStatus(order.orderId, e.target.value)}>
                          <option value="PLACED">Placed</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="READY_FOR_PICKUP">Ready</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            USERS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="adm-users-page">
            {/* Stats row */}
            <div className="adm-user-stats">
              {[
                { label:'Total', val: usersList.length, color:'#3b82f6' },
                { label:'Customers', val: usersList.filter(u=>u.role==='customer').length, color:'#10b981' },
                { label:'Merchants', val: usersList.filter(u=>u.role==='restaurant').length, color:'#f97316' },
                { label:'Riders', val: usersList.filter(u=>u.role==='rider').length, color:'#8b5cf6' },
                { label:'Admins', val: usersList.filter(u=>u.role==='admin').length, color:'#e23744' },
              ].map(s => (
                <div key={s.label} className="adm-ustat" style={{ borderTop:`2px solid ${s.color}` }}>
                  <strong style={{ color:s.color }}>{s.val}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="adm-toolbar">
              <div className="adm-search-wrap">
                <Search size={15} className="adm-search-icon"/>
                <input className="adm-search-input" placeholder="Search name, email or phone…" value={userSearch} onChange={e => setUserSearch(e.target.value)}/>
                {userSearch && <button className="adm-clear-btn" onClick={() => setUserSearch('')}><X size={13}/></button>}
              </div>
              <div className="adm-filter-row">
                <select className="adm-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="ALL">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="restaurant">Merchant</option>
                  <option value="rider">Rider</option>
                  <option value="admin">Admin</option>
                </select>
                <select className="adm-select" value={statusFilterUser} onChange={e => setStatusFilterUser(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div className="adm-role-pills" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[['ALL','All'], ['customer','🍲'], ['restaurant','👨‍🍳'], ['rider','🛵'], ['admin','🛡️']].map(([r,l]) => (
                    <button key={r} className={`adm-role-pill ${roleFilter===r?'active':''}`} onClick={()=>setRoleFilter(r)}>
                      {l} {r!=='ALL' && `(${usersList.filter(u=>u.role===r).length})`}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="adm-add-rider-btn"
                  onClick={onOpenRegisterRider}
                  title="Onboard and register new delivery partner"
                >
                  <Bike size={14} />
                  <span>+ Onboard Rider</span>
                </button>
              </div>
            </div>

            {/* User cards — mobile-first */}
            <div className="adm-user-cards">
              {filteredUsers.length === 0 ? (
                <div className="adm-empty"><Users size={36}/><p>No users found</p></div>
              ) : filteredUsers.map(u => {
                const isSelf = currentUser && (currentUser.id === u.id || currentUser.email?.toLowerCase() === u.email?.toLowerCase());
                const roleIcon = { admin:'🛡️', restaurant:'👨‍🍳', rider:'🛵', customer:'🍲' }[u.role] || '👤';
                const roleBg = { admin:'rgba(226,55,68,0.1)', restaurant:'rgba(249,115,22,0.1)', rider:'rgba(139,92,246,0.1)', customer:'rgba(16,185,129,0.1)' }[u.role];
                const roleColor = { admin:'#e23744', restaurant:'#f97316', rider:'#8b5cf6', customer:'#10b981' }[u.role];
                const portalTarget = { restaurant:'hotel', rider:'rider', admin:'admin', customer:'customer' }[u.role];
                return (
                  <div key={u.id} className={`adm-user-card ${u.status==='SUSPENDED'?'suspended':''}`}>
                    <div className="adm-uc-top">
                      <div className="adm-uc-avatar" style={{ background:roleBg, color:roleColor }}>{roleIcon}</div>
                      <div className="adm-uc-info">
                        <div className="adm-uc-name">
                          {u.name}
                          {isSelf && <span className="adm-self-tag">You</span>}
                        </div>
                        <div className="adm-uc-email">{u.email}</div>
                        <div className="adm-uc-phone">{u.phone}</div>
                        {u.role === 'rider' && (u.operatingZone || u.vehicleType || u.payoutUpi) && (
                          <div style={{ fontSize: '11px', color: '#8b5cf6', margin: '4px 0', background: 'rgba(139, 92, 246, 0.08)', padding: '4px 8px', borderRadius: '6px' }}>
                            🛵 {u.vehicleType || 'Two-Wheeler'} {u.vehicleNumber ? `(${u.vehicleNumber})` : ''} · 📍 {u.operatingZone || 'South Chennai'} {u.payoutUpi ? `· 💳 ${u.payoutUpi}` : ''}
                          </div>
                        )}
                      </div>
                      <div className="adm-uc-status-col">
                        <span className={`adm-uc-status ${u.status==='ACTIVE'?'active':'suspended'}`}>{u.status}</span>
                        {!isSelf && (
                          <button className="adm-suspend-btn" onClick={() => { onToggleUserStatus(u.id); setRoleMsg(`Status updated for ${u.name}`); setTimeout(()=>setRoleMsg(''),3000); }}>
                            {u.status==='ACTIVE'?'Suspend':'Restore'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="adm-uc-bottom">
                      <div className="adm-uc-role-row">
                        <label className="adm-uc-role-label">Role:</label>
                        <select
                          className="adm-role-select"
                          style={{ background: roleBg, color: roleColor, borderColor: roleColor+'44' }}
                          value={u.role}
                          onChange={e => {
                            onUpdateUserRole(u.id, e.target.value);
                            setRoleMsg(`✅ ${u.name} → ${e.target.value.toUpperCase()}`);
                            setTimeout(()=>setRoleMsg(''),3500);
                          }}
                        >
                          <option value="customer">🍲 Customer</option>
                          <option value="restaurant">👨‍🍳 Merchant</option>
                          <option value="rider">🛵 Rider</option>
                          <option value="admin">🛡️ Admin</option>
                        </select>
                      </div>
                      <button className="adm-inspect-btn" onClick={() => onSwitchPortal(portalTarget)}>
                        Inspect {roleIcon} Portal <ArrowRight size={13}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RBAC explainer */}
            <div className="adm-rbac-card">
              <div className="adm-rbac-title"><ShieldCheck size={16}/> Role-Based Access Control</div>
              <div className="adm-rbac-grid">
                <div className="adm-rbac-item"><strong>🔒 Strict Isolation:</strong> Each user type is locked to their portal. Only Admins can switch views.</div>
                <div className="adm-rbac-item"><strong>🛵 1-Trip Rule:</strong> Riders can only carry one active order at a time.</div>
                <div className="adm-rbac-item"><strong>⚡ Live Re-assignment:</strong> Role changes here take effect instantly in the user's live session.</div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            RESTAURANT PARTNERS & APPROVAL GATE
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'restaurants' && (() => {
          const pendingList = restaurantsList.filter(r => r.approvalStatus === 'PENDING');
          const approvedList = restaurantsList.filter(r => r.approvalStatus !== 'PENDING' && r.approvalStatus !== 'REJECTED');
          
          let displayedList = restaurantFilter === 'PENDING' 
            ? pendingList 
            : restaurantFilter === 'APPROVED' 
              ? approvedList 
              : restaurantsList;

          if (restaurantSearch.trim()) {
            const query = restaurantSearch.toLowerCase().trim();
            displayedList = displayedList.filter(r => 
              r.name?.toLowerCase().includes(query) ||
              r.region?.toLowerCase().includes(query) ||
              r.address?.toLowerCase().includes(query) ||
              (Array.isArray(r.cuisines) && r.cuisines.some(c => c.toLowerCase().includes(query)))
            );
          }

          return (
            <div className="adm-partners-page">
              <div className="adm-partners-header-row">
                <div>
                  <div className="adm-section-title">Partner Restaurants ({restaurantsList.length})</div>
                  <p className="adm-section-sub">Manage outlet onboarding, hygiene verification, image galleries, and live food delivery status</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {pendingList.length > 0 && (
                    <button 
                      className="adm-approve-btn"
                      onClick={() => {
                        onApproveAllRestaurants();
                        setRestaurantApprovalMsg(`🎉 All ${pendingList.length} pending restaurants have been approved and published live!`);
                        setTimeout(() => setRestaurantApprovalMsg(''), 4000);
                      }}
                      title="Approve and publish all pending restaurants at once"
                    >
                      <Sparkles size={14} />
                      <span>Approve All ({pendingList.length})</span>
                    </button>
                  )}
                  <button 
                    className="btn-primary adm-add-partner-btn"
                    onClick={onOpenRegisterRestaurant}
                  >
                    <Plus size={16} />
                    <span>+ Register New Restaurant</span>
                  </button>
                </div>
              </div>

              {/* Approval status banner message */}
              {restaurantApprovalMsg && (
                <div className="adm-alert-toast animate-fade">
                  {restaurantApprovalMsg}
                </div>
              )}

              {/* Pending Approvals Alert Bar */}
              {pendingList.length > 0 && (
                <div className="adm-pending-alert-bar animate-fade">
                  <div className="adm-pab-content">
                    <AlertTriangle size={18} className="text-amber" />
                    <span><strong>{pendingList.length} New Restaurant{pendingList.length === 1 ? '' : 's'} Awaiting Admin Review:</strong> Verify FSSAI, photos &amp; details before approving to go live on the customer app.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      className="adm-pab-btn"
                      onClick={() => setRestaurantFilter('PENDING')}
                    >
                      Review Pending ({pendingList.length})
                    </button>
                    <button 
                      className="adm-approve-btn"
                      onClick={() => {
                        onApproveAllRestaurants();
                        setRestaurantApprovalMsg(`🎉 All ${pendingList.length} pending restaurants approved!`);
                        setTimeout(() => setRestaurantApprovalMsg(''), 4000);
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve All</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Search Toolbar */}
              <div style={{ padding: '0 20px 10px' }}>
                <div className="adm-search-wrap">
                  <Search size={15} className="adm-search-icon"/>
                  <input 
                    className="adm-search-input" 
                    placeholder="Search restaurants by name, locality, cuisines, or address..." 
                    value={restaurantSearch} 
                    onChange={e => setRestaurantSearch(e.target.value)}
                  />
                  {restaurantSearch && (
                    <button className="adm-clear-btn" onClick={() => setRestaurantSearch('')}>
                      <X size={13}/>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="adm-role-pills" style={{ padding: '0 20px 14px' }}>
                <button 
                  className={`adm-role-pill ${restaurantFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setRestaurantFilter('ALL')}
                >
                  All Outlets ({restaurantsList.length})
                </button>
                <button 
                  className={`adm-role-pill ${restaurantFilter === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setRestaurantFilter('PENDING')}
                  style={pendingList.length > 0 ? { borderColor: '#f59e0b', color: '#f59e0b' } : {}}
                >
                  ⏳ Pending Approvals ({pendingList.length})
                </button>
                <button 
                  className={`adm-role-pill ${restaurantFilter === 'APPROVED' ? 'active' : ''}`}
                  onClick={() => setRestaurantFilter('APPROVED')}
                >
                  🟢 Live on App ({approvedList.length})
                </button>
              </div>

              <div className="adm-partner-cards">
                {displayedList.length === 0 ? (
                  <div className="adm-empty">
                    <Store size={36} />
                    <p>No restaurants found matching your criteria.</p>
                  </div>
                ) : displayedList.map(r => {
                  const isPending = r.approvalStatus === 'PENDING';
                  const isRejected = r.approvalStatus === 'REJECTED';

                  return (
                    <div 
                      key={r.id} 
                      className={`adm-partner-card ${isPending ? 'partner-pending-card' : ''}`}
                      style={isPending ? { border: '1.5px solid #f59e0b', background: 'rgba(245, 158, 11, 0.04)' } : {}}
                    >
                      <div style={{ position: 'relative' }}>
                        <img src={r.image} alt={r.name} className="adm-partner-thumb" onError={e => e.target.style.display='none'}/>
                        <button
                          type="button"
                          className="adm-photo-badge"
                          onClick={() => setEditingRestaurant(r)}
                          title="Change photo"
                        >
                          <Camera size={11} />
                        </button>
                      </div>

                      <div className="adm-partner-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="adm-partner-name">{r.name}</span>
                          {isPending && (
                            <span className="adm-status-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid #f59e0b' }}>
                              ⏳ PENDING APPROVAL
                            </span>
                          )}
                          {!isPending && !isRejected && (
                            <span className="adm-status-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' }}>
                              🟢 LIVE ON APP
                            </span>
                          )}
                          {isRejected && (
                            <span className="adm-status-pill" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444' }}>
                              ❌ REJECTED
                            </span>
                          )}
                        </div>

                        <div className="adm-partner-region"><MapPin size={11}/> {r.region} · {r.address}</div>
                        
                        {/* Owner & License Details */}
                        {(r.ownerName || r.fssaiLicense) && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0' }}>
                            {r.ownerName && <span>👤 Owner: <strong>{r.ownerName}</strong> ({r.ownerPhone || 'No Phone'}) · </span>}
                            {r.fssaiLicense && <span>🛡️ FSSAI: <strong>{r.fssaiLicense}</strong></span>}
                          </div>
                        )}

                        <div className="adm-partner-chips">
                          <span>⭐ {r.rating}</span>
                          <span>{r.menu?.length || 0} dishes</span>
                          <span>{r.ratingCount} reviews</span>
                          <span>₹{r.costForTwo} for two</span>
                          {r.pureVeg && <span style={{ color: '#10b981' }}>🌱 Pure Veg</span>}
                          {r.offer && <span style={{ color: '#f59e0b' }}>🏷️ {r.offer.slice(0, 18)}...</span>}
                        </div>
                      </div>

                      <div className="adm-partner-actions" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {/* Edit Hotel & Photo Button */}
                          <button
                            className="adm-edit-hotel-btn"
                            onClick={() => setEditingRestaurant(r)}
                            title="Edit hotel details, images, cuisines, prices & status"
                          >
                            <Edit3 size={13} />
                            <span>Edit Hotel</span>
                          </button>

                          {!isPending && (
                            <button 
                              className="adm-inspect-btn"
                              onClick={() => onSwitchPortal('hotel')}
                              title="Open Restaurant Kitchen Portal"
                            >
                              <Store size={13} />
                              <span>Open Kitchen</span>
                            </button>
                          )}
                        </div>

                        {isPending && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="adm-approve-btn"
                              onClick={() => {
                                onApproveRestaurant(r.id);
                                setRestaurantApprovalMsg(`🎉 ${r.name} approved! It is now LIVE on the customer page.`);
                                setTimeout(() => setRestaurantApprovalMsg(''), 4000);
                              }}
                              title="Approve restaurant and publish live to customers"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve &amp; Publish</span>
                            </button>
                            <button 
                              className="adm-reject-btn"
                              onClick={() => {
                                onRejectRestaurant(r.id);
                                setRestaurantApprovalMsg(`❌ ${r.name} rejected.`);
                                setTimeout(() => setRestaurantApprovalMsg(''), 4000);
                              }}
                              title="Reject application"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════════
            FLEET GPS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'fleet' && (
          <div style={{ height: 'calc(100vh - 110px)' }}>
            <AdminFleetRadarMap riderLocations={riderLocations} orders={orders}/>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PROMO CODES
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'promos' && (
          <div className="adm-promos-page">
            {/* Create form */}
            <div className="adm-promo-form-card">
              <div className="adm-section-title" style={{ padding:0, marginBottom:12 }}>⚡ Create Promo Code</div>
              <form onSubmit={handleCreateCoupon}>
                <div className="adm-promo-grid">
                  <div className="form-group">
                    <label className="field-label-bold">Code</label>
                    <input className="styled-input" placeholder="e.g. FEAST50" value={newCode} onChange={e => setNewCode(e.target.value)} required style={{ textTransform:'uppercase' }}/>
                  </div>
                  <div className="form-group">
                    <label className="field-label-bold">Zone</label>
                    <select className="styled-input" value={newRegion} onChange={e => setNewRegion(e.target.value)}>
                      <option>Perungalathur</option>
                      <option>Vandalur</option>
                      <option>Mannivakkam</option>
                      <option>All Zones</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="field-label-bold">Discount %</label>
                    <input className="styled-input" type="number" value={newDiscount} onChange={e=>setNewDiscount(e.target.value)} min={5} max={80}/>
                  </div>
                  <div className="form-group">
                    <label className="field-label-bold">Max Cap (₹)</label>
                    <input className="styled-input" type="number" value={newMaxDiscount} onChange={e=>setNewMaxDiscount(e.target.value)} min={50} max={500}/>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop:12, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Plus size={15}/> Launch Promo
                </button>
              </form>
            </div>

            {/* Active promos */}
            <div className="adm-section-title">Active Promos ({couponsList.length})</div>
            <div className="adm-coupon-cards">
              {couponsList.map(c => (
                <div key={c.code} className="adm-coupon-card">
                  <div className="adm-coupon-code">{c.code}</div>
                  <div className="adm-coupon-label">{c.label}</div>
                  <div className="adm-coupon-meta">
                    <span>📍 {c.region || 'All Zones'}</span>
                    <span>Min ₹{c.minOrder || 199}</span>
                    <span className="adm-coupon-active"><Check size={11}/> Active</span>
                  </div>
                </div>
              ))}
              {couponsList.length === 0 && <div className="adm-empty"><Tag size={32}/><p>No promo codes yet</p></div>}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SETTINGS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="adm-settings-page">
            {/* UPI Settings */}
            <div className="adm-settings-card">
              <div className="adm-settings-card-header">
                <div className="adm-settings-icon purple"><CreditCard size={18}/></div>
                <div>
                  <div className="adm-settings-title">Merchant UPI Gateway</div>
                  <div className="adm-settings-sub">Configure the UPI VPA for customer payments</div>
                </div>
              </div>
              <form onSubmit={handleSaveSettings}>
                <div className="form-group mb-2">
                  <label className="field-label-bold">UPI ID (VPA) *</label>
                  <input className="styled-input" placeholder="e.g. 8248651695@ybl" value={upiIdInput} onChange={e => setUpiIdInput(e.target.value)} required/>
                  <small className="field-hint">Embedded into GPay/PhonePe QR at checkout</small>
                </div>
                <div className="form-group mb-3">
                  <label className="field-label-bold">Business Display Name</label>
                  <input className="styled-input" placeholder="Unavukadai Express" value={merchantNameInput} onChange={e => setMerchantNameInput(e.target.value)}/>
                </div>
                <div className="adm-upi-preview">
                  <span>Preview:</span>
                  <code>upi://pay?pa={upiIdInput.trim()}&pn={encodeURIComponent(merchantNameInput.trim())}&cu=INR</code>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop:14, width:'100%' }}>Save Payment Settings</button>
              </form>
            </div>

            {/* Reset Card */}
            <div className="adm-settings-card danger-card">
              <div className="adm-settings-card-header">
                <div className="adm-settings-icon red"><AlertTriangle size={18}/></div>
                <div>
                  <div className="adm-settings-title" style={{ color:'#ef4444' }}>Sunday Launch Reset</div>
                  <div className="adm-settings-sub">Wipe test orders before going live</div>
                </div>
              </div>
              <p className="adm-danger-text">
                Currently <strong>{orders.length} order(s)</strong> in the system. Clear all test data so restaurants, riders, and dispatchers start fresh on launch day.
              </p>
              {!isResetConfirm ? (
                <button className="adm-danger-btn" onClick={() => setIsResetConfirm(true)}>
                  <Trash2 size={15}/> Reset All Orders for Launch
                </button>
              ) : (
                <div className="adm-confirm-box">
                  <p>⚠️ This <strong>cannot be undone</strong>. All orders will be erased.</p>
                  <div style={{ display:'flex', gap:10, marginTop:12 }}>
                    <button className="adm-cancel-btn" onClick={() => setIsResetConfirm(false)}>Cancel</button>
                    <button className="adm-confirm-delete-btn" onClick={handleConfirmReset}>Yes, Clear All Orders</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Edit Restaurant Modal */}
      {editingRestaurant && (
        <EditRestaurantModal
          isOpen={Boolean(editingRestaurant)}
          onClose={() => setEditingRestaurant(null)}
          restaurant={editingRestaurant}
          onSave={(id, updated) => {
            onUpdateRestaurantDetails(id, updated);
            setRestaurantApprovalMsg(`✅ "${updated.name}" updated successfully!`);
            setTimeout(() => setRestaurantApprovalMsg(''), 3500);
          }}
          onDelete={(id) => {
            onDeleteRestaurant(id);
            setRestaurantApprovalMsg(`🗑️ Restaurant removed from directory.`);
            setTimeout(() => setRestaurantApprovalMsg(''), 3500);
          }}
        />
      )}
    </div>
  );
}
