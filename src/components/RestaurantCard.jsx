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

  return (
    <div 
      className="restaurant-card"
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
          {offer ? (
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

        {/* Safety & Ratings Count */}
        <div className="card-subfooter">
          <div className="safety-note">
            <ShieldCheck size={13} className="safety-icon" />
            <span>{safetyScore || 'FSSAI Certified'}</span>
          </div>
          <span className="rating-count-label">{ratingCount} reviews</span>
        </div>
      </div>
    </div>
  );
}
