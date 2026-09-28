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
  Save, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Percent,
  Sparkles,
  Upload
} from 'lucide-react';

const HOTEL_IMAGE_PRESETS = [
  { label: 'Biryani Feast', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'South Tiffin & Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { label: 'Grill & Shawarma', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Traditional Meals', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pizza & Burger', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' },
  { label: 'Chinese & Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80' }
];

export default function EditRestaurantModal({
  isOpen,
  onClose,
  restaurant,
  onSave,
  onDelete
}) {
  const [formData, setFormData] = useState({
    name: '',
    region: 'Perungalathur',
    cuisines: '',
    address: '',
    image: '',
    costForTwo: 400,
    deliveryTimeMins: 25,
    offer: '',
    pureVeg: false,
    delivery: true,
    diningOut: true,
    nightlife: false,
    safetyScore: '4.9 Hygiene Certified',
    fssaiLicense: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    approvalStatus: 'APPROVED'
  });

  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData(prev => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        region: restaurant.region || 'Perungalathur',
        cuisines: Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(', ') : (restaurant.cuisines || ''),
        address: restaurant.address || '',
        image: restaurant.image || HOTEL_IMAGE_PRESETS[0].url,
        costForTwo: restaurant.costForTwo || 400,
        deliveryTimeMins: restaurant.deliveryTimeMins || 25,
        offer: restaurant.offer || '',
        pureVeg: Boolean(restaurant.pureVeg),
        delivery: restaurant.delivery !== false,
        diningOut: Boolean(restaurant.diningOut),
        nightlife: Boolean(restaurant.nightlife),
        safetyScore: restaurant.safetyScore || '4.9 Hygiene Certified',
        fssaiLicense: restaurant.fssaiLicense || 'FSSAI-TN-2026-XXXX',
        ownerName: restaurant.ownerName || '',
        ownerPhone: restaurant.ownerPhone || '',
        ownerEmail: restaurant.ownerEmail || '',
        approvalStatus: restaurant.approvalStatus || (restaurant.isApproved === false ? 'PENDING' : 'APPROVED')
      });
      setIsConfirmDelete(false);
      setSavedSuccess(false);
    }
  }, [restaurant, isOpen]);

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Restaurant Name and Address are required.');
      return;
    }

    const cuisinesArray = formData.cuisines
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const updatedData = {
      ...restaurant,
      name: formData.name.trim(),
      region: formData.region,
      cuisines: cuisinesArray.length > 0 ? cuisinesArray : restaurant.cuisines,
      address: formData.address.trim(),
      image: formData.image.trim() || HOTEL_IMAGE_PRESETS[0].url,
      costForTwo: Number(formData.costForTwo) || 400,
      deliveryTimeMins: Number(formData.deliveryTimeMins) || 25,
      deliveryTime: `${formData.deliveryTimeMins}-${Number(formData.deliveryTimeMins) + 5} min`,
      offer: formData.offer.trim(),
      pureVeg: Boolean(formData.pureVeg),
      delivery: Boolean(formData.delivery),
      diningOut: Boolean(formData.diningOut),
      nightlife: Boolean(formData.nightlife),
      safetyScore: formData.safetyScore.trim(),
      fssaiLicense: formData.fssaiLicense.trim(),
      ownerName: formData.ownerName.trim(),
      ownerPhone: formData.phone || formData.ownerPhone,
      ownerEmail: formData.email || formData.ownerEmail,
      approvalStatus: formData.approvalStatus,
      isApproved: formData.approvalStatus === 'APPROVED'
    };

    onSave(restaurant.id, updatedData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(restaurant.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose} style={{ zIndex: 3100 }}>
      <div 
        className="reg-restaurant-modal animate-scale" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: '720px' }}
      >
        {/* Header */}
        <div className="reg-modal-header" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
          <div className="reg-header-brand">
            <div className="reg-icon-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
              <Store size={22} />
            </div>
            <div>
              <h3>✏️ Edit Restaurant Details &amp; Images</h3>
              <p className="reg-header-sub">Update outlet information, banner photos, pricing, and live approval status</p>
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

        {savedSuccess && (
          <div className="adm-alert-toast animate-fade" style={{ margin: '16px 24px 0' }}>
            <CheckCircle2 size={16} />
            <span>✅ Restaurant details and images saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reg-form-body">
          {/* 1. Basic Details */}
          <div className="reg-two-col">
            <div className="form-group-generic">
              <label>Restaurant Name *</label>
              <div className="input-with-icon">
                <Store size={16} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group-generic">
              <label>Suburban Region / Hub *</label>
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

          {/* Full Address */}
          <div className="form-group-generic">
            <label>Complete Outlet Address *</label>
            <div className="input-with-icon">
              <MapPin size={16} />
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Cuisines */}
          <div className="form-group-generic">
            <label>Cuisines &amp; Categories (comma-separated)</label>
            <div className="input-with-icon">
              <Utensils size={16} />
              <input
                type="text"
                value={formData.cuisines}
                onChange={e => setFormData({ ...formData, cuisines: e.target.value })}
                placeholder="Biryani, South Indian, Tandoori"
              />
            </div>
          </div>

          {/* 2. Image Selection & Preview */}
          <div className="form-group-generic">
            <label>Hotel Showcase Image URL *</label>
            <div className="input-with-icon">
              <ImageIcon size={16} />
              <input
                type="url"
                required
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* File Upload Button & File Input */}
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <button 
                type="button" 
                className="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #fed7aa', background: '#fff7ed', color: '#c2410c', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                <Upload size={14} color="#ea580c" />
                <span>Upload Photo from Device / Camera</span>
              </button>
              <span style={{ fontSize: '12px', color: '#64748b' }}>PNG, JPG, WEBP up to 5MB</span>
            </div>

            {/* Live Image Preview */}
            {formData.image && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '120px', height: '70px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #ea580c', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = HOTEL_IMAGE_PRESETS[0].url; }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Live banner preview. You can pick from presets below, paste any link, or upload an image.
                </span>
              </div>
            )}

            {/* Presets */}
            <div className="image-preset-picker" style={{ marginTop: '8px' }}>
              {HOTEL_IMAGE_PRESETS.map((p) => (
                <div 
                  key={p.label}
                  className={`image-preset-item ${formData.image === p.url ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, image: p.url })}
                >
                  <img src={p.url} alt={p.label} />
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pricing & Operational Timing */}
          <div className="reg-three-col">
            <div className="form-group-generic">
              <label>Cost for Two (₹)</label>
              <div className="input-with-icon">
                <DollarSign size={16} />
                <input
                  type="number"
                  min="50"
                  step="50"
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
                <span>🌱 Pure Veg</span>
              </label>
            </div>
          </div>

          {/* 4. Promotional Headline & FSSAI Score */}
          <div className="reg-two-col">
            <div className="form-group-generic">
              <label>Active Offer / Discount Ribbon</label>
              <div className="input-with-icon">
                <Percent size={16} />
                <input
                  type="text"
                  value={formData.offer}
                  onChange={e => setFormData({ ...formData, offer: e.target.value })}
                  placeholder="50% OFF up to ₹120"
                />
              </div>
            </div>

            <div className="form-group-generic">
              <label>FSSAI Hygiene Certificate / Score</label>
              <div className="input-with-icon">
                <ShieldCheck size={16} />
                <input
                  type="text"
                  value={formData.safetyScore}
                  onChange={e => setFormData({ ...formData, safetyScore: e.target.value })}
                  placeholder="4.9 Hygiene Certified"
                />
              </div>
            </div>
          </div>

          {/* 5. Owner Contact & Compliance */}
          <div className="reg-three-col">
            <div className="form-group-generic">
              <label>Owner / Merchant Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Sundaram K."
              />
            </div>
            <div className="form-group-generic">
              <label>Merchant Phone</label>
              <input
                type="tel"
                value={formData.ownerPhone}
                onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                placeholder="+91 98401 22222"
              />
            </div>
            <div className="form-group-generic">
              <label>FSSAI License No.</label>
              <input
                type="text"
                value={formData.fssaiLicense}
                onChange={e => setFormData({ ...formData, fssaiLicense: e.target.value })}
                placeholder="FSSAI-TN-2026-XXXX"
              />
            </div>
          </div>

          {/* 6. Approval & Live Status Gate */}
          <div className="form-group-generic" style={{ padding: '14px', borderRadius: '12px', background: formData.approvalStatus === 'APPROVED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', border: `1px solid ${formData.approvalStatus === 'APPROVED' ? '#10b981' : '#f59e0b'}` }}>
            <label style={{ color: formData.approvalStatus === 'APPROVED' ? '#10b981' : '#f59e0b' }}>
              🛡️ Live Customer App Gate Status
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="approvalStatus"
                  value="APPROVED"
                  checked={formData.approvalStatus === 'APPROVED'}
                  onChange={() => setFormData({ ...formData, approvalStatus: 'APPROVED' })}
                />
                <span>🟢 APPROVED (Live on Customer App)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="approvalStatus"
                  value="PENDING"
                  checked={formData.approvalStatus === 'PENDING'}
                  onChange={() => setFormData({ ...formData, approvalStatus: 'PENDING' })}
                />
                <span>⏳ PENDING (Hidden from Customers)</span>
              </label>
            </div>
          </div>

          {/* Actions & Delete Confirmation */}
          <div className="modal-actions-generic" style={{ justifyContent: 'space-between' }}>
            {isConfirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>Confirm delete outlet?</span>
                <button 
                  type="button" 
                  className="adm-reject-btn"
                  onClick={handleDelete}
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  Yes, Delete
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsConfirmDelete(false)}
                  style={{ padding: '6px 12px' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="adm-reject-btn"
                onClick={() => setIsConfirmDelete(true)}
                title="Remove this restaurant from directory"
              >
                <Trash2 size={14} />
                <span>Delete Outlet</span>
              </button>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px' }}>
                <Save size={15} />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
