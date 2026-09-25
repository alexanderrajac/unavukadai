import React, { useState, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  Tag, 
  Check, 
  ArrowRight, 
  ShoppingBag,
  Clock,
  Sparkles,
  Crosshair,
  Loader2,
  Phone,
  Navigation
} from 'lucide-react';
import { COUPONS } from '../data/mockData';
import { 
  detectUserLocation, 
  calculateDistanceKm, 
  calculateDeliveryFee, 
  getDeliveryFeeBreakdown, 
  getRestaurantCoordinates,
  SUBURB_CENTERS 
} from '../utils/geolocation';
import UpiPaymentModal from './UpiPaymentModal';
import InteractiveAddressPinMap from './InteractiveAddressPinMap';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  selectedCity,
  onSelectCity,
  user,
  merchantUpi = '8248651695-3@ybl',
  onPlaceOrder,
  couponsList = COUPONS,
  prefilledCoupon = ''
}) {
  const [customCoupon, setCustomCoupon] = useState(null);
  const couponCode = customCoupon !== null ? customCoupon : (prefilledCoupon || '');
  const setCouponCode = (val) => setCustomCoupon(val);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [cookingNote, setCookingNote] = useState('');
  const [isProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Address & GPS state
  const [doorNo, setDoorNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isPinMapOpen, setIsPinMapOpen] = useState(false);
  const [locationDetectedNotice, setLocationDetectedNotice] = useState('');

  const handleConfirmPinLocation = ({ coords, street, locality, displayName, suburb, distanceKm, deliveryFee }) => {
    setDeliveryCoords(coords);
    if (street) setStreetAddress(street);
    if (suburb && onSelectCity) {
      onSelectCity(suburb);
    }
    if (!landmark && suburb?.area) {
      setLandmark(`Near ${suburb.area}`);
    }
    setLocationDetectedNotice(`📍 Pin confirmed: ${street || suburb?.name} (${distanceKm} km from restaurant)`);
    setTimeout(() => setLocationDetectedNotice(''), 5000);
  };

  const handleAutoDetectLocation = async () => {
    setIsDetectingGps(true);
    setLocationDetectedNotice('');
    try {
      const res = await detectUserLocation();
      if (onSelectCity && res.suburb) {
        onSelectCity(res.suburb);
      }
      setDeliveryCoords([res.lat, res.lng]);
      setStreetAddress(res.street || `${res.suburb.name} Hub`);
      if (!landmark && res.suburb.area) {
        setLandmark(`Near ${res.suburb.area}`);
      }
      setLocationDetectedNotice(`📍 GPS detected: ${res.suburb.name} (±${res.accuracy}m)`);
      setTimeout(() => setLocationDetectedNotice(''), 4000);
    } catch (err) {
      setLocationDetectedNotice(err.message || 'Could not detect location. Please type your street/door.');
      setTimeout(() => setLocationDetectedNotice(''), 4500);
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Primary restaurant & location coordinates
  const primaryRestaurantId = cartItems[0]?.restaurantId;
  const primaryRestaurantName = cartItems[0]?.restaurantName;
  const restaurantCoords = useMemo(() => {
    return getRestaurantCoordinates(primaryRestaurantId, selectedCity?.id || selectedCity?.name);
  }, [primaryRestaurantId, selectedCity]);

  // Customer coordinates (GPS or Suburb center)
  const customerCoords = useMemo(() => {
    if (deliveryCoords && Array.isArray(deliveryCoords) && deliveryCoords.length === 2) {
      return deliveryCoords;
    }
    const match = SUBURB_CENTERS.find(s => 
      s.id === selectedCity?.id || 
      (s.name && selectedCity?.name && s.name.toLowerCase() === selectedCity.name.toLowerCase())
    );
    if (match) return [match.lat, match.lng];
    return [12.9056, 80.0832]; // Default Perungalathur
  }, [deliveryCoords, selectedCity]);

  // Real-time distance calculation between restaurant and user location
  const deliveryDistanceKm = useMemo(() => {
    if (!customerCoords || !restaurantCoords) return 1.5;
    const dist = calculateDistanceKm(restaurantCoords[0], restaurantCoords[1], customerCoords[0], customerCoords[1]);
    return dist > 0 ? dist : 1.2;
  }, [customerCoords, restaurantCoords]);

  if (!isOpen) return null;

  // Financial calculations
  const itemTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Dynamic location-based Delivery Fee calculation
  const feeBreakdown = getDeliveryFeeBreakdown(deliveryDistanceKm, itemTotal);
  let baseDeliveryFee = feeBreakdown.fee;
  let deliveryFee = baseDeliveryFee;
  let couponDiscount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      const calculated = Math.round((itemTotal * appliedCoupon.discountPercent) / 100);
      couponDiscount = Math.min(calculated, appliedCoupon.maxDiscount);
    } else if (appliedCoupon.discountAmount) {
      deliveryFee = 0;
      couponDiscount = appliedCoupon.discountAmount;
    }
  }

  const platformFee = itemTotal > 0 ? 5 : 0;
  const taxes = itemTotal > 0 ? Math.round(itemTotal * 0.05) : 0; // 5% GST
  const grandTotal = Math.max(0, itemTotal + deliveryFee + platformFee + taxes - (appliedCoupon?.discountPercent ? couponDiscount : 0));

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    const found = couponsList.find(c => c.code === code);
    if (!found) {
      setCouponError('Invalid coupon code');
      return;
    }
    if (itemTotal < found.minOrder) {
      setCouponError(`Min order value of ₹${found.minOrder} required for ${code}`);
      return;
    }
    setAppliedCoupon(found);
    setCouponError('');
    setCouponCode(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirmed = (paymentData) => {
    setIsPaymentModalOpen(false);
    const fullAddress = [
      doorNo ? `Door ${doorNo}` : '',
      streetAddress || selectedCity?.locality || `${selectedCity?.name || 'Perungalathur'} Hub`,
      landmark ? `Near ${landmark}` : '',
      selectedCity?.name || 'Chennai'
    ].filter(Boolean).join(', ');

    onPlaceOrder({
      items: [...cartItems],
      deliveryFee,
      deliveryDistanceKm,
      grandTotal,
      discount: couponDiscount,
      address: fullAddress,
      customerAddress: fullAddress,
      doorNo,
      streetAddress,
      landmark,
      customerPhone: customerPhone || user?.phone || '+91 98401 23456',
      deliveryCoords: deliveryCoords || customerCoords || null,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
      cookingNote,
      paymentMethod: paymentData.paymentMethod,
      paymentStatus: paymentData.paymentStatus,
      orderId: paymentData.orderId
    });
  };

  return (
    <div className="cart-backdrop animate-fade" onClick={onClose}>
      <div 
        className="cart-drawer-panel animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} className="icon-crimson" />
            <h2>Your Order</h2>
            {cartItems.length > 0 && (
              <span className="cart-count-pill">{cartItems.length} items</span>
            )}
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-view">
            <div className="empty-cart-art">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Good food is always just a few clicks away! Explore delicious dishes and add them to your cart.</p>
            <button className="btn-primary" onClick={onClose}>
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="cart-drawer-scrollable">
            {/* Delivery address info & Auto-Location */}
            <div className="delivery-destination-card enhanced-card">
              <div className="delivery-header-flex">
                <div className="delivery-icon-box">
                  <MapPin size={18} className="icon-crimson" />
                </div>
                <div className="delivery-info">
                  <div className="delivering-header-row">
                    <span className="delivering-to-label">Delivering to</span>
                    <span className="hub-badge-small">{selectedCity?.name || 'Perungalathur'} Hub</span>
                  </div>
                  <strong>Doorstep Delivery</strong>
                  <p className="delivery-locality">{selectedCity?.locality}</p>
                </div>
              </div>

              {/* Location Action Buttons: Auto-Detect GPS & Interactive Map Pin Drop */}
              <div className="cart-location-actions-grid">
                <button 
                  type="button"
                  className="btn-autodetect-gps-cart"
                  onClick={handleAutoDetectLocation}
                  disabled={isDetectingGps}
                >
                  {isDetectingGps ? (
                    <>
                      <Loader2 size={15} className="spin-icon text-crimson" />
                      <span>Pinpointing GPS...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair size={15} className="icon-crimson pulse-slow" />
                      <span>🎯 Detect GPS</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-open-pin-map-cart"
                  onClick={() => setIsPinMapOpen(true)}
                >
                  <MapPin size={15} className="icon-crimson" />
                  <span>🗺️ Set Pin on Map</span>
                </button>
              </div>

              {/* Pin status badge if user has pinned coordinates */}
              {deliveryCoords && (
                <div className="pinned-coords-badge" onClick={() => setIsPinMapOpen(true)}>
                  <div className="pinned-badge-left">
                    <span className="live-dot-pulse mini"></span>
                    <span>📍 Pin Locked ({deliveryDistanceKm} km from {primaryRestaurantName?.split(' ')[0] || 'kitchen'})</span>
                  </div>
                  <span className="pinned-badge-edit">Adjust Pin →</span>
                </div>
              )}

              {locationDetectedNotice && (
                <div className="gps-cart-notice animate-fade">
                  {locationDetectedNotice}
                </div>
              )}

              {/* Precise Address Fields */}
              <div className="cart-address-grid">
                <div className="cart-input-group">
                  <label className="cart-input-label">Flat / Door / House No.</label>
                  <input 
                    type="text" 
                    className="cart-field-input"
                    placeholder="e.g. Door #4B, Sai Flats" 
                    value={doorNo}
                    onChange={(e) => setDoorNo(e.target.value)}
                  />
                </div>

                <div className="cart-input-group">
                  <label className="cart-input-label">Street / Area (Auto-filled by GPS)</label>
                  <input 
                    type="text" 
                    className="cart-field-input"
                    placeholder="e.g. GST Road / Mudichur Rd" 
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>

                <div className="cart-input-group">
                  <label className="cart-input-label">Landmark for Delivery Partner</label>
                  <input 
                    type="text" 
                    className="cart-field-input"
                    placeholder="e.g. Opp. Bus Stand / Near Temple" 
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>

                <div className="cart-input-group">
                  <label className="cart-input-label">Recipient Phone Number (for Rider calls) *</label>
                  <div className="cart-phone-wrapper">
                    <Phone size={14} className="phone-adornment" />
                    <input 
                      type="tel" 
                      className="cart-field-input with-phone-icon"
                      placeholder="e.g. 98401 23456" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="delivery-eta-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={13} className="text-crimson" />
                  <span>
                    <strong>{deliveryDistanceKm} km</strong> from {primaryRestaurantName || 'Restaurant'}
                  </span>
                </div>
                <span className="dist-charge-badge" style={{ 
                  background: deliveryFee === 0 ? '#dcfce7' : '#fee2e2', 
                  color: deliveryFee === 0 ? '#15803d' : '#b91c1c',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.72rem'
                }}>
                  {deliveryFee === 0 ? 'FREE Delivery' : `₹${deliveryFee} Delivery`}
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="cart-items-section">
              <div className="section-label-row">
                <span>Items Ordered</span>
                <button className="clear-cart-link" onClick={onClearCart}>
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-start">
                      <span className={item.isVeg ? 'veg-badge-mini' : 'nonveg-badge-mini'} />
                      <div className="cart-item-meta">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-unit-price">₹{item.price}</span>
                      </div>
                    </div>

                    <div className="cart-item-controls">
                      <div className="qty-control-pill mini">
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label="Decrease"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label="Increase"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="cart-item-subtotal">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking instructions note */}
            <div className="cooking-note-box">
              <input 
                type="text" 
                placeholder="Write cooking instructions (e.g. less spicy, extra chutney)..." 
                value={cookingNote}
                onChange={(e) => setCookingNote(e.target.value)}
              />
            </div>

            {/* Coupons & Promo Codes */}
            <div className="coupon-container">
              <div className="coupon-header">
                <Tag size={16} className="icon-crimson" />
                <span>Offers & Coupons</span>
              </div>

              {appliedCoupon ? (
                <div className="applied-coupon-pill">
                  <div className="coupon-applied-text">
                    <Check size={16} className="icon-success" />
                    <div>
                      <strong>'{appliedCoupon.code}' Applied</strong>
                      <span className="discount-applied-amount">
                        {appliedCoupon.discountPercent 
                          ? `Saved ₹${couponDiscount} (${appliedCoupon.label})` 
                          : 'Free Delivery Applied'}
                      </span>
                    </div>
                  </div>
                  <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="coupon-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter promo coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button 
                    className="apply-btn"
                    onClick={() => handleApplyCoupon()}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponError && <p className="coupon-error-msg">{couponError}</p>}

              {/* Quick coupons pills */}
              {!appliedCoupon && (
                <div className="quick-coupons-chips">
                  {couponsList.map(c => (
                    <button 
                      key={c.code} 
                      className="quick-coupon-chip"
                      onClick={() => handleApplyCoupon(c.code)}
                    >
                      <Sparkles size={11} />
                      <span>{c.code}</span>
                      <span className="coupon-small-hint">({c.label})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div className="bill-summary-card">
              <h4 className="bill-title">Bill Summary</h4>
              <div className="bill-line">
                <span>Item Total</span>
                <span>₹{itemTotal}</span>
              </div>
              <div className="bill-line">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Delivery Partner Fee</span>
                  <span style={{ fontSize: '0.73rem', color: '#6b7280', marginTop: '1px' }}>
                    📍 {deliveryDistanceKm} km ({feeBreakdown.text})
                  </span>
                </div>
                {deliveryFee === 0 ? (
                  <span className="text-free font-bold">FREE</span>
                ) : (
                  <span>₹{deliveryFee}</span>
                )}
              </div>
              <div className="bill-line">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="bill-line">
                <span>GST & Restaurant Charges</span>
                <span>₹{taxes}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="bill-line discount-highlight">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="bill-divider"></div>

              <div className="bill-grand-total">
                <span className="total-label">To Pay</span>
                <span className="total-amount">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="footer-amount-summary">
              <span className="pay-label">Total to pay</span>
              <span className="pay-amount">₹{grandTotal}</span>
            </div>
            <button 
              className="checkout-btn" 
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="spinner-loader"></div>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
        {/* Dynamic UPI & COD Payment Modal */}
        <UpiPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          grandTotal={grandTotal}
          orderItems={cartItems}
          deliveryAddress={selectedCity?.name || 'Perungalathur'}
          onPaymentConfirmed={handlePaymentConfirmed}
          upiId={merchantUpi}
        />

        {/* Interactive Pin-Drop Leaflet Map Modal */}
        <InteractiveAddressPinMap
          isOpen={isPinMapOpen}
          onClose={() => setIsPinMapOpen(false)}
          initialCoords={deliveryCoords || customerCoords}
          restaurantCoords={restaurantCoords}
          restaurantName={primaryRestaurantName || selectedCity?.name || 'Restaurant Hub'}
          itemTotal={itemTotal}
          onConfirmLocation={handleConfirmPinLocation}
        />
      </div>
    </div>
  );
}
