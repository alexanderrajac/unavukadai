import React from 'react';
import { Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container footer-container">
        {/* Top brand header */}
        <div className="footer-top-row">
          <div className="footer-brand">
            <span className="footer-logo-emoji">🍲</span>
            <span className="footer-brand-title">unavukadai</span>
          </div>

          <div className="footer-selectors">
            <div className="footer-pill-selector">
              <span>🇮🇳 India</span>
            </div>
            <div className="footer-pill-selector">
              <Globe size={14} />
              <span>English</span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          <div className="footer-col">
            <h5 className="footer-col-title">ABOUT UNAVUKADAI</h5>
            <ul className="footer-links-list">
              <li><a href="#about">Who We Are</a></li>
              <li><a href="#blog">Food Stories & Blog</a></li>
              <li><a href="#careers">Work With Us</a></li>
              <li><a href="#investor">Investor Relations</a></li>
              <li><a href="#press">Press Kit</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">UNAVUVERSE</h5>
            <ul className="footer-links-list">
              <li><a href="#delivery">Unavukadai Delivery</a></li>
              <li><a href="#dining">Fine Dining Pass</a></li>
              <li><a href="#hyperpure">Fresh Ingredients Direct</a></li>
              <li><a href="#feeding">Feeding South India</a></li>
              <li><a href="#events">Food Festivals 2026</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">FOR RESTAURANTS</h5>
            <ul className="footer-links-list">
              <li><a href="#partner">Partner With Us</a></li>
              <li><a href="#merchant">Merchant Kitchen App</a></li>
              <li><a href="#enterprise">Enterprise Fleet</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">LEARN MORE</h5>
            <ul className="footer-links-list">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#security">Security & Safe Food</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#help">Help & 24x7 Support</a></li>
            </ul>
          </div>

          <div className="footer-col social-col">
            <h5 className="footer-col-title">EXPERIENCE ON MOBILE</h5>
            <div className="app-download-badges">
              <div className="store-badge">
                <span className="store-icon">🍏</span>
                <div>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </div>
              <div className="store-badge">
                <span className="store-icon">▶</span>
                <div>
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="footer-bottom-bar">
          <p>
            By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners.
          </p>
          <div className="footer-crafted-by">
            <span>© 2026 Unavukadai™ Ltd. Crafted with</span>
            <Heart size={14} className="icon-heart-fill" />
            <span>for authentic food lovers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
