import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { 
  signInWithGoogleOAuth, 
  signInWithEmailPassword, 
  signUpWithEmailPassword 
} from '../services/supabaseAuth';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  initialTab = 'login' 
}) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Sync tab when opened
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMessage('');
      setSuccessNotice('');
      setPassword('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // 1. Google OAuth Flow
  const handleGoogleOAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await signInWithGoogleOAuth();
      if (!res.success) {
        setErrorMessage(res.error || 'Google Sign-In failed to start.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to Google.');
      setIsLoading(false);
    }
  };

  // 2. Email & Password Form Submit (Login or Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const trimmedInput = emailOrPhone.trim();
    if (!trimmedInput) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Please enter a password with at least 6 characters.');
      return;
    }

    // Convert input to email format if phone was entered
    const isEmail = trimmedInput.includes('@');
    const effectiveEmail = isEmail 
      ? trimmedInput.toLowerCase() 
      : `${trimmedInput.replace(/\D/g, '')}@unavukadai.com`;

    const displayName = name.trim() || effectiveEmail.split('@')[0].replace(/[._]/g, ' ');

    setIsLoading(true);

    if (tab === 'signup') {
      try {
        const res = await signUpWithEmailPassword(effectiveEmail, password, {
          name: displayName,
          phone: !isEmail ? trimmedInput : ''
        });

        if (!res.success && !res.user) {
          setErrorMessage(res.error || 'Failed to sign up. Please try again.');
          setIsLoading(false);
          return;
        }

        setSuccessNotice('Account successfully created!');
        setTimeout(() => {
          onLoginSuccess({
            id: res.user?.id,
            name: displayName,
            email: effectiveEmail,
            phone: !isEmail ? trimmedInput : '',
            authProvider: isEmail ? 'email' : 'phone',
            isVerified: true
          });
          setIsLoading(false);
          onClose();
        }, 500);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to sign up. Please try again.');
        setIsLoading(false);
      }
    } else {
      // Login
      try {
        const res = await signInWithEmailPassword(effectiveEmail, password);
        
        if (!res.success) {
          setErrorMessage(res.error || 'Invalid email/phone or password. Please try again.');
          setIsLoading(false);
          return;
        }

        setSuccessNotice(`Welcome back, ${res.user?.user_metadata?.name || displayName}!`);
        setTimeout(() => {
          onLoginSuccess({
            id: res.user?.id,
            name: res.user?.user_metadata?.name || displayName,
            email: res.user?.email || effectiveEmail,
            phone: res.user?.user_metadata?.phone || '',
            authProvider: 'email',
            isVerified: true
          });
          setIsLoading(false);
          onClose();
        }, 400);
      } catch (err) {
        setErrorMessage(err.message || 'Login failed. Please check credentials.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="new-auth-modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          type="button" 
          className="new-auth-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Brand Header */}
        <div className="new-auth-header">
          <div className="new-auth-flame-wrapper">
            <span className="new-auth-flame">🍲</span>
          </div>
          <h2 className="new-auth-title">
            {tab === 'login' ? 'Welcome Back to Unavukadai' : 'Create Your Account'}
          </h2>
          <p className="new-auth-subtext">
            {tab === 'login' 
              ? 'Sign in to access your orders, live tracking, and profile' 
              : 'Join South Chennai’s favorite authentic hyperlocal food network'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="new-auth-tab-bar">
          <button 
            type="button" 
            className={`new-auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setErrorMessage(''); setSuccessNotice(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`new-auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setErrorMessage(''); setSuccessNotice(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Primary Action: Continue with Google */}
        <div className="new-auth-google-section">
          <button 
            type="button" 
            className="new-google-auth-btn" 
            onClick={handleGoogleOAuth}
            disabled={isLoading}
          >
            <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="new-auth-divider">
          <span>or sign in with credentials</span>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="new-auth-alert error animate-fade">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="new-auth-alert success animate-fade">
            <Check size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form className="new-auth-form" onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="new-input-group">
              <label>Full Name</label>
              <div className="new-input-wrapper">
                <User size={16} className="new-input-icon" />
                <input 
                  type="text" 
                  placeholder="e.g. Rishi Kumar" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="new-input-group">
            <label>{tab === 'signup' ? 'Email Address or Phone' : 'Email Address or Mobile'}</label>
            <div className="new-input-wrapper">
              <Mail size={16} className="new-input-icon" />
              <input 
                type="text" 
                placeholder="name@gmail.com or 9840123456" 
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="new-input-group">
            <div className="new-label-row">
              <label>Password</label>
            </div>
            <div className="new-input-wrapper">
              <Lock size={16} className="new-input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder={tab === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <button 
                type="button" 
                className="new-toggle-pw-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="new-auth-submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Terms Note */}
        <p className="new-auth-terms-note">
          By signing in, you agree to Unavukadai’s Terms of Service &amp; Privacy Policy. South Chennai Hyperlocal Food Delivery.
        </p>
      </div>
    </div>
  );
}
