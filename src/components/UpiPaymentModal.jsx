import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Banknote, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Clock
} from 'lucide-react';

export default function UpiPaymentModal({
  isOpen,
  onClose,
  grandTotal,
  _orderItems,
  _deliveryAddress,
  onPaymentConfirmed,
  upiId = '8248651695-3@ybl'
}) {
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi' | 'cod'
  const [copied, setCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const [previewOrderId] = useState(() => 'UNV-' + Math.floor(100000 + Math.random() * 900000));

  if (!isOpen) return null;

  const upiIntent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Unavukadai%20Food&am=${grandTotal}&cu=INR&tn=Order_${previewOrderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntent)}`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentConfirmed({
        paymentMethod: paymentMode === 'upi' ? 'UPI' : 'COD',
        paymentStatus: paymentMode === 'upi' ? 'PAID' : 'PENDING_ON_DELIVERY',
        orderId: previewOrderId
      });
    }, 1000);
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div 
        className="upi-modal-container animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-icon" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="upi-header">
          <div className="upi-badge-row">
            <span className="secure-badge">
              <ShieldCheck size={14} />
              <span>100% Secure Checkout</span>
            </span>
          </div>
          <h2>Choose Payment Method</h2>
          <div className="upi-total-highlight">
            <span className="total-caption">Total Amount to Pay</span>
            <strong className="total-num">₹{grandTotal}</strong>
          </div>
        </div>

        {/* Payment Mode Selector Tabs */}
        <div className="payment-mode-tabs">
          <button 
            className={`payment-mode-tab ${paymentMode === 'upi' ? 'active' : ''}`}
            onClick={() => setPaymentMode('upi')}
          >
            <Smartphone size={16} />
            <span>Instant UPI / QR</span>
            <span className="tab-rec-tag">Recommended</span>
          </button>

          <button 
            className={`payment-mode-tab ${paymentMode === 'cod' ? 'active' : ''}`}
            onClick={() => setPaymentMode('cod')}
          >
            <Banknote size={16} />
            <span>Pay on Delivery</span>
          </button>
        </div>

        {/* UPI View */}
        {paymentMode === 'upi' && (
          <div className="upi-content-body">
            <div className="qr-container-card">
              <div className="qr-timer-pill">
                <Clock size={13} />
                <span>QR expires in {formatTimer(timerSeconds)}</span>
              </div>

              {/* Dynamic QR Code */}
              <div className="qr-code-frame">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI Payment QR Code" 
                  className="qr-img" 
                  loading="eager"
                />
                <div className="qr-apps-icons">
                  <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>CRED</span> • <span>BHIM</span>
                </div>
              </div>

              <div className="qr-scan-instructions">
                <p>Scan with any UPI app on your mobile phone to pay ₹{grandTotal}</p>
              </div>

              {/* UPI ID Copy Field */}
              <div className="upi-id-copy-row">
                <span className="upi-id-label">UPI ID:</span>
                <strong className="upi-id-value">{upiId}</strong>
                <button 
                  className="btn-copy-upi" 
                  onClick={handleCopyUpi} 
                  title="Copy UPI ID"
                >
                  {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Direct mobile deep-link intent */}
              <a 
                href={upiIntent} 
                className="btn-open-upi-app"
              >
                <Smartphone size={15} />
                <span>Pay via UPI App Directly (Mobile Only)</span>
              </a>
            </div>
          </div>
        )}

        {/* COD View */}
        {paymentMode === 'cod' && (
          <div className="cod-content-body">
            <div className="cod-info-card">
              <div className="cod-icon-wrap">
                <Banknote size={32} className="text-green" />
              </div>
              <h3>Cash on Delivery (COD)</h3>
              <p>
                Pay <strong>₹{grandTotal}</strong> in cash or via UPI QR to our delivery partner upon food arrival at your doorstep.
              </p>
              <div className="cod-benefits">
                <span>✓ Exact change preferred</span>
                <span>✓ Digital UPI payment also accepted at doorstep</span>
              </div>
            </div>
          </div>
        )}

        {/* Final Confirmation CTA */}
        <div className="upi-modal-footer">
          <button 
            className="btn-confirm-payment"
            onClick={handleConfirm}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <div className="spinner-loader"></div>
            ) : (
              <>
                <span>{paymentMode === 'upi' ? 'I Have Completed Payment' : 'Confirm Order via COD'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
