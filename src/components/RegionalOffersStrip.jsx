import React from 'react';
import { Tag, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { REGIONAL_OFFER_BANNERS } from '../data/mockData';

export default function RegionalOffersStrip({
  selectedCity,
  onSelectRegion,
  onApplyPromoCode
}) {
  return (
    <section className="regional-offers-section">
      <div className="regional-offers-header">
        <div className="section-title-group">
          <div className="badge-local-hub">
            <Sparkles size={13} />
            <span>Featured Neighborhood Deals</span>
          </div>
          <h2 className="section-title">Top Regional Offers &amp; Promo Codes</h2>
          <p className="section-subtitle">
            Instant savings &amp; discounts across <strong>Perungalathur</strong>, <strong>Vandalur</strong>, <strong>Mannivakkam</strong> &amp; Greater Chennai
          </p>
        </div>
      </div>

      <div className="regional-cards-grid">
        {REGIONAL_OFFER_BANNERS.map((banner) => {
          const isSelected = selectedCity.name.toLowerCase().includes(banner.region.toLowerCase());
          return (
            <div 
              key={banner.id} 
              className={`regional-banner-card ${isSelected ? 'active-region-card' : ''}`}
              style={{ background: banner.color }}
              onClick={() => onSelectRegion(banner.region)}
            >
              <div className="banner-top-badge">
                <Sparkles size={12} />
                <span>{banner.badge}</span>
              </div>
              <div className="banner-body">
                <span className="banner-region-tag">📍 {banner.region} Hub</span>
                <h3 className="banner-title">{banner.title}</h3>
                <p className="banner-subtitle">{banner.subtitle}</p>
              </div>

              <div className="banner-footer">
                <div 
                  className="promo-chip-clickable" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyPromoCode(banner.code);
                  }}
                  title="Click to copy & apply code"
                >
                  <Tag size={12} />
                  <span>Use: <strong>{banner.code}</strong></span>
                </div>
                <button className="banner-explore-btn">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
