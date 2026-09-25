import React from 'react';
import { SlidersHorizontal, Star, Zap, Percent, Check, X, ArrowUpDown } from 'lucide-react';

export default function FilterBar({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  onResetFilters
}) {
  const activeFiltersCount = 
    (filters.pureVeg ? 1 : 0) + 
    (filters.rating4Plus ? 1 : 0) + 
    (filters.fastDelivery ? 1 : 0) + 
    (filters.hasOffer ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0);

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="filter-bar-sticky">
      <div className="filter-bar-container">
        <div className="filter-chips-list">
          {/* Main Filter Icon */}
          <div className="filter-icon-indicator" title="Filters active">
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="active-filter-badge">{activeFiltersCount}</span>
            )}
          </div>

          {/* Rating 4.0+ */}
          <button 
            className={`filter-chip ${filters.rating4Plus ? 'active' : ''}`}
            onClick={() => toggleFilter('rating4Plus')}
          >
            <Star size={13} className="star-gold" />
            <span>Rating: 4.0+</span>
            {filters.rating4Plus && <Check size={13} />}
          </button>

          {/* Pure Veg */}
          <button 
            className={`filter-chip ${filters.pureVeg ? 'active' : ''}`}
            onClick={() => toggleFilter('pureVeg')}
          >
            <span className="veg-badge-mini"></span>
            <span>Pure Veg</span>
            {filters.pureVeg && <Check size={13} />}
          </button>

          {/* Fast Delivery */}
          <button 
            className={`filter-chip ${filters.fastDelivery ? 'active' : ''}`}
            onClick={() => toggleFilter('fastDelivery')}
          >
            <Zap size={14} className="icon-zap" />
            <span>Fast Delivery (≤ 30 min)</span>
            {filters.fastDelivery && <Check size={13} />}
          </button>

          {/* Great Offers */}
          <button 
            className={`filter-chip ${filters.hasOffer ? 'active' : ''}`}
            onClick={() => toggleFilter('hasOffer')}
          >
            <Percent size={13} />
            <span>Great Offers</span>
            {filters.hasOffer && <Check size={13} />}
          </button>

          {/* Price Range Filter */}
          <div className="price-select-wrapper">
            <select 
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className={`filter-select ${filters.priceRange !== 'all' ? 'active' : ''}`}
            >
              <option value="all">Cost for two</option>
              <option value="under400">Budget: Under ₹400</option>
              <option value="400to700">Mid-range: ₹400 - ₹700</option>
              <option value="above700">Premium: ₹700+</option>
            </select>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button className="clear-filters-btn" onClick={onResetFilters}>
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort by dropdown */}
        <div className="sort-by-wrapper">
          <ArrowUpDown size={14} className="sort-icon" />
          <span className="sort-label">Sort:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating: High to Low</option>
            <option value="deliveryTime">Delivery Time: Fastest</option>
            <option value="costAsc">Cost: Low to High</option>
            <option value="costDesc">Cost: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
