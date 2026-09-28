import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Upload,
  Camera,
  Trash2,
  Plus,
  CreditCard,
  ChefHat,
  Image as ImageIcon
} from 'lucide-react';

const SAMPLE_OUTLET_IMAGES = [
  { label: 'Biryani Feast', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'South Tiffin & Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { label: 'Grill & Shawarma', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Traditional Meals', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pizza & Burger', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' }
];

const SAMPLE_DISH_IMAGES = [
  { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Dosa & Tiffin', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { label: 'Curry / Gravy', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Grill Chicken', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Burger & Snacks', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Beverage / Shake', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80' }
];

const DISH_CATEGORIES = [
  'Biryani & Rice',
  'Tiffin & Dosa',
  'Starters & Appetizers',
  'Main Course Curries',
  'South Indian Meals',
  'Chinese & Fast Food',
  'Breads & Parottas',
  'Desserts & Beverages'
];

export default function RegisterRestaurantModal({
  isOpen,
  onClose,
  onRegisterRestaurant,
  currentUser,
  isAdmin = false,
  onSwitchPortal = () => {}
}) {
  const outletFileInputRef = useRef(null);

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
    image: SAMPLE_OUTLET_IMAGES[0].url,
    pureVeg: false,
    fssaiLicense: 'FSSAI-TN-2026-9840',
    offer: '50% OFF up to ₹100 | Welcome Offer',
    openTime: '07:00 AM',
    closeTime: '11:00 PM',
    payoutUpi: '8248651695@ybl',
    tagline: 'Authentic taste freshly prepared with premium local spices'
  });

  // Dynamic starter menu items with customizable photos
  const [menuItems, setMenuItems] = useState([
    {
      id: 'dish-init-1',
      name: 'Chef Signature Special Biryani',
      price: '220',
      category: 'Biryani & Rice',
      isVeg: false,
      image: SAMPLE_DISH_IMAGES[0].url,
      description: 'Slow-cooked aromatic seeraga samba rice with rich spices.'
    },
    {
      id: 'dish-init-2',
      name: 'Crispy Ghee Roast Masala Dosa',
      price: '90',
      category: 'Tiffin & Dosa',
      isVeg: true,
      image: SAMPLE_DISH_IMAGES[1].url,
      description: 'Served piping hot with 3 homemade chutneys and sambar.'
    }
  ]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [newRestaurantDetails, setNewRestaurantDetails] = useState(null);

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

  // Handle local image file upload with base64 data URL
  const handleFileUpload = (e, onDataReady) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onDataReady(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add new dish row
  const handleAddDishRow = () => {
    const newId = 'dish-new-' + Date.now();
    setMenuItems(prev => [
      ...prev,
      {
        id: newId,
        name: '',
        price: '150',
        category: 'Main Course Curries',
        isVeg: formData.pureVeg,
        image: SAMPLE_DISH_IMAGES[2].url,
        description: 'Freshly prepared specialty dish made to order.'
      }
    ]);
  };

  // Update specific dish field
  const handleUpdateDish = (index, field, value) => {
    setMenuItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Remove dish row
  const handleRemoveDish = (index) => {
    if (menuItems.length <= 1) {
      alert('Restaurant must have at least 1 starter menu dish.');
      return;
    }
    setMenuItems(prev => prev.filter((_, idx) => idx !== index));
  };

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

    // Format menu items
    const formattedMenu = menuItems.map((item, idx) => ({
      id: `${restaurantId}-m${idx + 1}`,
      name: item.name.trim() || `${formData.name} Specialty #${idx + 1}`,
      price: parseInt(item.price, 10) || 150,
      rating: 4.8,
      votes: 10 + idx * 5,
      category: item.category || 'Specialties',
      isVeg: Boolean(item.isVeg),
      image: item.image || SAMPLE_DISH_IMAGES[0].url,
      description: item.description.trim() || `Freshly prepared specialty from ${formData.name}.`
    }));

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
      image: formData.image || SAMPLE_OUTLET_IMAGES[0].url,
      address: formData.address.trim(),
      safetyScore: '4.9 FSSAI Certified',
      ownerName: formData.ownerName || 'Merchant Partner',
      ownerPhone: formData.phone,
      ownerEmail: formData.email,
      fssaiLicense: formData.fssaiLicense,
      payoutUpi: formData.payoutUpi,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      tagline: formData.tagline,
      isOpen: true,
      isClosed: false,
      menu: formattedMenu
    };

    onRegisterRestaurant(newRestaurant, {
      name: formData.ownerName || formData.name + ' Owner',
      email: formData.email,
      phone: formData.phone,
      role: 'restaurant'
    }, isAdmin);

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
        style={{ maxWidth: '740px', maxHeight: '90vh' }}
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
                  ? 'Add outlet details, upload banner & food photos, and publish to the live network' 
                  : 'Onboard your restaurant, upload food photos & menu dishes for admin review'}
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
              {isAdmin ? (
                <CheckCircle2 size={56} style={{ color: '#10b981' }} />
              ) : (
                <Clock size={56} style={{ color: '#f59e0b' }} />
              )}
            </div>
            <h3>{isAdmin ? '🎉 Restaurant Successfully Registered & Live!' : '📋 Application Submitted for Admin Verification!'}</h3>
            <p className="reg-success-desc">
              {isAdmin ? (
                <><strong>{newRestaurantDetails?.name}</strong> is verified and published with <strong>{newRestaurantDetails?.menu?.length} dishes</strong> on the customer app!</>
              ) : (
                <>Thank you! <strong>{newRestaurantDetails?.name}</strong> has been submitted with <strong>{newRestaurantDetails?.menu?.length} dishes</strong> for <strong>Master Admin</strong> review.</>
              )}
            </p>
            <div className="reg-success-summary">
              <div className="summary-pill">
                <span>📍 Area</span>
                <strong>{newRestaurantDetails?.region}</strong>
              </div>
              <div className="summary-pill">
                <span>🛡️ Status</span>
                <strong style={{ color: isAdmin ? '#10b981' : '#f59e0b' }}>
                  {isAdmin ? '✅ LIVE ON APP' : '⏳ PENDING ADMIN APPROVAL'}
                </strong>
              </div>
              <div className="summary-pill">
                <span>🍴 Menu Starter</span>
                <strong>{newRestaurantDetails?.menu?.length} Dishes Configured</strong>
              </div>
            </div>
            <p className="reg-role-tip">
              {isAdmin ? (
                <>💡 Restaurant is active immediately. You can manage live KOT orders in the <strong>Merchant Kitchen Portal</strong>.</>
              ) : (
                <>🔒 <strong>Admin Verification Policy:</strong> To maintain hygiene &amp; quality standards, new restaurant listings require Master Admin approval before appearing on the customer food delivery page.</>
              )}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => handleFinish(false)}
                style={{ padding: '12px 24px' }}
              >
                Done
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => handleFinish(true)}
                style={{ padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Open Merchant Kitchen</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reg-form-body">
            {/* SECTION 1: BASIC OUTLET INFO */}
            <div className="reg-form-section-title">
              <Store size={15} />
              <span>1. Restaurant Outlet Details</span>
            </div>

            <div className="reg-two-col">
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
                    <option value="Mannivakkam">Mannivakkam &amp; Mudichur</option>
                    <option value="Tambaram">Tambaram West &amp; Sanatorium</option>
                    <option value="Chromepet">Chromepet &amp; GST Road</option>
                    <option value="Guduvanchery">Guduvanchery Hub</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group-generic">
              <label>Specialty Cuisines (Comma separated) *</label>
              <div className="input-with-icon">
                <Utensils size={16} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Biryani, South Indian, Tandoori, Chinese"
                  value={formData.cuisines}
                  onChange={e => setFormData({ ...formData, cuisines: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group-generic">
              <label>Complete Street Address &amp; Landmarks *</label>
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

              <div className="form-group-generic">
                <label>Avg Prep Time (Mins)</label>
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

            {/* SECTION 2: OUTLET PHOTO UPLOAD & PRESET SELECTION */}
            <div className="reg-form-section-title" style={{ marginTop: '16px' }}>
              <Camera size={15} />
              <span>2. Restaurant Showcase Banner Photo</span>
            </div>

            <div className="outlet-photo-uploader-box">
              <div className="outlet-photo-preview-wrap">
                <img 
                  src={formData.image} 
                  alt="Outlet Banner Preview" 
                  className="outlet-photo-preview" 
                  onError={(e) => { e.target.src = SAMPLE_OUTLET_IMAGES[0].url; }}
                />
                <div className="outlet-photo-badge-label">Live Preview</div>
              </div>

              <div className="outlet-photo-controls">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* File Upload Trigger */}
                  <input
                    type="file"
                    ref={outletFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, (dataUrl) => setFormData(f => ({ ...f, image: dataUrl })))}
                  />
                  <button
                    type="button"
                    className="btn-upload-photo"
                    onClick={() => outletFileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    <span>Upload Outlet Photo</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => setFormData(f => ({ ...f, image: SAMPLE_OUTLET_IMAGES[0].url }))}
                  >
                    Reset Photo
                  </button>
                </div>

                <div className="form-group-generic" style={{ margin: '8px 0 0' }}>
                  <label style={{ fontSize: '11px' }}>Or Paste Image URL directly:</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  />
                </div>

                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Or select a verified sample banner:</span>
                  <div className="image-preset-picker" style={{ marginTop: '4px' }}>
                    {SAMPLE_OUTLET_IMAGES.map((img) => (
                      <div
                        key={img.label}
                        className={`image-preset-item ${formData.image === img.url ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, image: img.url })}
                        title={img.label}
                      >
                        <img src={img.url} alt={img.label} />
                        <span>{img.label.slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: MENU DISHES & FOOD PHOTOS */}
            <div className="reg-form-section-title" style={{ marginTop: '20px' }}>
              <ChefHat size={15} />
              <span>3. Starter Menu Items &amp; Food Photos ({menuItems.length} Dishes)</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '-4px 0 10px' }}>
              Add your signature items. You can upload custom food photos for each dish from your device.
            </p>

            <div className="reg-dishes-container">
              {menuItems.map((dish, index) => (
                <div key={dish.id || index} className="reg-dish-card animate-fade">
                  <div className="reg-dish-header">
                    <span className="reg-dish-num">Dish #{index + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label className="reg-dish-veg-toggle">
                        <input
                          type="checkbox"
                          checked={dish.isVeg}
                          onChange={e => handleUpdateDish(index, 'isVeg', e.target.checked)}
                        />
                        <span>{dish.isVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}</span>
                      </label>
                      {menuItems.length > 1 && (
                        <button
                          type="button"
                          className="reg-dish-delete-btn"
                          onClick={() => handleRemoveDish(index)}
                          title="Remove dish"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="reg-two-col" style={{ marginTop: '8px' }}>
                    <div className="form-group-generic">
                      <label>Dish Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chettinad Chicken Biryani"
                        value={dish.name}
                        onChange={e => handleUpdateDish(index, 'name', e.target.value)}
                      />
                    </div>

                    <div className="reg-two-col">
                      <div className="form-group-generic">
                        <label>Price (₹) *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="220"
                          value={dish.price}
                          onChange={e => handleUpdateDish(index, 'price', e.target.value)}
                        />
                      </div>
                      <div className="form-group-generic">
                        <label>Category</label>
                        <select
                          value={dish.category}
                          onChange={e => handleUpdateDish(index, 'category', e.target.value)}
                        >
                          {DISH_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Food Photo Upload Row */}
                  <div className="reg-dish-photo-row">
                    <div className="reg-dish-thumb-wrap">
                      <img
                        src={dish.image}
                        alt={dish.name || 'Dish'}
                        className="reg-dish-thumb"
                        onError={(e) => { e.target.src = SAMPLE_DISH_IMAGES[0].url; }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <label className="btn-upload-dish-photo">
                          <Camera size={13} />
                          <span>Upload Food Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e, (dataUrl) => handleUpdateDish(index, 'image', dataUrl))}
                          />
                        </label>
                        <input
                          type="url"
                          placeholder="Or paste image URL"
                          value={dish.image}
                          onChange={e => handleUpdateDish(index, 'image', e.target.value)}
                          style={{ flex: 1, minWidth: '160px', padding: '5px 8px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>

                      <div className="dish-presets-mini-strip">
                        {SAMPLE_DISH_IMAGES.map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            className={`dish-preset-chip ${dish.image === s.url ? 'active' : ''}`}
                            onClick={() => handleUpdateDish(index, 'image', s.url)}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group-generic" style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '11px' }}>Short Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Prepared with authentic seeraga samba rice and tender pieces."
                      value={dish.description}
                      onChange={e => handleUpdateDish(index, 'description', e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn-add-more-dishes"
                onClick={handleAddDishRow}
              >
                <Plus size={15} />
                <span>+ Add Another Dish to Menu</span>
              </button>
            </div>

            {/* SECTION 4: BUSINESS, OWNER & OPERATIONAL DETAILS */}
            <div className="reg-form-section-title" style={{ marginTop: '20px' }}>
              <ShieldCheck size={15} />
              <span>4. Operational, Banking &amp; Compliance Details</span>
            </div>

            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Owner / Manager Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sundaram K."
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>

              <div className="form-group-generic">
                <label>Contact Phone Number *</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 22222"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Official Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    placeholder="partner@unavukadai.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-generic">
                <label>Settlement Payout UPI ID (Daily Doorstep Cashout) *</label>
                <div className="input-with-icon">
                  <CreditCard size={16} />
                  <input
                    type="text"
                    required
                    placeholder="8248651695@ybl or hotel@okaxis"
                    value={formData.payoutUpi}
                    onChange={e => setFormData({ ...formData, payoutUpi: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Opening Time</label>
                <input
                  type="text"
                  placeholder="e.g. 07:00 AM"
                  value={formData.openTime}
                  onChange={e => setFormData({ ...formData, openTime: e.target.value })}
                />
              </div>

              <div className="form-group-generic">
                <label>Closing Time</label>
                <input
                  type="text"
                  placeholder="e.g. 11:00 PM"
                  value={formData.closeTime}
                  onChange={e => setFormData({ ...formData, closeTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group-generic">
              <label>Launch Promotional Offer / Headline</label>
              <input
                type="text"
                placeholder="e.g. Flat 50% OFF up to ₹100 on First 3 Orders"
                value={formData.offer}
                onChange={e => setFormData({ ...formData, offer: e.target.value })}
              />
            </div>

            <div className="form-group-generic">
              <label>FSSAI License / Food Safety Registration Number</label>
              <div className="input-with-icon">
                <ShieldCheck size={16} />
                <input
                  type="text"
                  placeholder="e.g. FSSAI-TN-2026-9840"
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
                <span>{isAdmin ? 'Confirm & Add Restaurant' : 'Register Restaurant & Publish Menu'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
