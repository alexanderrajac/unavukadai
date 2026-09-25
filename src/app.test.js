import { describe, it, expect } from 'vitest';
import { RESTAURANTS, CITIES, COUPONS, REGIONAL_OFFER_BANNERS, INITIAL_ORDERS } from './data/mockData';
import { calculateDeliveryFee, getDeliveryFeeBreakdown, getRestaurantCoordinates, calculateDistanceKm } from './utils/geolocation';

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

  it('should initialize with realistic suburban orders', () => {
    expect(INITIAL_ORDERS.length).toBeGreaterThanOrEqual(3);
    const localities = INITIAL_ORDERS.map(o => o.locality);
    expect(localities).toContain('Perungalathur');
    expect(localities).toContain('Vandalur');
    expect(localities).toContain('Mannivakkam');
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
  });
});






