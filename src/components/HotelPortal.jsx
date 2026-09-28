import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, 
  ChefHat, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  UtensilsCrossed, 
  Sparkles,
  MapPin,
  Volume2,
  Package,
  MessageCircle,
  Plus,
  Save,
  Check,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  Flame,
  Award,
  AlertCircle
} from 'lucide-react';
import { RESTAURANTS } from '../data/mockData';

function playKitchenChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.2);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.log('Audio chime not supported', e);
  }
}

function getWhatsAppOrderUrl(order) {
  const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join('%0A- ');
  const message = `*🔔 NEW UNAVUKADAI ORDER %23${order.orderId}*%0A` +
    `*Restaurant:* ${order.restaurantName}%0A` +
    `*Customer:* ${order.customerName} (${order.customerPhone})%0A` +
    `*Drop Location:* ${order.customerAddress || order.address} (${order.locality})%0A%0A` +
    `*Dishes to Cook:*%0A- ${itemsText}%0A%0A` +
    `*Total Bill:* ₹${order.grandTotal} (${order.paymentMethod || 'UPI'} - ${order.paymentStatus || 'PAID'})%0A` +
    (order.cookingNote ? `*Instructions:* ${order.cookingNote}%0A` : '');
  return `https://wa.me/?text=${message}`;
}

export default function HotelPortal({
  orders,
  onUpdateOrderStatus,
  onSimulateNewOrder,
  onToggleItemStock,
  restaurantStock = {},
  restaurantsList = RESTAURANTS,
  onAddMenuItem,
  onUpdateMenuItemPrice,
  onUpdateRestaurantDetails
}) {
  const [selectedHotelId, setSelectedHotelId] = useState(restaurantsList[0]?.id || 'res-perungalathur-1');
  const [activeTab, setActiveTab] = useState('kots'); // 'kots' | 'menu' | 'location'
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const currentHotel = restaurantsList.find(r => r.id === selectedHotelId) || restaurantsList[0];

  // Filter orders for this specific hotel
  const hotelOrders = orders.filter(o => o.restaurantId === selectedHotelId);
  const activeKOTs = hotelOrders.filter(o => o.status !== 'DELIVERED');
  const completedOrders = hotelOrders.filter(o => o.status === 'DELIVERED');
  const totalRevenue = hotelOrders.reduce((acc, o) => acc + o.itemTotal, 0);

  // Menu Search & Filter State
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('ALL');

  // Add Item Modal & Form State
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Biryani & Rice');
  const [dishIsVeg, setDishIsVeg] = useState(false);
  const [dishDesc, setDishDesc] = useState('');
  const [dishSuccessMsg, setDishSuccessMsg] = useState('');

  // Editable prices map
  const [priceEdits, setPriceEdits] = useState({});

  // Restaurant Profile & Location State
  const [profileName, setProfileName] = useState(currentHotel.name || '');
  const [profileAddress, setProfileAddress] = useState(currentHotel.address || '');
  const [profileRegion, setProfileRegion] = useState(currentHotel.region || 'Perungalathur');
  const [profileCostForTwo, setProfileCostForTwo] = useState(currentHotel.costForTwo || 400);
  const [profileDeliveryMins, setProfileDeliveryMins] = useState(currentHotel.deliveryTimeMins || 25);
  const [profileLat, setProfileLat] = useState(currentHotel.coords?.[0] || 12.9056);
  const [profileLng, setProfileLng] = useState(currentHotel.coords?.[1] || 80.0832);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // Synchronize profile inputs when outlet changes
  useEffect(() => {
    if (currentHotel) {
      setProfileName(currentHotel.name);
      setProfileAddress(currentHotel.address);
      setProfileRegion(currentHotel.region || 'Perungalathur');
      setProfileCostForTwo(currentHotel.costForTwo || 400);
      setProfileDeliveryMins(currentHotel.deliveryTimeMins || 25);
      if (currentHotel.coords && currentHotel.coords.length === 2) {
        setProfileLat(currentHotel.coords[0]);
        setProfileLng(currentHotel.coords[1]);
      }
    }
  }, [currentHotel]);

  // Categories list for current hotel
  const menuCategories = useMemo(() => {
    const set = new Set();
    currentHotel.menu?.forEach(m => {
      if (m.category) set.add(m.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [currentHotel]);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return (currentHotel.menu || []).filter(item => {
      const matchCat = selectedMenuCategory === 'ALL' || item.category === selectedMenuCategory;
      const matchSearch = !menuSearchQuery.trim() || 
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [currentHotel, selectedMenuCategory, menuSearchQuery]);

  // Handle Add New Food Item
  const handleAddNewDish = (e) => {
    e.preventDefault();
    if (!dishName.trim() || !dishPrice) return;

    if (onAddMenuItem) {
      onAddMenuItem(currentHotel.id, {
        name: dishName.trim(),
        price: Number(dishPrice),
        category: dishCategory,
        isVeg: dishIsVeg,
        description: dishDesc.trim() || `${dishName} freshly cooked with fine ingredients.`
      });
    }

    setDishName('');
    setDishPrice('');
    setDishDesc('');
    setShowAddDishModal(false);
    setDishSuccessMsg(`🎉 Successfully published "${dishName}" to your live menu!`);
    setTimeout(() => setDishSuccessMsg(''), 4500);
  };

  // Quick price nudge (+₹10 or -₹10)
  const handleNudgePrice = (item, delta) => {
    const currentVal = priceEdits[item.id] !== undefined ? Number(priceEdits[item.id]) : item.price;
    const nextVal = Math.max(10, currentVal + delta);
    setPriceEdits({ ...priceEdits, [item.id]: nextVal });
    if (onUpdateMenuItemPrice) {
      onUpdateMenuItemPrice(currentHotel.id, item.id, nextVal);
    }
  };

  // Handle Save Price Edit
  const handleSavePrice = (itemId) => {
    const newPrice = priceEdits[itemId];
    if (!newPrice || isNaN(newPrice)) return;
    if (onUpdateMenuItemPrice) {
      onUpdateMenuItemPrice(currentHotel.id, itemId, Number(newPrice));
    }
    setPriceEdits(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    setDishSuccessMsg(`✅ Price updated to ₹${newPrice}!`);
    setTimeout(() => setDishSuccessMsg(''), 3000);
  };

  // Handle Save Restaurant Profile & Coordinates
  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (onUpdateRestaurantDetails) {
      onUpdateRestaurantDetails(currentHotel.id, {
        name: profileName,
        address: profileAddress,
        region: profileRegion,
        costForTwo: Number(profileCostForTwo),
        deliveryTimeMins: Number(profileDeliveryMins),
        coords: [Number(profileLat), Number(profileLng)]
      });
    }
    setLocationSuccessMsg(`📍 Successfully updated ${profileName}'s address & GPS coordinates!`);
    setTimeout(() => setLocationSuccessMsg(''), 4000);
  };

  return (
    <div className="portal-page-container">
      {/* Merchant Header Hero Card */}
      <div className="portal-header-card merchant-hero-bg">
        <div className="portal-header-left">
          <div className="portal-badge-label merchant-glow-badge">
            <Store size={14} />
            <span>KITCHEN &amp; RESTAURANT MERCHANT SUITE</span>
          </div>
          <div className="merchant-title-row">
            <h1 className="portal-main-heading">{currentHotel.name}</h1>
            <span className="merchant-star-rating">⭐ {currentHotel.rating} (Verified Partner)</span>
          </div>
          <p className="portal-sub-location">
            <MapPin size={14} className="icon-crimson" />
            <span>{currentHotel.address} • <strong>{currentHotel.region}</strong></span>
            {currentHotel.coords && (
              <span className="merchant-coords-chip">
                📍 {currentHotel.coords[0].toFixed(4)}, {currentHotel.coords[1].toFixed(4)}
              </span>
            )}
          </p>
        </div>

        <div className="portal-header-actions">
          {/* Audio Chime Unlock Button */}
          <button 
            type="button" 
            className={`btn-audio-toggle ${isAudioUnlocked ? 'audio-unlocked' : ''}`}
            onClick={() => {
              playKitchenChime();
              setIsAudioUnlocked(true);
            }}
            title={isAudioUnlocked ? "Kitchen chime alerts active" : "Tap once to enable audio chime for new orders"}
          >
            <Volume2 size={16} />
            <span>{isAudioUnlocked ? '🔔 Kitchen Audio: ON' : '🔇 Enable Kitchen Chime'}</span>
          </button>

          {/* Switch Outlet Selector */}
          <div className="hotel-select-box">
            <label>Manage Outlet:</label>
            <select 
              value={selectedHotelId} 
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="hotel-dropdown"
            >
              {restaurantsList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.region})
                </option>
              ))}
            </select>
          </div>

          {/* Test Order Trigger */}
          <button 
            type="button"
            className="btn-simulate-order"
            onClick={() => {
              onSimulateNewOrder(currentHotel);
              playKitchenChime();
            }}
          >
            <Sparkles size={14} />
            <span>Simulate Incoming Order</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="portal-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-green-subtle">
            <TrendingUp size={22} className="text-green" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Today's Kitchen GMV</span>
            <h3 className="kpi-value">₹{totalRevenue}</h3>
            <span className="kpi-trend text-green">Live Today</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-orange-subtle">
            <ChefHat size={22} className="text-orange" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Cooking Tickets</span>
            <h3 className="kpi-value">{activeKOTs.length}</h3>
            <span className="kpi-trend text-orange">{activeKOTs.filter(o => o.status === 'PREPARING').length} In Wok/Oven</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-blue-subtle">
            <UtensilsCrossed size={22} className="text-blue" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Live Menu Catalog</span>
            <h3 className="kpi-value">{currentHotel.menu?.length || 0} Dishes</h3>
            <span className="kpi-trend text-blue">
              {currentHotel.menu?.filter(m => restaurantStock[m.id] !== false).length || 0} Ready to Serve
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-blue-subtle">
            <Clock size={22} className="text-blue" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Kitchen Prep Pace</span>
            <h3 className="kpi-value">{currentHotel.deliveryTimeMins || 20} Mins</h3>
            <span className="kpi-trend text-blue">Optimal Dispatch</span>
          </div>
        </div>
      </div>

      {/* Modern Subnav Tabs */}
      <div className="merchant-subnav-tabs">
        <button 
          type="button"
          className={`merchant-nav-tab ${activeTab === 'kots' ? 'active' : ''}`}
          onClick={() => setActiveTab('kots')}
        >
          <ChefHat size={17} />
          <span>Live Kitchen KOT Queue</span>
          {activeKOTs.length > 0 && (
            <span className="merchant-tab-badge pulse-red">{activeKOTs.length} Orders</span>
          )}
        </button>

        <button 
          type="button"
          className={`merchant-nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <UtensilsCrossed size={17} />
          <span>Menu &amp; Dish Pricing Studio</span>
          <span className="merchant-tab-badge secondary">{currentHotel.menu?.length || 0}</span>
        </button>

        <button 
          type="button"
          className={`merchant-nav-tab ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          <MapPin size={17} />
          <span>Outlet Address &amp; GPS Setup</span>
        </button>
      </div>

      {dishSuccessMsg && (
        <div className="withdraw-success-alert animate-fade mb-3">
          {dishSuccessMsg}
        </div>
      )}

      {locationSuccessMsg && (
        <div className="withdraw-success-alert animate-fade mb-3">
          {locationSuccessMsg}
        </div>
      )}

      {/* TAB 1: LIVE KITCHEN QUEUE */}
      {activeTab === 'kots' && (
        <div className="hotel-portal-layout">
          <div className="kots-column">
            <div className="kots-column-header">
              <div>
                <h2>Live Kitchen Order Tickets (KOT)</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Orders update in real-time. Sound chime alerts your staff on incoming requests.
                </p>
              </div>
              <span className="kot-count-pill">{activeKOTs.length} Active in Kitchen</span>
            </div>

            <div className="kots-list">
              {activeKOTs.length === 0 ? (
                <div className="kot-empty-state">
                  <ChefHat size={54} className="text-muted mb-2" />
                  <h3>No Active Orders Right Now</h3>
                  <p>Incoming orders from hungry customers in Chennai will chime and appear here instantly.</p>
                  <button 
                    type="button"
                    className="btn-primary mt-3"
                    onClick={() => {
                      onSimulateNewOrder(currentHotel);
                      playKitchenChime();
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Simulate Incoming Customer Order</span>
                  </button>
                </div>
              ) : (
                activeKOTs.map((order) => {
                  const isPlaced = order.status === 'PLACED';
                  const isPreparing = order.status === 'PREPARING';
                  const isReady = order.status === 'READY_FOR_PICKUP';
                  const isOut = order.status === 'OUT_FOR_DELIVERY';

                  return (
                    <div key={order.orderId} className={`kot-card ${order.status.toLowerCase()}`}>
                      <div className="kot-card-header">
                        <div>
                          <div className="kot-id-pill">#{order.orderId}</div>
                          <span className="kot-order-time">{order.placedAt}</span>
                        </div>
                        <div className={`kot-status-badge ${order.status.toLowerCase()}`}>
                          {order.status.replace(/_/g, ' ')}
                        </div>
                      </div>

                      <div className="kot-customer-info">
                        <strong>Customer: {order.customerName} ({order.customerPhone})</strong>
                        <span>Drop Destination: {order.customerAddress || order.address} ({order.locality})</span>
                        {order.cookingNote && (
                          <div className="kot-cooking-instruction">
                            ⚠️ Customer Note: {order.cookingNote}
                          </div>
                        )}
                      </div>

                      <div className="kot-dishes-table">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="kot-dish-row">
                            <span className="kot-dish-qty">{item.quantity}x</span>
                            <span className="kot-dish-name">{item.name}</span>
                            <span className="kot-dish-price">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="kot-card-footer">
                        <div className="kot-total-label">
                          <span>Total Items Value:</span>
                          <strong>₹{order.itemTotal}</strong>
                        </div>

                        {/* Action buttons */}
                        <div className="kot-actions-group">
                          {isPlaced && (
                            <button 
                              type="button"
                              className="btn-kot-action start-cooking"
                              onClick={() => onUpdateOrderStatus(order.orderId, 'PREPARING')}
                            >
                              <ChefHat size={16} />
                              <span>Accept &amp; Start Cooking</span>
                            </button>
                          )}

                          {isPreparing && (
                            <button 
                              type="button"
                              className="btn-kot-action mark-ready"
                              onClick={() => onUpdateOrderStatus(order.orderId, 'READY_FOR_PICKUP')}
                            >
                              <CheckCircle size={16} />
                              <span>Food Ready → Alert Rider</span>
                            </button>
                          )}

                          {isReady && (
                            <div className="kot-waiting-rider-badge">
                              <Clock size={14} />
                              <span>Awaiting Delivery Partner Pickup</span>
                            </div>
                          )}

                          {isOut && (
                            <div className="kot-rider-assigned-badge">
                              <span>🛵 Picked up by {order.riderName || 'Rider'}</span>
                            </div>
                          )}

                          <a 
                            href={getWhatsAppOrderUrl(order)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-whatsapp-order"
                            title="Share KOT slip directly with kitchen cooks or rider on WhatsApp"
                          >
                            <MessageCircle size={15} />
                            <span>WhatsApp Slip</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Menu Stock Sidebar */}
          <div className="menu-stock-column">
            <div className="menu-stock-header">
              <div className="menu-stock-title">
                <UtensilsCrossed size={18} className="icon-crimson" />
                <h3>Quick Stock Switcher</h3>
              </div>
              <span className="stock-subtitle">Live customer toggle</span>
            </div>

            <div className="menu-items-stock-list">
              {currentHotel.menu?.map((item) => {
                const isItemInStock = restaurantStock[item.id] !== false;
                return (
                  <div key={item.id} className="stock-item-row">
                    <div className="stock-item-info">
                      <span className={item.isVeg ? 'veg-badge-mini' : 'nonveg-badge-mini'} />
                      <div>
                        <div className="stock-item-name">{item.name}</div>
                        <div className="stock-item-price">₹{item.price} • {item.category}</div>
                      </div>
                    </div>

                    <button 
                      type="button"
                      className={`stock-toggle-btn ${isItemInStock ? 'in-stock' : 'out-of-stock'}`}
                      onClick={() => onToggleItemStock(item.id)}
                    >
                      {isItemInStock ? (
                        <>
                          <CheckCircle size={14} />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <Package size={14} />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU & DISH PRICING STUDIO */}
      {activeTab === 'menu' && (
        <div className="hotel-menu-management-card">
          <div className="menu-mgmt-top-bar">
            <div>
              <h2>{currentHotel.name} — Menu Studio</h2>
              <p>Add new dishes, modify prices on the fly, and toggle live availability for customers.</p>
            </div>
            <button 
              type="button" 
              className="btn-primary btn-add-dish-top"
              onClick={() => setShowAddDishModal(true)}
            >
              <Plus size={18} />
              <span>+ Add New Food Item</span>
            </button>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="menu-studio-toolbar">
            <div className="menu-search-input-wrap">
              <Search size={16} className="search-icon-muted" />
              <input 
                type="text" 
                placeholder="Search dishes by name or ingredients..." 
                value={menuSearchQuery}
                onChange={e => setMenuSearchQuery(e.target.value)}
                className="menu-search-field"
              />
            </div>

            <div className="menu-category-pills">
              {menuCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`menu-cat-pill ${selectedMenuCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedMenuCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Add Dish Modal */}
          {showAddDishModal && (
            <div className="modal-backdrop animate-fade" onClick={() => setShowAddDishModal(false)}>
              <div className="collect-otp-modal animate-scale" onClick={e => e.stopPropagation()}>
                <div className="collect-otp-header">
                  <div className="collect-otp-icon-wrap" style={{ background: 'rgba(226, 55, 68, 0.1)' }}>
                    <UtensilsCrossed size={28} className="icon-crimson" />
                  </div>
                  <h3>Add New Dish to Menu</h3>
                  <p className="collect-otp-subtitle">
                    Publish a delicious new recipe with price and category to {currentHotel.name}.
                  </p>
                </div>

                <form onSubmit={handleAddNewDish} className="collect-otp-form">
                  <div className="form-group mb-2">
                    <label className="field-label-bold">Dish Name</label>
                    <input 
                      type="text" 
                      className="styled-input" 
                      placeholder="e.g. Kongu Mutton Sukka or Ghee Roast Dosa" 
                      value={dishName}
                      onChange={e => setDishName(e.target.value)}
                      required 
                      autoFocus
                    />
                  </div>

                  <div className="form-grid-2col mb-2">
                    <div>
                      <label className="field-label-bold">Selling Price (₹)</label>
                      <input 
                        type="number" 
                        className="styled-input" 
                        placeholder="e.g. 260" 
                        value={dishPrice}
                        onChange={e => setDishPrice(e.target.value)}
                        required 
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="field-label-bold">Category</label>
                      <select 
                        className="styled-input"
                        value={dishCategory}
                        onChange={e => setDishCategory(e.target.value)}
                      >
                        <option value="Biryani & Rice">Biryani &amp; Rice</option>
                        <option value="Starters & Appetizers">Starters &amp; Appetizers</option>
                        <option value="South Indian Meals">South Indian Meals</option>
                        <option value="Tiffin & Dosa">Tiffin &amp; Dosa</option>
                        <option value="Chinese & Rolls">Chinese &amp; Rolls</option>
                        <option value="Beverages & Desserts">Beverages &amp; Desserts</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-2">
                    <label className="field-label-bold">Dietary Classification</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input 
                          type="radio" 
                          name="vegDiet" 
                          checked={dishIsVeg === false} 
                          onChange={() => setDishIsVeg(false)} 
                        />
                        <span>🍗 Non-Vegetarian</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input 
                          type="radio" 
                          name="vegDiet" 
                          checked={dishIsVeg === true} 
                          onChange={() => setDishIsVeg(true)} 
                        />
                        <span>🥬 Pure Vegetarian</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="field-label-bold">Description / Taste Notes</label>
                    <textarea 
                      className="styled-input" 
                      rows={2}
                      placeholder="e.g. Cooked slowly with shallots, crushed pepper, and rich spices."
                      value={dishDesc}
                      onChange={e => setDishDesc(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn-secondary flex-1"
                      onClick={() => setShowAddDishModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary flex-1"
                      disabled={!dishName.trim() || !dishPrice}
                    >
                      <Plus size={16} />
                      <span>Publish to Menu</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dishes Table */}
          <div className="menu-dishes-table-wrap">
            <table className="admin-table menu-studio-table">
              <thead>
                <tr>
                  <th>Dish &amp; Description</th>
                  <th>Category</th>
                  <th>Diet</th>
                  <th>Price Modifier (₹)</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map((item) => {
                  const isItemInStock = restaurantStock[item.id] !== false;
                  const currentPrice = priceEdits[item.id] !== undefined ? priceEdits[item.id] : item.price;
                  const isChanged = priceEdits[item.id] !== undefined && Number(priceEdits[item.id]) !== item.price;

                  return (
                    <tr key={item.id} className={!isItemInStock ? 'row-sold-out' : ''}>
                      <td>
                        <div className="menu-dish-item-cell">
                          <span className={item.isVeg ? 'veg-badge-mini' : 'nonveg-badge-mini'} />
                          <div>
                            <strong className="dish-name-label">{item.name}</strong>
                            <p className="dish-desc-sub">{item.description || 'Prepared fresh on order'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill-mini">{item.category}</span>
                      </td>
                      <td>
                        {item.isVeg ? (
                          <span className="diet-tag veg">🥬 Veg</span>
                        ) : (
                          <span className="diet-tag nonveg">🍗 Non-Veg</span>
                        )}
                      </td>
                      <td>
                        <div className="price-stepper-box">
                          <button 
                            type="button" 
                            className="btn-stepper minus"
                            onClick={() => handleNudgePrice(item, -10)}
                            title="Decrease price by ₹10"
                          >
                            −
                          </button>
                          <div className="price-input-adornment">
                            <span>₹</span>
                            <input 
                              type="number" 
                              className="inline-price-input"
                              value={currentPrice}
                              onChange={(e) => setPriceEdits({ ...priceEdits, [item.id]: e.target.value })}
                            />
                          </div>
                          <button 
                            type="button" 
                            className="btn-stepper plus"
                            onClick={() => handleNudgePrice(item, 10)}
                            title="Increase price by ₹10"
                          >
                            +
                          </button>
                          {isChanged && (
                            <button 
                              type="button" 
                              className="btn-save-price-mini"
                              onClick={() => handleSavePrice(item.id)}
                              title="Save Price"
                            >
                              <Save size={13} />
                              <span>Save</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <button 
                          type="button"
                          className={`stock-toggle-switch ${isItemInStock ? 'in-stock' : 'out-of-stock'}`}
                          onClick={() => onToggleItemStock(item.id)}
                        >
                          <span className="toggle-switch-thumb" />
                          <span className="toggle-switch-label">
                            {isItemInStock ? 'In Stock' : 'Sold Out'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESTAURANT PROFILE & EXACT GPS LOCATION */}
      {activeTab === 'location' && (
        <div className="hotel-location-profile-card">
          <div className="section-title-group mb-3">
            <h2>Restaurant Profile &amp; Exact GPS Coordinates</h2>
            <p>Accurate coordinates ensure correct customer delivery radius calculation and interactive map navigation.</p>
          </div>

          <form onSubmit={handleSaveLocation} className="hotel-profile-form">
            <div className="form-grid-2col mb-3">
              <div className="form-group">
                <label className="field-label-bold">Restaurant Outlet Name</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  value={profileName} 
                  onChange={e => setProfileName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="field-label-bold">Chennai Delivery Hub / Area</label>
                <select 
                  className="styled-input" 
                  value={profileRegion} 
                  onChange={e => setProfileRegion(e.target.value)}
                >
                  <option value="Perungalathur">Perungalathur Hub</option>
                  <option value="Vandalur">Vandalur City</option>
                  <option value="Mannivakkam">Mannivakkam</option>
                  <option value="T. Nagar">T. Nagar, Central Chennai</option>
                  <option value="Anna Nagar">Anna Nagar</option>
                  <option value="Velachery">Velachery Hub</option>
                  <option value="Adyar">Adyar</option>
                  <option value="OMR">OMR IT Corridor</option>
                  <option value="Tambaram">Tambaram Hub</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="field-label-bold">Full Door &amp; Street Address</label>
              <input 
                type="text" 
                className="styled-input" 
                value={profileAddress} 
                onChange={e => setProfileAddress(e.target.value)} 
                required 
              />
            </div>

            <div className="coordinates-preview-box mb-3">
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="field-label-bold">📍 Latitude Coordinate</label>
                  <input 
                    type="number" 
                    step="0.000001" 
                    className="styled-input" 
                    value={profileLat} 
                    onChange={e => setProfileLat(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="field-label-bold">📍 Longitude Coordinate</label>
                  <input 
                    type="number" 
                    step="0.000001" 
                    className="styled-input" 
                    value={profileLng} 
                    onChange={e => setProfileLng(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="coords-live-preview-pill">
                <span>📍 Live Coordinates: <strong>{Number(profileLat).toFixed(4)}, {Number(profileLng).toFixed(4)}</strong></span>
                <span className="text-green">✓ Customer Pin Validated</span>
              </div>
            </div>

            <div className="form-grid-2col mb-4">
              <div className="form-group">
                <label className="field-label-bold">Average Cost for Two (₹)</label>
                <input 
                  type="number" 
                  className="styled-input" 
                  value={profileCostForTwo} 
                  onChange={e => setProfileCostForTwo(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="field-label-bold">Kitchen Prep Time (Minutes)</label>
                <input 
                  type="number" 
                  className="styled-input" 
                  value={profileDeliveryMins} 
                  onChange={e => setProfileDeliveryMins(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary btn-save-profile-large">
              <Save size={18} />
              <span>Save Restaurant Profile &amp; Coordinates</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
