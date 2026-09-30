import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Navigation, X, ShieldCheck, Share, PlusSquare, Zap, Smartphone } from 'lucide-react';

export default function PwaInstallBottomSheet() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed recently (24 hour cooldown)
    const dismissedUntil = localStorage.getItem('unavu_pwa_dismissed_until');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt on Chromium / Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show bottom sheet after brief delay
      setTimeout(() => {
        setIsVisible(true);
      }, 2500);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If on iOS and not standalone, show prompt after 4 seconds
    let iosTimer = null;
    if (isIosDevice) {
      iosTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosSteps(true);
    } else {
      // Generic fallback
      alert('To install Unavukadai: Tap your browser menu (⋮) and select "Add to Home Screen" or "Install App".');
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Snooze for 24 hours
    localStorage.setItem('unavu_pwa_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="pwa-bottom-sheet-overlay animate-fade" onClick={handleDismiss}>
      <div 
        className="pwa-bottom-sheet-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="pwa-sheet-close-btn" 
          onClick={handleDismiss}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="pwa-sheet-header">
          <div className="pwa-sheet-app-icon">
            <span className="pwa-icon-emoji">🍲</span>
            <span className="pwa-app-badge">FAST</span>
          </div>
          <div className="pwa-sheet-title-box">
            <div className="pwa-sheet-pill">
              <Sparkles size={12} className="text-yellow-400" />
              <span>OFFICIAL APP</span>
            </div>
            <h3 className="pwa-sheet-heading">Install Unavukadai App</h3>
            <p className="pwa-sheet-subheading">
              1-Tap Ordering &amp; Live Tracking across South Chennai
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pwa-perks-grid">
          <div className="pwa-perk-item">
            <div className="pwa-perk-icon bg-amber-subtle">
              <Zap size={16} className="text-amber" />
            </div>
            <div className="pwa-perk-text">
              <strong>1-Tap Home Screen Access</strong>
              <span>Loads instantly without typing URL</span>
            </div>
          </div>

          <div className="pwa-perk-item">
            <div className="pwa-perk-icon bg-blue-subtle">
              <Navigation size={16} className="text-blue" />
            </div>
            <div className="pwa-perk-text">
              <strong>Live GPS Rider Tracking</strong>
              <span>Follow captain on live map</span>
            </div>
          </div>

          <div className="pwa-perk-item">
            <div className="pwa-perk-icon bg-green-subtle">
              <Smartphone size={16} className="text-green" />
            </div>
            <div className="pwa-perk-text">
              <strong>WhatsApp PIN &amp; Offline Menus</strong>
              <span>Smooth ordering on suburban 4G/5G</span>
            </div>
          </div>
        </div>

        {/* iOS Step-by-Step Instructions if expanded */}
        {showIosSteps && (
          <div className="pwa-ios-instructions animate-scale">
            <div className="ios-step-row">
              <div className="ios-step-num">1</div>
              <div className="ios-step-desc">
                Tap the <Share size={15} className="inline-icon text-blue" /> <strong>Share</strong> button at bottom of Safari
              </div>
            </div>
            <div className="ios-step-row">
              <div className="ios-step-num">2</div>
              <div className="ios-step-desc">
                Scroll down and tap <PlusSquare size={15} className="inline-icon text-crimson" /> <strong>Add to Home Screen</strong>
              </div>
            </div>
            <div className="ios-step-row">
              <div className="ios-step-num">3</div>
              <div className="ios-step-desc">
                Tap <strong>Add</strong> in the top-right corner. Done! 🎉
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pwa-sheet-actions">
          <button 
            type="button"
            className="pwa-sheet-install-btn"
            onClick={handleInstallClick}
          >
            <Download size={18} />
            <span>{isIos && showIosSteps ? 'Follow Steps Above' : 'Install Unavukadai App'}</span>
          </button>
          
          <button 
            type="button"
            className="pwa-sheet-later-btn"
            onClick={handleDismiss}
          >
            <span>Maybe Later</span>
          </button>
        </div>

        <div className="pwa-sheet-footer-notice">
          <ShieldCheck size={12} className="text-green" />
          <span>No download required • 0 MB storage used • Safe &amp; Fast</span>
        </div>
      </div>
    </div>
  );
}
