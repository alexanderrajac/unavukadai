import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Utensils, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

const SAMPLE_FOOD_IMAGES = [
  { label: 'Biryani Feast', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'South Tiffin & Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { label: 'Grill & Shawarma', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Traditional Meals', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pizza & Burger', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' }
];

export default function RegisterRestaurantModal({
  isOpen,
  onClose,
  onRegisterRestaurant,
  currentUser,
  isAdmin = false,
  onSwitchPortal = () => {}
}) {
  const [formData, setFormData] = useState({
    name: '',
    region: 'Perungalathur',
    cuisines: 'Biryani, South Indian, Tandoori',
    address: '',
    phone: currentUser?.phone || '+91 98401 22222',
    email: currentUser?.email || '',
    ownerName: currentUser?.name || '',
    costForTwo: '400',
    deliveryTimeMins: '25',
    image: SAMPLE_FOOD_IMAGES[0].url,
    pureVeg: false,
    fssaiLicense: 'FSSAI-TN-2026-9840',
    offer: '50% OFF up to ₹100 | Welcome Offer'
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [newRestaurantDetails, setNewRestaurantDetails] = useState(null);

  // Reset success state and prefill user contact on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setFormData(prev => ({
        ...prev,
        ownerName: currentUser?.name || prev.ownerName,
        email: currentUser?.email || prev.email,
        phone: currentUser?.phone || prev.phone
      }));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please enter restaurant name and address.');
      return;
    }

    const cuisinesArray = formData.cuisines
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const restaurantId = 'res-' + formData.region.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4);

    const newRestaurant = {
      id: restaurantId,
      name: formData.name.trim(),
      region: formData.region,
      cuisines: cuisinesArray.length > 0 ? cuisinesArray : ['South Indian', 'Biryani'],
      rating: 4.8,
      ratingCount: 'New Partner',
      deliveryTime: `${formData.deliveryTimeMins}-${parseInt(formData.deliveryTimeMins, 10) + 5} min`,
      deliveryTimeMins: parseInt(formData.deliveryTimeMins, 10) || 25,
      distance: '1.2 km',
      costForTwo: parseInt(formData.costForTwo, 10) || 400,
      offer: formData.offer || 'Flat 20% OFF on all orders',
      pureVeg: Boolean(formData.pureVeg),
      delivery: true,
      diningOut: true,
      nightlife: false,
      image: formData.image || SAMPLE_FOOD_IMAGES[0].url,
      address: formData.address.trim(),
      safetyScore: '4.9 FSSAI Certified',
      ownerName: formData.ownerName || 'Merchant Partner',
      ownerPhone: formData.phone,
      ownerEmail: formData.email,
      fssaiLicense: formData.fssaiLicense,
      menu: [
        {
          id: `${restaurantId}-m1`,
          name: `${formData.name} Signature Special`,
          price: Math.round(parseInt(formData.costForTwo, 10) / 2) || 180,
          rating: 4.9,
          votes: 12,
          category: 'Specialties',
          isVeg: formData.pureVeg,
          description: `Freshly prepared specialty dish from ${formData.name}.`
        },
        {
          id: `${restaurantId}-m2`,
          name: formData.pureVeg ? 'Paneer Butter Masala & Roti' : 'Chef Special Chicken Biryani',
          price: Math.round(parseInt(formData.costForTwo, 10) * 0.6) || 220,
          rating: 4.8,
          votes: 18,
          category: 'Chef Specials',
          isVeg: formData.pureVeg,
          description: 'Authentic rich gravy served fresh with fragrant spices.'
        }
      ]
    };

    onRegisterRestaurant(newRestaurant, {
      name: formData.ownerName || formData.name + ' Owner',
      email: formData.email,
      phone: formData.phone,
      role: 'restaurant'
    });

    setNewRestaurantDetails(newRestaurant);
    setIsSuccess(true);
  };

  const handleFinish = (goToKitchen = false) => {
    setIsSuccess(false);
    onClose();
    if (goToKitchen) {
      onSwitchPortal('hotel');
    }
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose} style={{ zIndex: 3000 }}>
      <div 
        className="reg-restaurant-modal animate-scale" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="reg-modal-header">
          <div className="reg-header-brand">
            <div className="reg-icon-badge">
              <Store size={22} />
            </div>
            <div>
              <h3>{isAdmin ? '🛡️ Register New Partner Restaurant' : '🏪 Partner with Unavukadai'}</h3>
              <p className="reg-header-sub">
                {isAdmin 
                  ? 'Add a new restaurant and onboard its merchant into the Unavukadai network' 
                  : 'Start receiving orders in Tambaram, Perungalathur & Vandalur in 5 minutes'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-icon" 
            onClick={onClose} 
            aria-label="Close modal"
            style={{ position: 'relative', top: 'auto', right: 'auto', color: '#fff' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="reg-success-card animate-fade">
            <div className="reg-success-icon">
              <CheckCircle2 size={56} style={{ color: '#10b981' }} />
            </div>
            <h3>🎉 Restaurant Successfully Registered!</h3>
            <p className="reg-success-desc">
              <strong>{newRestaurantDetails?.name}</strong> is now live in the <strong>{newRestaurantDetails?.region}</strong> zone!
            </p>
            <div className="reg-success-summary">
              <div className="summary-pill">
                <span>📍 Area</span>
                <strong>{newRestaurantDetails?.region}</strong>
              </div>
              <div className="summary-pill">
                <span>👨‍🍳 Assigned Role</span>
                <strong>Merchant (Restaurant Admin)</strong>
              </div>
              <div className="summary-pill">
                <span>📦 Menu Starter</span>
                <strong>2 Signature Dishes Added</strong>
              </div>
            </div>
            <p className="reg-role-tip">
              💡 You can now open your <strong>👨‍🍳 Merchant Kitchen Portal</strong> to manage live orders, edit your menu prices, and customize your kitchen timings.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => handleFinish(false)}
                style={{ padding: '12px 20px' }}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => handleFinish(true)}
                style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Open Merchant Kitchen Portal</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reg-form-body">
            <div className="reg-two-col">
              {/* Restaurant Name */}
              <div className="form-group-generic">
                <label>Restaurant Name *</label>
                <div className="input-with-icon">
                  <Store size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thalappakatti Dindigul Biryani"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Operating Region */}
              <div className="form-group-generic">
                <label>Suburban Hub / Region *</label>
                <div className="input-with-icon">
                  <MapPin size={16} />
                  <select
                    value={formData.region}
                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                  >
                    <option value="Perungalathur">Perungalathur Hub</option>
                    <option value="Vandalur">Vandalur City</option>
                    <option value="Mannivakkam">Mannivakkam & Mudichur</option>
                    <option value="Tambaram">Tambaram West & Sanatorium</option>
                    <option value="Chromepet">Chromepet & GST Road</option>
                    <option value="Guduvanchery">Guduvanchery Hub</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cuisines & Tags */}
            <div className="form-group-generic">
              <label>Cuisines / Specialties (comma separated) *</label>
              <div className="input-with-icon">
                <Utensils size={16} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Biryani, South Indian, Chettinad, Chinese"
                  value={formData.cuisines}
                  onChange={e => setFormData({ ...formData, cuisines: e.target.value })}
                />
              </div>
            </div>

            {/* Detailed Address */}
            <div className="form-group-generic">
              <label>Full Address &amp; Landmark *</label>
              <div className="input-with-icon">
                <MapPin size={16} />
                <input
                  type="text"
                  required
                  placeholder="e.g. No 14, GST Road, Opp Bus Stand, Perungalathur"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="reg-three-col">
              {/* Cost for Two */}
              <div className="form-group-generic">
                <label>Cost for Two (₹)</label>
                <div className="input-with-icon">
                  <DollarSign size={16} />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    placeholder="400"
                    value={formData.costForTwo}
                    onChange={e => setFormData({ ...formData, costForTwo: e.target.value })}
                  />
                </div>
              </div>

              {/* Delivery Time */}
              <div className="form-group-generic">
                <label>Avg Prep/Delivery Time (Mins)</label>
                <div className="input-with-icon">
                  <Clock size={16} />
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={formData.deliveryTimeMins}
                    onChange={e => setFormData({ ...formData, deliveryTimeMins: e.target.value })}
                  />
                </div>
              </div>

              {/* Pure Veg Toggle */}
              <div className="form-group-generic flex-center-vert">
                <label>Dietary Type</label>
                <label className="veg-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.pureVeg}
                    onChange={e => setFormData({ ...formData, pureVeg: e.target.checked })}
                  />
                  <span>🌱 Pure Vegetarian</span>
                </label>
              </div>
            </div>

            {/* Owner & Contact Details */}
            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Merchant / Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sundaram K."
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>
              <div className="form-group-generic">
                <label>Merchant Phone (For KOT Alerts)</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input
                    type="tel"
                    placeholder="+91 98401 23456"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Image Selection Presets */}
            <div className="form-group-generic">
              <label>Select Showcase Banner Image</label>
              <div className="image-preset-picker">
                {SAMPLE_FOOD_IMAGES.map((img) => (
                  <div
                    key={img.label}
                    className={`image-preset-item ${formData.image === img.url ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, image: img.url })}
                  >
                    <img src={img.url} alt={img.label} />
                    <span>{img.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Promotional Offer */}
            <div className="form-group-generic">
              <label>Launch Offer / Promo Headline</label>
              <input
                type="text"
                placeholder="e.g. 50% OFF up to ₹100 | Use FIRST50"
                value={formData.offer}
                onChange={e => setFormData({ ...formData, offer: e.target.value })}
              />
            </div>

            {/* FSSAI Hygiene Certificate */}
            <div className="form-group-generic">
              <label>FSSAI License / Registration No.</label>
              <div className="input-with-icon">
                <ShieldCheck size={16} />
                <input
                  type="text"
                  placeholder="e.g. FSSAI-TN-2026-XXXX"
                  value={formData.fssaiLicense}
                  onChange={e => setFormData({ ...formData, fssaiLicense: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions-generic">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary btn-submit-reg">
                <Sparkles size={16} />
                <span>{isAdmin ? 'Confirm & Add Restaurant' : 'Register Restaurant & Become Merchant'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
