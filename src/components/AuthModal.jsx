import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('4821');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setIsLoading(true);
    const generated = String(Math.floor(1000 + Math.random() * 9000));
    setSimulatedOtp(generated);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 400);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: name || 'Gourmet Foodie',
        phone: '+91 ' + phone,
        avatar: '🍲'
      });
      onClose();
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess({
      name: 'Priya Sundaram',
      phone: '+91 98401 23456',
      avatar: '👩‍🍳'
    });
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="auth-modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-brand-logo">
            <span className="auth-flame">🍲</span>
            <span className="auth-brand-name">unavukadai</span>
          </div>
          <h3>{tab === 'login' ? 'Welcome Back!' : 'Create an Account'}</h3>
          <p className="auth-subtext">Order from top restaurants, enjoy fast delivery & discover dishes</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-switch">
          <button 
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setOtpSent(false); }}
          >
            Log In
          </button>
          <button 
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setOtpSent(false); }}
          >
            Sign Up
          </button>
        </div>

        {!otpSent ? (
          <form className="auth-form" onSubmit={handleSendOtp}>
            {tab === 'signup' && (
              <div className="auth-input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Priya Sundaram" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label>Phone Number</label>
              <div className="phone-prefix-input">
                <span className="country-code">+91</span>
                <input 
                  type="tel" 
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isLoading || phone.length < 10}
            >
              {isLoading ? 'Sending OTP...' : 'Send One Time Password (OTP)'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="otp-sent-indicator">
              <CheckCircle size={16} className="icon-success" />
              <span>Mobile: +91 {phone}</span>
              <button 
                type="button" 
                className="edit-phone-link"
                onClick={() => setOtpSent(false)}
              >
                Change
              </button>
            </div>

            {/* In-app Zero-SMS Gateway Simulation Banner */}
            <div className="simulated-sms-box animate-fade">
              <div className="sms-box-header">
                <span>📲 In-App Verification PIN:</span>
                <strong className="sms-otp-code">{simulatedOtp}</strong>
              </div>
              <p className="sms-box-sub">No external SMS gateway needed. Auto-generated securely on your device.</p>
              <button 
                type="button" 
                className="btn-autofill-otp"
                onClick={() => setOtp(simulatedOtp.split(''))}
              >
                ⚡ Auto-fill {simulatedOtp}
              </button>
            </div>

            <div className="otp-inputs-row">
              {otp.map((digit, idx) => (
                <input 
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text" 
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="otp-digit-box"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isLoading || otp.some(d => !d)}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or quickly test with</span>
        </div>

        <button className="demo-login-chip" onClick={handleQuickDemoLogin}>
          <span>🚀 Instant Demo Account (Priya)</span>
        </button>

        <div className="auth-terms">
          <p>
            By continuing, you agree to our <a href="#terms">Terms of Service</a> & <a href="#privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
