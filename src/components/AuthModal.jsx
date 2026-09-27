import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  Mail, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Lock,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Check
} from 'lucide-react';
import { 
  sendWhatsAppOtpApi, 
  verifyWhatsAppOtpApi, 
  getWhatsAppStatusApi 
} from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMethod, setAuthMethod] = useState('google'); // 'google' | 'phone' | 'email'
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Phone & WhatsApp OTP states
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [sentViaWhatsApp, setSentViaWhatsApp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [whatsAppGatewayStatus, setWhatsAppGatewayStatus] = useState(null);

  // Email / Gmail states
  const [customEmail, setCustomEmail] = useState('');
  const [emailName, setEmailName] = useState('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  // Check WhatsApp gateway status when modal opens
  useEffect(() => {
    if (isOpen) {
      getWhatsAppStatusApi().then(st => {
        if (st) setWhatsAppGatewayStatus(st);
      });
    }
  }, [isOpen]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  // Google 1-Click Sign-In accounts
  const googleAccounts = [
    {
      name: 'Alexander Raja',
      email: 'alexanderrajac@gmail.com',
      avatar: '👨‍💻'
    },
    {
      name: 'Priya Sundaram',
      email: 'priya.sundaram@gmail.com',
      avatar: '👩‍🍳'
    }
  ];

  const handleSelectGoogleAccount = (acc) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: acc.name,
        email: acc.email,
        phone: '+91 98401 23456',
        avatar: acc.avatar,
        authProvider: 'google',
        isVerified: true
      });
      onClose();
    }, 400);
  };

  const handleCustomGoogleSignIn = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const extractedName = emailName || customEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      onLoginSuccess({
        name: extractedName,
        email: customEmail.toLowerCase(),
        phone: '+91 98401 23456',
        avatar: '🍲',
        authProvider: 'google',
        isVerified: true
      });
      onClose();
    }, 450);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 10) return;
    setIsLoading(true);
    setOtpError('');
    try {
      const res = await sendWhatsAppOtpApi(phone, tab === 'signup' ? 'SIGNUP' : 'LOGIN');
      setIsLoading(false);
      setOtpSent(true);
      setSentViaWhatsApp(Boolean(res.sentViaWhatsApp));
      setResendTimer(60);
    } catch (err) {
      setIsLoading(false);
      setOtpError(err.message || 'Failed to send WhatsApp OTP. Please try again.');
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpChange = (index, value) => {
    // If user pastes multiple digits
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 4).split('');
      const updated = ['', '', '', ''];
      chars.forEach((c, idx) => { updated[idx] = c; });
      setOtp(updated);
      setOtpError('');
      const lastIdx = Math.min(3, chars.length - 1);
      const nextInput = document.getElementById(`otp-input-${lastIdx}`);
      if (nextInput) nextInput.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setOtpError('');

    if (cleaned && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setOtpError('Please enter all 4 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      const res = await verifyWhatsAppOtpApi(phone, enteredOtp);
      setIsLoading(false);
      if (res.success && res.verified) {
        onLoginSuccess({
          name: name || 'Gourmet Foodie',
          phone: '+91 ' + phone,
          avatar: '🍲',
          authProvider: 'whatsapp',
          isVerified: true
        });
        onClose();
      } else {
        setOtpError(res.error || 'Incorrect OTP code. Please check your WhatsApp.');
      }
    } catch (err) {
      setIsLoading(false);
      setOtpError(err.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="auth-modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag Indicator */}
        <div className="mobile-sheet-pull-handle" />

        <button className="modal-close-icon" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-logo">
            <span className="auth-flame">🍲</span>
            <span className="auth-brand-name">unavukadai</span>
          </div>
          <h3>{tab === 'login' ? 'Welcome Back!' : 'Create an Account'}</h3>
          <p className="auth-subtext">Instant WhatsApp verification & 1-click delivery in South Chennai</p>
        </div>

        {/* Tab Switcher: Log In / Sign Up */}
        <div className="auth-tab-switch">
          <button 
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setOtpSent(false); setShowGoogleChooser(false); setOtpError(''); }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setOtpSent(false); setShowGoogleChooser(false); setOtpError(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* 1. Mobile Phone Number & Real WhatsApp OTP (Primary) */}
        {!otpSent ? (
          <form className="auth-form" onSubmit={handleSendOtp}>
            {tab === 'signup' && (
              <div className="auth-input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="auth-input-field"
                  placeholder="e.g. Priya Sundaram" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <div className="flex-between-label">
                <label>WhatsApp Phone Number</label>
                <span className="whatsapp-gateway-badge">
                  <span className="whatsapp-dot-live"></span>
                  <span>WhatsApp Gateway</span>
                </span>
              </div>
              <div className="phone-prefix-input">
                <span className="country-code">+91</span>
                <input 
                  type="tel" 
                  maxLength={10}
                  className="auth-input-field"
                  placeholder="Enter 10-digit mobile number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>
            </div>

            {otpError && (
              <div className="auth-error-banner animate-fade">
                <AlertCircle size={15} />
                <span>{otpError}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full btn-whatsapp-otp-send"
              disabled={isLoading || phone.length < 10}
            >
              <MessageSquare size={17} />
              <span>{isLoading ? 'Sending to WhatsApp...' : 'Send WhatsApp OTP'}</span>
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="otp-sent-indicator whatsapp-indicator">
              <CheckCircle size={16} className="icon-success" />
              <span>Sent to WhatsApp: <strong>+91 {phone}</strong></span>
              <button 
                type="button" 
                className="edit-phone-link"
                onClick={() => { setOtpSent(false); setOtpError(''); }}
              >
                Change
              </button>
            </div>

            {/* WhatsApp notification info card */}
            <div className="whatsapp-otp-notice-card animate-fade">
              <div className="notice-icon-box">💬</div>
              <div className="notice-text-content">
                <strong>Check your WhatsApp</strong>
                <p>We sent a 4-digit verification code to your WhatsApp number.</p>
              </div>
            </div>

            {otpError && (
              <div className="auth-error-banner animate-fade">
                <AlertCircle size={15} />
                <span>{otpError}</span>
              </div>
            )}

            {/* Interactive 4-digit OTP Validator */}
            <div className="otp-inputs-row">
              {otp.map((digit, idx) => (
                <input 
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text" 
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`otp-digit-box ${digit ? 'filled' : ''} ${otpError ? 'error-ring' : ''}`}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {/* 60-Second Resend Countdown Timer */}
            <div className="resend-otp-row">
              {resendTimer > 0 ? (
                <span className="resend-countdown-text">
                  Resend code via WhatsApp in <strong>{resendTimer}s</strong>
                </span>
              ) : (
                <button 
                  type="button" 
                  className="btn-resend-whatsapp"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                >
                  <RefreshCw size={13} />
                  <span>Resend WhatsApp OTP</span>
                </button>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isLoading || otp.some(d => !d)}
            >
              {isLoading ? 'Verifying with System...' : 'Verify OTP & Continue'}
            </button>
          </form>
        )}

        {/* 2. Google / Gmail Alternative */}
        {!otpSent && (
          <>
            <div className="auth-divider">
              <span>or continue with Google</span>
            </div>

            {!showGoogleChooser ? (
              <div className="google-auth-section">
                <button 
                  type="button" 
                  className="btn-google-auth"
                  onClick={() => setShowGoogleChooser(true)}
                  disabled={isLoading}
                >
                  <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{tab === 'login' ? 'Sign in with Google / Gmail' : 'Sign up with Google / Gmail'}</span>
                </button>
              </div>
            ) : (
              <div className="google-chooser-panel animate-fade">
                <div className="google-chooser-header">
                  <span className="google-sub-label">Choose a Google Account</span>
                  <button 
                    type="button" 
                    className="btn-back-chooser"
                    onClick={() => setShowGoogleChooser(false)}
                  >
                    Back
                  </button>
                </div>

                <div className="google-account-list">
                  {googleAccounts.map((acc, idx) => (
                    <div 
                      key={idx} 
                      className="google-account-item"
                      onClick={() => handleSelectGoogleAccount(acc)}
                    >
                      <div className="acc-avatar-bubble">{acc.avatar}</div>
                      <div className="acc-info-box">
                        <strong>{acc.name}</strong>
                        <span>{acc.email}</span>
                      </div>
                      <ArrowRight size={14} className="text-muted" />
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCustomGoogleSignIn} className="custom-gmail-form">
                  <span className="or-other-label">Or use custom Gmail address:</span>
                  {tab === 'signup' && (
                    <input 
                      type="text" 
                      className="auth-input-field mb-2"
                      placeholder="Your Full Name"
                      value={emailName}
                      onChange={(e) => setEmailName(e.target.value)}
                    />
                  )}
                  <div className="gmail-input-wrap">
                    <Mail size={16} className="input-adornment" />
                    <input 
                      type="email" 
                      className="auth-input-field with-icon"
                      placeholder="yourname@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn-google-custom-submit"
                    disabled={isLoading || !customEmail}
                  >
                    {isLoading ? 'Signing In...' : 'Continue with this Gmail'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        <div className="auth-terms">
          <p>
            By continuing, you agree to our <a href="#terms">Terms of Service</a> & <a href="#privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
