import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Home, 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Navigation, 
  Crosshair, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { SUBURB_CENTERS, detectUserLocation } from '../utils/geolocation';
import InteractiveAddressPinMap from './InteractiveAddressPinMap';

export default function AddressBookModal({
  isOpen,
  onClose,
  addresses = [],
  activeAddressId = null,
  onSelectAddress,
  onSaveAddress,
  onDeleteAddress
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isPinMapOpen, setIsPinMapOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Form State
  const [tag, setTag] = useState('Home'); // 'Home' | 'Work' | 'Campus' | 'Other'
  const [customTag, setCustomTag] = useState('');
  const [doorNo, setDoorNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedSuburb, setSelectedSuburb] = useState(SUBURB_CENTERS[0]);
  const [coords, setCoords] = useState([SUBURB_CENTERS[0].lat, SUBURB_CENTERS[0].lng]);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTag('Home');
    setCustomTag('');
    setDoorNo('');
    setStreetAddress('');
    setLandmark('');
    setSelectedSuburb(SUBURB_CENTERS[0]);
    setCoords([SUBURB_CENTERS[0].lat, SUBURB_CENTERS[0].lng]);
    setEditingId(null);
    setIsAddingNew(false);
    setFormError('');
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAddingNew(true);
  };

  const handleStartEdit = (addr) => {
    setEditingId(addr.id);
    setTag(['Home', 'Work', 'Campus'].includes(addr.tag) ? addr.tag : 'Other');
    setCustomTag(['Home', 'Work', 'Campus'].includes(addr.tag) ? '' : addr.tag);
    setDoorNo(addr.doorNo || '');
    setStreetAddress(addr.streetAddress || '');
    setLandmark(addr.landmark || '');
    const matchedSuburb = SUBURB_CENTERS.find(s => s.id === addr.suburb?.id) || SUBURB_CENTERS[0];
    setSelectedSuburb(matchedSuburb);
    setCoords(addr.coords || [matchedSuburb.lat, matchedSuburb.lng]);
    setIsAddingNew(true);
  };

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setFormError('');
    try {
      const res = await detectUserLocation();
      if (res.suburb) setSelectedSuburb(res.suburb);
      if (res.lat && res.lng) setCoords([res.lat, res.lng]);
      if (res.street) setStreetAddress(res.street);
      if (!landmark && res.suburb?.area) setLandmark(`Near ${res.suburb.area}`);
    } catch (err) {
      setFormError(err.message || 'GPS detection failed. Please enter street manually.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleConfirmPinLocation = ({ coords: newCoords, street, locality, suburb }) => {
    if (newCoords) setCoords(newCoords);
    if (street) setStreetAddress(street);
    if (suburb) setSelectedSuburb(suburb);
    if (!landmark && suburb?.area) setLandmark(`Near ${suburb.area}`);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!streetAddress.trim()) {
      setFormError('Please enter street or locality address');
      return;
    }

    const finalTag = tag === 'Other' && customTag.trim() ? customTag.trim() : tag;

    const newAddressObj = {
      id: editingId || `addr-${Date.now()}`,
      tag: finalTag,
      doorNo: doorNo.trim(),
      streetAddress: streetAddress.trim(),
      landmark: landmark.trim(),
      locality: selectedSuburb.name,
      city: 'Chennai',
      suburb: selectedSuburb,
      coords,
      formattedAddress: [
        doorNo ? `Door ${doorNo}` : '',
        streetAddress,
        landmark ? `Near ${landmark}` : '',
        `${selectedSuburb.name} Hub, Chennai`
      ].filter(Boolean).join(', ')
    };

    onSaveAddress(newAddressObj);
    resetForm();
  };

  const getTagIcon = (tagStr) => {
    switch (tagStr?.toLowerCase()) {
      case 'home':
        return <Home size={16} className="text-crimson" />;
      case 'work':
      case 'office':
        return <Briefcase size={16} className="text-blue" />;
      case 'campus':
      case 'hostel':
      case 'college':
        return <GraduationCap size={16} className="text-purple" />;
      default:
        return <MapPin size={16} className="text-orange" />;
    }
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div 
        className="address-book-modal-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="mobile-sheet-pull-handle" />

        {/* Modal Header */}
        <div className="address-modal-header">
          <div className="address-header-title">
            <div className="header-icon-box">
              <MapPin size={20} className="icon-crimson" />
            </div>
            <div>
              <h3>{isAddingNew ? (editingId ? 'Edit Address' : 'Add New Delivery Address') : 'Saved Addresses'}</h3>
              <p className="address-header-sub">
                {isAddingNew 
                  ? 'Pinpoint your exact doorstep for 1-tap ordering' 
                  : 'Manage your home, office, and frequent delivery locations'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-icon" 
            onClick={() => {
              if (isAddingNew) setIsAddingNew(false);
              else onClose();
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="address-modal-scrollable">
          {!isAddingNew ? (
            <div className="address-list-container">
              {/* Add New Address Prompt Button */}
              <button 
                type="button" 
                className="btn-add-address-trigger"
                onClick={handleStartAdd}
              >
                <div className="add-icon-circle">
                  <Plus size={18} />
                </div>
                <div className="add-text-meta">
                  <strong>Add New Address</strong>
                  <span>Deliver to a new flat, office desk, or hostel room</span>
                </div>
                <ArrowRight size={16} className="text-muted" />
              </button>

              {/* List of saved addresses */}
              {addresses.length === 0 ? (
                <div className="empty-addresses-view">
                  <span className="empty-emoji">📍</span>
                  <h4>No saved addresses yet</h4>
                  <p>Save your home and work addresses to place orders faster with 1 click!</p>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handleStartAdd}
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="saved-addresses-grid">
                  {addresses.map((addr) => {
                    const isSelected = activeAddressId === addr.id;

                    return (
                      <div 
                        key={addr.id}
                        className={`saved-address-card ${isSelected ? 'active-selected' : ''}`}
                        onClick={() => {
                          if (onSelectAddress) {
                            onSelectAddress(addr);
                            onClose();
                          }
                        }}
                      >
                        <div className="addr-card-top">
                          <div className="addr-tag-pill">
                            {getTagIcon(addr.tag)}
                            <span>{addr.tag}</span>
                          </div>

                          <div className="addr-actions-row" onClick={(e) => e.stopPropagation()}>
                            <button 
                              type="button" 
                              className="btn-addr-action edit"
                              onClick={() => handleStartEdit(addr)}
                              title="Edit Address"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              type="button" 
                              className="btn-addr-action delete"
                              onClick={() => onDeleteAddress(addr.id)}
                              title="Delete Address"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="addr-card-details">
                          {addr.doorNo && <strong className="addr-door">Door: {addr.doorNo}</strong>}
                          <p className="addr-street">{addr.streetAddress}</p>
                          {addr.landmark && <p className="addr-landmark">Near {addr.landmark}</p>}
                          <span className="addr-suburb-tag">📍 {addr.locality || 'Perungalathur'} Hub</span>
                        </div>

                        <div className="addr-card-footer">
                          {isSelected ? (
                            <span className="selected-indicator">
                              <Check size={14} /> Selected for Delivery
                            </span>
                          ) : (
                            <span className="tap-to-deliver">
                              Deliver Here →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Add / Edit Form */
            <form className="address-form" onSubmit={handleSave}>
              {/* Category Tag Selection */}
              <div className="form-field-group">
                <label className="field-label-bold">Address Label</label>
                <div className="tag-selector-row">
                  {[
                    { id: 'Home', icon: Home, label: 'Home' },
                    { id: 'Work', icon: Briefcase, label: 'Work' },
                    { id: 'Campus', icon: GraduationCap, label: 'Campus' },
                    { id: 'Other', icon: MapPin, label: 'Other' }
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`tag-choice-btn ${tag === t.id ? 'active' : ''}`}
                        onClick={() => setTag(t.id)}
                      >
                        <Icon size={14} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {tag === 'Other' && (
                  <input 
                    type="text" 
                    className="styled-input mt-2"
                    placeholder="e.g. Gym, Friend's Place, Parent's House"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                  />
                )}
              </div>

              {/* Suburb Center Hub */}
              <div className="form-field-group">
                <label className="field-label-bold">South Chennai Suburb Hub</label>
                <div className="suburb-pills-selector">
                  {SUBURB_CENTERS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`suburb-choice-btn ${selectedSuburb.id === s.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSuburb(s);
                        setCoords([s.lat, s.lng]);
                      }}
                    >
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Pin & GPS Fast Triggers */}
              <div className="address-map-fast-triggers">
                <button
                  type="button"
                  className="btn-gps-trigger"
                  onClick={handleDetectGps}
                  disabled={isDetectingGps}
                >
                  <Crosshair size={15} className="icon-crimson" />
                  <span>{isDetectingGps ? 'Detecting...' : '🎯 Detect Device GPS'}</span>
                </button>

                <button
                  type="button"
                  className="btn-pin-map-trigger"
                  onClick={() => setIsPinMapOpen(true)}
                >
                  <MapPin size={15} className="icon-crimson" />
                  <span>🗺️ Pinpoint on Map</span>
                </button>
              </div>

              {/* Input Fields */}
              <div className="form-field-group">
                <label className="field-label-bold">Flat / House / Door Number</label>
                <input 
                  type="text" 
                  className="styled-input"
                  placeholder="e.g. Flat #4B, Sai Shanthi Towers"
                  value={doorNo}
                  onChange={(e) => setDoorNo(e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label-bold">Street / Road / Area *</label>
                <input 
                  type="text" 
                  className="styled-input"
                  placeholder="e.g. GST Road, Peerkankaranai"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="field-label-bold">Landmark for Delivery Partner</label>
                <input 
                  type="text" 
                  className="styled-input"
                  placeholder="e.g. Opp. Bus Depot / Near Anjaneyar Temple"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>

              {formError && (
                <div className="form-error-banner animate-fade">
                  ⚠️ {formError}
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="address-form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                >
                  <Check size={16} />
                  <span>Save Address</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Leaflet Pin Drop Map Modal */}
        <InteractiveAddressPinMap
          isOpen={isPinMapOpen}
          onClose={() => setIsPinMapOpen(false)}
          initialCoords={coords}
          restaurantCoords={[selectedSuburb.lat, selectedSuburb.lng]}
          restaurantName={`${selectedSuburb.name} Hub`}
          onConfirmLocation={handleConfirmPinLocation}
        />
      </div>
    </div>
  );
}
