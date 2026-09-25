import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CURATED_COLLECTIONS } from '../data/mockData';

export default function Collections({ onSelectCollection }) {
  return (
    <section className="collections-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Curated Collections</h2>
          <p className="section-subtitle">Explore curated lists of top restaurants, cafes, pubs, and bars based on trends</p>
        </div>
        <div className="view-all-link">
          <span>All collections in Chennai</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="collections-grid">
        {CURATED_COLLECTIONS.map((col) => (
          <div 
            key={col.id} 
            className="collection-card"
            onClick={() => onSelectCollection(col)}
          >
            <div className="collection-img-wrapper">
              <img src={col.image} alt={col.title} loading="lazy" />
              <div className="collection-gradient-overlay"></div>
              <span className="collection-tag-badge">{col.tag}</span>
            </div>
            <div className="collection-content">
              <h3 className="collection-title">{col.title}</h3>
              <div className="collection-footer">
                <span className="places-count">{col.placesCount}</span>
                <ArrowRight size={14} className="collection-arrow" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
