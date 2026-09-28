import React from 'react';
import { ShoppingBag, Store, Bike, ShieldAlert } from 'lucide-react';

export default function PortalSwitcher({
  currentPortal,
  setCurrentPortal,
  cartCount,
  pendingKitchenOrdersCount,
  availableRiderTripsCount,
  totalOrdersCount
}) {
  return (
    <div className="portal-switcher-bar">
      <div className="portal-switcher-inner">
        <div className="portal-brand-mini">
          <span className="portal-hub-tag">⚡ CHANGE APP POSITION ANYTIME:</span>
        </div>

        <nav className="portal-nav-pills">
          {/* Customer Portal */}
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

          {/* Hotel / Merchant Portal */}
          <a 
            href="#/hotel"
            className={`portal-pill-btn ${currentPortal === 'hotel' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPortal('hotel'); }}
            title="Switch to Restaurant Merchant & Kitchen Portal"
          >
            <Store size={15} />
            <span>👨‍🍳 Merchant App</span>
            {pendingKitchenOrdersCount > 0 && (
              <span className="portal-counter-badge warning">{pendingKitchenOrdersCount} KOT</span>
            )}
          </a>

          {/* Delivery Rider Portal */}
          <a 
            href="#/rider"
            className={`portal-pill-btn ${currentPortal === 'rider' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPortal('rider'); }}
            title="Switch to Delivery Rider Partner Captain App"
          >
            <Bike size={15} />
            <span>🛵 Rider App</span>
            {availableRiderTripsCount > 0 && (
              <span className="portal-counter-badge success">{availableRiderTripsCount} Trips</span>
            )}
          </a>

          {/* Super Admin Portal */}
          <a 
            href="#/admin"
            className={`portal-pill-btn ${currentPortal === 'admin' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPortal('admin'); }}
            title="Switch to Super Admin Radar & Analytics"
          >
            <ShieldAlert size={15} />
            <span>🛡️ Admin App</span>
            <span className="portal-counter-badge dark">{totalOrdersCount} Orders</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
