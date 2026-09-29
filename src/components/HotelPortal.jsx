import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Store, ChefHat, Clock, CheckCircle, TrendingUp, UtensilsCrossed, Sparkles,
  MapPin, Volume2, Package, MessageCircle, Plus, Save, Check, Search, Filter,
  DollarSign, ArrowRight, Flame, Award, AlertCircle, X, Bell, Star, Users,
  BarChart2, Settings, HelpCircle, Tag, Gift, Eye, EyeOff, ChevronDown,
  ChevronRight, Phone, Mail, Truck, ShieldCheck, Download, FileText,
  ToggleLeft, ToggleRight, RefreshCw, Home, IndianRupee, Zap, Calendar,
  TrendingDown, Percent, Copy, CheckSquare, Power, Edit3, Trash2,
  MessageSquare, ThumbsUp, ThumbsDown, MoreVertical, Send, Loader2,
  LayoutGrid, List, ArrowUpRight, ArrowDownLeft, PieChart, Activity,
  BookOpen, ClipboardList, Coffee, Headphones, LogOut, Siren,
  Upload, Image as ImageIcon
} from 'lucide-react';
import { RESTAURANTS } from '../data/mockData';
import { compressImageFile } from '../utils/imageCompressor';

const DISH_PHOTO_PRESETS = [
  { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
  { label: 'Dosa & Tiffin', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80' },
  { label: 'Chicken & Grill', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=80' },
  { label: 'Parotta & Curry', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=80' },
  { label: 'Fried Rice', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80' },
  { label: 'Paneer / Veg', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80' }
];

// ── Audio chime ──────────────────────────────────────────────────────────────
function playKitchenChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.frequency.setValueAtTime(587.33, ctx.currentTime);
    o2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    [o1, o2].forEach(o => o.connect(g)); g.connect(ctx.destination);
    o1.start(); o1.stop(ctx.currentTime + 0.2);
    o2.start(ctx.currentTime + 0.15); o2.stop(ctx.currentTime + 0.7);
  } catch (e) {}
}

function getWhatsAppOrderUrl(order) {
  const items = order.items.map(i => `${i.quantity}x ${i.name}`).join('%0A- ');
  const msg = `*🔔 NEW ORDER %23${order.orderId}*%0A*Restaurant:* ${order.restaurantName}%0A*Customer:* ${order.customerName} (${order.customerPhone})%0A*Drop:* ${order.customerAddress || order.address} (${order.locality})%0A%0A*Dishes:*%0A- ${items}%0A%0A*Total:* ₹${order.grandTotal} (${order.paymentMethod || 'UPI'} - ${order.paymentStatus || 'PAID'})%0A${order.cookingNote ? `*Note:* ${order.cookingNote}` : ''}`;
  return `https://wa.me/?text=${msg}`;
}

// ── Static data for new modules ───────────────────────────────────────────────
const MOCK_REVIEWS = [
  { id: 'r1', customer: 'Priya S.', rating: 5, text: 'Absolutely loved the biryani! Very authentic taste.', dish: 'Chicken Biryani', time: '2 hours ago', replied: false },
  { id: 'r2', customer: 'Karthik R.', rating: 4, text: 'Good food, slightly delayed delivery but worth the wait.', dish: 'Mutton Curry', time: '5 hours ago', replied: true, reply: 'Thank you Karthik! We are working on faster prep times.' },
  { id: 'r3', customer: 'Anitha M.', rating: 5, text: 'Best dosa in Perungalathur area hands down!', dish: 'Masala Dosa', time: 'Yesterday', replied: false },
  { id: 'r4', customer: 'Surya K.', rating: 3, text: 'Quantity was a bit less for the price. Taste was good.', dish: 'Parotta + Kurma', time: '2 days ago', replied: false },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'ORDER', title: 'New Order Received!', body: 'Order #UK-5821 — Chicken Biryani × 2', time: '2 min ago', unread: true },
  { id: 'n2', type: 'PAYMENT', title: 'Payout Credited', body: '₹2,340 settled to your bank account', time: '1 hour ago', unread: true },
  { id: 'n3', type: 'STOCK', title: 'Low Stock Alert', body: 'Mutton Pepper Fry is almost out of stock', time: '3 hours ago', unread: false },
  { id: 'n4', type: 'RIDER', title: 'Rider Arrived', body: 'Murugan is at your kitchen for pickup', time: '5 hours ago', unread: false },
  { id: 'n5', type: 'OFFER', title: 'Offer Expiring Soon', body: '20% Weekend Special ends in 4 hours', time: '6 hours ago', unread: false },
];

const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Priya S.', phone: '+91 98401 11111', orders: 8, spent: 1840, last: '2 days ago', repeat: true },
  { id: 'c2', name: 'Karthik R.', phone: '+91 98401 22222', orders: 5, spent: 1100, last: '5 days ago', repeat: true },
  { id: 'c3', name: 'Anitha M.', phone: '+91 98401 33333', orders: 12, spent: 2760, last: 'Yesterday', repeat: true },
  { id: 'c4', name: 'Surya K.', phone: '+91 98401 44444', orders: 2, spent: 480, last: '1 week ago', repeat: false },
  { id: 'c5', name: 'Deepa N.', phone: '+91 98401 55555', orders: 3, spent: 640, last: '3 days ago', repeat: false },
];

const MOCK_PAYOUTS = [
  { id: 'p1', date: '27 Sep 2026', orders: 18, gross: 4320, commission: 648, net: 3672, status: 'SETTLED' },
  { id: 'p2', date: '26 Sep 2026', orders: 14, gross: 3150, commission: 472, net: 2678, status: 'SETTLED' },
  { id: 'p3', date: '25 Sep 2026', orders: 21, gross: 4900, commission: 735, net: 4165, status: 'SETTLED' },
  { id: 'p4', date: '28 Sep 2026', orders: 7, gross: 1680, commission: 252, net: 1428, status: 'PENDING' },
];

const MOCK_OFFERS = [
  { id: 'o1', title: '20% Weekend Special', type: 'PERCENT', value: 20, minOrder: 200, active: true, expiry: '30 Sep 2026' },
  { id: 'o2', title: 'Buy 1 Get 1 Biryani', type: 'BOGO', value: 0, minOrder: 0, active: false, expiry: '29 Sep 2026' },
  { id: 'o3', title: 'First Order ₹50 Off', type: 'FLAT', value: 50, minOrder: 150, active: true, expiry: '31 Oct 2026' },
];

const SUPPORT_TOPICS = ['Order problem', 'Payment issue', 'Rider issue', 'Customer complaint', 'Menu update request', 'Account issue', 'Technical problem'];

export default function HotelPortal({
  orders,
  onUpdateOrderStatus,
  onSimulateNewOrder,
  onToggleItemStock,
  restaurantStock = {},
  restaurantsList = RESTAURANTS,
  onAddMenuItem,
  onUpdateMenuItemPrice,
  onUpdateRestaurantDetails
}) {
  // ── Core State ─────────────────────────────────────────────────────────────
  const [selectedHotelId, setSelectedHotelId] = useState(restaurantsList[0]?.id || 'res-perungalathur-1');
  const [activeTab, setActiveTab] = useState('dashboard');
  const currentHotel = restaurantsList.find(r => r.id === selectedHotelId) || restaurantsList[0];
  const [isOpen, setIsOpen] = useState(() => currentHotel?.isOpen !== false && !currentHotel?.isClosed);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const prevOrderCountRef = useRef(0);

  useEffect(() => {
    if (currentHotel) {
      setIsOpen(currentHotel.isOpen !== false && !currentHotel.isClosed);
    }
  }, [currentHotel?.id, currentHotel?.isOpen, currentHotel?.isClosed]);

  const handleToggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (onUpdateRestaurantDetails && currentHotel) {
      onUpdateRestaurantDetails(currentHotel.id, {
        isOpen: nextOpen,
        isClosed: !nextOpen
      });
    }
  };

  // ── Order buckets ──────────────────────────────────────────────────────────
  const hotelOrders = orders.filter(o => o.restaurantId === selectedHotelId);
  const activeKOTs = hotelOrders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status));
  const newOrders = activeKOTs.filter(o => o.status === 'PLACED');
  const preparingOrders = activeKOTs.filter(o => o.status === 'PREPARING');
  const readyOrders = activeKOTs.filter(o => o.status === 'READY_FOR_PICKUP');
  const completedOrders = hotelOrders.filter(o => o.status === 'DELIVERED');
  const totalRevenue = completedOrders.reduce((a, o) => a + (o.itemTotal || 0), 0);

  // ── Menu State ─────────────────────────────────────────────────────────────
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('ALL');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [dishForm, setDishForm] = useState({ name: '', price: '', offerPrice: '', category: 'Biryani & Rice', isVeg: false, desc: '', prepTime: '15', tags: '', image: '' });
  const [priceEdits, setPriceEdits] = useState({});
  const [dishSuccessMsg, setDishSuccessMsg] = useState('');
  const dishFileInputRef = useRef(null);

  const handleDishPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 800, 800, 0.75);
      if (compressed) {
        setDishForm(prev => ({ ...prev, image: compressed }));
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDishForm(prev => ({ ...prev, image: event.target.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Profile State ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: currentHotel.name || '',
    address: currentHotel.address || '',
    region: currentHotel.region || 'Perungalathur',
    phone: currentHotel.phone || '+91 98401 22222',
    cuisine: currentHotel.cuisine || 'South Indian',
    costForTwo: currentHotel.costForTwo || 400,
    deliveryMins: currentHotel.deliveryTimeMins || 25,
    minOrder: 100,
    lat: currentHotel.coords?.[0] || 12.9056,
    lng: currentHotel.coords?.[1] || 80.0832,
    openTime: '08:00', closeTime: '22:00',
    desc: 'Authentic South Indian cuisine cooked fresh daily.',
  });
  const [locationMsg, setLocationMsg] = useState('');

  // ── Reviews State ──────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  // ── Notifications State ────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => n.unread).length;

  // ── Offers State ───────────────────────────────────────────────────────────
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', type: 'PERCENT', value: '', minOrder: '', expiry: '' });

  // ── Support State ──────────────────────────────────────────────────────────
  const [supportTicket, setSupportTicket] = useState({ topic: '', message: '' });
  const [ticketSent, setTicketSent] = useState(false);

  // ── Order filter/search ────────────────────────────────────────────────────
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // ── Kitchen Display view ───────────────────────────────────────────────────
  const [kitchenView, setKitchenView] = useState('grid');

  // ── Sync profile when hotel changes ───────────────────────────────────────
  useEffect(() => {
    setProfileForm(f => ({
      ...f,
      name: currentHotel.name || '',
      address: currentHotel.address || '',
      region: currentHotel.region || 'Perungalathur',
      costForTwo: currentHotel.costForTwo || 400,
      deliveryMins: currentHotel.deliveryTimeMins || 25,
      lat: currentHotel.coords?.[0] || 12.9056,
      lng: currentHotel.coords?.[1] || 80.0832,
    }));
  }, [currentHotel]);

  // ── New order audio alert ──────────────────────────────────────────────────
  useEffect(() => {
    if (isAudioUnlocked && activeKOTs.length > prevOrderCountRef.current) {
      playKitchenChime();
      setNotifications(prev => [{
        id: `n-${Date.now()}`, type: 'ORDER',
        title: 'New Order Received!',
        body: `Order #${activeKOTs[activeKOTs.length - 1]?.orderId}`,
        time: 'Just now', unread: true
      }, ...prev]);
    }
    prevOrderCountRef.current = activeKOTs.length;
  }, [activeKOTs.length, isAudioUnlocked]);

  // ── Menu helpers ───────────────────────────────────────────────────────────
  const menuCategories = useMemo(() => {
    const s = new Set();
    currentHotel.menu?.forEach(m => m.category && s.add(m.category));
    return ['ALL', ...Array.from(s)];
  }, [currentHotel]);

  const filteredMenuItems = useMemo(() => (currentHotel.menu || []).filter(item => {
    const mc = selectedMenuCategory === 'ALL' || item.category === selectedMenuCategory;
    const ms = !menuSearchQuery.trim() || item.name.toLowerCase().includes(menuSearchQuery.toLowerCase());
    return mc && ms;
  }), [currentHotel, selectedMenuCategory, menuSearchQuery]);

  const handleAddDish = (e) => {
    e.preventDefault();
    if (!dishForm.name.trim() || !dishForm.price) return;
    if (onAddMenuItem) onAddMenuItem(currentHotel.id, { 
      name: dishForm.name.trim(), 
      price: Number(dishForm.price), 
      category: dishForm.category, 
      isVeg: dishForm.isVeg, 
      image: dishForm.image || DISH_PHOTO_PRESETS[0].url,
      description: dishForm.desc.trim() || `${dishForm.name} freshly prepared.` 
    });
    setDishForm({ name: '', price: '', offerPrice: '', category: 'Biryani & Rice', isVeg: false, desc: '', prepTime: '15', tags: '', image: '' });
    setShowAddDishModal(false);
    setDishSuccessMsg(`🎉 "${dishForm.name}" published to menu!`);
    setTimeout(() => setDishSuccessMsg(''), 4000);
  };

  const handleNudgePrice = (item, delta) => {
    const cur = priceEdits[item.id] !== undefined ? Number(priceEdits[item.id]) : item.price;
    const next = Math.max(10, cur + delta);
    setPriceEdits(p => ({ ...p, [item.id]: next }));
    if (onUpdateMenuItemPrice) onUpdateMenuItemPrice(currentHotel.id, item.id, next);
  };

  const handleSavePrice = (itemId) => {
    const p = priceEdits[itemId];
    if (!p || isNaN(p)) return;
    if (onUpdateMenuItemPrice) onUpdateMenuItemPrice(currentHotel.id, itemId, Number(p));
    setPriceEdits(prev => { const c = { ...prev }; delete c[itemId]; return c; });
    setDishSuccessMsg(`✅ Price updated to ₹${p}`);
    setTimeout(() => setDishSuccessMsg(''), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateRestaurantDetails) onUpdateRestaurantDetails(currentHotel.id, { name: profileForm.name, address: profileForm.address, region: profileForm.region, costForTwo: Number(profileForm.costForTwo), deliveryTimeMins: Number(profileForm.deliveryMins), coords: [Number(profileForm.lat), Number(profileForm.lng)] });
    setLocationMsg(`✅ ${profileForm.name} profile updated!`);
    setTimeout(() => setLocationMsg(''), 4000);
  };

  const handleReplyReview = (id) => {
    if (!replyText[id]?.trim()) return;
    setReviews(prev => prev.map(r => r.id === id ? { ...r, replied: true, reply: replyText[id] } : r));
    setReplyText(p => ({ ...p, [id]: '' }));
    setReplyingTo(null);
  };

  const filteredOrders = useMemo(() => {
    let list = hotelOrders;
    if (orderFilter !== 'ALL') list = list.filter(o => o.status === orderFilter);
    if (orderSearch.trim()) list = list.filter(o => o.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()));
    return list.sort((a, b) => (b.placedAt > a.placedAt ? 1 : -1));
  }, [hotelOrders, orderFilter, orderSearch]);

  const avgOrderValue = completedOrders.length ? Math.round(totalRevenue / completedOrders.length) : 0;
  const bestSelling = useMemo(() => {
    const map = {};
    hotelOrders.forEach(o => o.items?.forEach(i => { map[i.name] = (map[i.name] || 0) + i.quantity; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [hotelOrders]);

  const TABS = [
    { id: 'dashboard', icon: <Home size={18}/>, label: 'Home' },
    { id: 'orders', icon: <Package size={18}/>, label: 'Orders', badge: newOrders.length || null },
    { id: 'kitchen', icon: <ChefHat size={18}/>, label: 'Kitchen', badge: activeKOTs.length || null },
    { id: 'menu', icon: <UtensilsCrossed size={18}/>, label: 'Menu' },
    { id: 'finance', icon: <IndianRupee size={18}/>, label: 'Finance' },
    { id: 'offers', icon: <Gift size={18}/>, label: 'Offers' },
    { id: 'reviews', icon: <Star size={18}/>, label: 'Reviews' },
    { id: 'customers', icon: <Users size={18}/>, label: 'Customers' },
    { id: 'analytics', icon: <BarChart2 size={18}/>, label: 'Analytics' },
    { id: 'notifications', icon: <Bell size={18}/>, label: 'Alerts', badge: unreadCount || null },
    { id: 'support', icon: <Headphones size={18}/>, label: 'Support' },
    { id: 'profile', icon: <Store size={18}/>, label: 'Profile' },
    { id: 'settings', icon: <Settings size={18}/>, label: 'Settings' },
  ];

  // ── STATUS BADGE helper ───────────────────────────────────────────────────
  const statusColor = (s) => ({
    PLACED: '#f97316', PREPARING: '#3b82f6', READY_FOR_PICKUP: '#8b5cf6',
    OUT_FOR_DELIVERY: '#10b981', DELIVERED: '#22c55e', CANCELLED: '#ef4444'
  }[s] || '#64748b');

  return (
    <div className={`mp-shell ${darkMode ? 'mp-dark' : 'mp-light'}`}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mp-header">
        <div className="mp-header-left">
          <div className="mp-brand-dot"/>
          <div>
            <div className="mp-brand-name">{currentHotel.name}</div>
            <div className="mp-brand-sub">⭐ {currentHotel.rating} · {currentHotel.region}</div>
          </div>
        </div>
        <div className="mp-header-right">
          {/* Open/Closed toggle */}
          <button className={`mp-open-toggle ${isOpen ? 'open' : 'closed'}`} onClick={handleToggleOpen}>
            <Power size={14}/>
            <span>{isOpen ? 'Open' : 'Closed'}</span>
          </button>
          {/* Audio */}
          <button className={`mp-icon-btn ${isAudioUnlocked ? 'active' : ''}`} title="Kitchen audio" onClick={() => { playKitchenChime(); setIsAudioUnlocked(true); }}>
            <Volume2 size={17}/>
          </button>
          {/* Notifications bell */}
          <button className="mp-icon-btn notify-btn" onClick={() => setActiveTab('notifications')}>
            <Bell size={17}/>
            {unreadCount > 0 && <span className="mp-notify-dot">{unreadCount}</span>}
          </button>
          {/* Simulate order */}
          <button className="mp-sim-btn" onClick={() => { onSimulateNewOrder(currentHotel); if (isAudioUnlocked) playKitchenChime(); }}>
            <Sparkles size={14}/> Test Order
          </button>
          {/* Outlet selector */}
          <select className="mp-outlet-select" value={selectedHotelId} onChange={e => setSelectedHotelId(e.target.value)}>
            {restaurantsList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────────────── */}
      <div className="mp-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`mp-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon}
            <span>{t.label}</span>
            {t.badge ? <span className="mp-tab-badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* ── Success Toast ─────────────────────────────────────────────────────── */}
      {(dishSuccessMsg || locationMsg) && (
        <div className="mp-toast animate-fade">{dishSuccessMsg || locationMsg}</div>
      )}

      <div className="mp-content">

        {/* ════════════════════════════════════════════════════════════════════
            1. DASHBOARD
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="mp-dashboard">
            {/* Status hero */}
            <div className={`mp-status-hero ${isOpen ? 'hero-open' : 'hero-closed'}`}>
              <div>
                <div className="mp-status-label">{isOpen ? '🟢 Restaurant Open' : '🔴 Restaurant Closed'}</div>
                <div className="mp-status-name">{currentHotel.name}</div>
                <div className="mp-status-sub">{currentHotel.address} · {profileForm.openTime} – {profileForm.closeTime}</div>
              </div>
              <button className={`mp-toggle-large ${isOpen ? 'open' : 'closed'}`} onClick={handleToggleOpen}>
                <Power size={20}/>
                <span>{isOpen ? 'Close Restaurant' : 'Open Restaurant'}</span>
              </button>
            </div>

            {/* KPI grid */}
            <div className="mp-kpi-grid">
              {[
                { label: "Today's Revenue", value: `₹${totalRevenue}`, sub: `${completedOrders.length} orders`, color: 'green', icon: <IndianRupee size={20}/> },
                { label: 'Active Orders', value: activeKOTs.length, sub: `${newOrders.length} new · ${preparingOrders.length} cooking`, color: 'orange', icon: <ChefHat size={20}/> },
                { label: 'Ready for Pickup', value: readyOrders.length, sub: 'Awaiting rider', color: 'purple', icon: <Package size={20}/> },
                { label: 'Avg Order Value', value: `₹${avgOrderValue || 0}`, sub: 'Today', color: 'blue', icon: <TrendingUp size={20}/> },
              ].map(k => (
                <div key={k.label} className={`mp-kpi-card kpi-${k.color}`}>
                  <div className={`mp-kpi-icon ${k.color}`}>{k.icon}</div>
                  <div>
                    <div className="mp-kpi-val">{k.value}</div>
                    <div className="mp-kpi-label">{k.label}</div>
                    <div className="mp-kpi-sub">{k.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mp-quick-actions">
              <div className="mp-section-title">Quick Actions</div>
              <div className="mp-qa-grid">
                {[
                  { label: 'View Orders', icon: <Package size={18}/>, tab: 'orders', badge: activeKOTs.length },
                  { label: 'Kitchen Display', icon: <ChefHat size={18}/>, tab: 'kitchen' },
                  { label: 'Edit Menu', icon: <UtensilsCrossed size={18}/>, tab: 'menu' },
                  { label: 'Finance', icon: <IndianRupee size={18}/>, tab: 'finance' },
                  { label: 'Offers', icon: <Gift size={18}/>, tab: 'offers' },
                  { label: 'Analytics', icon: <BarChart2 size={18}/>, tab: 'analytics' },
                ].map(qa => (
                  <button key={qa.label} className="mp-qa-card" onClick={() => setActiveTab(qa.tab)}>
                    <div className="mp-qa-icon">{qa.icon}</div>
                    <span>{qa.label}</span>
                    {qa.badge > 0 && <span className="mp-qa-badge">{qa.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent orders preview */}
            <div className="mp-section-title" style={{ padding: '0 16px', marginTop: 16 }}>Recent Orders</div>
            <div className="mp-recent-orders">
              {activeKOTs.slice(0, 4).length === 0 ? (
                <div className="mp-empty-state"><ChefHat size={36}/><p>No active orders. Tap "Test Order" to simulate one.</p></div>
              ) : activeKOTs.slice(0, 4).map(o => (
                <div key={o.orderId} className="mp-recent-row" onClick={() => setActiveTab('orders')}>
                  <div className="mp-recent-left">
                    <div className="mp-recent-id">#{o.orderId}</div>
                    <div className="mp-recent-cust">{o.customerName} · {o.items?.length} items</div>
                  </div>
                  <div className="mp-recent-right">
                    <span className="mp-status-pill" style={{ background: statusColor(o.status) + '22', color: statusColor(o.status) }}>{o.status.replace(/_/g, ' ')}</span>
                    <div className="mp-recent-amt">₹{o.grandTotal}</div>
                  </div>
                </div>
              ))}
              {activeKOTs.length > 4 && (
                <button className="mp-view-all-btn" onClick={() => setActiveTab('orders')}>View all {activeKOTs.length} orders →</button>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            2. ORDER MANAGEMENT
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="mp-orders-page">
            <div className="mp-orders-toolbar">
              <div className="mp-search-wrap">
                <Search size={15} className="mp-search-icon"/>
                <input className="mp-search-input" placeholder="Search order ID or customer..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)}/>
              </div>
              <div className="mp-filter-chips">
                {['ALL','PLACED','PREPARING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(f => (
                  <button key={f} className={`mp-filter-chip ${orderFilter === f ? 'active' : ''}`} onClick={() => setOrderFilter(f)}>
                    {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
                    {f === 'PLACED' && newOrders.length > 0 && <span className="mp-chip-badge">{newOrders.length}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mp-order-pipeline">
              {/* Pipeline stats */}
              <div className="mp-pipeline-bar">
                {[['New', newOrders.length, '#f97316'], ['Cooking', preparingOrders.length, '#3b82f6'], ['Ready', readyOrders.length, '#8b5cf6'], ['Done', completedOrders.length, '#22c55e']].map(([l, v, c]) => (
                  <div key={l} className="mp-pipe-stat" style={{ borderTop: `3px solid ${c}` }}>
                    <div className="mp-pipe-val" style={{ color: c }}>{v}</div>
                    <div className="mp-pipe-label">{l}</div>
                  </div>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="mp-empty-state"><Package size={40}/><p>No orders match your filter.</p></div>
              ) : (
                <div className="mp-order-cards">
                  {filteredOrders.map(order => {
                    const s = order.status;
                    const color = statusColor(s);
                    return (
                      <div key={order.orderId} className="mp-order-card" style={{ borderLeft: `4px solid ${color}` }}>
                        {/* Card Header */}
                        <div className="mp-oc-header">
                          <div className="mp-oc-left">
                            <div className="mp-oc-id">#{order.orderId}</div>
                            <div className="mp-oc-time">{order.placedAt}</div>
                          </div>
                          <div className="mp-oc-right">
                            <span className="mp-status-pill" style={{ background: color + '22', color }}>{s.replace(/_/g,' ')}</span>
                            <div className="mp-oc-amount">₹{order.grandTotal}</div>
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="mp-oc-customer">
                          <div><strong>{order.customerName}</strong> · <span>{order.customerPhone}</span></div>
                          <div className="mp-oc-addr"><MapPin size={11}/> {order.customerAddress || order.address} ({order.locality})</div>
                        </div>

                        {/* Items */}
                        <div className="mp-oc-items">
                          {order.items.map((item, i) => (
                            <div key={i} className="mp-oc-item-row">
                              <span className="mp-oc-qty">{item.quantity}×</span>
                              <span className="mp-oc-iname">{item.name}</span>
                              <span className="mp-oc-iprice">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Payment + note */}
                        <div className="mp-oc-meta">
                          <span className="mp-pay-badge">{order.paymentMethod || 'UPI'} · {order.paymentStatus || 'PAID'}</span>
                          {order.cookingNote && <span className="mp-note-badge">📝 {order.cookingNote}</span>}
                          {order.riderName && <span className="mp-rider-badge">🛵 {order.riderName}</span>}
                        </div>

                        {/* Actions */}
                        <div className="mp-oc-actions">
                          {s === 'PLACED' && (<>
                            <button className="mp-btn-accept" onClick={() => onUpdateOrderStatus(order.orderId, 'PREPARING')}>
                              <CheckCircle size={15}/> Accept & Cook
                            </button>
                            <button className="mp-btn-reject" onClick={() => setRejecting(order.orderId)}>
                              <X size={15}/> Reject
                            </button>
                          </>)}
                          {s === 'PREPARING' && (
                            <button className="mp-btn-ready" onClick={() => onUpdateOrderStatus(order.orderId, 'READY_FOR_PICKUP')}>
                              <CheckCircle size={15}/> Mark Ready
                            </button>
                          )}
                          {s === 'READY_FOR_PICKUP' && (
                            <>
                              <div className="mp-waiting-rider"><Clock size={14}/> Awaiting rider pickup</div>
                              <button 
                                className="mp-btn-accept" 
                                style={{ background: '#2563eb', borderColor: '#2563eb' }}
                                onClick={() => onUpdateOrderStatus(order.orderId, 'OUT_FOR_DELIVERY', { riderName: order.riderName || 'Express Dispatch' })}
                                title="Dispatch order with rider or hotel runner"
                              >
                                <Truck size={14}/> Dispatch Order
                              </button>
                            </>
                          )}
                          {s === 'OUT_FOR_DELIVERY' && (
                            <>
                              <div className="mp-out-badge"><Truck size={14}/> {order.riderName || 'Rider'} delivering</div>
                              <button 
                                className="mp-btn-ready" 
                                style={{ background: '#059669', borderColor: '#059669' }}
                                onClick={() => onUpdateOrderStatus(order.orderId, 'DELIVERED')}
                                title="Mark order as delivered"
                              >
                                <CheckCircle size={14}/> Mark Delivered
                              </button>
                            </>
                          )}
                          <a href={getWhatsAppOrderUrl(order)} target="_blank" rel="noopener noreferrer" className="mp-btn-wa">
                            <MessageCircle size={14}/> WhatsApp Slip
                          </a>
                          {order.customerPhone && (
                            <a href={`tel:${order.customerPhone.replace(/\s+/g,'')}`} className="mp-btn-call">
                              <Phone size={14}/> Call
                            </a>
                          )}
                        </div>

                        {/* Reject reason modal inline */}
                        {rejecting === order.orderId && (
                          <div className="mp-reject-box">
                            <select className="mp-reject-select" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                              <option value="">Select reason…</option>
                              <option>Item not available</option>
                              <option>Kitchen closed</option>
                              <option>Too many orders</option>
                              <option>Delivery area unavailable</option>
                              <option>Other</option>
                            </select>
                            <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                              <button className="mp-btn-cancel" onClick={() => setRejecting(null)}>Cancel</button>
                              <button className="mp-btn-confirm-reject" onClick={() => { onUpdateOrderStatus(order.orderId, 'CANCELLED'); setRejecting(null); setRejectReason(''); }}>
                                Confirm Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            3. KITCHEN DISPLAY
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'kitchen' && (
          <div className="mp-kitchen">
            <div className="mp-kitchen-header">
              <div className="mp-kitchen-title">🍳 Kitchen Display System</div>
              <div className="mp-kitchen-controls">
                <button className={`mp-kds-view-btn ${kitchenView === 'grid' ? 'active' : ''}`} onClick={() => setKitchenView('grid')}><LayoutGrid size={15}/></button>
                <button className={`mp-kds-view-btn ${kitchenView === 'list' ? 'active' : ''}`} onClick={() => setKitchenView('list')}><List size={15}/></button>
              </div>
            </div>

            <div className="mp-kds-columns">
              {/* NEW */}
              <div className="mp-kds-col new">
                <div className="mp-kds-col-header"><Bell size={16}/> NEW ({newOrders.length})</div>
                {newOrders.length === 0 ? <div className="mp-kds-empty">No new orders</div> : newOrders.map(o => (
                  <div key={o.orderId} className="mp-kds-card new">
                    <div className="mp-kds-id">#{o.orderId}</div>
                    <div className="mp-kds-time"><Clock size={12}/> {o.placedAt}</div>
                    <div className="mp-kds-items">
                      {o.items.map((it, i) => <div key={i} className="mp-kds-item"><strong>{it.quantity}×</strong> {it.name}</div>)}
                    </div>
                    {o.cookingNote && <div className="mp-kds-note">⚠️ {o.cookingNote}</div>}
                    <button className="mp-kds-action-btn accept" onClick={() => onUpdateOrderStatus(o.orderId, 'PREPARING')}>
                      ✓ Start Cooking
                    </button>
                  </div>
                ))}
              </div>

              {/* PREPARING */}
              <div className="mp-kds-col preparing">
                <div className="mp-kds-col-header"><Flame size={16}/> PREPARING ({preparingOrders.length})</div>
                {preparingOrders.length === 0 ? <div className="mp-kds-empty">Nothing cooking</div> : preparingOrders.map(o => (
                  <div key={o.orderId} className="mp-kds-card preparing">
                    <div className="mp-kds-id">#{o.orderId}</div>
                    <div className="mp-kds-time"><Clock size={12}/> {o.placedAt}</div>
                    <div className="mp-kds-items">
                      {o.items.map((it, i) => <div key={i} className="mp-kds-item"><strong>{it.quantity}×</strong> {it.name}</div>)}
                    </div>
                    {o.cookingNote && <div className="mp-kds-note">⚠️ {o.cookingNote}</div>}
                    <button className="mp-kds-action-btn ready" onClick={() => onUpdateOrderStatus(o.orderId, 'READY_FOR_PICKUP')}>
                      ✓ Mark Ready
                    </button>
                  </div>
                ))}
              </div>

              {/* READY */}
              <div className="mp-kds-col ready">
                <div className="mp-kds-col-header"><Package size={16}/> READY ({readyOrders.length})</div>
                {readyOrders.length === 0 ? <div className="mp-kds-empty">Nothing ready yet</div> : readyOrders.map(o => (
                  <div key={o.orderId} className="mp-kds-card ready">
                    <div className="mp-kds-id">#{o.orderId}</div>
                    <div className="mp-kds-time"><Clock size={12}/> {o.placedAt}</div>
                    <div className="mp-kds-items">
                      {o.items.map((it, i) => <div key={i} className="mp-kds-item"><strong>{it.quantity}×</strong> {it.name}</div>)}
                    </div>
                    <div className="mp-kds-waiting"><Truck size={13}/> Awaiting rider…</div>
                    <button 
                      className="mp-kds-action-btn ready" 
                      style={{ marginTop: '8px', background: '#2563eb' }}
                      onClick={() => onUpdateOrderStatus(o.orderId, 'OUT_FOR_DELIVERY', { riderName: o.riderName || 'Express Dispatch' })}
                    >
                      ✓ Dispatch Trip
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            4. MENU MANAGEMENT
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'menu' && (
          <div className="mp-menu-page">
            <div className="mp-menu-toolbar">
              <div className="mp-search-wrap">
                <Search size={15} className="mp-search-icon"/>
                <input className="mp-search-input" placeholder="Search dishes..." value={menuSearchQuery} onChange={e => setMenuSearchQuery(e.target.value)}/>
              </div>
              <button className="mp-btn-add-dish" onClick={() => setShowAddDishModal(true)}>
                <Plus size={16}/> Add Dish
              </button>
            </div>

            <div className="mp-cat-pills">
              {menuCategories.map(c => (
                <button key={c} className={`mp-cat-pill ${selectedMenuCategory === c ? 'active' : ''}`} onClick={() => setSelectedMenuCategory(c)}>{c}</button>
              ))}
            </div>

            {/* Add Dish Modal */}
            {showAddDishModal && (
              <div className="modal-backdrop animate-fade" onClick={() => setShowAddDishModal(false)}>
                <div className="collect-otp-modal animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                  <button className="modal-close-icon" onClick={() => setShowAddDishModal(false)}><X size={20}/></button>
                  <div className="collect-otp-header">
                    <div className="collect-otp-icon-wrap"><UtensilsCrossed size={26} className="icon-crimson"/></div>
                    <h3>Add New Dish</h3>
                    <p className="collect-otp-subtitle">Add to {currentHotel.name}'s live menu</p>
                  </div>
                  <form onSubmit={handleAddDish} className="collect-otp-form">
                    <div className="form-group mb-2">
                      <label className="field-label-bold">Dish Name *</label>
                      <input className="styled-input" placeholder="e.g. Masala Dosa" value={dishForm.name} onChange={e => setDishForm(f => ({...f, name: e.target.value}))} required autoFocus/>
                    </div>
                    <div className="form-grid-2col mb-2">
                      <div>
                        <label className="field-label-bold">Price (₹) *</label>
                        <input className="styled-input" type="number" min={1} placeholder="120" value={dishForm.price} onChange={e => setDishForm(f => ({...f, price: e.target.value}))} required/>
                      </div>
                      <div>
                        <label className="field-label-bold">Offer Price (₹)</label>
                        <input className="styled-input" type="number" min={1} placeholder="Optional" value={dishForm.offerPrice} onChange={e => setDishForm(f => ({...f, offerPrice: e.target.value}))}/>
                      </div>
                    </div>
                    <div className="form-grid-2col mb-2">
                      <div>
                        <label className="field-label-bold">Category</label>
                        <select className="styled-input" value={dishForm.category} onChange={e => setDishForm(f => ({...f, category: e.target.value}))}>
                          {['Biryani & Rice','Starters & Appetizers','South Indian Meals','Tiffin & Dosa','Chinese & Rolls','Beverages & Desserts','Parotta & Curries','Soups & Salads'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="field-label-bold">Prep Time (min)</label>
                        <input className="styled-input" type="number" min={1} value={dishForm.prepTime} onChange={e => setDishForm(f => ({...f, prepTime: e.target.value}))}/>
                      </div>
                    </div>
                    <div className="form-group mb-2">
                      <label className="field-label-bold">Diet Type</label>
                      <div style={{ display:'flex', gap:16, marginTop:6 }}>
                        {[['🥬 Vegetarian', true], ['🍗 Non-Veg', false]].map(([l, v]) => (
                          <label key={l} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:600 }}>
                            <input type="radio" name="diet" checked={dishForm.isVeg === v} onChange={() => setDishForm(f => ({...f, isVeg: v}))}/> {l}
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Food Photo Upload */}
                    <div className="form-group mb-2">
                      <label className="field-label-bold">Dish Food Photo</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '2px solid #fdba74', background: '#f8fafc', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {dishForm.image ? (
                            <img src={dishForm.image} alt="Dish" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <UtensilsCrossed size={22} color="#94a3b8" />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="file" 
                            ref={dishFileInputRef} 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={handleDishPhotoUpload} 
                          />
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: 13, cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}
                            onClick={() => dishFileInputRef.current?.click()}
                          >
                            <Upload size={14} color="#ea580c" />
                            <span>Upload Dish Photo</span>
                          </button>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>From camera or device gallery (PNG, JPG)</div>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {DISH_PHOTO_PRESETS.map(p => (
                          <button 
                            key={p.label} 
                            type="button"
                            onClick={() => setDishForm(f => ({ ...f, image: p.url }))}
                            style={{
                              fontSize: 11,
                              padding: '3px 9px',
                              borderRadius: 12,
                              border: dishForm.image === p.url ? '1px solid #ea580c' : '1px solid #cbd5e1',
                              background: dishForm.image === p.url ? '#fff7ed' : '#ffffff',
                              color: dishForm.image === p.url ? '#c2410c' : '#475569',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label className="field-label-bold">Description</label>
                      <textarea className="styled-input" rows={2} placeholder="Taste notes, ingredients…" value={dishForm.desc} onChange={e => setDishForm(f => ({...f, desc: e.target.value}))}/>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                      <button type="button" className="btn-secondary flex-1" onClick={() => setShowAddDishModal(false)}>Cancel</button>
                      <button type="submit" className="btn-primary flex-1" disabled={!dishForm.name || !dishForm.price}>
                        <Plus size={16}/> Publish to Menu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Menu Cards */}
            <div className="mp-menu-cards">
              {filteredMenuItems.map(item => {
                const inStock = restaurantStock[item.id] !== false;
                const curPrice = priceEdits[item.id] !== undefined ? priceEdits[item.id] : item.price;
                const changed = priceEdits[item.id] !== undefined && Number(priceEdits[item.id]) !== item.price;
                return (
                  <div key={item.id} className={`mp-menu-card ${!inStock ? 'out-of-stock' : ''}`}>
                    <div className="mp-mc-top">
                      <span className={item.isVeg ? 'mp-veg-dot' : 'mp-nonveg-dot'}/>
                      {item.image && (
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div className="mp-mc-info">
                        <div className="mp-mc-name">{item.name}</div>
                        <div className="mp-mc-cat">{item.category}</div>
                        <div className="mp-mc-desc">{item.description || 'Freshly prepared on order'}</div>
                      </div>
                    </div>
                    <div className="mp-mc-bottom">
                      {/* Price stepper */}
                      <div className="mp-price-stepper">
                        <button className="mp-step-btn" onClick={() => handleNudgePrice(item, -10)}>−</button>
                        <div className="mp-price-display">
                          <span>₹</span>
                          <input type="number" className="mp-price-input" value={curPrice} onChange={e => setPriceEdits(p => ({...p, [item.id]: e.target.value}))}/>
                        </div>
                        <button className="mp-step-btn plus" onClick={() => handleNudgePrice(item, 10)}>+</button>
                        {changed && <button className="mp-save-price-btn" onClick={() => handleSavePrice(item.id)}><Save size={12}/> Save</button>}
                      </div>
                      {/* Stock toggle */}
                      <button className={`mp-stock-toggle ${inStock ? 'in' : 'out'}`} onClick={() => onToggleItemStock(item.id)}>
                        <span className="mp-toggle-thumb"/>
                        <span>{inStock ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredMenuItems.length === 0 && (
                <div className="mp-empty-state"><UtensilsCrossed size={36}/><p>No dishes found. Add your first dish!</p><button className="mp-btn-primary" onClick={() => setShowAddDishModal(true)}><Plus size={14}/> Add Dish</button></div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            5. FINANCE
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'finance' && (
          <div className="mp-finance-page">
            {/* Summary hero */}
            <div className="mp-finance-hero">
              <div>
                <div className="mp-finance-label">Today's Net Earnings</div>
                <div className="mp-finance-amount">₹{Math.round(totalRevenue * 0.85)}</div>
                <div className="mp-finance-sub">After 15% platform commission · ₹{totalRevenue} gross</div>
              </div>
              <button className="mp-finance-export"><Download size={14}/> Export</button>
            </div>

            {/* Period tabs */}
            <div className="mp-period-tabs">
              {['Today', 'Week', 'Month'].map(p => (
                <button key={p} className={`mp-period-tab ${p === 'Today' ? 'active' : ''}`}>{p}</button>
              ))}
            </div>

            {/* Summary cards */}
            <div className="mp-fin-summary">
              {[
                { label: 'Gross Revenue', value: `₹${totalRevenue}`, color: '#10b981' },
                { label: 'Platform Commission (15%)', value: `−₹${Math.round(totalRevenue * 0.15)}`, color: '#ef4444' },
                { label: 'Refunds / Adjustments', value: '−₹0', color: '#f97316' },
                { label: 'Net Payout', value: `₹${Math.round(totalRevenue * 0.85)}`, color: '#3b82f6' },
              ].map(s => (
                <div key={s.label} className="mp-fin-row">
                  <span>{s.label}</span>
                  <strong style={{ color: s.color }}>{s.value}</strong>
                </div>
              ))}
            </div>

            {/* Payout history */}
            <div className="mp-section-title">Payout History</div>
            <div className="mp-payout-table">
              <div className="mp-pt-header">
                <span>Date</span><span>Orders</span><span>Gross</span><span>Commission</span><span>Net</span><span>Status</span>
              </div>
              {MOCK_PAYOUTS.map(p => (
                <div key={p.id} className="mp-pt-row">
                  <span>{p.date}</span>
                  <span>{p.orders}</span>
                  <span>₹{p.gross}</span>
                  <span className="text-red">−₹{p.commission}</span>
                  <strong style={{ color: '#10b981' }}>₹{p.net}</strong>
                  <span className={`mp-payout-status ${p.status.toLowerCase()}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            6. OFFERS & PROMOTIONS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'offers' && (
          <div className="mp-offers-page">
            <div className="mp-offers-toolbar">
              <div className="mp-section-title">Offers & Promotions</div>
              <button className="mp-btn-add-offer" onClick={() => setShowAddOffer(true)}><Plus size={15}/> New Offer</button>
            </div>

            {showAddOffer && (
              <div className="mp-add-offer-form">
                <h4>Create New Offer</h4>
                <div className="form-grid-2col mb-2">
                  <div>
                    <label className="field-label-bold">Title</label>
                    <input className="styled-input" placeholder="e.g. Weekend Special" value={newOffer.title} onChange={e => setNewOffer(o => ({...o, title: e.target.value}))}/>
                  </div>
                  <div>
                    <label className="field-label-bold">Type</label>
                    <select className="styled-input" value={newOffer.type} onChange={e => setNewOffer(o => ({...o, type: e.target.value}))}>
                      <option value="PERCENT">% Discount</option>
                      <option value="FLAT">Flat Off</option>
                      <option value="BOGO">Buy 1 Get 1</option>
                      <option value="FIRST">First Order</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid-2col mb-2">
                  <div>
                    <label className="field-label-bold">Value</label>
                    <input className="styled-input" type="number" placeholder="20" value={newOffer.value} onChange={e => setNewOffer(o => ({...o, value: e.target.value}))}/>
                  </div>
                  <div>
                    <label className="field-label-bold">Min Order (₹)</label>
                    <input className="styled-input" type="number" placeholder="150" value={newOffer.minOrder} onChange={e => setNewOffer(o => ({...o, minOrder: e.target.value}))}/>
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label className="field-label-bold">Expiry Date</label>
                  <input className="styled-input" type="date" value={newOffer.expiry} onChange={e => setNewOffer(o => ({...o, expiry: e.target.value}))}/>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn-secondary flex-1" onClick={() => setShowAddOffer(false)}>Cancel</button>
                  <button className="btn-primary flex-1" onClick={() => {
                    if (!newOffer.title) return;
                    setOffers(prev => [...prev, { id: `o-${Date.now()}`, ...newOffer, active: true }]);
                    setNewOffer({ title:'', type:'PERCENT', value:'', minOrder:'', expiry:'' });
                    setShowAddOffer(false);
                  }}><Plus size={14}/> Create</button>
                </div>
              </div>
            )}

            <div className="mp-offer-cards">
              {offers.map(offer => (
                <div key={offer.id} className={`mp-offer-card ${offer.active ? 'active' : 'inactive'}`}>
                  <div className="mp-offer-left">
                    <div className="mp-offer-tag">{offer.type}</div>
                    <div className="mp-offer-title">{offer.title}</div>
                    <div className="mp-offer-meta">
                      {offer.value > 0 && <span>{offer.type === 'PERCENT' ? `${offer.value}% off` : `₹${offer.value} off`}</span>}
                      {offer.minOrder > 0 && <span> · Min ₹{offer.minOrder}</span>}
                      <span> · Expires {offer.expiry}</span>
                    </div>
                  </div>
                  <button className={`mp-offer-toggle ${offer.active ? 'on' : 'off'}`} onClick={() => setOffers(prev => prev.map(o => o.id === offer.id ? {...o, active: !o.active} : o))}>
                    {offer.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            7. REVIEWS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reviews' && (
          <div className="mp-reviews-page">
            {/* Rating overview */}
            <div className="mp-rating-hero">
              <div className="mp-rating-big">⭐ {currentHotel.rating}</div>
              <div>
                <div className="mp-rating-label">Overall Rating</div>
                <div className="mp-rating-count">{reviews.length} reviews</div>
                <div className="mp-rating-bars">
                  {[5,4,3,2,1].map(n => (
                    <div key={n} className="mp-rating-bar-row">
                      <span>{n}★</span>
                      <div className="mp-rb-track"><div className="mp-rb-fill" style={{ width: `${reviews.filter(r => r.rating === n).length / reviews.length * 100}%` }}/></div>
                      <span>{reviews.filter(r => r.rating === n).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review cards */}
            <div className="mp-review-cards">
              {reviews.map(r => (
                <div key={r.id} className="mp-review-card">
                  <div className="mp-review-top">
                    <div>
                      <strong>{r.customer}</strong>
                      <div className="mp-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <div className="mp-review-time">{r.time}</div>
                  </div>
                  <div className="mp-review-dish">📦 {r.dish}</div>
                  <div className="mp-review-text">{r.text}</div>
                  {r.replied && <div className="mp-review-reply"><strong>Your reply:</strong> {r.reply}</div>}
                  {!r.replied && (
                    replyingTo === r.id ? (
                      <div className="mp-reply-box">
                        <textarea className="styled-input" rows={2} placeholder="Write a reply…" value={replyText[r.id] || ''} onChange={e => setReplyText(p => ({...p, [r.id]: e.target.value}))}/>
                        <div style={{ display:'flex', gap:8, marginTop:8 }}>
                          <button className="btn-secondary" onClick={() => setReplyingTo(null)}>Cancel</button>
                          <button className="btn-primary" onClick={() => handleReplyReview(r.id)}><Send size={13}/> Send Reply</button>
                        </div>
                      </div>
                    ) : (
                      <button className="mp-reply-btn" onClick={() => setReplyingTo(r.id)}><MessageSquare size={13}/> Reply</button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            8. CUSTOMERS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="mp-customers-page">
            <div className="mp-cust-summary">
              <div className="mp-cust-stat"><strong>{MOCK_CUSTOMERS.length}</strong><span>Total Customers</span></div>
              <div className="mp-cust-stat"><strong>{MOCK_CUSTOMERS.filter(c => c.repeat).length}</strong><span>Repeat Buyers</span></div>
              <div className="mp-cust-stat"><strong>₹{MOCK_CUSTOMERS.reduce((a,c) => a+c.spent, 0)}</strong><span>Total Spend</span></div>
            </div>
            <div className="mp-cust-list">
              {MOCK_CUSTOMERS.sort((a,b) => b.orders - a.orders).map(c => (
                <div key={c.id} className="mp-cust-card">
                  <div className="mp-cust-avatar">{c.name.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                  <div className="mp-cust-info">
                    <strong>{c.name}</strong>
                    <span>{c.phone}</span>
                    <span>Last order: {c.last}</span>
                  </div>
                  <div className="mp-cust-stats">
                    <div className="mp-cust-orders"><strong>{c.orders}</strong><small>orders</small></div>
                    <div className="mp-cust-spent"><strong>₹{c.spent}</strong><small>spent</small></div>
                    {c.repeat && <span className="mp-repeat-badge">Loyal</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            9. ANALYTICS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="mp-analytics-page">
            <div className="mp-analytics-kpis">
              {[
                { label: 'Total Orders', value: hotelOrders.length, icon: <Package size={18}/>, color: '#3b82f6' },
                { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: <IndianRupee size={18}/>, color: '#10b981' },
                { label: 'Avg Order Value', value: `₹${avgOrderValue}`, icon: <TrendingUp size={18}/>, color: '#f97316' },
                { label: 'Cancelled', value: hotelOrders.filter(o => o.status === 'CANCELLED').length, icon: <X size={18}/>, color: '#ef4444' },
              ].map(k => (
                <div key={k.label} className="mp-an-kpi" style={{ borderLeft: `3px solid ${k.color}` }}>
                  <div style={{ color: k.color }}>{k.icon}</div>
                  <div className="mp-an-val">{k.value}</div>
                  <div className="mp-an-label">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Best Sellers */}
            <div className="mp-section-title">🔥 Best Selling Items</div>
            <div className="mp-best-sellers">
              {bestSelling.length === 0 ? (
                <div className="mp-empty-state"><BarChart2 size={32}/><p>Place some orders to see analytics</p></div>
              ) : bestSelling.map(([name, qty], i) => (
                <div key={name} className="mp-bs-row">
                  <span className="mp-bs-rank">#{i+1}</span>
                  <span className="mp-bs-name">{name}</span>
                  <div className="mp-bs-bar-wrap">
                    <div className="mp-bs-bar" style={{ width: `${(qty / bestSelling[0][1]) * 100}%` }}/>
                  </div>
                  <span className="mp-bs-qty">{qty} sold</span>
                </div>
              ))}
            </div>

            {/* Peak hours */}
            <div className="mp-section-title">⏰ Peak Hours</div>
            <div className="mp-peak-hours">
              {['8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM'].map((h, i) => {
                const heights = [15,20,35,55,90,100,85,40,30,50,75,95,80,60];
                return (
                  <div key={h} className="mp-peak-bar">
                    <div className="mp-peak-bar-fill" style={{ height: `${heights[i]}%`, background: heights[i] > 70 ? '#ef4444' : heights[i] > 40 ? '#f97316' : '#10b981' }}/>
                    <span className="mp-peak-label">{h}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            10. NOTIFICATIONS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="mp-notif-page">
            <div className="mp-notif-header">
              <div className="mp-section-title">Notifications</div>
              <button className="mp-mark-all-read" onClick={() => setNotifications(prev => prev.map(n => ({...n, unread: false})))}>
                <CheckSquare size={13}/> Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="mp-empty-state"><Bell size={36}/><p>All caught up! No notifications.</p></div>
            ) : notifications.map(n => (
              <div key={n.id} className={`mp-notif-row ${n.unread ? 'unread' : ''}`} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? {...x, unread: false} : x))}>
                <div className={`mp-notif-icon-wrap notif-${n.type.toLowerCase()}`}>
                  {n.type === 'ORDER' && <Package size={16}/>}
                  {n.type === 'PAYMENT' && <IndianRupee size={16}/>}
                  {n.type === 'STOCK' && <AlertCircle size={16}/>}
                  {n.type === 'RIDER' && <Truck size={16}/>}
                  {n.type === 'OFFER' && <Gift size={16}/>}
                </div>
                <div className="mp-notif-body">
                  <div className="mp-notif-title">{n.title}</div>
                  <div className="mp-notif-text">{n.body}</div>
                  <div className="mp-notif-time">{n.time}</div>
                </div>
                {n.unread && <div className="mp-notif-unread-dot"/>}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            11. SUPPORT
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'support' && (
          <div className="mp-support-page">
            <div className="mp-support-quick">
              <a href="tel:18004251234" className="mp-support-card"><Phone size={20} className="text-green"/><span>Call Support</span><small>24/7</small></a>
              <button className="mp-support-card" onClick={() => window.open('https://wa.me/918248651695?text=Hi+Unavu+Restaurant+Support')}><MessageCircle size={20} className="text-green"/><span>WhatsApp</span><small>Instant</small></button>
              <button className="mp-support-card" onClick={() => window.open('mailto:support@unavukadai.com')}><Mail size={20}/><span>Email</span><small>24h reply</small></button>
            </div>

            <div className="mp-section-title">Raise a Ticket</div>
            {ticketSent ? (
              <div className="mp-ticket-success"><CheckCircle size={28} className="text-green"/><p>Ticket raised! We'll respond within 2 hours.</p><button className="mp-btn-primary" onClick={() => { setTicketSent(false); setSupportTicket({ topic:'', message:'' }); }}>New Ticket</button></div>
            ) : (
              <form className="mp-ticket-form" onSubmit={e => { e.preventDefault(); if (supportTicket.topic && supportTicket.message) setTicketSent(true); }}>
                <div className="form-group mb-2">
                  <label className="field-label-bold">Issue Type</label>
                  <select className="styled-input" value={supportTicket.topic} onChange={e => setSupportTicket(s => ({...s, topic: e.target.value}))} required>
                    <option value="">Select topic…</option>
                    {SUPPORT_TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group mb-3">
                  <label className="field-label-bold">Describe the issue</label>
                  <textarea className="styled-input" rows={4} placeholder="Tell us what happened…" value={supportTicket.message} onChange={e => setSupportTicket(s => ({...s, message: e.target.value}))} required/>
                </div>
                <button type="submit" className="btn-primary" style={{ width:'100%' }}><Send size={14}/> Submit Ticket</button>
              </form>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            12. RESTAURANT PROFILE
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="mp-profile-page">
            <form onSubmit={handleSaveProfile} className="mp-profile-form">
              <div className="mp-section-title">Restaurant Profile</div>

              <div className="form-grid-2col mb-2">
                <div className="form-group">
                  <label className="field-label-bold">Restaurant Name</label>
                  <input className="styled-input" value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name: e.target.value}))} required/>
                </div>
                <div className="form-group">
                  <label className="field-label-bold">Phone</label>
                  <input className="styled-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))}/>
                </div>
              </div>

              <div className="form-group mb-2">
                <label className="field-label-bold">Description</label>
                <textarea className="styled-input" rows={2} value={profileForm.desc} onChange={e => setProfileForm(f => ({...f, desc: e.target.value}))}/>
              </div>

              <div className="form-grid-2col mb-2">
                <div className="form-group">
                  <label className="field-label-bold">Cuisine Type</label>
                  <select className="styled-input" value={profileForm.cuisine} onChange={e => setProfileForm(f => ({...f, cuisine: e.target.value}))}>
                    {['South Indian','North Indian','Chinese','Biryani','Multi-cuisine','Bakery','Fast Food','Seafood'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="field-label-bold">Delivery Hub</label>
                  <select className="styled-input" value={profileForm.region} onChange={e => setProfileForm(f => ({...f, region: e.target.value}))}>
                    {['Perungalathur','Vandalur','Kilambakkam','Tambaram','Chromepet','Pallavaram','Mudichur','Mannivakkam'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group mb-2">
                <label className="field-label-bold">Full Address</label>
                <input className="styled-input" value={profileForm.address} onChange={e => setProfileForm(f => ({...f, address: e.target.value}))} required/>
              </div>

              <div className="form-grid-2col mb-2">
                <div className="form-group">
                  <label className="field-label-bold">Opening Time</label>
                  <input type="time" className="styled-input" value={profileForm.openTime} onChange={e => setProfileForm(f => ({...f, openTime: e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="field-label-bold">Closing Time</label>
                  <input type="time" className="styled-input" value={profileForm.closeTime} onChange={e => setProfileForm(f => ({...f, closeTime: e.target.value}))}/>
                </div>
              </div>

              <div className="form-grid-2col mb-2">
                <div className="form-group">
                  <label className="field-label-bold">Min Order (₹)</label>
                  <input type="number" className="styled-input" value={profileForm.minOrder} onChange={e => setProfileForm(f => ({...f, minOrder: e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="field-label-bold">Prep Time (min)</label>
                  <input type="number" className="styled-input" value={profileForm.deliveryMins} onChange={e => setProfileForm(f => ({...f, deliveryMins: e.target.value}))}/>
                </div>
              </div>

              <div className="form-grid-2col mb-2">
                <div className="form-group">
                  <label className="field-label-bold">📍 Latitude</label>
                  <input type="number" step="0.000001" className="styled-input" value={profileForm.lat} onChange={e => setProfileForm(f => ({...f, lat: e.target.value}))} required/>
                </div>
                <div className="form-group">
                  <label className="field-label-bold">📍 Longitude</label>
                  <input type="number" step="0.000001" className="styled-input" value={profileForm.lng} onChange={e => setProfileForm(f => ({...f, lng: e.target.value}))} required/>
                </div>
              </div>

              <div className="mp-coords-preview">
                <MapPin size={13}/> {Number(profileForm.lat).toFixed(4)}, {Number(profileForm.lng).toFixed(4)} ·
                <a href={`https://www.google.com/maps?q=${profileForm.lat},${profileForm.lng}`} target="_blank" rel="noopener noreferrer" style={{ color:'#3b82f6', marginLeft:6 }}>Open in Maps</a>
              </div>

              <button type="submit" className="btn-primary" style={{ width:'100%', marginTop:16 }}>
                <Save size={16}/> Save Profile
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            13. SETTINGS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="mp-settings-page">
            {[
              { section: '🏪 Restaurant', items: [
                { label: 'Auto-accept orders', sub: 'Skip manual accept step', toggle: true, val: false },
                { label: 'Kitchen audio alerts', sub: 'Chime for new orders', toggle: true, val: isAudioUnlocked },
              ]},
              { section: '🔔 Notifications', items: [
                { label: 'New order alerts', toggle: true, val: true },
                { label: 'Payout notifications', toggle: true, val: true },
                { label: 'Stock alerts', toggle: true, val: true },
              ]},
              { section: '🌙 Display', items: [
                { label: 'Dark mode', sub: 'Switch to dark theme', toggle: true, val: darkMode, action: () => setDarkMode(d => !d) },
              ]},
              { section: '⚙️ Account', items: [
                { label: 'Bank / UPI settings', sub: '8248651695@ybl', link: true },
                { label: 'Tax & GST info', link: true },
                { label: 'Privacy policy', link: true },
                { label: 'Terms of service', link: true },
              ]},
            ].map(s => (
              <div key={s.section} className="mp-settings-section">
                <div className="mp-settings-section-title">{s.section}</div>
                {s.items.map(item => (
                  <div key={item.label} className="mp-settings-row">
                    <div>
                      <div className="mp-settings-label">{item.label}</div>
                      {item.sub && <div className="mp-settings-sub">{item.sub}</div>}
                    </div>
                    {item.toggle && (
                      <button className={`mp-toggle-pill ${item.val ? 'on' : 'off'}`} onClick={item.action}>
                        {item.val ? 'ON' : 'OFF'}
                      </button>
                    )}
                    {item.link && <ChevronRight size={16} className="text-muted"/>}
                  </div>
                ))}
              </div>
            ))}

            <button className="mp-logout-btn">
              <LogOut size={16}/> Sign Out
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
