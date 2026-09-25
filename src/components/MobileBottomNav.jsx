import React from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  ReceiptText, 
  ShoppingBag 
} from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenAddresses,
  onOpenMyOrders,
  onOpenCart,
  cartCount = 0,
  cartTotal = 0,
  activeOrdersCount = 0,
  currentAddressTag = 'Home'
}) {
  return (
    <nav className="mobile-bottom-nav animate-slide-up" aria-label="Mobile Navigation">
      {/* 1. Explore / Food */}
      <button 
        type="button" 
        className={`mobile-nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
        onClick={() => setActiveTab('delivery')}
      >
        <div className="mobile-nav-icon-box">
          <Compass size={20} />
        </div>
        <span className="mobile-nav-label">Explore</span>
      </button>

      {/* 2. Instant Search */}
      <button 
        type="button" 
        className="mobile-nav-item"
        onClick={onOpenSearch}
      >
        <div className="mobile-nav-icon-box">
          <Search size={20} />
        </div>
        <span className="mobile-nav-label">Search</span>
      </button>

      {/* 3. Address Book & Location Setting */}
      <button 
        type="button" 
        className="mobile-nav-item"
        onClick={onOpenAddresses}
      >
        <div className="mobile-nav-icon-box">
          <MapPin size={20} />
        </div>
        <span className="mobile-nav-label">{currentAddressTag || 'Address'}</span>
      </button>

      {/* 4. Orders with Live Pulse */}
      <button 
        type="button" 
        className="mobile-nav-item"
        onClick={onOpenMyOrders}
      >
        <div className="mobile-nav-icon-box">
          <ReceiptText size={20} />
          {activeOrdersCount > 0 && (
            <span className="mobile-nav-pulse-dot" />
          )}
        </div>
        <span className="mobile-nav-label">Orders</span>
      </button>

      {/* 5. Cart with Badges */}
      <button 
        type="button" 
        className={`mobile-nav-item cart-item ${cartCount > 0 ? 'highlight-cart' : ''}`}
        onClick={onOpenCart}
      >
        <div className="mobile-nav-icon-box">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="mobile-nav-badge">{cartCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">
          {cartCount > 0 ? `₹${cartTotal}` : 'Cart'}
        </span>
      </button>
    </nav>
  );
}
