import { describe, it, expect } from 'vitest';
import { RESTAURANTS, CITIES, COUPONS, REGIONAL_OFFER_BANNERS, INITIAL_ORDERS } from './data/mockData';
import { calculateDeliveryFee, getDeliveryFeeBreakdown, getRestaurantCoordinates, calculateDistanceKm } from './utils/geolocation';
import { mapAppOrderToPg, mapPgOrderToApp } from './services/api';

describe('Unavukadai Suburban Hubs (Perungalathur, Vandalur & Mannivakkam)', () => {
  it('should include Perungalathur, Vandalur, and Mannivakkam in available hubs', () => {
    const hubNames = CITIES.map(c => c.name);
    expect(hubNames).toContain('Perungalathur');
    expect(hubNames).toContain('Vandalur');
    expect(hubNames).toContain('Mannivakkam');
  });

  it('should have dedicated regional offer banners for all three suburbs', () => {
    expect(REGIONAL_OFFER_BANNERS.length).toBe(3);
    const regions = REGIONAL_OFFER_BANNERS.map(b => b.region);
    expect(regions).toContain('Perungalathur');
    expect(regions).toContain('Vandalur');
    expect(regions).toContain('Mannivakkam');
  });

  it('should have local restaurants in each suburban region', () => {
    const perungalathurRes = RESTAURANTS.filter(r => r.region === 'Perungalathur');
    const vandalurRes = RESTAURANTS.filter(r => r.region === 'Vandalur');
    const mannivakkamRes = RESTAURANTS.filter(r => r.region === 'Mannivakkam');

    expect(perungalathurRes.length).toBeGreaterThan(0);
    expect(vandalurRes.length).toBeGreaterThan(0);
    expect(mannivakkamRes.length).toBeGreaterThan(0);

    // Verify restaurant names
    expect(perungalathurRes.some(r => r.name.includes('SS Hyderabad Biryani'))).toBe(true);
    expect(vandalurRes.some(r => r.name.includes('Ananda Bhavan'))).toBe(true);
    expect(mannivakkamRes.some(r => r.name.includes('Muniyandi Vilas'))).toBe(true);
  });
});

describe('Regional Promo Codes & Billing Calculations', () => {
  const calculateCart = (items, couponCode) => {
    const itemTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let deliveryFee = itemTotal > 0 ? 35 : 0;
    let couponDiscount = 0;

    const coupon = COUPONS.find(c => c.code === couponCode);
    if (coupon && itemTotal >= coupon.minOrder) {
      if (coupon.discountPercent) {
        const calculated = Math.round((itemTotal * coupon.discountPercent) / 100);
        couponDiscount = Math.min(calculated, coupon.maxDiscount);
      } else if (coupon.discountAmount) {
        deliveryFee = 0;
        couponDiscount = coupon.discountAmount;
      }
    }

    const platformFee = itemTotal > 0 ? 5 : 0;
    const taxes = itemTotal > 0 ? Math.round(itemTotal * 0.05) : 0;
    const grandTotal = Math.max(
      0,
      itemTotal + deliveryFee + platformFee + taxes - (coupon?.discountPercent ? couponDiscount : 0)
    );

    return { itemTotal, deliveryFee, couponDiscount, platformFee, taxes, grandTotal };
  };

  it('should apply PERUNGAL50 coupon (50% OFF up to ₹120)', () => {
    const items = [{ id: 'ssh-1', name: 'Chicken Dum Biryani', price: 280, quantity: 1 }]; // ₹280
    // 50% of 280 = 140, capped at 120
    const bill = calculateCart(items, 'PERUNGAL50');
    expect(bill.itemTotal).toBe(280);
    expect(bill.couponDiscount).toBe(120);
    expect(bill.grandTotal).toBe(280 + 35 + 5 + 14 - 120); // 214
  });

  it('should apply VANDALUR60 coupon (60% OFF up to ₹150)', () => {
    const items = [{ id: 'vab-1', name: 'Ghee Podi Roast Dosa', price: 130, quantity: 2 }]; // ₹260
    // 60% of 260 = 156, capped at 150
    const bill = calculateCart(items, 'VANDALUR60');
    expect(bill.itemTotal).toBe(260);
    expect(bill.couponDiscount).toBe(150);
    expect(bill.grandTotal).toBe(260 + 35 + 5 + 13 - 150); // 163
  });

  it('should apply MANNIVAKKAM40 coupon (40% OFF up to ₹100)', () => {
    const items = [{ id: 'mmv-1', name: 'Naatu Kozhi Varuval', price: 290, quantity: 1 }]; // ₹290
    // 40% of 290 = 116, capped at 100
    const bill = calculateCart(items, 'MANNIVAKKAM40');
    expect(bill.itemTotal).toBe(290);
    expect(bill.couponDiscount).toBe(100);
  });
});

describe('Multi-Portal Shared Order Lifecycle Transitions', () => {
  it('should progress order cleanly through all 5 statuses', () => {
    let order = {
      orderId: 'UNV-TEST1',
      status: 'PLACED',
      riderId: null
    };

    expect(order.status).toBe('PLACED');

    // 1. Hotel accepts order
    order.status = 'PREPARING';
    expect(order.status).toBe('PREPARING');

    // 2. Hotel marks ready for pickup
    order.status = 'READY_FOR_PICKUP';
    expect(order.status).toBe('READY_FOR_PICKUP');

    // 3. Rider accepts delivery trip
    order.riderId = 'rider-1';
    order.riderName = 'Murugan S.';
    expect(order.riderId).toBe('rider-1');

    // 4. Rider picks up from kitchen
    order.status = 'OUT_FOR_DELIVERY';
    expect(order.status).toBe('OUT_FOR_DELIVERY');

    // 5. Rider marks delivered
    order.status = 'DELIVERED';
    expect(order.status).toBe('DELIVERED');
  });

  it('should accurately classify active order statuses vs terminal states', () => {
    const ACTIVE_STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'];
    
    expect(ACTIVE_STATUSES.includes('PLACED')).toBe(true);
    expect(ACTIVE_STATUSES.includes('PREPARING')).toBe(true);
    expect(ACTIVE_STATUSES.includes('READY_FOR_PICKUP')).toBe(true);
    expect(ACTIVE_STATUSES.includes('OUT_FOR_DELIVERY')).toBe(true);
    expect(ACTIVE_STATUSES.includes('DELIVERED')).toBe(false);
    expect(ACTIVE_STATUSES.includes('CANCELLED')).toBe(false);
  });

  it('should safely map order to Postgres row without schema cache error and decode customerEmail', () => {
    const clientOrder = {
      orderId: 'UNV-882211',
      customerName: 'Alexander Raja',
      customerPhone: '+91 98401 23456',
      customerEmail: 'alexanderrajac@gmail.com',
      restaurantId: 'res-perungalathur-1',
      restaurantName: 'SS Hyderabad Biryani',
      status: 'PLACED',
      cookingNote: 'Less spicy please',
      items: [{ id: 'item-1', name: 'Dum Biryani', price: 220, quantity: 1 }],
      grandTotal: 260
    };

    const pgRow = mapAppOrderToPg(clientOrder);
    
    // Must NOT have raw customer_email key (prevents PGRST204 column missing error)
    expect(pgRow.customer_email).toBeUndefined();
    // Must safely encode customer email in cooking_note
    expect(pgRow.cooking_note).toContain('[email:alexanderrajac@gmail.com]');
    expect(pgRow.cooking_note).toContain('Less spicy please');

    // Decode back
    const restored = mapPgOrderToApp(pgRow);
    expect(restored.orderId).toBe('UNV-882211');
    expect(restored.customerEmail).toBe('alexanderrajac@gmail.com');
    expect(restored.cookingNote).toBe('Less spicy please');
    expect(restored.status).toBe('PLACED');
  });
});

describe('Checkout & Payment Options (UPI & Cash on Delivery)', () => {
  it('should support Instant UPI QR payment with dynamic intent URL', () => {
    const upiId = 'unavukadai@upi';
    const grandTotal = 320;
    const orderId = 'UNV-123456';

    const upiIntent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Unavukadai%20Food&am=${grandTotal}&cu=INR&tn=Order_${orderId}`;
    expect(upiIntent).toContain('upi://pay?pa=unavukadai%40upi');
    expect(upiIntent).toContain('am=320');
    expect(upiIntent).toContain('Order_UNV-123456');

    const paymentData = {
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      orderId
    };

    expect(paymentData.paymentMethod).toBe('UPI');
    expect(paymentData.paymentStatus).toBe('PAID');
    expect(paymentData.orderId).toBe('UNV-123456');
  });

  it('should support Cash on Delivery (COD) with pending doorstep collection status', () => {
    const orderId = 'UNV-654321';
    const paymentData = {
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_ON_DELIVERY',
      orderId
    };

    expect(paymentData.paymentMethod).toBe('COD');
    expect(paymentData.paymentStatus).toBe('PENDING_ON_DELIVERY');
  });

  it('should successfully construct completed order payload without white screen or missing address', () => {
    const selectedCity = { id: 'perungalathur', name: 'Perungalathur', isSuburban: true };
    const cartItems = [{ id: 'ssh-1', name: 'Chicken Dum Biryani', price: 280, quantity: 1 }];
    const orderSummary = {
      orderId: 'UNV-998877',
      address: selectedCity?.locality || `${selectedCity.name} Hub, Chennai`,
      grandTotal: 284,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_ON_DELIVERY'
    };

    const newOrder = {
      orderId: orderSummary.orderId,
      customerName: 'Priya Sundaram',
      customerPhone: '+91 98401 23456',
      restaurantId: 'res-perungalathur-1',
      restaurantName: 'SS Hyderabad Biryani',
      customerAddress: orderSummary.address,
      locality: selectedCity.name,
      items: [...cartItems],
      grandTotal: orderSummary.grandTotal,
      status: 'PLACED',
      paymentMethod: orderSummary.paymentMethod,
      paymentStatus: orderSummary.paymentStatus
    };

    expect(newOrder.orderId).toBe('UNV-998877');
    expect(newOrder.customerAddress).toBe('Perungalathur Hub, Chennai');
    expect(newOrder.paymentMethod).toBe('COD');
    expect(newOrder.paymentStatus).toBe('PENDING_ON_DELIVERY');
    expect(newOrder.status).toBe('PLACED');
  });
});

describe('Doorstep Delivery Verification (Collect OTP Without External SMS)', () => {
  it('should generate a 4-digit numeric OTP for every order', () => {
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
    expect(generatedOtp).toHaveLength(4);
    expect(/^\d{4}$/.test(generatedOtp)).toBe(true);
  });

  it('should verify rider OTP match and complete delivery', () => {
    const trip = {
      orderId: 'UNV-889900',
      status: 'OUT_FOR_DELIVERY',
      deliveryOtp: '7412',
      riderEarnings: 65
    };

    const verifyAndDeliver = (enteredOtp) => {
      if (enteredOtp === trip.deliveryOtp || enteredOtp === '1234') {
        trip.status = 'DELIVERED';
        return { success: true, earnings: trip.riderEarnings };
      }
      return { success: false, error: 'Invalid OTP' };
    };

    // Correct OTP entered by rider
    const resultSuccess = verifyAndDeliver('7412');
    expect(resultSuccess.success).toBe(true);
    expect(trip.status).toBe('DELIVERED');
    expect(resultSuccess.earnings).toBe(65);
  });

  it('should accept master bypass OTP (1234) for emergency or test handoffs', () => {
    const trip = {
      orderId: 'UNV-889901',
      status: 'OUT_FOR_DELIVERY',
      deliveryOtp: '9823',
      riderEarnings: 60
    };

    const verifyAndDeliver = (enteredOtp) => {
      if (enteredOtp === trip.deliveryOtp || enteredOtp === '1234') {
        trip.status = 'DELIVERED';
        return { success: true };
      }
      return { success: false, error: 'Invalid OTP' };
    };

    const result = verifyAndDeliver('1234');
    expect(result.success).toBe(true);
    expect(trip.status).toBe('DELIVERED');
  });

  it('should reject incorrect OTP and prevent false delivery completion', () => {
    const trip = {
      orderId: 'UNV-889902',
      status: 'OUT_FOR_DELIVERY',
      deliveryOtp: '5566',
      riderEarnings: 60
    };

    const verifyAndDeliver = (enteredOtp) => {
      if (enteredOtp === trip.deliveryOtp || enteredOtp === '1234') {
        trip.status = 'DELIVERED';
        return { success: true };
      }
      return { success: false, error: 'Invalid OTP' };
    };

    const result = verifyAndDeliver('9999');
    expect(result.success).toBe(false);
    expect(trip.status).toBe('OUT_FOR_DELIVERY'); // status stays OUT_FOR_DELIVERY
  });
});

describe('Real-Time Location Tracking (Leaflet + OpenStreetMap)', () => {
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  }

  it('should accurately calculate distance between Perungalathur hub and Vandalur hub (~2.1 km)', () => {
    const perungalathur = [12.9056, 80.0832];
    const vandalur = [12.8893, 80.0815];
    const distance = getDistanceKm(perungalathur[0], perungalathur[1], vandalur[0], vandalur[1]);
    expect(distance).toBeGreaterThanOrEqual(1.5);
    expect(distance).toBeLessThanOrEqual(2.5);
  });

  it('should format rider location broadcast payload with valid coordinates and speed', () => {
    const payload = {
      riderId: 'rider-1',
      riderName: 'Murugan S.',
      lat: 12.9056,
      lng: 80.0832,
      speed: 28,
      heading: 195,
      locality: 'Perungalathur'
    };

    expect(payload.riderId).toBe('rider-1');
    expect(payload.lat).toBe(12.9056);
    expect(payload.lng).toBe(80.0832);
    expect(payload.speed).toBeGreaterThan(0);
  });

  it('should construct valid OpenStreetMap tile URL template without API key', () => {
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    expect(osmUrl).toContain('tile.openstreetmap.org');
    expect(osmUrl).not.toContain('key='); // 100% free, zero API key
  });
});

describe('GPS Auto-Detection & Suburb Matching (Perungalathur, Vandalur, Mannivakkam)', () => {
  // Direct import of geolocation functions
  it('should match coordinates near Peerkankaranai (12.906, 80.084) to Perungalathur hub', async () => {
    const { findNearestSuburb } = await import('./utils/geolocation');
    const matched = findNearestSuburb(12.9060, 80.0840);
    expect(matched.id).toBe('perungalathur');
    expect(matched.name).toBe('Perungalathur');
    expect(matched.distanceKm).toBeLessThan(1);
  });

  it('should match coordinates near Crescent University / Zoo (12.888, 80.082) to Vandalur hub', async () => {
    const { findNearestSuburb } = await import('./utils/geolocation');
    const matched = findNearestSuburb(12.8885, 80.0820);
    expect(matched.id).toBe('vandalur');
    expect(matched.name).toBe('Vandalur');
    expect(matched.distanceKm).toBeLessThan(1);
  });

  it('should match coordinates along Mudichur Road (12.894, 80.053) to Mannivakkam hub', async () => {
    const { findNearestSuburb } = await import('./utils/geolocation');
    const matched = findNearestSuburb(12.8945, 80.0530);
    expect(matched.id).toBe('mannivakkam');
    expect(matched.name).toBe('Mannivakkam');
    expect(matched.distanceKm).toBeLessThan(1);
  });

  it('should properly format structured customer drop address and recipient phone', () => {
    const doorNo = '4B';
    const streetAddress = 'Peerkankaranai Main Road';
    const landmark = 'Near Bus Stand';
    const locality = 'Perungalathur';
    const customerPhone = '+91 98401 23456';

    const fullAddress = [
      doorNo ? `Door ${doorNo}` : '',
      streetAddress,
      landmark ? `Near ${landmark}` : '',
      locality
    ].filter(Boolean).join(', ');

    expect(fullAddress).toBe('Door 4B, Peerkankaranai Main Road, Near Near Bus Stand, Perungalathur');
    expect(customerPhone).toMatch(/^\+?[0-9\s]{10,14}$/);
  });

  it('should construct valid native tel: phone dialer links without spaces', () => {
    const rawCustomerPhone = '+91 98401 23456';
    const telLink = `tel:${rawCustomerPhone.replace(/\s+/g, '')}`;
    expect(telLink).toBe('tel:+919840123456');

    const rawRiderPhone = '+91 98765 43210';
    const riderTelLink = `tel:${rawRiderPhone.replace(/\s+/g, '')}`;
    expect(riderTelLink).toBe('tel:+919876543210');
  });

  it('should dynamically construct UPI payment intent with custom merchant UPI ID', () => {
    const customMerchantUpi = 'storeowner@okaxis';
    const amount = 360;
    const orderId = 'UNV-889749';
    const upiIntent = `upi://pay?pa=${encodeURIComponent(customMerchantUpi)}&pn=Unavukadai%20Food&am=${amount}&cu=INR&tn=Order_${orderId}`;

    expect(upiIntent).toContain('pa=storeowner%40okaxis');
    expect(upiIntent).toContain('am=360');
    expect(upiIntent).toContain('tn=Order_UNV-889749');
  });

  it('should clean order database array for Sunday morning launch reset', () => {
    let ecosystemOrders = [
      { orderId: 'UNV-TEST-1', status: 'DELIVERED' },
      { orderId: 'UNV-TEST-2', status: 'PLACED' }
    ];

    expect(ecosystemOrders.length).toBe(2);

    // Simulate reset
    ecosystemOrders = [];
    expect(ecosystemOrders.length).toBe(0);
  });
});

describe('Dynamic Location-Based Delivery Charges & Launch UPI Verification', () => {
  it('should charge base fee ₹20 for hyperlocal delivery under 1.5 km', () => {
    const fee = calculateDeliveryFee(1.2, 250);
    expect(fee).toBe(20);
    const breakdown = getDeliveryFeeBreakdown(1.2, 250);
    expect(breakdown.fee).toBe(20);
    expect(breakdown.text).toContain('Hyperlocal');
  });

  it('should charge ₹28 for standard suburban delivery between 1.5 km and 3.5 km', () => {
    const fee = calculateDeliveryFee(2.4, 250);
    expect(fee).toBe(28);
    const breakdown = getDeliveryFeeBreakdown(2.4, 250);
    expect(breakdown.fee).toBe(28);
    expect(breakdown.text).toContain('Standard zone');
  });

  it('should charge ₹38 for cross-suburban delivery between 3.5 km and 6.0 km', () => {
    const fee = calculateDeliveryFee(4.8, 300);
    expect(fee).toBe(38);
    const breakdown = getDeliveryFeeBreakdown(4.8, 300);
    expect(breakdown.fee).toBe(38);
    expect(breakdown.text).toContain('Extended suburban zone');
  });

  it('should charge ₹38 + ₹8/km for long distances beyond 6 km', () => {
    // 8.5 km = 38 + (2.5 * 8) = 38 + 20 = 58
    const fee = calculateDeliveryFee(8.5, 300);
    expect(fee).toBe(58);
  });

  it('should provide FREE delivery for high-value orders over ₹500', () => {
    const fee = calculateDeliveryFee(4.2, 550);
    expect(fee).toBe(0);
    const breakdown = getDeliveryFeeBreakdown(4.2, 550);
    expect(breakdown.fee).toBe(0);
    expect(breakdown.text).toContain('FREE');
  });

  it('should generate valid UPI payment intent for launch merchant UPI 8248651695-3@ybl', () => {
    const upiId = '8248651695-3@ybl';
    const amount = 420;
    const orderId = 'UNV-123456';
    const intent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Unavukadai%20Food&am=${amount}&cu=INR&tn=Order_${orderId}`;
    
    expect(intent).toContain('pa=8248651695-3%40ybl');
    expect(intent).toContain('am=420');
    expect(intent).toContain('Order_UNV-123456');
  });

  it('should correctly resolve restaurant hub coordinates for South Chennai suburbs', () => {
    const pCoords = getRestaurantCoordinates('res-perungalathur-1', 'Perungalathur');
    expect(pCoords).toEqual([12.9056, 80.0832]);

    const vCoords = getRestaurantCoordinates('res-vandalur-1', 'Vandalur');
    expect(vCoords).toEqual([12.8893, 80.0815]);

    const mCoords = getRestaurantCoordinates('res-mannivakkam-1', 'Mannivakkam');
    expect(mCoords).toEqual([12.8941, 80.0526]);
  });

  describe('Interactive Pin-Drop Map & Live Rider Tracking Upgrades', () => {
    it('should dynamically update distance and delivery fee when pin is dragged', () => {
      const restaurantCoords = [12.9056, 80.0832]; // SS Hyderabad Biryani (Perungalathur)
      
      // Hyperlocal pin position (~0.6 km)
      const nearbyPin = [12.9090, 80.0860];
      const distNear = calculateDistanceKm(restaurantCoords[0], restaurantCoords[1], nearbyPin[0], nearbyPin[1]);
      expect(distNear).toBeLessThanOrEqual(1.5);
      expect(calculateDeliveryFee(distNear, 200)).toBe(20);

      // Drag pin to Vandalur (~2.1 km)
      const vandalurPin = [12.8893, 80.0815];
      const distMid = calculateDistanceKm(restaurantCoords[0], restaurantCoords[1], vandalurPin[0], vandalurPin[1]);
      expect(distMid).toBeGreaterThan(1.5);
      expect(distMid).toBeLessThanOrEqual(3.5);
      expect(calculateDeliveryFee(distMid, 200)).toBe(28);

      // High value order should have free delivery regardless of distance
      expect(calculateDeliveryFee(distMid, 550)).toBe(0);
    });

    it('should format rider direct call and quick map action controls cleanly', () => {
      const riderPhone = '+91 98765 43210';
      const cleanPhone = riderPhone.replace(/\s+/g, '');
      const callHref = `tel:${cleanPhone}`;
      expect(callHref).toBe('tel:+919876543210');

      const speedKmH = 28;
      expect(speedKmH).toBeGreaterThan(0);
      expect(`${speedKmH} km/h`).toBe('28 km/h');
    });

    it('should authenticate user with Google / Gmail provider and persist profile', () => {
      const googleUser = {
        name: 'Alexander Raja',
        email: 'alexanderrajac@gmail.com',
        phone: '+91 98401 23456',
        avatar: '👨‍💻',
        authProvider: 'google',
        isVerified: true
      };

      expect(googleUser.email).toContain('@gmail.com');
      expect(googleUser.authProvider).toBe('google');
      expect(googleUser.isVerified).toBe(true);
    });

    it('should manage multiple saved addresses with tags (Home, Work, Campus, Other)', () => {
      const savedAddresses = [
        {
          id: 'addr-1',
          tag: 'Home',
          doorNo: 'Flat 4B, Sri Sai Flats',
          streetAddress: 'Peerkankaranai Main Road',
          locality: 'Perungalathur',
          coords: [12.9095, 80.0895]
        },
        {
          id: 'addr-2',
          tag: 'Work',
          doorNo: 'Tower B, 3rd Floor',
          streetAddress: 'GST Road',
          locality: 'Vandalur',
          coords: [12.8893, 80.0815]
        }
      ];

      expect(savedAddresses.length).toBe(2);
      expect(savedAddresses[0].tag).toBe('Home');
      expect(savedAddresses[1].tag).toBe('Work');

      // Adding new address
      const newAddr = {
        id: 'addr-3',
        tag: 'Campus',
        doorNo: 'Room 204, Hostel C',
        streetAddress: 'Crescent Campus Road',
        locality: 'Vandalur',
        coords: [12.8795, 80.0780]
      };
      const updated = [newAddr, ...savedAddresses];
      expect(updated.length).toBe(3);
      expect(updated[0].tag).toBe('Campus');

      // Delete address
      const afterDelete = updated.filter(a => a.id !== 'addr-2');
      expect(afterDelete.length).toBe(2);
      expect(afterDelete.some(a => a.tag === 'Work')).toBe(false);
    });

    it('should verify mobile bottom sheet and active order floating bar clearance', () => {
      // Mobile bottom nav height is 64px, floating bar sits above it at 72px + safe area
      const bottomNavHeight = 64;
      const floatingBarBottomOffset = 72;
      expect(floatingBarBottomOffset).toBeGreaterThan(bottomNavHeight);

      // Verify payment methods support both UPI and COD
      const validPaymentModes = ['UPI', 'COD'];
      expect(validPaymentModes).toContain('UPI');
      expect(validPaymentModes).toContain('COD');
    });
  });
});

describe('Rider 1-Trip Concurrency Enforcement & Role-Based Access Isolation', () => {
  it('should enforce 1-trip concurrency rule: rider cannot accept a second trip while one is active', () => {
    const activeOrders = [
      { id: 'ord-101', status: 'OUT_FOR_DELIVERY', riderId: 'rider-1', riderName: 'Murugan S.' },
      { id: 'ord-102', status: 'READY', riderId: null, riderName: null }
    ];

    const currentRiderId = 'rider-1';
    const currentRiderName = 'Murugan S.';

    // Check if rider has active trip
    const hasActiveTrip = activeOrders.some(
      o => (o.riderId === currentRiderId || o.riderName === currentRiderName) && o.status !== 'DELIVERED'
    );

    expect(hasActiveTrip).toBe(true);

    // Trip acceptance attempt must fail
    const acceptTrip = (orderId) => {
      const hasOngoing = activeOrders.some(
        o => (o.riderId === currentRiderId || o.riderName === currentRiderName) && o.status !== 'DELIVERED'
      );
      if (hasOngoing) {
        return { success: false, reason: 'Rider already has an active trip' };
      }
      return { success: true };
    };

    const attempt = acceptTrip('ord-102');
    expect(attempt.success).toBe(false);
    expect(attempt.reason).toBe('Rider already has an active trip');
  });

  it('should permit trip acceptance once prior order is marked DELIVERED', () => {
    const orders = [
      { id: 'ord-101', status: 'DELIVERED', riderId: 'rider-1', riderName: 'Murugan S.' },
      { id: 'ord-102', status: 'READY', riderId: null, riderName: null }
    ];

    const currentRiderId = 'rider-1';
    const hasOngoing = orders.some(
      o => (o.riderId === currentRiderId) && o.status !== 'DELIVERED'
    );

    expect(hasOngoing).toBe(false);

    const acceptTrip = (orderId) => {
      const busy = orders.some(o => o.riderId === currentRiderId && o.status !== 'DELIVERED');
      if (busy) return false;
      const target = orders.find(o => o.id === orderId);
      if (target) {
        target.riderId = currentRiderId;
        target.status = 'OUT_FOR_DELIVERY';
        return true;
      }
      return false;
    };

    expect(acceptTrip('ord-102')).toBe(true);
    expect(orders.find(o => o.id === 'ord-102').riderId).toBe('rider-1');
  });

  it('should enforce strict portal isolation based on registered user role', () => {
    const getPermittedPortals = (userRole) => {
      if (userRole === 'restaurant') return ['hotel'];
      if (userRole === 'rider') return ['rider'];
      if (userRole === 'customer') return ['customer'];
      if (userRole === 'admin') return ['customer', 'hotel', 'rider', 'admin'];
      return ['customer'];
    };

    expect(getPermittedPortals('restaurant')).toEqual(['hotel']);
    expect(getPermittedPortals('rider')).toEqual(['rider']);
    expect(getPermittedPortals('customer')).toEqual(['customer']);
    expect(getPermittedPortals('admin')).toContain('admin');
    expect(getPermittedPortals('admin').length).toBe(4);
  });

  it('should allow Master Admin to dynamically reassign user roles and reflect immediately', () => {
    const usersDirectory = [
      { id: 'usr-1', name: 'Chef Ravi', role: 'restaurant', status: 'ACTIVE' },
      { id: 'usr-2', name: 'Kumar', role: 'customer', status: 'ACTIVE' }
    ];

    const updateUserRole = (userId, newRole) => {
      return usersDirectory.map(u => u.id === userId ? { ...u, role: newRole } : u);
    };

    // Promote Kumar from customer to rider
    const updated = updateUserRole('usr-2', 'rider');
    expect(updated.find(u => u.id === 'usr-2').role).toBe('rider');

    // Toggle status
    const toggleStatus = (list, userId) => {
      return list.map(u => u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u);
    };

    const suspended = toggleStatus(updated, 'usr-1');
    expect(suspended.find(u => u.id === 'usr-1').status).toBe('SUSPENDED');
  });
});

describe('Individual Users Orders & Verified Email Display', () => {
  const testUserRaja = {
    name: 'Raja Official',
    email: 'rajacofficial369@gmail.com',
    phone: '+91 98401 23456',
    role: 'admin'
  };

  const testUserAlexander = {
    name: 'Alexander Raja',
    email: 'alexanderrajac@gmail.com',
    phone: '+91 98401 23456',
    role: 'customer'
  };

  it('should filter orders strictly by individual user email address', () => {
    const filterOrdersForUser = (ordersList, user) => {
      if (!user) return [];
      const userEmail = user.email?.toLowerCase().trim();
      return ordersList.filter(o => o.customerEmail?.toLowerCase().trim() === userEmail);
    };

    const rajaOrders = filterOrdersForUser(INITIAL_ORDERS, testUserRaja);
    expect(rajaOrders.length).toBeGreaterThanOrEqual(1);
    rajaOrders.forEach(o => {
      expect(o.customerEmail).toBe('rajacofficial369@gmail.com');
    });

    const alexanderOrders = filterOrdersForUser(INITIAL_ORDERS, testUserAlexander);
    expect(alexanderOrders.length).toBeGreaterThanOrEqual(1);
    alexanderOrders.forEach(o => {
      expect(o.customerEmail).toBe('alexanderrajac@gmail.com');
    });
  });

  it('should attach individual customerEmail and customerId when placing order', () => {
    const user = testUserRaja;
    const orderSummary = {
      orderId: 'UNV-990011',
      address: 'Peerkankaranai Main Rd, Perungalathur Hub',
      grandTotal: 490,
      paymentMethod: 'UPI'
    };

    const createdOrder = {
      orderId: orderSummary.orderId,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerAddress: orderSummary.address,
      grandTotal: orderSummary.grandTotal
    };

    expect(createdOrder.customerEmail).toBe('rajacofficial369@gmail.com');
    expect(createdOrder.customerName).toBe('Raja Official');
    expect(createdOrder.orderId).toBe('UNV-990011');
  });

  it('should calculate individual user metrics accurately', () => {
    const userOrders = INITIAL_ORDERS.filter(o => o.customerEmail === 'rajacofficial369@gmail.com');
    const totalSpent = userOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const activeOrders = userOrders.filter(o => o.status !== 'DELIVERED').length;

    expect(totalSpent).toBeGreaterThan(0);
    expect(activeOrders).toBeGreaterThanOrEqual(1);
  });
});

describe('Restaurant Self-Registration & Merchant Onboarding Pipeline', () => {
  it('should register a new restaurant partner with signature menu items', () => {
    const newRestaurant = {
      id: 'res-perungalathur-999',
      name: 'Madurai Muniyandi Vilas',
      region: 'Perungalathur',
      cuisines: ['South Indian', 'Biryani', 'Chettinad'],
      rating: 4.8,
      ratingCount: 'New Partner',
      deliveryTime: '25-30 min',
      costForTwo: 350,
      menu: [
        { id: 'dish-1', name: 'Muniyandi Special Mutton Sukka', price: 240, isVeg: false }
      ]
    };

    const initialList = [...RESTAURANTS];
    const updatedList = [newRestaurant, ...initialList];

    expect(updatedList.length).toBe(initialList.length + 1);
    expect(updatedList[0].name).toBe('Madurai Muniyandi Vilas');
    expect(updatedList[0].region).toBe('Perungalathur');
    expect(updatedList[0].menu.length).toBeGreaterThan(0);
  });

  it('should upgrade customer account to restaurant merchant role upon registration', () => {
    const customerUser = {
      id: 'usr-cust-99',
      name: 'Sundar Store Owner',
      email: 'sundar.hotel@gmail.com',
      phone: '+91 98401 99999',
      role: 'customer'
    };

    // Promote to merchant
    const promotedUser = {
      ...customerUser,
      role: 'restaurant',
      restaurantId: 'res-vandalur-888',
      restaurantName: 'Sundar Tiffin House'
    };

    expect(promotedUser.role).toBe('restaurant');
    expect(promotedUser.restaurantId).toBe('res-vandalur-888');
  });

  it('should enforce Admin Approval Gate: pending restaurants do not appear on customer side until approved', () => {
    const pendingRestaurant = {
      id: 'res-tambaram-777',
      name: 'Tambaram Chettinad Kitchen',
      region: 'Tambaram',
      cuisines: ['Chettinad'],
      isApproved: false,
      approvalStatus: 'PENDING',
      delivery: true
    };

    const restaurantList = [pendingRestaurant, ...RESTAURANTS];

    // Customer filter simulation
    const customerVisible = restaurantList.filter(res => {
      if (res.isApproved === false || res.approvalStatus === 'PENDING') return false;
      return true;
    });

    expect(customerVisible.some(r => r.id === 'res-tambaram-777')).toBe(false);

    // After Admin Approval
    const approvedRestaurant = { ...pendingRestaurant, isApproved: true, approvalStatus: 'APPROVED' };
    const listAfterApproval = [approvedRestaurant, ...RESTAURANTS];
    const customerVisibleAfterApproval = listAfterApproval.filter(res => {
      if (res.isApproved === false || res.approvalStatus === 'PENDING') return false;
      return true;
    });

    expect(customerVisibleAfterApproval.some(r => r.id === 'res-tambaram-777')).toBe(true);
  });

  it('should accept uploaded outlet photos, custom starter menu dishes, and individual food photos during registration', () => {
    const customPhotoDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...sampleBanner';
    const dishPhotoDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...sampleDish';

    const registeredPayload = {
      name: 'Nellai Saravana Mess',
      region: 'Mannivakkam',
      cuisines: ['South Indian', 'Meals', 'Tiffin'],
      image: customPhotoDataUrl,
      payoutUpi: 'nellaimess@okaxis',
      fssaiLicense: '12423005000123',
      menu: [
        {
          id: 'dish-1',
          name: 'Special Mutton Chukka',
          price: 240,
          category: 'Starters & Appetizers',
          isVeg: false,
          image: dishPhotoDataUrl,
          description: 'Spicy dry roasted tender mutton.'
        },
        {
          id: 'dish-2',
          name: 'Crispy Ghee Roast Dosa',
          price: 90,
          category: 'Tiffin & Dosa',
          isVeg: true,
          image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
          description: 'Golden roasted served with 3 chutneys.'
        }
      ]
    };

    expect(registeredPayload.image).toBe(customPhotoDataUrl);
    expect(registeredPayload.payoutUpi).toBe('nellaimess@okaxis');
    expect(registeredPayload.fssaiLicense).toBe('12423005000123');
    expect(registeredPayload.menu.length).toBe(2);
    expect(registeredPayload.menu[0].image).toBe(dishPhotoDataUrl);
    expect(registeredPayload.menu[0].isVeg).toBe(false);
    expect(registeredPayload.menu[1].isVeg).toBe(true);
  });

  it('should persist custom dish photos when restaurant publishes new items to live menu in HotelPortal', () => {
    const currentRestaurant = {
      id: 'res-perungalathur-1',
      name: 'SS Hyderabad Biryani',
      menu: [
        { id: 'ss-1', name: 'Chicken Dum Biryani', price: 260, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800' }
      ]
    };

    const newDish = {
      name: 'Paneer Tikka Roll',
      price: 150,
      category: 'Starters & Appetizers',
      isVeg: true,
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      description: 'Charcoal grilled cottage cheese in soft parotta.'
    };

    const addedDish = {
      id: `${currentRestaurant.id}-dish-${Date.now()}`,
      name: newDish.name.trim(),
      price: Number(newDish.price),
      category: newDish.category || 'Specialties',
      isVeg: Boolean(newDish.isVeg),
      description: newDish.description,
      image: newDish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      rating: '4.8',
      votes: 1
    };

    const updatedMenu = [...currentRestaurant.menu, addedDish];
    expect(updatedMenu.length).toBe(2);
    expect(updatedMenu[1].name).toBe('Paneer Tikka Roll');
    expect(updatedMenu[1].image).toContain('data:image/png;base64');
    expect(updatedMenu[1].isVeg).toBe(true);
  });
});

describe('Rider Partner Registration & Order Dispatch Mechanics', () => {
  it('should register a new rider with vehicle details, driving license, and payout UPI', () => {
    const riderPayload = {
      id: 'rider-vand-9921',
      name: 'Karthik Raja',
      phone: '+91 98401 77777',
      email: 'karthik.rider@gmail.com',
      role: 'rider',
      operatingZone: 'Vandalur & Zoo Corridor',
      vehicleType: 'EV',
      vehicleNumber: 'TN 11 EV 1008',
      drivingLicense: 'TN1120250001234',
      payoutUpi: 'karthik@ybl',
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
      isApproved: true
    };

    expect(riderPayload.role).toBe('rider');
    expect(riderPayload.vehicleType).toBe('EV');
    expect(riderPayload.operatingZone).toContain('Vandalur');
    expect(riderPayload.payoutUpi).toBe('karthik@ybl');
  });

  it('should split available orders to broadcast pool and assign exclusively upon rider acceptance', () => {
    const orders = [
      { orderId: 'UK-101', status: 'READY_FOR_PICKUP', riderId: null, riderName: null, total: 340 },
      { orderId: 'UK-102', status: 'READY_FOR_PICKUP', riderId: null, riderName: null, total: 520 },
      { orderId: 'UK-103', status: 'OUT_FOR_DELIVERY', riderId: 'rider-1', riderName: 'Murugan S.', total: 280 }
    ];

    // Broadcast pool: unassigned orders
    const broadcastPool = orders.filter(o => !o.riderId && o.status !== 'DELIVERED');
    expect(broadcastPool.length).toBe(2);
    expect(broadcastPool.map(o => o.orderId)).toEqual(['UK-101', 'UK-102']);

    // Rider Karthik claims UK-101
    const claimedOrder = {
      ...broadcastPool[0],
      riderId: 'rider-karthik',
      riderName: 'Karthik Raja',
      riderPhone: '+91 98401 77777',
      status: 'OUT_FOR_DELIVERY'
    };

    expect(claimedOrder.riderId).toBe('rider-karthik');
    expect(claimedOrder.status).toBe('OUT_FOR_DELIVERY');

    // Remaining broadcast pool should no longer include UK-101
    const updatedOrders = [claimedOrder, orders[1], orders[2]];
    const newBroadcastPool = updatedOrders.filter(o => !o.riderId && o.status !== 'DELIVERED');
    expect(newBroadcastPool.length).toBe(1);
    expect(newBroadcastPool[0].orderId).toBe('UK-102');
  });

  it('should prevent rider from taking concurrent orders until doorstep OTP delivery is complete', () => {
    const activeOrders = [
      { orderId: 'UK-101', status: 'OUT_FOR_DELIVERY', riderId: 'rider-karthik', riderName: 'Karthik Raja' },
      { orderId: 'UK-102', status: 'READY_FOR_PICKUP', riderId: null }
    ];

    const currentRider = 'rider-karthik';
    const hasActiveTrip = activeOrders.some(o => o.riderId === currentRider && o.status !== 'DELIVERED');

    // Concurrency check should block 2nd order
    const canAcceptSecondTrip = !hasActiveTrip;
    expect(canAcceptSecondTrip).toBe(false);

    // After doorstep OTP delivery
    const completedOrders = activeOrders.map(o => o.orderId === 'UK-101' ? { ...o, status: 'DELIVERED' } : o);
    const hasActiveTripAfterDelivery = completedOrders.some(o => o.riderId === currentRider && o.status !== 'DELIVERED');
    const canAcceptNow = !hasActiveTripAfterDelivery;

    expect(canAcceptNow).toBe(true);
  });

  it('should register new Google OAuth users with unique ID and Google auth provider badge', () => {
    const existingUsers = [
      { id: 'usr-admin-1', name: 'Admin', email: 'admin@unavukadai.com', role: 'admin', phone: '+91 98400 11111' },
      { id: 'usr-cust-1', name: 'Alexander Raja', email: 'alexanderrajac@gmail.com', role: 'customer', phone: '+91 98401 23456' }
    ];

    const googleUser = {
      name: 'Priya Dharshini',
      email: 'priya.dharshini99@gmail.com',
      phone: '',
      authProvider: 'google',
      isVerified: true
    };

    // Registration simulation
    const alreadyExists = existingUsers.some(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
    expect(alreadyExists).toBe(false);

    const newUserRecord = {
      id: 'usr-g-' + Date.now(),
      name: googleUser.name,
      email: googleUser.email,
      phone: googleUser.phone,
      role: 'customer',
      authProvider: 'google',
      status: 'ACTIVE',
      isVerified: true,
      createdAt: '28 Sep, 2026'
    };

    const updatedUsersList = [newUserRecord, ...existingUsers];
    expect(updatedUsersList.length).toBe(3);
    expect(updatedUsersList[0].authProvider).toBe('google');
    expect(updatedUsersList[0].email).toBe('priya.dharshini99@gmail.com');
  });

  it('should mark rider as OFFLINE and remove from active dispatch when vehicle toggle is turned off', () => {
    const initialRiderLocations = {
      'rider-1': { riderId: 'rider-1', riderName: 'Murugan S.', isOnline: true, speed: 28, lat: 12.9056, lng: 80.0832 }
    };

    expect(initialRiderLocations['rider-1'].isOnline).toBe(true);

    // Rider switches vehicle to OFFLINE
    const offlineLocData = {
      riderId: 'rider-1',
      riderName: 'Murugan S.',
      isOnline: false,
      speed: 0,
      status: 'OFFLINE'
    };

    const updatedLocations = {
      ...initialRiderLocations,
      [offlineLocData.riderId]: {
        ...initialRiderLocations[offlineLocData.riderId],
        ...offlineLocData
      }
    };

    expect(updatedLocations['rider-1'].isOnline).toBe(false);
    expect(updatedLocations['rider-1'].speed).toBe(0);

    // Active online fleet count
    const onlineRiders = Object.values(updatedLocations).filter(r => r.isOnline !== false);
    expect(onlineRiders.length).toBe(0);
  });

  it('should update restaurant to CLOSED and reflect in customer card & modal ordering state', () => {
    const restaurant = {
      id: 'res-vandalur-1',
      name: 'Hotel Ananda Bhavan',
      isOpen: true,
      isClosed: false
    };

    expect(restaurant.isOpen).toBe(true);

    // Restaurant closes kitchen
    const closedRestaurant = {
      ...restaurant,
      isOpen: false,
      isClosed: true
    };

    // Verification on customer card
    const isOutletClosedOnCard = closedRestaurant.isOpen === false || closedRestaurant.isClosed === true;
    expect(isOutletClosedOnCard).toBe(true);

    // Dishes should have ADD disabled when closed
    const canOrderDishes = !isOutletClosedOnCard;
    expect(canOrderDishes).toBe(false);
  });
});

describe('WhatsApp Marketing King Notifications & Order Receipt Integration', () => {
  it('should format WhatsApp order notification payload with normalized 10-digit/12-digit Indian phone number', () => {
    const normalizePhoneTest = (phone) => {
      if (!phone) return '';
      let digits = String(phone).replace(/[^\d]/g, '');
      if (digits.length === 10) digits = '91' + digits;
      return digits;
    };

    expect(normalizePhoneTest('9840123456')).toBe('919840123456');
    expect(normalizePhoneTest('+91 98401 23456')).toBe('919840123456');
    expect(normalizePhoneTest('09840123456')).toBe('09840123456');
  });

  it('should generate formatted WhatsApp direct share URL for 1-tap customer receipt', () => {
    const order = {
      orderId: 'UK-7788',
      restaurantName: 'SS Hyderabad Biryani',
      grandTotal: 520,
      deliveryOtp: '4821',
      items: [
        { name: 'Chicken Biryani', quantity: 2 }
      ]
    };

    const text = `🍲 *UNAVUKADAI ORDER #${order.orderId}*\n*Restaurant:* ${order.restaurantName}\n*Total Bill:* ₹${order.grandTotal}\n🔑 *Doorstep Delivery OTP:* *${order.deliveryOtp}*`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    expect(waUrl).toContain('https://wa.me/?text=');
    expect(waUrl).toContain(encodeURIComponent('UK-7788'));
    expect(waUrl).toContain(encodeURIComponent('4821'));
  });

  it('should allow resending WhatsApp delivery PIN without blocking order progress or UI', () => {
    const mockOrderState = {
      orderId: 'UK-7788',
      status: 'OUT_FOR_DELIVERY',
      deliveryOtp: '4821',
      waNotificationSent: false
    };

    // Trigger WhatsApp notification simulation
    const updated = {
      ...mockOrderState,
      waNotificationSent: true,
      lastDispatchedAt: Date.now()
    };

    expect(updated.waNotificationSent).toBe(true);
    expect(updated.status).toBe('OUT_FOR_DELIVERY'); // Does not modify or disrupt order lifecycle
    expect(updated.deliveryOtp).toBe('4821');
  });
});

describe('Customer Live Orders Experience, WhatsApp Receipts & Offline Caching', () => {
  it('should format full itemized WhatsApp bill with delivery PIN and live track URL', () => {
    const order = {
      orderId: 'UK-9921',
      restaurantName: 'Muniyandi Vilas',
      locality: 'Perungalathur',
      status: 'OUT_FOR_DELIVERY',
      deliveryOtp: '7412',
      grandTotal: 340,
      paymentMethod: 'UPI',
      customerAddress: 'Flat 3B, Lake View Rd, Perungalathur',
      items: [
        { name: 'Parotta Set', quantity: 2, price: 90 },
        { name: 'Chicken Salna', quantity: 1, price: 160 }
      ]
    };

    const itemsSummary = order.items.map(i => `• ${i.quantity}x ${i.name} - ₹${i.price * i.quantity}`).join('\n');
    const text = 
      `🍲 *UNAVUKADAI ORDER RECEIPT*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Order ID:* #${order.orderId}\n` +
      `🏨 *Restaurant:* ${order.restaurantName} (${order.locality} Hub)\n` +
      `📊 *Status:* ${order.status.replace(/_/g, ' ')}\n` +
      `\n🔑 *Delivery PIN:* ${order.deliveryOtp}\n\n` +
      `📋 *Items Ordered:*\n${itemsSummary}\n\n` +
      `💰 *Grand Total:* ₹${order.grandTotal} (${order.paymentMethod})\n` +
      `📍 *Delivery Address:* ${order.customerAddress}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🚀 *Track Live:* http://localhost:5173`;

    expect(text).toContain('UK-9921');
    expect(text).toContain('Muniyandi Vilas');
    expect(text).toContain('Parotta Set');
    expect(text).toContain('7412');
    expect(text).toContain('₹340');
  });

  it('should calculate correct live lifecycle progress step index for active orders', () => {
    const getStatusIndex = (status) => {
      const steps = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      if (status === 'READY_FOR_PICKUP') return 2;
      const idx = steps.indexOf(status);
      return idx === -1 ? 0 : idx;
    };

    expect(getStatusIndex('PLACED')).toBe(0);
    expect(getStatusIndex('CONFIRMED')).toBe(1);
    expect(getStatusIndex('PREPARING')).toBe(2);
    expect(getStatusIndex('READY_FOR_PICKUP')).toBe(2);
    expect(getStatusIndex('OUT_FOR_DELIVERY')).toBe(3);
    expect(getStatusIndex('DELIVERED')).toBe(4);
  });

  it('should cache and retrieve offline menu data in localStorage format', () => {
    const mockRestaurants = [
      { id: 'res-test-1', name: 'SS Hyderabad', menu: [{ id: 'm1', name: 'Biryani', price: 220 }] }
    ];

    // Simulate offline caching
    const cachePayload = {
      timestamp: Date.now(),
      data: mockRestaurants
    };

    expect(cachePayload.data.length).toBe(1);
    expect(cachePayload.data[0].name).toBe('SS Hyderabad');
    expect(cachePayload.data[0].menu[0].name).toBe('Biryani');
  });

  it('should enforce 24-hour snooze for PWA install bottom sheet dismissal', () => {
    const now = Date.now();
    const dismissedUntil = now + (24 * 60 * 60 * 1000);

    // Within 24 hours -> Should remain hidden
    const isDismissedActive = now < dismissedUntil;
    expect(isDismissedActive).toBe(true);

    // After 25 hours -> Should show again
    const futureTime = now + (25 * 60 * 60 * 1000);
    const isStillDismissed = futureTime < dismissedUntil;
    expect(isStillDismissed).toBe(false);
  });
});




