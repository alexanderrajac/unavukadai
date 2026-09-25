import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FOOD_CATEGORIES } from '../data/mockData';

export default function CategoryCarousel({ selectedCategory, onSelectCategory }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="category-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Inspiration for your first order</h2>
          <p className="section-subtitle">Top curated delicacies freshly prepared in your neighbourhood</p>
        </div>
        <div className="carousel-nav-arrows">
          <button 
            className="arrow-btn" 
            onClick={() => handleScroll('left')} 
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            className="arrow-btn" 
            onClick={() => handleScroll('right')} 
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="category-scroll-track" ref={scrollRef}>
        {/* All option */}
        <div 
          className={`category-item-card ${!selectedCategory ? 'selected' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <div className="category-thumb-all">
            <span className="all-icon">✨</span>
          </div>
          <span className="category-name">All Flavours</span>
        </div>

        {FOOD_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <div 
              key={cat.id} 
              className={`category-item-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCategory(isSelected ? null : cat.name)}
            >
              <div className="category-thumb-wrapper">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="category-img" 
                  loading="lazy" 
                />
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
