import React from 'react';
import { ShoppingBag, Store, Bike, ShieldAlert, LogOut, Lock } from 'lucide-react';

export default function PortalSwitcher({
  currentPortal,
  setCurrentPortal,
  cartCount,
  pendingKitchenOrdersCount,
  availableRiderTripsCount,
  totalOrdersCount,
  user,
  onLogout,
  onOpenAuth
}) {
  const role = user?.role || 'customer';

  // 1. RESTAURANT MERCHANT RESTRICTED VIEW
  if (role === 'restaurant') {
    return (
      <div className="portal-switcher-bar merchant-role-bar">
        <div className="portal-switcher-inner">
          <div className="portal-brand-mini">
            <span className="portal-hub-tag merchant-tag">👨‍🍳 RESTAURANT MERCHANT PORTAL</span>
            <span className="portal-user-tag">Outlet: {user.name}</span>
          </div>

          <div className="portal-nav-pills">
            <span className="portal-pill-btn active">
              <Store size={15} />
              <span>Kitchen Live KOT &amp; Menu Studio</span>
              {pendingKitchenOrdersCount > 0 && (
                <span className="portal-counter-badge warning">{pendingKitchenOrdersCount} Active</span>
              )}
            </span>

            <button 
              type="button" 
              className="portal-pill-btn logout-role-btn" 
              onClick={onLogout}
              title="Log out of restaurant merchant portal"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. DELIVERY RIDER CAPTAIN RESTRICTED VIEW
  if (role === 'rider') {
    return (
      <div className="portal-switcher-bar rider-role-bar">
        <div className="portal-switcher-inner">
          <div className="portal-brand-mini">
            <span className="portal-hub-tag rider-tag">🛵 DELIVERY FLEET CAPTAIN</span>
            <span className="portal-user-tag">Captain: {user.name}</span>
          </div>

          <div className="portal-nav-pills">
            <span className="portal-pill-btn active">
              <Bike size={15} />
              <span>Duty Radar &amp; Wallet</span>
              {availableRiderTripsCount > 0 && (
                <span className="portal-counter-badge success">{availableRiderTripsCount} Trips</span>
              )}
            </span>

            <button 
              type="button" 
              className="portal-pill-btn logout-role-btn" 
              onClick={onLogout}
              title="Log out of rider delivery portal"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. MASTER ADMIN (UNRESTRICTED MULTI-PORTAL GOVERNANCE)
  if (role === 'admin' || currentPortal === 'admin') {
    return (
      <div className="portal-switcher-bar admin-role-bar">
        <div className="portal-switcher-inner">
          <div className="portal-brand-mini">
            <span className="portal-hub-tag admin-tag">👑 MASTER ADMIN CONSOLE</span>
            <span className="portal-user-tag">Full Governance Mode (Role Control)</span>
          </div>

          <nav className="portal-nav-pills">
            <a 
              href="#/customer"
              className={`portal-pill-btn ${currentPortal === 'customer' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPortal('customer'); }}
              title="Switch to Customer Foodie App"
            >
              <ShoppingBag size={15} />
              <span>🍲 Customer App</span>
              {cartCount > 0 && <span className="portal-counter-badge primary">{cartCount}</span>}
            </a>

            <a 
              href="#/hotel"
              className={`portal-pill-btn ${currentPortal === 'hotel' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPortal('hotel'); }}
              title="Switch to Restaurant Merchant Portal"
            >
              <Store size={15} />
              <span>👨‍🍳 Merchant App</span>
              {pendingKitchenOrdersCount > 0 && (
                <span className="portal-counter-badge warning">{pendingKitchenOrdersCount} KOT</span>
              )}
            </a>

            <a 
              href="#/rider"
              className={`portal-pill-btn ${currentPortal === 'rider' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPortal('rider'); }}
              title="Switch to Delivery Rider Partner App"
            >
              <Bike size={15} />
              <span>🛵 Rider App</span>
              {availableRiderTripsCount > 0 && (
                <span className="portal-counter-badge success">{availableRiderTripsCount} Trips</span>
              )}
            </a>

            <a 
              href="#/admin"
              className={`portal-pill-btn ${currentPortal === 'admin' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPortal('admin'); }}
              title="Master Admin Console & Users"
            >
              <ShieldAlert size={15} />
              <span>🛡️ Master Admin</span>
              <span className="portal-counter-badge dark">{totalOrdersCount} Orders</span>
            </a>

            <button 
              type="button" 
              className="portal-pill-btn logout-role-btn" 
              onClick={onLogout}
              title="Log out of Master Admin"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      </div>
    );
  }

  // 4. CUSTOMER VIEW / GUESTS: No top bar shown (clean user interface)
  return null;
}
