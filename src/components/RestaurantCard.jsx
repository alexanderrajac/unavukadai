import React from 'react';
import { Star, Heart, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function RestaurantCard({
  restaurant,
  onOpenModal,
  isFavorite,
  onToggleFavorite
}) {
  const {
    id,
    name,
    cuisines,
    rating,
    ratingCount,
    deliveryTime,
    distance,
    costForTwo,
    offer,
    pureVeg,
    image,
    safetyScore
  } = restaurant;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(id);
  };

  const isClosed = restaurant.isOpen === false || restaurant.isClosed === true;

  return (
    <div 
      className={`restaurant-card ${isClosed ? 'outlet-closed' : ''}`}
      onClick={() => onOpenModal(restaurant)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter') onOpenModal(restaurant); }}
    >
      {/* Thumbnail Area */}
      <div className="card-thumb-container">
        <img 
          src={image} 
          alt={name} 
          className="card-thumb-img" 
          loading="lazy" 
        />
        
        {/* Top Badges */}
        <div className="card-top-badges">
          {isClosed ? (
            <div className="card-closed-badge">
              <span>🔴 CLOSED</span>
            </div>
          ) : offer ? (
            <div className="card-offer-badge">
              <span>{offer}</span>
            </div>
          ) : <div />}

          <button 
            className={`card-bookmark-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Remove from Bookmarks' : 'Bookmark this restaurant'}
            aria-label="Bookmark"
          >
            <Heart size={16} fill={isFavorite ? '#e23744' : 'none'} stroke={isFavorite ? '#e23744' : '#ffffff'} />
          </button>
        </div>

        {/* Closed Overlay Strip */}
        {isClosed && (
          <div className="card-closed-strip">
            <span>Currently Not Accepting Orders</span>
          </div>
        )}

        {/* Bottom Time & Distance overlay */}
        <div className="card-thumb-footer">
          <div className="delivery-time-pill">
            <Clock size={12} />
            <span>{deliveryTime}</span>
          </div>
          <div className="distance-pill">
            <MapPin size={12} />
            <span>{distance}</span>
          </div>
        </div>
      </div>

      {/* Body Info */}
      <div className="card-content">
        <div className="card-title-row">
          <div className="card-name-group">
            <h3 className="restaurant-name">{name}</h3>
            {pureVeg && <span className="veg-badge-mini" title="Pure Vegetarian" />}
            {isClosed && <span className="closed-status-pill">CLOSED</span>}
          </div>
          <div className="rating-badge">
            <span>{rating}</span>
            <Star size={11} fill="currentColor" strokeWidth={0} />
          </div>
        </div>

        <div className="card-details-row">
          <p className="cuisines-text">{cuisines.join(', ')}</p>
          <span className="price-for-two">₹{costForTwo} for two</span>
        </div>

        {/* Popular Dishes Preview */}
        {restaurant.menu && restaurant.menu.length > 0 && (
          <div className="card-dishes-preview">
            <span className="card-dishes-label">Must try:</span>
            <div className="card-dishes-tags">
              {restaurant.menu.slice(0, 2).map(dish => (
                <span key={dish.id} className="card-dish-tag">
                  {dish.isVeg ? '🌱' : '🍗'} {dish.name} (₹{dish.price})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Safety & Ratings Count */}
        <div className="card-subfooter">
          <div className="safety-note">
            <ShieldCheck size={13} className="safety-icon" />
            <span>{safetyScore || 'FSSAI Certified'}</span>
          </div>
          <span className="card-explore-btn">
            View Menu &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
