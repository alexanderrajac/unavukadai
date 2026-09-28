import React, { useState, useEffect } from 'react';
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
  Edit2,
  Navigation,
  DollarSign
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

  // Add Item Form State
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Biryani & Rice');
  const [dishIsVeg, setDishIsVeg] = useState(false);
  const [dishDesc, setDishDesc] = useState('');
  const [dishSuccessMsg, setDishSuccessMsg] = useState('');

  // Editable prices map
  const [priceEdits, setPriceEdits] = useState({});

  // Restaurant Location & Profile Form State
  const [profileName, setProfileName] = useState(currentHotel.name || '');
  const [profileAddress, setProfileAddress] = useState(currentHotel.address || '');
  const [profileRegion, setProfileRegion] = useState(currentHotel.region || 'Perungalathur');
  const [profileCostForTwo, setProfileCostForTwo] = useState(currentHotel.costForTwo || 400);
  const [profileDeliveryMins, setProfileDeliveryMins] = useState(currentHotel.deliveryTimeMins || 25);
  const [profileLat, setProfileLat] = useState(currentHotel.coords?.[0] || 12.9056);
  const [profileLng, setProfileLng] = useState(currentHotel.coords?.[1] || 80.0832);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // Sync profile form when currentHotel changes
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
        description: dishDesc.trim() || `${dishName} made fresh with authentic ingredients.`
      });
    }

    setDishName('');
    setDishPrice('');
    setDishDesc('');
    setShowAddDishModal(false);
    setDishSuccessMsg(`🎉 Successfully added "${dishName}" to ${currentHotel.name}'s live menu!`);
    setTimeout(() => setDishSuccessMsg(''), 4500);
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
    setLocationSuccessMsg(`📍 Successfully updated ${profileName}'s exact address & GPS coordinates!`);
    setTimeout(() => setLocationSuccessMsg(''), 4000);
  };

  return (
    <div className="portal-page-container">
      {/* Hotel Portal Header */}
      <div className="portal-header-card">
        <div className="portal-header-left">
          <div className="portal-badge-label">
            <Store size={14} />
            <span>HOTEL & RESTAURANT MERCHANT PORTAL</span>
          </div>
          <h1 className="portal-main-heading">{currentHotel.name}</h1>
          <p className="portal-sub-location">
            <MapPin size={14} className="icon-crimson" />
            <span>{currentHotel.address} • <strong>{currentHotel.region} Hub</strong></span>
            {currentHotel.coords && (
              <span className="gps-tag ml-2">📍 {currentHotel.coords[0].toFixed(4)}, {currentHotel.coords[1].toFixed(4)}</span>
            )}
          </p>
        </div>

        <div className="portal-header-actions">
          {/* Audio Chime Unlock Button for Kitchen Tablet */}
          <button 
            type="button" 
            className={`btn-audio-toggle ${isAudioUnlocked ? 'audio-unlocked' : ''}`}
            onClick={() => {
              playKitchenChime();
              setIsAudioUnlocked(true);
            }}
            title={isAudioUnlocked ? "Kitchen chime alerts active" : "Tap once to unlock browser audio for new orders"}
          >
            <Volume2 size={15} />
            <span>{isAudioUnlocked ? '🔔 Audio Chime ON' : '🔇 Enable Kitchen Audio'}</span>
          </button>

          {/* Switch Hotel Selector */}
          <div className="hotel-select-box">
            <label>Switch Outlet:</label>
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

      {/* Hotel Metrics Row */}
      <div className="portal-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-green-subtle">
            <TrendingUp size={22} className="text-green" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Today's Restaurant Sales</span>
            <h3 className="kpi-value">₹{totalRevenue}</h3>
            <span className="kpi-trend">Live Kitchen GMV</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-orange-subtle">
            <ChefHat size={22} className="text-orange" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Kitchen Tickets</span>
            <h3 className="kpi-value">{activeKOTs.length}</h3>
            <span className="kpi-trend text-orange">{activeKOTs.filter(o => o.status === 'PREPARING').length} Currently Cooking</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-blue-subtle">
            <UtensilsCrossed size={22} className="text-blue" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Menu Dishes Count</span>
            <h3 className="kpi-value">{currentHotel.menu?.length || 0}</h3>
            <span className="kpi-trend">Available for order</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-blue-subtle">
            <Clock size={22} className="text-blue" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Average Prep Time</span>
            <h3 className="kpi-value">{currentHotel.deliveryTimeMins || 20} Mins</h3>
            <span className="kpi-trend text-blue">Pickup Ready</span>
          </div>
        </div>
      </div>

      {/* Restaurant Admin Navigation Tabs */}
      <div className="rider-subnav-tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`subnav-tab ${activeTab === 'kots' ? 'active' : ''}`}
          onClick={() => setActiveTab('kots')}
        >
          <ChefHat size={16} />
          <span>Live Kitchen Orders ({activeKOTs.length})</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <UtensilsCrossed size={16} />
          <span>Menu & Pricing Management ({currentHotel.menu?.length || 0})</span>
        </button>

        <button 
          className={`subnav-tab ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          <MapPin size={16} />
          <span>Restaurant Location & Coordinates</span>
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

      {/* TAB 1: LIVE ORDERS & KITCHEN KOT TICKETS */}
      {activeTab === 'kots' && (
        <div className="hotel-portal-layout">
          <div className="kots-column">
            <div className="kots-column-header">
              <h2>Kitchen Order Tickets (KOT)</h2>
              <span className="kot-count-pill">{activeKOTs.length} Active Orders</span>
            </div>

            <div className="kots-list">
              {activeKOTs.length === 0 ? (
                <div className="kot-empty-state">
                  <ChefHat size={48} className="text-muted" />
                  <h3>No Active Orders Right Now</h3>
                  <p>Incoming customer orders from Chennai &amp; suburbs will sound a chime and appear here.</p>
                  <button 
                    className="btn-primary mt-3"
                    onClick={() => {
                      onSimulateNewOrder(currentHotel);
                      playKitchenChime();
                    }}
                  >
                    Simulate Sample Order
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
                        <strong>Customer: {order.customerName}</strong>
                        <span>Drop Locality: {order.locality}</span>
                        {order.cookingNote && (
                          <div className="kot-cooking-instruction">
                            ⚠️ Note: {order.cookingNote}
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

                        {/* Dynamic Action Buttons */}
                        <div className="kot-actions-group">
                          {isPlaced && (
                            <button 
                              className="btn-kot-action start-cooking"
                              onClick={() => onUpdateOrderStatus(order.orderId, 'PREPARING')}
                            >
                              <ChefHat size={15} />
                              <span>Accept &amp; Start Cooking</span>
                            </button>
                          )}

                          {isPreparing && (
                            <button 
                              className="btn-kot-action mark-ready"
                              onClick={() => onUpdateOrderStatus(order.orderId, 'READY_FOR_PICKUP')}
                            >
                              <CheckCircle size={15} />
                              <span>Mark Food Ready (Alert Rider)</span>
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
                            title="Share order directly with kitchen staff or rider on WhatsApp"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp KOT</span>
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

      {/* TAB 2: MENU & DISH PRICING MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="hotel-menu-management-card">
          <div className="menu-mgmt-top-bar">
            <div>
              <h2>{currentHotel.name} — Full Menu Catalog</h2>
              <p>Add new food items, update dish prices in real-time, and control item availability.</p>
            </div>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => setShowAddDishModal(true)}
            >
              <Plus size={16} />
              <span>+ Add New Food Item / Dish</span>
            </button>
          </div>

          {/* Modal / Form to Add New Food Item */}
          {showAddDishModal && (
            <div className="modal-backdrop animate-fade" onClick={() => setShowAddDishModal(false)}>
              <div className="collect-otp-modal animate-scale" onClick={e => e.stopPropagation()}>
                <div className="collect-otp-header">
                  <div className="collect-otp-icon-wrap" style={{ background: 'rgba(226, 55, 68, 0.1)' }}>
                    <UtensilsCrossed size={28} className="icon-crimson" />
                  </div>
                  <h3>Add New Dish to Menu</h3>
                  <p className="collect-otp-subtitle">
                    New dish will be immediately visible for customer ordering at {currentHotel.name}.
                  </p>
                </div>

                <form onSubmit={handleAddNewDish} className="collect-otp-form">
                  <div className="form-group mb-2">
                    <label className="field-label-bold">Dish / Item Name</label>
                    <input 
                      type="text" 
                      className="styled-input" 
                      placeholder="e.g. Special Chettinad Mutton Sukka" 
                      value={dishName}
                      onChange={e => setDishName(e.target.value)}
                      required 
                      autoFocus
                    />
                  </div>

                  <div className="form-group-row mb-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="field-label-bold">Price (₹)</label>
                      <input 
                        type="number" 
                        className="styled-input" 
                        placeholder="e.g. 280" 
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
                        <option value="Biryani & Rice">Biryani & Rice</option>
                        <option value="Starters & Appetizers">Starters & Appetizers</option>
                        <option value="South Indian Meals">South Indian Meals</option>
                        <option value="Tiffin & Dosa">Tiffin & Dosa</option>
                        <option value="Chinese & Rolls">Chinese & Rolls</option>
                        <option value="Beverages & Desserts">Beverages & Desserts</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-2">
                    <label className="field-label-bold">Food Type</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="vegStatus" 
                          checked={dishIsVeg === false} 
                          onChange={() => setDishIsVeg(false)} 
                        />
                        <span>🍗 Non-Vegetarian</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="vegStatus" 
                          checked={dishIsVeg === true} 
                          onChange={() => setDishIsVeg(true)} 
                        />
                        <span>🥬 Pure Vegetarian</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="field-label-bold">Description / Ingredients</label>
                    <textarea 
                      className="styled-input" 
                      rows={2}
                      placeholder="e.g. Tender lamb pieces roasted with authentic spices, shallots, and fresh curry leaves."
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
                      <span>Publish Dish</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dishes Table */}
          <div className="menu-dishes-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dish Name</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price (₹)</th>
                  <th>Availability</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {currentHotel.menu?.map((item) => {
                  const isItemInStock = restaurantStock[item.id] !== false;
                  const isEditing = priceEdits[item.id] !== undefined;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={item.isVeg ? 'veg-badge-mini' : 'nonveg-badge-mini'} />
                          <div>
                            <strong>{item.name}</strong>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{item.description || 'Specialty item'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill-mini">{item.category}</span>
                      </td>
                      <td>
                        {item.isVeg ? '🥬 Pure Veg' : '🍗 Non-Veg'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>₹</span>
                          <input 
                            type="number" 
                            className="inline-price-input"
                            value={priceEdits[item.id] !== undefined ? priceEdits[item.id] : item.price}
                            onChange={(e) => setPriceEdits({ ...priceEdits, [item.id]: e.target.value })}
                            style={{ width: '80px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                          {isEditing && (
                            <button 
                              type="button" 
                              className="btn-save-price-mini"
                              onClick={() => handleSavePrice(item.id)}
                              title="Save new price"
                            >
                              <Save size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <button 
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
                      </td>
                      <td>
                        <button 
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => onToggleItemStock(item.id)}
                        >
                          Toggle Stock
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
            <h2>Restaurant Outlet & Exact GPS Coordinates</h2>
            <p>Set your exact restaurant location coordinates for the customer map and delivery radius calculation.</p>
          </div>

          <form onSubmit={handleSaveLocation} className="hotel-profile-form">
            <div className="form-grid-2col">
              <div className="form-group">
                <label className="field-label-bold">Restaurant Name</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  value={profileName} 
                  onChange={e => setProfileName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="field-label-bold">Target Hub / Region</label>
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
              <label className="field-label-bold">Full Street Address</label>
              <input 
                type="text" 
                className="styled-input" 
                value={profileAddress} 
                onChange={e => setProfileAddress(e.target.value)} 
                required 
              />
            </div>

            <div className="form-grid-2col mb-3">
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
                <label className="field-label-bold">Average Kitchen Prep Time (Mins)</label>
                <input 
                  type="number" 
                  className="styled-input" 
                  value={profileDeliveryMins} 
                  onChange={e => setProfileDeliveryMins(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ minWidth: '220px' }}>
              <Save size={16} />
              <span>Save Restaurant Profile & Coordinates</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
