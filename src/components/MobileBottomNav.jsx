import React from 'react';
import { Compass, Search, MapPin, ReceiptText, ShoppingBag } from 'lucide-react';

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
  currentAddressTag = 'Home',
  user
}) {
  return (
    <nav className="cust-bottom-nav" aria-label="Mobile Navigation">

      {/* 1. Explore */}
      <button
        type="button"
        className={`cust-nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
        onClick={() => setActiveTab('delivery')}
      >
        <div className="cust-nav-icon">
          <Compass size={21}/>
        </div>
        <span className="cust-nav-label">Explore</span>
      </button>

      {/* 2. Search */}
      <button type="button" className="cust-nav-item" onClick={onOpenSearch}>
        <div className="cust-nav-icon">
          <Search size={21}/>
        </div>
        <span className="cust-nav-label">Search</span>
      </button>

      {/* 3. Address */}
      <button type="button" className="cust-nav-item" onClick={onOpenAddresses}>
        <div className="cust-nav-icon">
          <MapPin size={21}/>
        </div>
        <span className="cust-nav-label">{currentAddressTag || 'Address'}</span>
      </button>

      {/* 4. Orders & Account */}
      <button 
        type="button" 
        className={`cust-nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
        onClick={onOpenMyOrders}
      >
        <div className="cust-nav-icon" style={{ position: 'relative' }}>
          {user?.avatar ? (
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{user.avatar}</span>
          ) : (
            <ReceiptText size={21}/>
          )}
          {activeOrdersCount > 0 && (
            <span className="cust-nav-live-dot"/>
          )}
        </div>
        <span className="cust-nav-label">
          {user ? 'My Account' : 'Orders'}
        </span>
      </button>

      {/* 5. Cart — highlighted when items in cart */}
      <button
        type="button"
        className={`cust-nav-item cust-nav-cart ${cartCount > 0 ? 'has-items' : ''}`}
        onClick={onOpenCart}
      >
        <div className="cust-nav-icon" style={{ position: 'relative' }}>
          <ShoppingBag size={21}/>
          {cartCount > 0 && (
            <span className="cust-nav-cart-badge">{cartCount}</span>
          )}
        </div>
        <span className="cust-nav-label">
          {cartCount > 0 ? `₹${cartTotal}` : 'Cart'}
        </span>
      </button>
    </nav>
  );
}
