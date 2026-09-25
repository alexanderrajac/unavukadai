import React, { useState, useMemo } from 'react';
import { 
  X, 
  Star, 
  Search, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function RestaurantModal({
  restaurant,
  onClose,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onOpenCart
}) {
  const [vegOnly, setVegOnly] = useState(false);
  const [dishSearch, setDishSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Extract unique menu categories
  const categories = useMemo(() => {
    if (!restaurant) return ['All'];
    const set = new Set();
    restaurant.menu.forEach(item => set.add(item.category));
    return ['All', ...Array.from(set)];
  }, [restaurant]);

  // Filter items
  const filteredMenu = useMemo(() => {
    if (!restaurant) return [];
    return restaurant.menu.filter(item => {
      const matchVeg = vegOnly ? item.isVeg : true;
      const matchSearch = dishSearch
        ? item.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
          item.description.toLowerCase().includes(dishSearch.toLowerCase())
        : true;
      const matchCat = activeCategory === 'All' ? true : item.category === activeCategory;
      return matchVeg && matchSearch && matchCat;
    });
  }, [restaurant, vegOnly, dishSearch, activeCategory]);

  if (!restaurant) return null;

  // Check item quantity in cart
  const getItemQty = (itemId) => {
    const found = cartItems.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartAmount = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div 
        className="restaurant-modal-container animate-scale" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Hero Banner */}
        <div className="modal-hero">
          <div className="modal-hero-bg">
            <img src={restaurant.image} alt={restaurant.name} />
            <div className="modal-hero-gradient"></div>
          </div>
          <div className="modal-hero-details">
            <div className="modal-hero-meta">
              <span className="badge-featured">⭐ Top Choice</span>
              {restaurant.offer && <span className="badge-offer-highlight">{restaurant.offer}</span>}
            </div>
            <h1 className="modal-restaurant-title">{restaurant.name}</h1>
            <p className="modal-cuisines">{restaurant.cuisines.join(' • ')}</p>
            <div className="modal-subinfo-row">
              <span className="info-chip">
                <MapPin size={14} />
                {restaurant.address}
              </span>
              <span className="info-chip">
                <Clock size={14} />
                {restaurant.deliveryTime}
              </span>
              <span className="info-chip">
                <ShieldCheck size={14} />
                {restaurant.safetyScore}
              </span>
            </div>

            <div className="modal-rating-score-box">
              <div className="rating-pill-lg">
                <span>{restaurant.rating}</span>
                <Star size={14} fill="currentColor" />
              </div>
              <div className="rating-desc">
                <strong>{restaurant.ratingCount}</strong>
                <span>Delivery Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Search & Filters Bar */}
        <div className="menu-control-bar">
          {/* Veg Only Toggle */}
          <label className={`veg-toggle-switch ${vegOnly ? 'active' : ''}`}>
            <input 
              type="checkbox" 
              checked={vegOnly} 
              onChange={(e) => setVegOnly(e.target.checked)} 
            />
            <span className="veg-badge-mini" />
            <span className="toggle-label">Veg Only</span>
          </label>

          {/* Dish Search */}
          <div className="dish-search-input">
            <Search size={15} />
            <input 
              type="text" 
              placeholder={`Search in ${restaurant.name}...`} 
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
            />
            {dishSearch && (
              <button onClick={() => setDishSearch('')}><X size={14} /></button>
            )}
          </div>
        </div>

        {/* Categories Tab Strip */}
        <div className="menu-categories-strip">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes List */}
        <div className="menu-dishes-body">
          <div className="menu-count-headline">
            <h3>{activeCategory === 'All' ? 'Full Recommended Menu' : activeCategory}</h3>
            <span>{filteredMenu.length} items available</span>
          </div>

          <div className="dishes-grid">
            {filteredMenu.map(dish => {
              const qty = getItemQty(dish.id);
              return (
                <div key={dish.id} className="dish-item-card">
                  <div className="dish-info-column">
                    <div className="dish-header-row">
                      <span className={dish.isVeg ? 'veg-badge' : 'nonveg-badge'} title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'} />
                      {dish.bestSeller && (
                        <span className="bestseller-tag">
                          <Sparkles size={11} /> Bestseller
                        </span>
                      )}
                    </div>
                    <h4 className="dish-name">{dish.name}</h4>
                    <div className="dish-price-rating">
                      <span className="dish-price">₹{dish.price}</span>
                      <div className="dish-rating-chip">
                        <Star size={11} fill="currentColor" strokeWidth={0} />
                        <span>{dish.rating} ({dish.votes})</span>
                      </div>
                    </div>
                    <p className="dish-description">{dish.description}</p>
                  </div>

                  {/* Dish Image & Action Button */}
                  <div className="dish-action-column">
                    <div className="dish-img-box">
                      <img src={dish.image} alt={dish.name} loading="lazy" />
                    </div>

                    <div className="dish-btn-container">
                      {qty === 0 ? (
                        <button 
                          className="add-dish-btn"
                          onClick={() => onAddToCart(dish, restaurant)}
                        >
                          <span>ADD</span>
                          <Plus size={14} />
                        </button>
                      ) : (
                        <div className="qty-control-pill">
                          <button 
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(dish.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="qty-val">{qty}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(dish.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMenu.length === 0 && (
            <div className="empty-dish-state">
              <p>No dishes match your filter criteria.</p>
              <button 
                className="btn-outline" 
                onClick={() => { setVegOnly(false); setDishSearch(''); setActiveCategory('All'); }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Floating Cart Strip (if items present) */}
        {totalCartCount > 0 && (
          <div className="floating-cart-footer animate-fade">
            <div className="cart-footer-left">
              <div className="cart-footer-count">
                <ShoppingBag size={18} />
                <span>{totalCartCount} item{totalCartCount > 1 ? 's' : ''} added</span>
              </div>
              <span className="cart-footer-total">₹{totalCartAmount}</span>
            </div>
            <button className="view-cart-btn-primary" onClick={onOpenCart}>
              <span>View Cart & Checkout</span>
              <span className="arrow-sym">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
