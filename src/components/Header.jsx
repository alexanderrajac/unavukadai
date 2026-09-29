import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  ShoppingBag, 
  Moon, 
  Sun, 
  ChevronDown, 
  User, 
  X,
  UtensilsCrossed,
  GlassWater,
  Truck,
  ReceiptText,
  Crosshair,
  Loader2,
  LogOut,
  Home,
  Check,
  Mail,
  Store,
  Bike,
  Handshake,
  ArrowRight,
  Sparkles,
  Download,
  Smartphone
} from 'lucide-react';
import { CITIES } from '../data/mockData';
import { detectUserLocation } from '../utils/geolocation';

export default function Header({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
  cartCount,
  cartTotal,
  setIsCartOpen,
  isDarkMode,
  setIsDarkMode,
  setIsAuthOpen,
  onOpenAuth,
  user,
  onOpenMyOrders,
  activeOrdersCount = 0,
  onOpenAddressBook,
  onLogout,
  currentPortal = 'customer',
  onSwitchPortal = () => {},
  onOpenRegisterRestaurant = () => {},
  onOpenRegisterRider = () => {}
}) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstallHelp, setShowIosInstallHelp] = useState(false);
  const cityRef = useRef(null);
  const userMenuRef = useRef(null);
  const partnerMenuRef = useRef(null);

  // PWA Add to Home Screen handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsInstalled(true);
      }
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        setInstallPrompt(e);
      };
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setInstallPrompt(null);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', handleAppInstalled);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      setShowIosInstallHelp(true);
      setTimeout(() => setShowIosInstallHelp(false), 6000);
    }
  };

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsNotice('');
    try {
      const loc = await detectUserLocation();
      setSelectedCity(loc.suburb);
      setGpsNotice(`📍 Detected: ${loc.suburb.name} Hub`);
      setTimeout(() => {
        setIsCityDropdownOpen(false);
        setGpsNotice('');
      }, 1200);
    } catch (err) {
      setGpsNotice(err.message || 'Could not detect location');
      setTimeout(() => setGpsNotice(''), 3500);
    } finally {
      setIsDetectingGps(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setIsCityDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (partnerMenuRef.current && !partnerMenuRef.current.contains(e.target)) {
        setIsPartnerMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = CITIES.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.locality.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Top Bar */}
        <div className="header-top">
          {/* Logo */}
          <div className="logo-brand" onClick={() => { setActiveTab('delivery'); setSearchQuery(''); }}>
            <div className="logo-icon-wrapper">
              <span className="logo-flame">🍲</span>
            </div>
            <div className="logo-text-group">
              <span className="brand-title">unavukadai</span>
              <span className="brand-tagline">Authentic Food & Flavours</span>
            </div>
          </div>

          {/* Search & Location Bar */}
          <div className="omnibar-container">
            {/* Location selector */}
            <div className="location-picker-box" ref={cityRef}>
              <div 
                className="location-trigger" 
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                title="Change location"
              >
                <MapPin size={18} className="icon-crimson" />
                <span className="location-text">{selectedCity.locality}</span>
                <ChevronDown size={14} className={`chevron-icon ${isCityDropdownOpen ? 'rotated' : ''}`} />
              </div>

              {isCityDropdownOpen && (
                <div className="city-dropdown-menu animate-scale">
                  {/* GPS Auto-Detect Button */}
                  <button 
                    type="button" 
                    className="btn-detect-gps-header"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                  >
                    {isDetectingGps ? (
                      <>
                        <Loader2 size={16} className="spin-icon text-crimson" />
                        <div className="detect-text-box">
                          <span className="detect-title">Detecting your location...</span>
                          <span className="detect-sub">Finding nearest suburban hub</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Crosshair size={16} className="icon-crimson" />
                        <div className="detect-text-box">
                          <span className="detect-title">🎯 Detect My Location</span>
                          <span className="detect-sub">GPS Auto-detect (Chennai &amp; Suburbs)</span>
                        </div>
                      </>
                    )}
                  </button>

                  {gpsNotice && (
                    <div className="gps-notice-pill animate-fade">
                      {gpsNotice}
                    </div>
                  )}

                  <div className="city-search-box">
                    <Search size={14} />
                    <input 
                      type="text" 
                      placeholder="Search city or locality..." 
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="city-list">
                    {filteredCities.map((city) => (
                      <div 
                        key={city.id} 
                        className={`city-item ${selectedCity.id === city.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCity(city);
                          setIsCityDropdownOpen(false);
                          setCitySearch('');
                        }}
                      >
                        <MapPin size={15} />
                        <div>
                          <div className="city-name">{city.name}</div>
                          <div className="city-sub">{city.locality}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {onOpenAddressBook && (
                    <div className="city-dropdown-footer">
                      <button 
                        type="button" 
                        className="btn-open-addr-book-header"
                        onClick={() => {
                          setIsCityDropdownOpen(false);
                          onOpenAddressBook();
                        }}
                      >
                        <Home size={14} className="icon-crimson" />
                        <span>Manage Saved Addresses</span>
                        <ChevronDown size={13} style={{ transform: 'rotate(-90deg)' }} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="omnibar-divider"></div>

            {/* Universal Search */}
            <div className="search-input-box">
              <Search size={18} className="search-icon-dim" />
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine, or a dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="header-actions">
            {/* Theme Toggle */}
            <button 
              className="icon-action-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={19} className="icon-sun" /> : <Moon size={19} />}
            </button>

            {/* My Orders Button */}
            <button 
              className="orders-btn-trigger"
              onClick={onOpenMyOrders}
              title="View my orders & live tracking"
            >
              <ReceiptText size={17} />
              <span>Orders</span>
              {activeOrdersCount > 0 && (
                <span className="live-orders-indicator-dot"></span>
              )}
            </button>

            {/* PWA Install App Button */}
            {!isInstalled && (
              <div style={{ position: 'relative' }}>
                <button 
                  type="button" 
                  className="pwa-header-install-btn" 
                  onClick={handleInstallClick}
                  title="Install Unavukadai on your mobile phone"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'linear-gradient(135deg, rgba(226,55,68,0.12) 0%, rgba(249,115,22,0.12) 100%)',
                    border: '1px solid rgba(226,55,68,0.3)',
                    color: '#e23744',
                    borderRadius: '20px',
                    padding: '6px 11px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Download size={13} />
                  <span>Install App</span>
                </button>
                {showIosInstallHelp && (
                  <div className="animate-fade" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', background: '#0f172a', border: '1px solid rgba(226,55,68,0.4)', borderRadius: '10px', padding: '10px 14px', fontSize: '11px', color: '#f8fafc', width: '220px', zIndex: 3100, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                    📱 <strong>Install on iPhone:</strong> Tap the Share button <strong style={{ color: '#38bdf8' }}>⎋</strong> in Safari &amp; choose <strong style={{ color: '#f59e0b' }}>&quot;Add to Home Screen&quot; ➕</strong>
                  </div>
                )}
              </div>
            )}

            {/* Unified Partner Menu (Restaurant & Rider Registration) */}
            <div className="partner-menu-wrapper" ref={partnerMenuRef}>
              <button 
                type="button"
                className={`partner-btn-trigger ${isPartnerMenuOpen ? 'active' : ''}`}
                onClick={() => setIsPartnerMenuOpen(!isPartnerMenuOpen)}
                title="Partner with Unavukadai - Restaurant & Rider Registration"
                aria-expanded={isPartnerMenuOpen}
              >
                <Handshake size={15} />
                <span>Partner</span>
                <ChevronDown size={13} className={`chevron-partner ${isPartnerMenuOpen ? 'rotated' : ''}`} />
              </button>

              {isPartnerMenuOpen && (
                <div className="partner-dropdown-menu animate-scale">
                  <div className="partner-dropdown-header">
                    <div className="partner-tag-pill">GROW WITH UNAVUKADAI</div>
                    <h4>Partner &amp; Earn With Us</h4>
                    <p>Join South Chennai's fastest growing hyperlocal network</p>
                  </div>

                  <div className="partner-dropdown-cards">
                    {/* 1. Register Restaurant */}
                    <div 
                      className="partner-card-item hotel-partner"
                      onClick={() => {
                        setIsPartnerMenuOpen(false);
                        onOpenRegisterRestaurant();
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="partner-card-icon store-theme">
                        <Store size={20} />
                      </div>
                      <div className="partner-card-info">
                        <div className="partner-card-top-row">
                          <span className="partner-card-title">Register Restaurant</span>
                          <span className="partner-role-badge badge-orange">HOTEL</span>
                        </div>
                        <p className="partner-card-desc">
                          Zero listing fee · 12% commission · Daily direct UPI settlement &amp; live kitchen KOT.
                        </p>
                        <div className="partner-card-cta text-orange">
                          <span>Register Outlet</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>

                    {/* 2. Register Rider */}
                    <div 
                      className="partner-card-item rider-partner"
                      onClick={() => {
                        setIsPartnerMenuOpen(false);
                        onOpenRegisterRider();
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="partner-card-icon bike-theme">
                        <Bike size={20} />
                      </div>
                      <div className="partner-card-info">
                        <div className="partner-card-top-row">
                          <span className="partner-card-title">Become Delivery Rider</span>
                          <span className="partner-role-badge badge-purple">RIDER</span>
                        </div>
                        <p className="partner-card-desc">
                          Drive your two-wheeler · Keep 100% delivery fees · Flexible shifts &amp; daily payouts.
                        </p>
                        <div className="partner-card-cta text-purple">
                          <span>Join Delivery Fleet</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Shortcut for active roles */}
                  {(user?.role === 'restaurant' || user?.role === 'rider' || user?.role === 'admin') && (
                    <div className="partner-dropdown-footer">
                      <span className="footer-lead">Already registered?</span>
                      <div className="footer-links">
                        {(user.role === 'restaurant' || user.role === 'admin') && (
                          <button 
                            type="button" 
                            className="footer-portal-link"
                            onClick={() => {
                              setIsPartnerMenuOpen(false);
                              onSwitchPortal('hotel');
                            }}
                          >
                            <Store size={12} />
                            <span>Kitchen Portal</span>
                          </button>
                        )}
                        {(user.role === 'rider' || user.role === 'admin') && (
                          <button 
                            type="button" 
                            className="footer-portal-link purple"
                            onClick={() => {
                              setIsPartnerMenuOpen(false);
                              onSwitchPortal('rider');
                            }}
                          >
                            <Bike size={12} />
                            <span>Rider Portal</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Trigger */}
            <button 
              className={`cart-btn-trigger ${cartCount > 0 ? 'has-items' : ''}`}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={18} />
              <span className="cart-label">Cart</span>
              {cartCount > 0 && (
                <span className="cart-badge-counter">{cartCount}</span>
              )}
              {cartCount > 0 && (
                <span className="cart-price-peek">₹{cartTotal}</span>
              )}
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div className="user-profile-wrapper" ref={userMenuRef}>
                <div 
                  className="user-profile-chip" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="user-avatar">{user.avatar || user.name.charAt(0)}</div>
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={13} className={`chevron-mini ${isUserMenuOpen ? 'rotated' : ''}`} />
                </div>

                {isUserMenuOpen && (
                  <div className="user-profile-dropdown-menu animate-scale">
                    <div className="user-dropdown-header">
                      <div className="dropdown-user-avatar">{user.avatar || '🍲'}</div>
                      <div className="dropdown-user-info">
                        <strong>{user.name}</strong>
                        <span className="dropdown-email">{user.email || user.phone}</span>
                        {user.authProvider === 'google' && (
                          <span className="google-verified-tag">✓ Google Verified</span>
                        )}
                        <span className="dropdown-role-tag">
                          {user.role === 'admin' ? '👑 Master Admin' : user.role === 'restaurant' ? '👨‍🍳 Merchant' : user.role === 'rider' ? '🛵 Rider' : '🍲 Foodie'}
                        </span>
                      </div>
                    </div>

                    <div className="user-dropdown-divider" />

                    <button 
                      type="button" 
                      className="user-dropdown-item"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenAddressBook) onOpenAddressBook();
                      }}
                    >
                      <Home size={15} className="icon-crimson" />
                      <span>Saved Addresses</span>
                    </button>

                    <button 
                      type="button" 
                      className="user-dropdown-item"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('orders');
                        if (onOpenMyOrders) onOpenMyOrders();
                      }}
                    >
                      <ReceiptText size={15} />
                      <span>My Orders</span>
                      {activeOrdersCount > 0 && <span className="active-dot-mini" />}
                    </button>

                    {/* Merchant Kitchen shortcut for restaurant or admin */}
                    {(user?.role === 'restaurant' || user?.role === 'admin') && (
                      <button 
                        type="button" 
                        className={`user-dropdown-item ${currentPortal === 'hotel' ? 'active-portal-item' : ''}`}
                        onClick={() => { setIsUserMenuOpen(false); onSwitchPortal('hotel'); }}
                      >
                        <Store size={15} style={{ color: '#f97316' }} />
                        <span>👨‍🍳 Merchant Kitchen Portal</span>
                        {currentPortal === 'hotel' && <Check size={14} className="text-green" />}
                      </button>
                    )}

                    {/* Register Restaurant link for customers */}
                    {user?.role !== 'restaurant' && (
                      <button 
                        type="button" 
                        className="user-dropdown-item"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRegisterRestaurant();
                        }}
                      >
                        <Store size={15} style={{ color: '#3b82f6' }} />
                        <span>🏪 Register Restaurant</span>
                      </button>
                    )}

                    {/* Rider Delivery Portal shortcut for riders or admin */}
                    {(user?.role === 'rider' || user?.role === 'admin') && (
                      <button 
                        type="button" 
                        className={`user-dropdown-item ${currentPortal === 'rider' ? 'active-portal-item' : ''}`}
                        onClick={() => { setIsUserMenuOpen(false); onSwitchPortal('rider'); }}
                      >
                        <Bike size={15} style={{ color: '#8b5cf6' }} />
                        <span>🛵 Rider Delivery Portal</span>
                        {currentPortal === 'rider' && <Check size={14} className="text-green" />}
                      </button>
                    )}

                    {/* Become Delivery Partner link for non-riders */}
                    {user?.role !== 'rider' && (
                      <button 
                        type="button" 
                        className="user-dropdown-item"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRegisterRider();
                        }}
                      >
                        <Bike size={15} style={{ color: '#8b5cf6' }} />
                        <span>🚴 Become Delivery Partner</span>
                      </button>
                    )}

                    {user?.role === 'admin' && (
                      <>
                        <div className="user-dropdown-divider" />
                        <button 
                          type="button" 
                          className={`user-dropdown-item ${currentPortal === 'admin' ? 'active-portal-item' : ''}`}
                          onClick={() => { setIsUserMenuOpen(false); onSwitchPortal('admin'); }}
                        >
                          <span>🛡️ Super Admin Console</span>
                          {currentPortal === 'admin' && <Check size={14} className="text-green" />}
                        </button>
                      </>
                    )}

                    <div className="user-dropdown-divider" />

                    <button 
                      type="button" 
                      className="user-dropdown-item logout-item"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="auth-btn-pill" 
                  onClick={() => onOpenAuth ? onOpenAuth('login') : (setIsAuthOpen && setIsAuthOpen(true))}
                >
                  <User size={15} />
                  <span>Log in</span>
                </button>
                <button 
                  className="auth-btn-pill auth-btn-signup-pill" 
                  onClick={() => onOpenAuth ? onOpenAuth('signup') : (setIsAuthOpen && setIsAuthOpen(true))}
                >
                  <Sparkles size={14} />
                  <span>Sign up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Primary Tabs (Delivery / Dining Out / Nightlife) */}
        <nav className="service-nav-tabs">
          <button 
            className={`service-tab ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            <div className="tab-icon-frame delivery-icon">
              <Truck size={22} />
            </div>
            <div className="tab-info">
              <span className="tab-title">Delivery</span>
              <span className="tab-subtitle">Food to your doorstep</span>
            </div>
          </button>

          <button 
            className={`service-tab ${activeTab === 'dining' ? 'active' : ''}`}
            onClick={() => setActiveTab('dining')}
          >
            <div className="tab-icon-frame dining-icon">
              <UtensilsCrossed size={22} />
            </div>
            <div className="tab-info">
              <span className="tab-title">Dining Out</span>
              <span className="tab-subtitle">Explore curated restaurants</span>
            </div>
          </button>

          <button 
            className={`service-tab ${activeTab === 'nightlife' ? 'active' : ''}`}
            onClick={() => setActiveTab('nightlife')}
          >
            <div className="tab-icon-frame nightlife-icon">
              <GlassWater size={22} />
            </div>
            <div className="tab-info">
              <span className="tab-title">Nightlife</span>
              <span className="tab-subtitle">Pubs, bars & late night</span>
            </div>
          </button>

          <button 
            className={`service-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="tab-icon-frame orders-icon">
              <ReceiptText size={22} />
            </div>
            <div className="tab-info">
              <span className="tab-title">
                My Orders
                {activeOrdersCount > 0 && <span className="tab-count-badge">{activeOrdersCount}</span>}
              </span>
              <span className="tab-subtitle">Individual Order History</span>
            </div>
          </button>
        </nav>
      </div>
    </header>
  );
}
