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
          <span className="portal-hub-tag">UNAVUKADAI MULTI-PORTAL ECOSYSTEM</span>
        </div>

        <nav className="portal-nav-pills">
          {/* Customer Portal */}
          <a 
            href="#/customer"
            className={`portal-pill-btn ${currentPortal === 'customer' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPortal('customer'); }}
          >
            <ShoppingBag size={15} />
            <span>Customer App</span>
            {cartCount > 0 && <span className="portal-counter-badge primary">{cartCount}</span>}
          </a>

          {/* Hotel / Merchant Portal */}
          <a 
            href="#/hotel"
            className={`portal-pill-btn ${currentPortal === 'hotel' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPortal('hotel'); }}
          >
            <Store size={15} />
            <span>Hotel / Merchant</span>
            {pendingKitchenOrdersCount > 0 && (
              <span className="portal-counter-badge warning">{pendingKitchenOrdersCount} KOT</span>
            )}
          </a>

          {/* Delivery Rider Portal */}
          <a 
            href="#/rider"
            className={`portal-pill-btn ${currentPortal === 'rider' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPortal('rider'); }}
          >
            <Bike size={15} />
            <span>Rider Partner</span>
            {availableRiderTripsCount > 0 && (
              <span className="portal-counter-badge success">{availableRiderTripsCount} Trips</span>
            )}
          </a>

          {/* Super Admin Portal */}
          <a 
            href="#/admin"
            className={`portal-pill-btn ${currentPortal === 'admin' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPortal('admin'); }}
          >
            <ShieldAlert size={15} />
            <span>Super Admin</span>
            <span className="portal-counter-badge dark">{totalOrdersCount} Orders</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
