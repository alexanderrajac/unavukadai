import React, { useState, useEffect, useMemo } from 'react';
import PortalSwitcher from './components/PortalSwitcher';
import Header from './components/Header';
import RegionalOffersStrip from './components/RegionalOffersStrip';
import CategoryCarousel from './components/CategoryCarousel';
import Collections from './components/Collections';
import FilterBar from './components/FilterBar';
import RestaurantCard from './components/RestaurantCard';
import RestaurantModal from './components/RestaurantModal';
import CartDrawer from './components/CartDrawer';
import OrderSuccessModal from './components/OrderSuccessModal';
import MyOrdersModal from './components/MyOrdersModal';
import UserOrdersPage from './components/UserOrdersPage';
import ActiveOrderFloatingBar from './components/ActiveOrderFloatingBar';
import AuthModal from './components/AuthModal';
import AddressBookModal from './components/AddressBookModal';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import RegisterRestaurantModal from './components/RegisterRestaurantModal';
import { ArrowRight, Flame } from 'lucide-react';

import HotelPortal from './components/HotelPortal';
import RiderPortal from './components/RiderPortal';
import AdminPortal from './components/AdminPortal';

import { CITIES, RESTAURANTS, INITIAL_ORDERS, COUPONS } from './data/mockData';
import {
  fetchOrdersFromApi,
  createOrderApi,
  updateOrderStatusApi,
  cancelOrderApi,
  toggleItemStockApi,
  addCouponApi,
  updateRiderLocationApi,
  fetchSettingsApi,
  updateSettingsApi,
  resetOrdersApi,
  subscribeToLiveUpdates,
  sendOrderWhatsAppNotificationApi
} from './services/api';
import { supabase, signOutSupabase } from './services/supabaseAuth';
import './App.css';

export default function App() {
  // Helper to determine portal from URL
  const getPortalFromUrl = () => {
    const hash = window.location.hash.toLowerCase().replace('#/', '').replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const queryPortal = params.get('portal');
    const target = queryPortal || hash;
    if (['hotel', 'rider', 'admin', 'customer'].includes(target)) {
      return target;
    }
    return 'customer';
  };

  // Current active role portal: 'customer' | 'hotel' | 'rider' | 'admin'
  const [currentPortal, setCurrentPortalState] = useState(getPortalFromUrl);

  const setCurrentPortal = (portal) => {
    setCurrentPortalState(portal);
    window.location.hash = `#/${portal}`;
  };

  // Listen to browser hash changes (direct link clicks, back/forward buttons, auth modal deep links)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.toLowerCase().replace('#/', '').replace('#', '');
      if (rawHash === 'login' || rawHash === 'signin') {
        setAuthInitialTab('login');
        setIsAuthOpen(true);
        return;
      }
      if (rawHash === 'signup' || rawHash === 'register') {
        setAuthInitialTab('signup');
        setIsAuthOpen(true);
        return;
      }
      if (rawHash === 'orders' || rawHash === 'my-orders' || rawHash === 'account') {
        setCurrentPortalState('customer');
        setActiveTab('orders');
        return;
      }
      const detected = getPortalFromUrl();
      setCurrentPortalState(detected);
    };

    // Check initial hash on mount
    const rawHash = window.location.hash.toLowerCase().replace('#/', '').replace('#', '');
    if (rawHash === 'login' || rawHash === 'signin') {
      setAuthInitialTab('login');
      setIsAuthOpen(true);
    } else if (rawHash === 'signup' || rawHash === 'register') {
      setAuthInitialTab('signup');
      setIsAuthOpen(true);
    } else if (rawHash === 'orders' || rawHash === 'my-orders' || rawHash === 'account') {
      setCurrentPortalState('customer');
      setActiveTab('orders');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Shared Orders Across Ecosystem
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_ecosystem_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('unavu_ecosystem_orders', JSON.stringify(orders));
  }, [orders]);

  // Restaurant Menu Stock State (dishId -> boolean)
  const [restaurantStock, setRestaurantStock] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_stock');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleItemStock = (itemId) => {
    setRestaurantStock(prev => ({
      ...prev,
      [itemId]: prev[itemId] === false ? true : false
    }));
    toggleItemStockApi(itemId);
  };

  // Dynamic Restaurants List with local persistence (Restaurant Admin editing)
  const [restaurantsList, setRestaurantsList] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_restaurants_v2');
      return saved ? JSON.parse(saved) : RESTAURANTS;
    } catch {
      return RESTAURANTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('unavu_restaurants_v2', JSON.stringify(restaurantsList));
    } catch (e) {
      console.warn('Failed to cache restaurantsList', e);
    }
  }, [restaurantsList]);

  // Restaurant Admin: Add Food Item
  const handleAddMenuItem = (restaurantId, newItem) => {
    setRestaurantsList(prev => prev.map(r => {
      if (r.id === restaurantId) {
        const dishItem = {
          id: `${restaurantId}-dish-${Date.now()}`,
          name: newItem.name.trim(),
          price: Number(newItem.price),
          category: newItem.category || 'Specialties',
          isVeg: Boolean(newItem.isVeg),
          description: newItem.description?.trim() || 'Freshly prepared specialty dish.',
          votes: 1
        };
        return {
          ...r,
          menu: [...r.menu, dishItem]
        };
      }
      return r;
    }));
  };

  // Restaurant Admin: Edit Item Price
  const handleUpdateMenuItemPrice = (restaurantId, itemId, newPrice) => {
    setRestaurantsList(prev => prev.map(r => {
      if (r.id === restaurantId) {
        return {
          ...r,
          menu: r.menu.map(item => item.id === itemId ? { ...item, price: Number(newPrice) } : item)
        };
      }
      return r;
    }));
  };

  // Restaurant Admin: Edit Restaurant Profile, Address & Coordinates
  const handleUpdateRestaurantDetails = (restaurantId, details) => {
    setRestaurantsList(prev => prev.map(r => {
      if (r.id === restaurantId) {
        return {
          ...r,
          name: details.name || r.name,
          address: details.address || r.address,
          region: details.region || r.region,
          costForTwo: details.costForTwo ? Number(details.costForTwo) : r.costForTwo,
          deliveryTimeMins: details.deliveryTimeMins ? Number(details.deliveryTimeMins) : r.deliveryTimeMins,
          coords: details.coords || r.coords
        };
      }
      return r;
    }));
  };

  // Restaurant Registration & Merchant Promotion
  const [isRegisterRestaurantOpen, setIsRegisterRestaurantOpen] = useState(false);

  const handleRegisterRestaurant = (newRestaurant, ownerInfo) => {
    // 1. Add restaurant to dynamic list
    setRestaurantsList(prev => [newRestaurant, ...prev]);

    // 2. Automatically upgrade/create merchant role in master registered users
    if (ownerInfo) {
      const normalizedEmail = ownerInfo.email?.toLowerCase().trim();
      const normalizedPhone = ownerInfo.phone?.replace(/\D/g, '');

      setUsersList(prev => {
        const existingIdx = prev.findIndex(u => 
          (normalizedEmail && u.email?.toLowerCase().trim() === normalizedEmail) ||
          (normalizedPhone && u.phone && u.phone.replace(/\D/g, '') === normalizedPhone)
        );

        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            role: 'restaurant',
            restaurantId: newRestaurant.id,
            restaurantName: newRestaurant.name
          };
          return updated;
        } else {
          const newMerchant = {
            id: 'usr-merchant-' + Date.now(),
            name: ownerInfo.name || newRestaurant.name + ' Owner',
            email: ownerInfo.email || `${newRestaurant.id}@unavukadai.com`,
            phone: ownerInfo.phone || '+91 98401 22222',
            role: 'restaurant',
            restaurantId: newRestaurant.id,
            restaurantName: newRestaurant.name,
            status: 'ACTIVE',
            createdAt: '28 Sep, 2026'
          };
          return [newMerchant, ...prev];
        }
      });

      // If active session matches, upgrade session user & switch to hotel merchant portal
      if (user) {
        const updatedUser = {
          ...user,
          role: 'restaurant',
          restaurantId: newRestaurant.id,
          restaurantName: newRestaurant.name
        };
        setUser(updatedUser);
      }
    }
  };

  // Platform Settings (Merchant UPI ID & Name)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.merchantUpi === 'unavukadai@upi' || !parsed.merchantUpi) {
          parsed.merchantUpi = '8248651695-3@ybl';
        }
        return parsed;
      }
      return { merchantUpi: '8248651695-3@ybl', merchantName: 'Unavukadai Express' };
    } catch {
      return { merchantUpi: '8248651695-3@ybl', merchantName: 'Unavukadai Express' };
    }
  });

  useEffect(() => {
    localStorage.setItem('unavu_settings', JSON.stringify(settings));
  }, [settings]);

  const handleUpdateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    updateSettingsApi(newSettings);
  };

  const handleResetOrders = () => {
    setOrders([]);
    setCompletedOrder(null);
    localStorage.removeItem('unavu_ecosystem_orders');
    resetOrdersApi();
  };

  // Coupons State (allows Admin to add new promo codes)
  const [couponsList, setCouponsList] = useState(COUPONS);

  const handleAddCoupon = (newCoupon) => {
    setCouponsList(prev => [newCoupon, ...prev]);
    addCouponApi(newCoupon);
    alert(`🎉 Promo Code ${newCoupon.code} launched for ${newCoupon.region}!`);
  };

  // Live Rider GPS Locations Across Suburban Fleet
  const [riderLocations, setRiderLocations] = useState({
    'rider-1': { riderId: 'rider-1', riderName: 'Murugan S.', lat: 12.9056, lng: 80.0832, speed: 28, heading: 195, locality: 'Perungalathur' },
    'rider-2': { riderId: 'rider-2', riderName: 'Anand Kumar', lat: 12.8893, lng: 80.0815, speed: 22, heading: 170, locality: 'Vandalur' }
  });

  const handleUpdateRiderLocation = (locData) => {
    setRiderLocations(prev => ({
      ...prev,
      [locData.riderId]: locData
    }));
    updateRiderLocationApi(locData);
  };

  // Sync with Server (Initial fetch + Live Cross-Device SSE Stream: Server is SSOT)
  useEffect(() => {
    fetchOrdersFromApi().then(remoteOrders => {
      // Server is Single Source of Truth: if API responds, it takes precedence over stale localStorage
      if (remoteOrders && Array.isArray(remoteOrders)) {
        setOrders(remoteOrders);
      }
    });

    fetchSettingsApi().then(remSettings => {
      if (remSettings) setSettings(remSettings);
    });

    const unsubscribe = subscribeToLiveUpdates((payload) => {
      if (payload.type === 'INIT') {
        if (Array.isArray(payload.data?.orders)) setOrders(payload.data.orders);
        if (payload.data?.stock) setRestaurantStock(payload.data.stock);
        if (payload.data?.coupons?.length > 0) setCouponsList(payload.data.coupons);
        if (payload.data?.riderLocations) setRiderLocations(payload.data.riderLocations);
        if (payload.data?.settings) setSettings(payload.data.settings);
      } else if (payload.type === 'ORDERS_UPDATED') {
        if (Array.isArray(payload.data)) setOrders(payload.data);
      } else if (payload.type === 'STOCK_UPDATED') {
        if (payload.data) setRestaurantStock(payload.data);
      } else if (payload.type === 'COUPONS_UPDATED') {
        if (payload.data) setCouponsList(payload.data);
      } else if (payload.type === 'SETTINGS_UPDATED') {
        if (payload.data) setSettings(payload.data);
      } else if (payload.type === 'RIDER_LOCATION_UPDATED') {
        if (payload.data?.riderId) {
          setRiderLocations(prev => ({
            ...prev,
            [payload.data.riderId]: payload.data
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Customer Navigation & Location (Defaults to Perungalathur Hub)
  const [activeTab, setActiveTab] = useState('delivery');
  const [selectedCity, setSelectedCity] = useState(CITIES[0]); // All Locations (Chennai)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    pureVeg: false,
    rating4Plus: false,
    fastDelivery: false,
    hasOffer: false,
    priceRange: 'all'
  });
  const [sortBy, setSortBy] = useState('relevance');

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_favs');
      return saved ? JSON.parse(saved) : ['res-perungalathur-1', 'res-vandalur-1'];
    } catch {
      return ['res-perungalathur-1', 'res-vandalur-1'];
    }
  });

  // Cart
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & User state
  const [activeRestaurantModal, setActiveRestaurantModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [prefilledCoupon, setPrefilledCoupon] = useState('');

  const handleOpenAuth = (tab = 'login') => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
  };

  // User Authentication State (Persistent with Google Gmail support)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Master Registered Users Directory & Roles
  const INITIAL_USERS = [
    {
      id: 'usr-admin-0',
      name: 'Murugan (Master Admin)',
      email: 'murugan@unavukadai.com',
      phone: '+91 82486 51695',
      role: 'admin',
      status: 'ACTIVE',
      createdAt: '28 Sep, 2026'
    },
    {
      id: 'usr-admin-1',
      name: 'Master Admin (HQ)',
      email: 'admin@unavukadai.com',
      phone: '+91 98400 11111',
      role: 'admin',
      status: 'ACTIVE',
      createdAt: '28 Sep, 2026'
    },
    {
      id: 'usr-merchant-1',
      name: 'Chef Sundaram (Junior Kuppanna)',
      email: 'kuppanna.kitchen@gmail.com',
      phone: '+91 98401 22222',
      role: 'restaurant',
      status: 'ACTIVE',
      createdAt: '28 Sep, 2026'
    },
    {
      id: 'usr-rider-1',
      name: 'Murugan S. (Fleet Captain)',
      email: 'murugan.rider@gmail.com',
      phone: '+91 98765 43210',
      role: 'rider',
      status: 'ACTIVE',
      createdAt: '28 Sep, 2026'
    },
    {
      id: 'usr-admin-2',
      name: 'Raja Official',
      email: 'rajacofficial369@gmail.com',
      phone: '+91 98401 23456',
      role: 'admin',
      status: 'ACTIVE',
      createdAt: '28 Sep, 2026'
    },
    {
      id: 'usr-cust-1',
      name: 'Alexander Raja',
      email: 'alexanderrajac@gmail.com',
      phone: '+91 98401 23456',
      role: 'customer',
      status: 'ACTIVE',
      createdAt: '28 Sep, 2026'
    }
  ];

  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure Raja Official admin is always present
        if (!parsed.some(u => u.email?.toLowerCase() === 'rajacofficial369@gmail.com')) {
          parsed.push(INITIAL_USERS[4]);
        }
        // Ensure 8248651695 master admin is always present
        if (!parsed.some(u => u.phone?.replace(/\D/g, '') === '918248651695' || u.phone?.replace(/\D/g, '') === '8248651695')) {
          parsed.unshift(INITIAL_USERS[0]);
        }
        return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('unavu_registered_users', JSON.stringify(usersList));
  }, [usersList]);

  const handleUpdateUserRole = (userId, newRole) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    const targetUser = usersList.find(u => u.id === userId);
    if (user && targetUser && (user.id === userId || user.email?.toLowerCase() === targetUser.email?.toLowerCase())) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      if (newRole === 'restaurant') setCurrentPortal('hotel');
      else if (newRole === 'rider') setCurrentPortal('rider');
      else if (newRole === 'admin') setCurrentPortal('admin');
      else setCurrentPortal('customer');
    }
  };

  const handleToggleUserStatus = (userId) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('unavu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('unavu_user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('unavu_user');
    localStorage.removeItem('unavu_oauth_intended_role');
    signOutSupabase();
    setCurrentPortal('customer');
  };

  const handleLoginSuccess = (userData) => {
    // Check if user already exists in master registered users directory (only admin can change role in Admin panel)
    const normalizedEmail = userData.email?.toLowerCase().trim();
    const normalizedPhone = userData.phone?.replace(/\D/g, '');
    const existing = usersList.find(u => 
      (normalizedEmail && u.email?.toLowerCase().trim() === normalizedEmail) ||
      (normalizedPhone && u.phone && u.phone.replace(/\D/g, '') === normalizedPhone)
    );
    const effectiveRole = existing ? existing.role : 'customer';

    if (!existing) {
      const newUserRecord = {
        id: 'usr-' + Date.now(),
        name: userData.name || userData.email?.split('@')[0] || 'User',
        email: userData.email,
        phone: userData.phone || '+91 98401 23456',
        role: effectiveRole,
        status: 'ACTIVE',
        createdAt: '28 Sep, 2026'
      };
      setUsersList(prev => [...prev, newUserRecord]);
    }

    const roleAvatar = effectiveRole === 'restaurant' ? '👨‍🍳' : effectiveRole === 'rider' ? '🛵' : effectiveRole === 'admin' ? '🛡️' : '🍲';
    const updatedUser = { ...userData, role: effectiveRole, avatar: roleAvatar };
    setUser(updatedUser);

    // Strict Role-Based Portal Routing
    if (effectiveRole === 'restaurant') {
      setCurrentPortal('hotel');
    } else if (effectiveRole === 'rider') {
      setCurrentPortal('rider');
    } else if (effectiveRole === 'admin') {
      setCurrentPortal('admin');
    } else {
      setCurrentPortal('customer');
    }
  };

  // Listen to Supabase Google OAuth session changes on redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const supaUser = session.user;
        const googleName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0];
        const googleEmail = supaUser.email;

        handleLoginSuccess({
          name: googleName,
          email: googleEmail,
          phone: supaUser.phone || '+91 98401 23456',
          authProvider: 'google',
          isVerified: true
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const supaUser = session.user;
        const googleName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0];
        const googleEmail = supaUser.email;

        handleLoginSuccess({
          name: googleName,
          email: googleEmail,
          phone: supaUser.phone || '+91 98401 23456',
          authProvider: 'google',
          isVerified: true
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [usersList]);

  // Strict Role Route Guard: non-admins are locked strictly to their respective app portal
  useEffect(() => {
    if (!user) return;
    if (user.role === 'restaurant' && currentPortal !== 'hotel') {
      setCurrentPortal('hotel');
    } else if (user.role === 'rider' && currentPortal !== 'rider') {
      setCurrentPortal('rider');
    } else if (user.role === 'customer' && currentPortal !== 'customer') {
      setCurrentPortal('customer');
    }
  }, [user, currentPortal]);

  // Saved Addresses State & Settings
  const INITIAL_SAVED_ADDRESSES = [
    {
      id: 'addr-1',
      tag: 'Home',
      doorNo: 'Flat 4B, Sri Sai Flats',
      streetAddress: 'Peerkankaranai Main Road',
      landmark: 'Near Peerkankaranai Lake',
      locality: 'Perungalathur',
      city: 'Chennai',
      coords: [12.9095, 80.0895],
      suburb: CITIES.find(c => c.id === 'perungalathur') || CITIES[0],
      formattedAddress: 'Door 4B, Peerkankaranai Main Road, Near Lake, Perungalathur Hub'
    },
    {
      id: 'addr-2',
      tag: 'Work',
      doorNo: 'Tower B, 3rd Floor',
      streetAddress: 'GST Road',
      landmark: 'Opp. Vandalur Zoo Gate',
      locality: 'Vandalur',
      city: 'Chennai',
      coords: [12.8893, 80.0815],
      suburb: CITIES.find(c => c.id === 'vandalur') || CITIES[1],
      formattedAddress: 'Tower B, GST Road, Opp. Zoo Gate, Vandalur Hub'
    }
  ];

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('unavu_saved_addresses');
      return saved ? JSON.parse(saved) : INITIAL_SAVED_ADDRESSES;
    } catch {
      return INITIAL_SAVED_ADDRESSES;
    }
  });

  useEffect(() => {
    localStorage.setItem('unavu_saved_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  const [activeAddressId, setActiveAddressId] = useState('addr-1');
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);

  const handleSaveAddress = (newAddr) => {
    setSavedAddresses(prev => {
      const existsIndex = prev.findIndex(a => a.id === newAddr.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newAddr;
        return copy;
      }
      return [newAddr, ...prev];
    });
    setActiveAddressId(newAddr.id);
    if (newAddr.suburb) {
      setSelectedCity(newAddr.suburb);
    }
  };

  const handleDeleteAddress = (id) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSelectAddress = (addr) => {
    setActiveAddressId(addr.id);
    if (addr.suburb) {
      setSelectedCity(addr.suburb);
    }
  };

  const handleCancelOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
    setTrackingOrder(null);
    setCompletedOrder(null);
    cancelOrderApi(orderId);
  };

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('unavu_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('unavu_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('unavu_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist Favorites & Cart
  useEffect(() => {
    localStorage.setItem('unavu_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('unavu_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleFavorite = (resId) => {
    setFavorites(prev => 
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

  // Cart Operations
  const handleAddToCart = (dish, restaurant) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === dish.id);
      if (exists) {
        return prev.map(i => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          isVeg: dish.isVeg,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          quantity: 1
        }
      ];
    });
  };

  const handleUpdateQuantity = (dishId, delta) => {
    setCartItems(prev => {
      return prev
        .map(i => {
          if (i.id === dishId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handlePlaceOrder = (orderSummary) => {
    const newOrderId = orderSummary?.orderId || ('UNV-' + Math.floor(100000 + Math.random() * 900000));
    const newOrderObj = {
      orderId: newOrderId,
      customerName: user ? user.name : 'Suburban Foodie',
      customerEmail: user?.email || 'rajacofficial369@gmail.com',
      customerPhone: orderSummary?.customerPhone || (user ? user.phone : '+91 98401 23456'),
      restaurantId: cartItems[0]?.restaurantId || 'res-perungalathur-1',
      restaurantName: cartItems[0]?.restaurantName || 'SS Hyderabad Biryani',
      restaurantAddress: 'GST Road Hub',
      customerAddress: orderSummary?.customerAddress || orderSummary?.address || `${selectedCity?.name || 'Perungalathur'} Hub, Chennai`,
      locality: selectedCity?.name || 'Perungalathur',
      doorNo: orderSummary?.doorNo || '',
      streetAddress: orderSummary?.streetAddress || '',
      landmark: orderSummary?.landmark || '',
      deliveryCoords: orderSummary?.deliveryCoords || null,
      items: [...cartItems],
      itemTotal: cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      deliveryFee: orderSummary?.deliveryFee !== undefined ? orderSummary.deliveryFee : 35,
      deliveryDistanceKm: orderSummary?.deliveryDistanceKm || null,
      platformFee: 5,
      taxes: Math.round(cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) * 0.05),
      discount: orderSummary?.discount || 0,
      grandTotal: orderSummary?.grandTotal,
      status: 'PLACED', // Hotel sees this as new KOT
      paymentMethod: orderSummary?.paymentMethod || 'UPI',
      paymentStatus: orderSummary?.paymentStatus || 'PAID',
      deliveryOtp: orderSummary?.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000)),
      riderId: null,
      riderName: null,
      riderPhone: null,
      riderEarnings: 60,
      placedAt: 'Just now',
      etaMins: 24,
      cookingNote: orderSummary?.cookingNote || ''
    };

    setOrders(prev => [newOrderObj, ...prev]);
    setCompletedOrder(newOrderObj);
    setCartItems([]);
    setIsCartOpen(false);
    createOrderApi(newOrderObj);
    sendOrderWhatsAppNotificationApi(newOrderObj);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));
    updateOrderStatusApi(orderId, newStatus);
  };

  const handleAcceptTrip = (orderId) => {
    const existingOrder = orders.find(o => o.orderId === orderId);
    if (!existingOrder) return false;

    // Strict 1-Trip Limit: Rider cannot take multiple concurrent trips!
    const activeTrip = orders.find(o => 
      (o.riderId === 'rider-1' || o.riderName === 'Murugan S.') && 
      o.status !== 'DELIVERED'
    );

    if (activeTrip) {
      alert(`⚠️ Rider Trip Concurrency Rule: You already have active trip #${activeTrip.orderId} in progress. You must complete doorstep delivery and verify OTP for #${activeTrip.orderId} before accepting another trip.`);
      return false;
    }

    // Transition status to OUT_FOR_DELIVERY if ready, otherwise assign rider while cooking
    const targetStatus = existingOrder.status === 'READY_FOR_PICKUP' ? 'OUT_FOR_DELIVERY' : existingOrder.status;

    const riderDetails = {
      riderId: 'rider-1',
      riderName: 'Murugan S.',
      riderPhone: '+91 98765 43210',
      status: targetStatus
    };
    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return {
          ...o,
          ...riderDetails
        };
      }
      return o;
    }));
    updateOrderStatusApi(orderId, targetStatus, riderDetails);
    return true;
  };

  const handleSimulateNewOrder = (hotel) => {
    const simulatedItem = hotel.menu[0];
    const newId = 'UNV-' + Math.floor(100000 + Math.random() * 900000);
    const simulated = {
      orderId: newId,
      customerName: 'Ashwin Raman',
      customerPhone: '+91 98410 77654',
      restaurantId: hotel.id,
      restaurantName: hotel.name,
      restaurantAddress: hotel.address,
      customerAddress: `Near ${hotel.region} Junction`,
      locality: hotel.region,
      items: [{ id: simulatedItem.id, name: simulatedItem.name, price: simulatedItem.price, quantity: 2 }],
      itemTotal: simulatedItem.price * 2,
      deliveryFee: 35,
      platformFee: 5,
      taxes: Math.round(simulatedItem.price * 2 * 0.05),
      discount: 100,
      grandTotal: (simulatedItem.price * 2) + 35 + 5 + Math.round(simulatedItem.price * 2 * 0.05) - 100,
      status: 'PLACED',
      deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
      riderId: null,
      riderName: null,
      riderPhone: null,
      riderEarnings: 65,
      placedAt: 'Just now',
      etaMins: 20,
      cookingNote: 'Less spicy please'
    };
    setOrders(prev => [simulated, ...prev]);
    createOrderApi(simulated);
  };

  const resetFilters = () => {
    setFilters({
      pureVeg: false,
      rating4Plus: false,
      fastDelivery: false,
      hasOffer: false,
      priceRange: 'all'
    });
    setSortBy('relevance');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Filter & Sort Logic for Customer App
  const filteredRestaurants = useMemo(() => {
    return restaurantsList.filter(res => {
      // Filter by locality if a specific location/suburb is selected (skip if "All Locations")
      if (selectedCity && !selectedCity.isAll) {
        if (res.region && !res.region.toLowerCase().includes(selectedCity.name.toLowerCase())) {
          // If searching or user clicked a category, allow cross-area items
          if (!searchQuery && !selectedCategory) return false;
        }
      }

      // Service Tab filtering
      if (activeTab === 'delivery' && !res.delivery) return false;
      if (activeTab === 'dining' && !res.diningOut) return false;
      if (activeTab === 'nightlife' && !res.nightlife) return false;

      // Pure Veg Filter
      if (filters.pureVeg && !res.pureVeg) return false;

      // Rating 4.0+
      if (filters.rating4Plus && res.rating < 4.0) return false;

      // Fast Delivery (< 30 mins)
      if (filters.fastDelivery && res.deliveryTimeMins > 30) return false;

      // Has Offer
      if (filters.hasOffer && !res.offer) return false;

      // Price Range Filter
      if (filters.priceRange === 'under400' && res.costForTwo >= 400) return false;
      if (filters.priceRange === '400to700' && (res.costForTwo < 400 || res.costForTwo > 700)) return false;
      if (filters.priceRange === 'above700' && res.costForTwo <= 700) return false;

      // Category filter
      if (selectedCategory) {
        const catLower = selectedCategory.toLowerCase();
        const hasCuisine = res.cuisines.some(c => c.toLowerCase().includes(catLower));
        const hasDish = res.menu.some(m => m.name.toLowerCase().includes(catLower) || m.category.toLowerCase().includes(catLower));
        if (!hasCuisine && !hasDish) return false;
      }

      // Universal search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = res.name.toLowerCase().includes(q);
        const matchRegion = res.region && res.region.toLowerCase().includes(q);
        const matchCuisine = res.cuisines.some(c => c.toLowerCase().includes(q));
        const matchDish = res.menu.some(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
        if (!matchName && !matchRegion && !matchCuisine && !matchDish) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'deliveryTime') return a.deliveryTimeMins - b.deliveryTimeMins;
      if (sortBy === 'costAsc') return a.costForTwo - b.costForTwo;
      if (sortBy === 'costDesc') return b.costForTwo - a.costForTwo;
      return 0;
    });
  }, [activeTab, filters, sortBy, selectedCategory, searchQuery, selectedCity, restaurantsList]);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartAmount = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  // Portal live counts
  const pendingKitchenOrdersCount = orders.filter(o => o.status === 'PLACED' || o.status === 'PREPARING').length;
  const availableRiderTripsCount = orders.filter(o => o.status === 'READY_FOR_PICKUP' && !o.riderId).length;

  return (
    <div className="app-root">
      {/* Universal Multi-Portal Switcher Bar (Role Sensitive) */}
      <PortalSwitcher
        currentPortal={currentPortal}
        setCurrentPortal={setCurrentPortal}
        cartCount={totalCartCount}
        pendingKitchenOrdersCount={pendingKitchenOrdersCount}
        availableRiderTripsCount={availableRiderTripsCount}
        totalOrdersCount={orders.length}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* 1. CUSTOMER PORTAL */}
      {currentPortal === 'customer' && (
        <>
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cartCount={totalCartCount}
            cartTotal={totalCartAmount}
            setIsCartOpen={setIsCartOpen}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            setIsAuthOpen={setIsAuthOpen}
            onOpenAuth={handleOpenAuth}
            user={user}
            onOpenMyOrders={() => setIsMyOrdersOpen(true)}
            activeOrdersCount={orders.filter(o => o.status !== 'DELIVERED').length}
            onOpenAddressBook={() => setIsAddressBookOpen(true)}
            onLogout={handleLogout}
            currentPortal={currentPortal}
            onSwitchPortal={setCurrentPortal}
            onOpenRegisterRestaurant={() => setIsRegisterRestaurantOpen(true)}
          />

          {activeTab === 'orders' ? (
            <UserOrdersPage
              user={user}
              orders={orders}
              onSelectOrderToTrack={(ord) => setTrackingOrder(ord)}
              onReorder={(ord) => {
                if (ord.items && ord.items.length > 0) {
                  setCartItems(ord.items);
                  setIsCartOpen(true);
                  setActiveTab('delivery');
                }
              }}
              onBackToMenu={() => setActiveTab('delivery')}
              onOpenAuth={handleOpenAuth}
              onSwitchUser={(targetEmail) => {
                const target = usersList.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
                if (target) {
                  handleLoginSuccess({
                    name: target.name,
                    email: target.email,
                    phone: target.phone,
                    role: target.role,
                    authProvider: 'google',
                    isVerified: true
                  });
                }
              }}
            />
          ) : (
            <main className="main-content">
              <div className="container">
                {/* Exclusive Regional Offers Strip for Perungalathur, Vandalur & Mannivakkam */}
                <RegionalOffersStrip
                  selectedCity={selectedCity}
                  onSelectRegion={(reg) => {
                    const foundCity = CITIES.find(c => c.name.toLowerCase().includes(reg.toLowerCase()));
                    if (foundCity) setSelectedCity(foundCity);
                    setSearchQuery('');
                  }}
                  onApplyPromoCode={(code) => {
                    setPrefilledCoupon(code);
                    setIsCartOpen(true);
                  }}
                />

                {/* Quick Foodie Cravings Filter Bar */}
                <div className="home-quick-cravings-bar animate-fade">
                  <div className="cravings-label">
                    <Flame size={16} className="cravings-fire-icon" />
                    <span>Quick Cravings:</span>
                  </div>
                  <div className="cravings-chips-scroll">
                    {[
                      { label: '🍗 Biryani', query: 'biryani' },
                      { label: '🥞 Dosa & Tiffin', query: 'dosa' },
                      { label: '🥘 Parotta & Salna', query: 'parotta' },
                      { label: '🍢 Shawarma & Grill', query: 'shawarma' },
                      { label: '🌱 Pure Veg', filter: 'pureVeg' },
                      { label: '⚡ Fast Delivery (20m)', filter: 'fastDelivery' },
                      { label: '🏷️ Top Offers', filter: 'offers' },
                      { label: '⭐ Rating 4.0+', filter: 'rating4Plus' }
                    ].map((chip) => {
                      const isActive = chip.query 
                        ? searchQuery.toLowerCase().includes(chip.query) 
                        : (chip.filter ? filters[chip.filter] : false);
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          className={`cravings-chip ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            if (chip.query) {
                              setSearchQuery(searchQuery.toLowerCase() === chip.query ? '' : chip.query);
                            } else if (chip.filter) {
                              setFilters(prev => ({ ...prev, [chip.filter]: !prev[chip.filter] }));
                            }
                          }}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inspiration Category Carousel */}
                {activeTab === 'delivery' && (
                  <CategoryCarousel
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                )}

                {/* Curated Collections */}
                {activeTab !== 'delivery' && (
                  <Collections 
                    onSelectCollection={(col) => {
                      setSearchQuery(col.tag.includes('Campus') ? 'shawarma' : 'biryani');
                    }} 
                  />
                )}
              </div>

              {/* Sticky Filter Bar */}
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onResetFilters={resetFilters}
              />

              {/* Restaurants Grid Section */}
              <div className="container restaurant-section">
                <div className="results-headline-row">
                  <h2 className="results-title">
                    {selectedCity?.isAll
                      ? (activeTab === 'delivery' ? 'Top Rated Food Delivery in Chennai' : activeTab === 'dining' ? 'Best Dining Spots in Chennai' : 'Nightlife & Pubs in Chennai')
                      : (activeTab === 'delivery' ? 'Food Delivery in ' + selectedCity.name : activeTab === 'dining' ? 'Best Dining Spots in ' + selectedCity.name : 'Nightlife & Pubs in ' + selectedCity.name)
                    }
                    {selectedCategory && ` (${selectedCategory})`}
                  </h2>
                  <span className="results-count">
                    {filteredRestaurants.length} restaurant{filteredRestaurants.length === 1 ? '' : 's'} available
                  </span>
                </div>

                {filteredRestaurants.length > 0 ? (
                  <div className="restaurants-grid">
                    {filteredRestaurants.map(restaurant => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onOpenModal={setActiveRestaurantModal}
                        isFavorite={favorites.includes(restaurant.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-results-box animate-fade">
                    <div className="empty-results-icon">🔍</div>
                    <h3>No restaurants matched your filters in {selectedCity.name}</h3>
                    <p>Try resetting some filters or searching for another dish or cuisine.</p>
                    <button className="btn-primary" onClick={resetFilters}>
                      Reset All Filters
                    </button>
                  </div>
                )}

                {/* Merchant Onboarding CTA Banner */}
                <div className="merchant-onboarding-home-banner animate-fade">
                  <div className="mo-banner-content">
                    <div className="mo-banner-icon">🏪</div>
                    <div className="mo-banner-text">
                      <h3>Are you a Restaurant or Cloud Kitchen Owner?</h3>
                      <p>Partner with <strong>Unavukadai</strong> across Perungalathur, Vandalur, Mannivakkam &amp; Tambaram. Get live WhatsApp KOTs, automated fleet delivery, and zero listing fee.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="btn-primary mo-banner-btn"
                    onClick={() => setIsRegisterRestaurantOpen(true)}
                  >
                    <span>Register Restaurant Free</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </main>
          )}

          <Footer />

          {/* Restaurant Detail Modal */}
          {activeRestaurantModal && (
            <RestaurantModal
              restaurant={activeRestaurantModal}
              onClose={() => setActiveRestaurantModal(null)}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onOpenCart={() => {
                setActiveRestaurantModal(null);
                setIsCartOpen(true);
              }}
            />
          )}

          {/* Slide-over Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            user={user}
            merchantUpi={settings?.merchantUpi || '8248651695-3@ybl'}
            onPlaceOrder={handlePlaceOrder}
            couponsList={couponsList}
            prefilledCoupon={prefilledCoupon}
            savedAddresses={savedAddresses}
            onOpenAddressBook={() => setIsAddressBookOpen(true)}
          />

          {/* Active Order Floating Tracker Bar */}
          <ActiveOrderFloatingBar
            activeOrder={orders.find(o => o.status !== 'DELIVERED')}
            onOpenTracker={() => setTrackingOrder(orders.find(o => o.status !== 'DELIVERED'))}
          />

          {/* Customer Orders & History Modal */}
          <MyOrdersModal
            isOpen={isMyOrdersOpen}
            onClose={() => setIsMyOrdersOpen(false)}
            orders={orders}
            user={user}
            onSelectOrderToTrack={(ord) => setTrackingOrder(ord)}
            onViewFullOrdersPage={() => {
              setIsMyOrdersOpen(false);
              setActiveTab('orders');
            }}
            onOpenAuth={handleOpenAuth}
          />

          {/* Live Real-Time Order Tracker Modal */}
          {(trackingOrder || completedOrder) && (
            <OrderSuccessModal
              order={trackingOrder || completedOrder}
              orders={orders}
              onClose={() => {
                setTrackingOrder(null);
                setCompletedOrder(null);
              }}
              onCancelOrder={handleCancelOrder}
              riderLiveLocation={riderLocations[trackingOrder?.riderId || completedOrder?.riderId || 'rider-1']}
            />
          )}

          {/* Auth Modal (Google / Gmail & Mobile OTP) */}
          <AuthModal
            isOpen={isAuthOpen}
            initialTab={authInitialTab}
            onClose={() => setIsAuthOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />

          {/* Saved Address Book & Settings Modal */}
          <AddressBookModal
            isOpen={isAddressBookOpen}
            onClose={() => setIsAddressBookOpen(false)}
            addresses={savedAddresses}
            activeAddressId={activeAddressId}
            onSelectAddress={handleSelectAddress}
            onSaveAddress={handleSaveAddress}
            onDeleteAddress={handleDeleteAddress}
          />

          {/* Restaurant Registration & Merchant Onboarding Modal */}
          <RegisterRestaurantModal
            isOpen={isRegisterRestaurantOpen}
            onClose={() => setIsRegisterRestaurantOpen(false)}
            onRegisterRestaurant={handleRegisterRestaurant}
            currentUser={user}
            isAdmin={user?.role === 'admin'}
          />

          {/* Mobile-Native Bottom Navigation Bar */}
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSearch={() => {
              const searchInput = document.querySelector('.search-input-box input');
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            onOpenAddresses={() => setIsAddressBookOpen(true)}
            onOpenMyOrders={() => setActiveTab('orders')}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={totalCartCount}
            cartTotal={totalCartAmount}
            activeOrdersCount={orders.filter(o => o.status !== 'DELIVERED').length}
            currentAddressTag={savedAddresses.find(a => a.id === activeAddressId)?.tag || 'Home'}
          />
        </>
      )}

      {/* 2. HOTEL / RESTAURANT MERCHANT PORTAL */}
      {currentPortal === 'hotel' && (
        <HotelPortal
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onSimulateNewOrder={handleSimulateNewOrder}
          onToggleItemStock={handleToggleItemStock}
          restaurantStock={restaurantStock}
          restaurantsList={restaurantsList}
          onAddMenuItem={handleAddMenuItem}
          onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
          onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
        />
      )}

      {/* 3. DELIVERY RIDER PARTNER PORTAL */}
      {currentPortal === 'rider' && (
        <RiderPortal
          orders={orders}
          onAcceptTrip={handleAcceptTrip}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          riderName="Murugan S."
          riderLocation={riderLocations['rider-1']}
          onUpdateLocation={handleUpdateRiderLocation}
        />
      )}

      {/* 4. SUPER ADMIN CONSOLE */}
      {currentPortal === 'admin' && (
        <AdminPortal
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAddCoupon={handleAddCoupon}
          couponsList={couponsList}
          riderLocations={riderLocations}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetOrders={handleResetOrders}
          usersList={usersList}
          onUpdateUserRole={handleUpdateUserRole}
          onToggleUserStatus={handleToggleUserStatus}
          currentUser={user}
          onSwitchPortal={setCurrentPortal}
          restaurantsList={restaurantsList}
          onOpenRegisterRestaurant={() => setIsRegisterRestaurantOpen(true)}
        />
      )}
    </div>
  );
}
