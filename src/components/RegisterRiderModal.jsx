import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  CreditCard,
  AlertCircle,
  FileCheck2,
  Navigation
} from 'lucide-react';

const OPERATING_ZONES = [
  'Perungalathur Hub',
  'Vandalur & Zoo Corridor',
  'Mannivakkam & Mudichur Road',
  'Kilambakkam KCBT Terminus',
  'Tambaram & Peerkankaranai',
  'Chromepet & Sanatorium'
];

const VEHICLE_TYPES = [
  { id: 'BIKE', label: 'Petrol Bike', icon: '🛵', desc: '100cc - 150cc' },
  { id: 'SCOOTER', label: 'Scooter / Activa', icon: '🛵', desc: 'Automatic' },
  { id: 'EV', label: 'Electric EV', icon: '⚡', desc: 'Eco friendly' },
  { id: 'CYCLE', label: 'Bicycle / E-Cycle', icon: '🚲', desc: 'Short radius' }
];

export default function RegisterRiderModal({
  isOpen,
  onClose,
  onRegisterRider,
  currentUser,
  isAdmin = false,
  onSwitchPortal = () => {}
}) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '+91 98401 54321',
    email: currentUser?.email || '',
    operatingZone: 'Perungalathur Hub',
    vehicleType: 'BIKE',
    vehicleNumber: 'TN 11 AB 7890',
    drivingLicense: 'TN1120240008421',
    emergencyContact: '+91 98400 99999',
    payoutUpi: '8248651695@ybl',
    experienceYears: '2'
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [newRiderDetails, setNewRiderDetails] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setFormData(prev => ({
        ...prev,
        name: currentUser?.name || prev.name,
        phone: currentUser?.phone || prev.phone,
        email: currentUser?.email || prev.email
      }));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in your name and phone number.');
      return;
    }

    if (formData.vehicleType !== 'CYCLE' && !formData.drivingLicense.trim()) {
      alert('Please provide your Driving License (DL) number for two-wheeler delivery verification.');
      return;
    }

    const riderId = 'rider-' + formData.operatingZone.toLowerCase().slice(0, 4) + '-' + Date.now().toString().slice(-4);

    const newRider = {
      id: riderId,
      riderId: riderId,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      role: 'rider',
      operatingZone: formData.operatingZone,
      vehicleType: formData.vehicleType,
      vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
      drivingLicense: formData.drivingLicense.trim().toUpperCase(),
      emergencyContact: formData.emergencyContact.trim(),
      payoutUpi: formData.payoutUpi.trim(),
      status: 'ACTIVE',
      approvalStatus: isAdmin ? 'APPROVED' : 'APPROVED',
      isApproved: true,
      rating: 5.0,
      totalTrips: 0,
      todayEarnings: 0,
      registeredAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    onRegisterRider(newRider, isAdmin);
    setNewRiderDetails(newRider);
    setIsSuccess(true);
  };

  const handleFinish = (goToPortal = false) => {
    setIsSuccess(false);
    onClose();
    if (goToPortal) {
      onSwitchPortal('rider');
    }
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose} style={{ zIndex: 3050 }}>
      <div 
        className="reg-restaurant-modal animate-scale" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Modal Header */}
        <div className="reg-modal-header" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div className="reg-header-brand">
            <div className="reg-icon-badge" style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#c084fc' }}>
              <Bike size={24} />
            </div>
            <div>
              <h3>{isAdmin ? '🛡️ Register & Onboard Delivery Partner' : '🚴 Join Unavukadai Delivery Fleet'}</h3>
              <p className="reg-header-sub">
                {isAdmin 
                  ? 'Add verified rider directly to live dispatch pool & assign local delivery zones'
                  : 'Deliver food across Perungalathur, Vandalur & Mannivakkam corridors · Instant daily UPI payouts'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-icon" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess && newRiderDetails ? (
          <div className="reg-success-card animate-fade">
            <div className="reg-success-icon" style={{ color: '#8b5cf6' }}>
              <CheckCircle2 size={56} />
            </div>
            <h3>🎉 Rider Successfully Enrolled &amp; Verified!</h3>
            <p className="reg-success-desc">
              <strong>{newRiderDetails.name}</strong> is now enrolled as a verified delivery partner for <strong>{newRiderDetails.operatingZone}</strong>.
            </p>

            <div className="reg-success-summary">
              <div className="summary-pill">
                <span>Rider ID</span>
                <strong>{newRiderDetails.riderId}</strong>
              </div>
              <div className="summary-pill">
                <span>Vehicle</span>
                <strong>{newRiderDetails.vehicleType} · {newRiderDetails.vehicleNumber}</strong>
              </div>
              <div className="summary-pill">
                <span>Payout UPI</span>
                <strong>{newRiderDetails.payoutUpi}</strong>
              </div>
              <div className="summary-pill">
                <span>Dispatch Status</span>
                <strong style={{ color: '#10b981' }}>🟢 Active &amp; Ready</strong>
              </div>
            </div>

            <div className="reg-role-tip" style={{ borderColor: 'rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.08)' }}>
              ⚡ <strong>Instant Portal Access:</strong> Tap below to launch your <strong>Rider Delivery Portal</strong>, toggle Online mode, and begin receiving live order delivery alerts in your suburb!
            </div>

            <div className="modal-actions-generic" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => handleFinish(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => handleFinish(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#8b5cf6' }}
              >
                <span>Launch Rider Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reg-form-body">
            {/* Name & Phone */}
            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Rider Full Name *</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senthil Kumar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-generic">
                <label>Mobile Number (For dispatch alerts) *</label>
                <div className="input-with-icon">
                  <Phone size={15} className="input-icon-left" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 54321"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Email & Operating Zone */}
            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={15} className="input-icon-left" />
                  <input
                    type="email"
                    placeholder="rider@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-generic">
                <label>Primary Operating Hub *</label>
                <div className="input-with-icon">
                  <MapPin size={15} className="input-icon-left" />
                  <select
                    value={formData.operatingZone}
                    onChange={e => setFormData({ ...formData, operatingZone: e.target.value })}
                  >
                    {OPERATING_ZONES.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Type Selector */}
            <div className="form-group-generic">
              <label>Delivery Vehicle Type *</label>
              <div className="rider-vehicle-grid">
                {VEHICLE_TYPES.map(vt => (
                  <button
                    key={vt.id}
                    type="button"
                    className={`rider-vehicle-card ${formData.vehicleType === vt.id ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, vehicleType: vt.id })}
                  >
                    <span className="rider-vehicle-icon">{vt.icon}</span>
                    <strong className="rider-vehicle-label">{vt.label}</strong>
                    <span className="rider-vehicle-desc">{vt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Number & Driving License */}
            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Vehicle Plate No. {formData.vehicleType === 'CYCLE' ? '(Optional)' : '*'}</label>
                <div className="input-with-icon">
                  <Bike size={15} className="input-icon-left" />
                  <input
                    type="text"
                    required={formData.vehicleType !== 'CYCLE'}
                    placeholder="e.g. TN 11 AB 7890"
                    value={formData.vehicleNumber}
                    onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-generic">
                <label>Driving License (DL) No. {formData.vehicleType === 'CYCLE' ? '(Optional)' : '*'}</label>
                <div className="input-with-icon">
                  <FileCheck2 size={15} className="input-icon-left" />
                  <input
                    type="text"
                    required={formData.vehicleType !== 'CYCLE'}
                    placeholder="e.g. TN1120240008421"
                    value={formData.drivingLicense}
                    onChange={e => setFormData({ ...formData, drivingLicense: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Payout UPI & Emergency Contact */}
            <div className="reg-two-col">
              <div className="form-group-generic">
                <label>Payout UPI ID (Instant Doorstep Settlement) *</label>
                <div className="input-with-icon">
                  <CreditCard size={15} className="input-icon-left" />
                  <input
                    type="text"
                    required
                    placeholder="8248651695@ybl or phone@paytm"
                    value={formData.payoutUpi}
                    onChange={e => setFormData({ ...formData, payoutUpi: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-generic">
                <label>Emergency Contact Phone *</label>
                <div className="input-with-icon">
                  <Phone size={15} className="input-icon-left" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98400 99999"
                    value={formData.emergencyContact}
                    onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Guarantee Pill */}
            <div className="rider-guarantee-strip">
              <ShieldCheck size={18} className="text-green" />
              <span>
                <strong>Zero Onboarding Fee:</strong> Flexible delivery shifts, automatic trip fuel incentives, and 100% customer tips credited to your account.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions-generic">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ background: '#8b5cf6', borderColor: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={16} />
                <span>{isAdmin ? 'Confirm & Register Rider' : 'Submit & Start Delivering'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
