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
  Check,
  Key
} from 'lucide-react';
import { 
  sendWhatsAppOtpApi, 
  verifyWhatsAppOtpApi, 
  getWhatsAppStatusApi 
} from '../services/api';
import { signInWithGoogleOAuth } from '../services/supabaseAuth';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'signup'
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'google'

  // Phone & WhatsApp OTP states
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [emailSignup, setEmailSignup] = useState('');
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
  const [googleNotice, setGoogleNotice] = useState('');

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setOtpSent(false);
      setOtpError('');
      setGoogleNotice('');
      getWhatsAppStatusApi().then(st => {
        if (st) setWhatsAppGatewayStatus(st);
      });
    }
  }, [isOpen, initialTab]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  // Direct Instant Google Sign-In
  const handleGoogleSignInWithEmail = (targetEmail, targetName) => {
    const finalEmail = targetEmail || customEmail;
    if (!finalEmail || !finalEmail.includes('@')) return;
    setIsLoading(true);
    setGoogleNotice('');
    setTimeout(() => {
      setIsLoading(false);
      const extractedName = targetName || emailName || finalEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      onLoginSuccess({
        name: extractedName,
        email: finalEmail.toLowerCase(),
        phone: '+91 98401 23456',
        authProvider: 'google',
        isVerified: true
      });
      onClose();
    }, 350);
  };

  // Real Supabase Google OAuth Redirect
  const handleRealGoogleOAuth = async () => {
    setIsLoading(true);
    setGoogleNotice('');
    try {
      const res = await signInWithGoogleOAuth();
      if (!res.success) {
        setGoogleNotice(res.error || 'Google OAuth failed to start.');
      }
    } catch (err) {
      setGoogleNotice(err.message || 'Google OAuth redirect failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send WhatsApp OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 10) return;
    setIsLoading(true);
    setOtpError('');
    try {
      const res = await sendWhatsAppOtpApi(phone, tab === 'signup' ? 'SIGNUP' : 'LOGIN');
      if (res && res.success === false) {
        setIsLoading(false);
        setOtpError(res.error || 'Failed to send WhatsApp OTP. Please try again.');
        return;
      }
      setIsLoading(false);
      setOtpSent(true);
      setSentViaWhatsApp(Boolean(res.sentViaWhatsApp));
      setResendTimer(60);
    } catch (err) {
      setIsLoading(false);
      setOtpError(err.message || 'Failed to send WhatsApp OTP. Please try again.');
    }
  };

  // Auto-Fill test OTP
  const handleFillTestOtp = () => {
    setOtp(['1', '2', '3', '4']);
    setOtpError('');
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpChange = (index, value) => {
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

  // Verify WhatsApp OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setOtpError('Please enter all 4 digits of the OTP code.');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      const res = await verifyWhatsAppOtpApi(phone, enteredOtp);
      setIsLoading(false);
      if (res.success && res.verified) {
        onLoginSuccess({
          name: name || (tab === 'signup' ? 'New Customer' : 'Valued Customer'),
          email: emailSignup || `${phone}@unavukadai.express`,
          phone: '+91 ' + phone,
          authProvider: 'whatsapp',
          isVerified: true
        });
        onClose();
      } else {
        setOtpError(res.error || 'Incorrect OTP code. Tip: Use test code 1234');
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
          <h3>{tab === 'login' ? 'Welcome Back!' : 'Create Your Account'}</h3>
          <p className="auth-subtext">Instant login for fastest food delivery in South Chennai</p>
        </div>

        {/* Tab Switcher: Log In / Sign Up */}
        <div className="auth-tab-switch">
          <button 
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setOtpSent(false); setOtpError(''); }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setOtpSent(false); setOtpError(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Method Selector: Phone/WhatsApp vs Google */}
        <div className="auth-method-tabs">
          <button 
            type="button" 
            className={`auth-method-tab ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('phone'); setOtpError(''); }}
          >
            <Phone size={15} />
            <span>Mobile OTP</span>
            <span className="method-pill-live">WhatsApp</span>
          </button>
          <button 
            type="button" 
            className={`auth-method-tab ${authMethod === 'google' ? 'active' : ''}`}
            onClick={() => { setAuthMethod('google'); setOtpError(''); }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" className="google-icon-svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        {/* METHOD 1: Mobile Phone Number & Real WhatsApp OTP */}
        {authMethod === 'phone' && (
          <div className="auth-method-content animate-fade">
            {!otpSent ? (
              <form className="auth-form" onSubmit={handleSendOtp}>
                {tab === 'signup' && (
                  <div className="auth-input-group">
                    <label>Your Full Name</label>
                    <input 
                      type="text" 
                      className="auth-input-field"
                      placeholder="e.g. Raja Alexander" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                )}

                <div className="auth-input-group">
                  <div className="flex-between-label">
                    <label>WhatsApp Mobile Number</label>
                    <span className="whatsapp-gateway-badge">
                      <span className="whatsapp-dot-live"></span>
                      <span>Instant SMS &amp; WhatsApp</span>
                    </span>
                  </div>
                  <div className="phone-prefix-input">
                    <span className="country-code">+91</span>
                    <input 
                      type="tel" 
                      maxLength={10}
                      className="auth-input-field"
                      placeholder="Enter 10-digit number" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required
                      autoFocus={tab === 'login'}
                    />
                  </div>
                </div>

                {tab === 'signup' && (
                  <div className="auth-input-group">
                    <label>Email Address (Optional)</label>
                    <input 
                      type="email" 
                      className="auth-input-field"
                      placeholder="e.g. name@example.com" 
                      value={emailSignup}
                      onChange={(e) => setEmailSignup(e.target.value)}
                    />
                  </div>
                )}

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
                  <span>{isLoading ? 'Sending OTP Code...' : tab === 'signup' ? 'Create Account & Send OTP' : 'Send WhatsApp OTP Code'}</span>
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleVerifyOtp}>
                <div className="otp-sent-indicator whatsapp-indicator">
                  <CheckCircle size={16} className="icon-success" />
                  <span>Sent verification code to: <strong>+91 {phone}</strong></span>
                  <button 
                    type="button" 
                    className="edit-phone-link"
                    onClick={() => { setOtpSent(false); setOtpError(''); }}
                  >
                    Change
                  </button>
                </div>

                {/* 4-digit interactive OTP inputs */}
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

                {/* Test bypass helper chip */}
                <div className="test-otp-chip-row">
                  <button 
                    type="button" 
                    className="test-otp-chip-btn"
                    onClick={handleFillTestOtp}
                    title="Click to automatically fill bypass OTP code"
                  >
                    <Key size={13} />
                    <span>Test Bypass OTP: <strong>1234</strong> (Click to auto-fill)</span>
                  </button>
                </div>

                {otpError && (
                  <div className="auth-error-banner animate-fade">
                    <AlertCircle size={15} />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* Resend OTP */}
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
                      <span>Resend WhatsApp Code</span>
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={isLoading || otp.some(d => !d)}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* METHOD 2: Google & Gmail Sign-In */}
        {authMethod === 'google' && (
          <div className="google-auth-section animate-fade">
            {googleNotice && (
              <div className="google-notice-box animate-fade">
                <span className="notice-icon">💡</span>
                <span>{googleNotice}</span>
              </div>
            )}

            {/* Instant 1-Click Saved Google Profiles */}
            <div className="quick-google-accounts-box mb-3">
              <label className="quick-acc-label">⚡ 1-Click Fast Sign In:</label>
              
              <button 
                type="button"
                className="google-profile-quick-btn mb-2"
                onClick={() => handleGoogleSignInWithEmail('rajacofficial369@gmail.com', 'Raja Official')}
                disabled={isLoading}
              >
                <div className="google-quick-avatar bg-blue-subtle">
                  <span>👑</span>
                </div>
                <div className="google-quick-info">
                  <span className="google-quick-name">Raja Official (Master Admin)</span>
                  <span className="google-quick-email">rajacofficial369@gmail.com</span>
                </div>
                <span className="quick-signin-tag">Sign In ➔</span>
              </button>

              <button 
                type="button"
                className="google-profile-quick-btn"
                onClick={() => handleGoogleSignInWithEmail('alexanderrajac@gmail.com', 'Alexander Raja')}
                disabled={isLoading}
              >
                <div className="google-quick-avatar bg-purple-subtle">
                  <span>🍲</span>
                </div>
                <div className="google-quick-info">
                  <span className="google-quick-name">Alexander Raja (Foodie Customer)</span>
                  <span className="google-quick-email">alexanderrajac@gmail.com</span>
                </div>
                <span className="quick-signin-tag">Sign In ➔</span>
              </button>
            </div>

            {/* Official 1-Tap Google OAuth button */}
            <button 
              type="button" 
              className="btn-google-auth w-full mb-3"
              onClick={handleRealGoogleOAuth}
              disabled={isLoading}
            >
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
            </button>

            {/* Direct Any Gmail Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleGoogleSignInWithEmail(); }} className="google-signin-form-direct">
              <div className="auth-input-group mb-2">
                <label>Or Enter Any Google / Gmail Address:</label>
                <div className="gmail-input-wrap">
                  <Mail size={16} className="input-adornment" />
                  <input 
                    type="email" 
                    className="auth-input-field with-icon"
                    placeholder="Enter your Gmail address" 
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                  />
                </div>
              </div>

              {customEmail && customEmail.includes('@') && (
                <button 
                  type="submit" 
                  className="btn-primary w-full animate-fade"
                  disabled={isLoading}
                >
                  <span>Sign In as {customEmail}</span>
                </button>
              )}
            </form>
          </div>
        )}

        <div className="auth-terms">
          <p>
            By continuing, you agree to our <a href="#terms">Terms of Service</a> &amp; <a href="#privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
