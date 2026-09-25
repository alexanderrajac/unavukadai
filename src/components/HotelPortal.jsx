import React, { useState } from 'react';
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
  MessageCircle
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
  restaurantStock
}) {
  const [selectedHotelId, setSelectedHotelId] = useState('res-perungalathur-1');
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const currentHotel = RESTAURANTS.find(r => r.id === selectedHotelId) || RESTAURANTS[0];

  // Filter orders for this specific hotel
  const hotelOrders = orders.filter(o => o.restaurantId === selectedHotelId);
  const activeKOTs = hotelOrders.filter(o => o.status !== 'DELIVERED');
  const completedOrders = hotelOrders.filter(o => o.status === 'DELIVERED');

  const totalRevenue = hotelOrders.reduce((acc, o) => acc + o.itemTotal, 0);

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
            <label>Switch Hotel Outlet:</label>
            <select 
              value={selectedHotelId} 
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="hotel-dropdown"
            >
              {RESTAURANTS.map(r => (
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
            <Clock size={22} className="text-blue" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Average Prep Time</span>
            <h3 className="kpi-value">14 Mins</h3>
            <span className="kpi-trend">Within 20 min SLA</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-purple-subtle">
            <CheckCircle size={22} className="text-purple" />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Completed Deliveries</span>
            <h3 className="kpi-value">{completedOrders.length}</h3>
            <span className="kpi-trend">{currentHotel.rating} ★ Food Quality</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live KOTs & Menu Stock */}
      <div className="hotel-main-columns">
        {/* Left Column: Live Kitchen Orders (KOT) */}
        <div className="kot-section-column">
          <div className="kot-header-row">
            <div className="kot-title-group">
              <ChefHat size={20} className="icon-crimson" />
              <h2>Live Kitchen Order Tickets (KOT)</h2>
              <span className="kot-live-pulse-badge">LIVE KITCHEN FEED</span>
            </div>
            <button className="kot-sound-toggle" onClick={playKitchenChime} title="Click to test kitchen chime audio">
              <Volume2 size={16} />
              <span>Chime Active (Test)</span>
            </button>
          </div>

          <div className="kot-orders-list">
            {activeKOTs.length === 0 ? (
              <div className="empty-kot-state">
                <ChefHat size={44} className="text-muted" />
                <h3>No active kitchen tickets</h3>
                <p>All orders cooked! Click "Simulate Incoming Order" to test the kitchen workflow.</p>
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

        {/* Right Column: Menu Items Stock Controller */}
        <div className="menu-stock-column">
          <div className="menu-stock-header">
            <div className="menu-stock-title">
              <UtensilsCrossed size={18} className="icon-crimson" />
              <h3>Menu Availability Switcher</h3>
            </div>
            <span className="stock-subtitle">Instant on/off toggle</span>
          </div>

          <div className="menu-items-stock-list">
            {currentHotel.menu.map((item) => {
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
    </div>
  );
}
