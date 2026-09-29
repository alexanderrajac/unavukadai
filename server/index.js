import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabaseConnection, getActiveEngine } from './db/connection.js';
import * as dbRepo from './db/repository.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// SSE (Server-Sent Events) clients registry for instant cross-device broadcast
let sseClients = [];

function broadcastToClients(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

// Health Check with Active Database Engine Status
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Unavukadai API', 
    databaseEngine: getActiveEngine(),
    time: new Date().toISOString() 
  });
});

// Real-Time SSE Stream Endpoint
app.get('/api/orders/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = Date.now() + Math.random();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial state immediately with fresh DB data
  try {
    const orders = await dbRepo.getOrders();
    const riderLocations = await dbRepo.getRiderLocations();
    const stock = await dbRepo.getStock();
    const coupons = await dbRepo.getCoupons();
    const settings = await dbRepo.getSettings();

    res.write(`data: ${JSON.stringify({ 
      type: 'INIT', 
      data: { orders, stock, coupons, settings, riderLocations } 
    })}\n\n`);
  } catch (err) {
    console.error('Error sending SSE INIT state:', err);
  }

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// GET Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await dbRepo.getOrders();
    res.json(orders || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// POST Create Order (Atomic DB Transaction + Instant Broadcast)
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = await dbRepo.createOrder(req.body);
    const allOrders = await dbRepo.getOrders();

    broadcastToClients('ORDERS_UPDATED', allOrders);

    // Asynchronously dispatch WhatsApp order confirmation without blocking checkout response
    if (newOrder.customerPhone) {
      const itemsSummary = Array.isArray(newOrder.items)
        ? newOrder.items.map(i => `• ${i.quantity}x ${i.name}`).join('\n')
        : '';

      const msg = `🍲 *UNAVUKADAI ORDER CONFIRMED!* 🍲\n\n` +
        `*Order ID:* #${newOrder.orderId}\n` +
        `*Restaurant:* ${newOrder.restaurantName || 'Eatery'}\n` +
        `*Total Bill:* ₹${newOrder.grandTotal}\n\n` +
        (itemsSummary ? `*Ordered Items:*\n${itemsSummary}\n\n` : '') +
        `🔑 *Doorstep Delivery OTP: ${newOrder.deliveryOtp}*\n` +
        `_Please share this 4-digit OTP with your delivery partner upon food arrival._\n\n` +
        `🛵 *Live Tracking:* http://localhost:5173/#/customer\n` +
        `_Thank you for supporting authentic local South Chennai eateries!_`;

      enqueueNotification('/send-message', {
        phone: normalizePhone(newOrder.customerPhone),
        message: msg,
        orderId: newOrder.orderId
      });
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error creating order in DB:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Allowed Order Status Transitions (State Machine)
const ALLOWED_ORDER_TRANSITIONS = {
  'PLACED': ['PREPARING', 'CANCELLED'],
  'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
  'READY_FOR_PICKUP': ['OUT_FOR_DELIVERY', 'CANCELLED'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
  'DELIVERED': [],
  'CANCELLED': []
};

// PATCH Update Order Status or Rider (With Strict State Constraints)
app.patch('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;

  try {
    const orders = await dbRepo.getOrders();
    const existingOrder = (orders || []).find(o => o.orderId === orderId);

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 1. Enforce Rider Acceptance Constraint:
    // Riders can accept orders when ready, or pre-accept when kitchen is preparing
    if (req.body.riderId && !existingOrder.riderId && !req.body.forceTransition) {
      const riderAcceptableStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'];
      if (!riderAcceptableStatuses.includes(existingOrder.status) && req.body.status !== 'READY_FOR_PICKUP') {
        return res.status(400).json({
          error: `Rider cannot accept order #${orderId}. Current status is: ${existingOrder.status}.`
        });
      }
    }

    // 2. Enforce Order State Machine Transitions (bypassed if forceTransition is requested)
    if (req.body.status && req.body.status !== existingOrder.status) {
      const allowedNext = ALLOWED_ORDER_TRANSITIONS[existingOrder.status] || [];
      if (!allowedNext.includes(req.body.status) && !req.body.forceTransition) {
        return res.status(400).json({
          error: `Invalid status transition from ${existingOrder.status} to ${req.body.status}. Allowed transitions: ${allowedNext.join(', ') || 'Terminal state'}.`
        });
      }
    }

    const updatedOrder = await dbRepo.updateOrder(orderId, req.body);
    const allOrders = await dbRepo.getOrders();

    broadcastToClients('ORDERS_UPDATED', allOrders);
    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE Cancel Order
app.delete('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    await dbRepo.deleteOrder(orderId);
    const allOrders = await dbRepo.getOrders();

    broadcastToClients('ORDERS_UPDATED', allOrders);
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// GET & POST Stock
app.get('/api/stock', async (req, res) => {
  try {
    const stock = await dbRepo.getStock();
    res.json(stock || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stock' });
  }
});

app.post('/api/stock/toggle', async (req, res) => {
  const { itemId } = req.body;
  try {
    const updatedStock = await dbRepo.toggleStock(itemId);
    broadcastToClients('STOCK_UPDATED', updatedStock);
    res.json(updatedStock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle stock' });
  }
});

// GET & POST Coupons
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await dbRepo.getCoupons();
    res.json(coupons || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve coupons' });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const newCoupon = await dbRepo.createCoupon(req.body);
    const allCoupons = await dbRepo.getCoupons();
    broadcastToClients('COUPONS_UPDATED', allCoupons);
    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// GET & POST Rider GPS Locations
app.get('/api/riders/locations', async (req, res) => {
  try {
    const locs = await dbRepo.getRiderLocations();
    res.json(locs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve rider locations' });
  }
});

app.post('/api/riders/location', async (req, res) => {
  const { riderId, lat, lng, latitude, longitude, speed, heading, orderId, riderName } = req.body;
  const rawLat = lat !== undefined ? lat : latitude;
  const rawLng = lng !== undefined ? lng : longitude;

  if (!riderId || rawLat === undefined || rawLng === undefined) {
    return res.status(400).json({ error: 'riderId, lat (or latitude), and lng (or longitude) are required' });
  }

  const parsedLat = parseFloat(rawLat);
  const parsedLng = parseFloat(rawLng);

  if (!isFinite(parsedLat) || !isFinite(parsedLng) || parsedLat === 0 || parsedLng === 0) {
    return res.status(400).json({ error: 'Invalid coordinate numbers provided' });
  }

  try {
    const locationData = {
      riderId,
      riderName: riderName || 'Murugan S.',
      lat: Number(parsedLat.toFixed(6)),
      lng: Number(parsedLng.toFixed(6)),
      speed: typeof speed === 'number' ? speed : 25,
      heading: typeof heading === 'number' ? heading : 0,
      orderId: orderId || null
    };

    const saved = await dbRepo.updateRiderLocation(locationData);
    broadcastToClients('RIDER_LOCATION_UPDATED', saved);
    res.json(saved);
  } catch (err) {
    console.error('Error saving rider location:', err);
    res.status(500).json({ error: 'Failed to update rider location' });
  }
});

// GET & POST Platform Settings (e.g. Merchant UPI ID)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await dbRepo.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updatedSettings = await dbRepo.updateSettings(req.body);
    broadcastToClients('SETTINGS_UPDATED', updatedSettings);
    res.json(updatedSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST Reset Orders for Clean Production Launch
app.post('/api/orders/reset', async (req, res) => {
  try {
    await dbRepo.resetOrders();
    broadcastToClients('ORDERS_UPDATED', []);
    res.json({ success: true, message: 'All test orders cleared for production launch' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset orders' });
  }
});

// -------------------------------------------------------------
// WHATSAPP OTP VERIFICATION & ASYNC NOTIFICATION GATEWAY (API v1)
// -------------------------------------------------------------
const WHATSAPP_GATEWAY_BASE_URL = process.env.WHATSAPP_GATEWAY_URL || 'https://whatsappmarketingking-production.up.railway.app';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || 'wa_live_ec5dbf1a10fb6cc19f6523719e380fca433a7b39';
const activeOtps = new Map(); // normalizedPhone -> { otp, expiresAt, attempts }

function normalizePhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/[^\d]/g, '');
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return digits;
}

// Resilient gateway dispatcher for order messages
async function postToGateway(endpoint, body, timeoutMs = 3500) {
  const targets = [WHATSAPP_GATEWAY_BASE_URL];
  let lastError = null;
  for (const baseUrl of targets) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': WHATSAPP_API_KEY
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return { success: true, data, gatewayUrl: baseUrl };
      }
      lastError = data.error || `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.message;
    }
  }

  return { success: false, error: lastError };
}

// Asynchronous Non-Blocking Notification Queue
const notificationQueue = [];
let isProcessingQueue = false;

async function processNotificationQueue() {
  if (isProcessingQueue || notificationQueue.length === 0) return;
  isProcessingQueue = true;

  while (notificationQueue.length > 0) {
    const job = notificationQueue.shift();
    try {
      const res = await postToGateway(job.endpoint, job.payload, 3500);
      if (res.success) {
        console.log(`[Async Queue] Notification delivered to +${job.payload?.phone}`);
      } else {
        console.warn(`[Async Queue] Gateway warning for +${job.payload?.phone}:`, res.error);
      }
    } catch (err) {
      console.warn(`[Async Queue] Error processing notification:`, err.message);
    }
  }

  isProcessingQueue = false;
}

function enqueueNotification(endpoint, payload) {
  notificationQueue.push({ endpoint, payload, queuedAt: Date.now() });
  setImmediate(processNotificationQueue);
}

// 1. WhatsApp Gateway Live Connection Status
app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const gatewayRes = await fetch(`${WHATSAPP_GATEWAY_BASE_URL}/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3500)
    });
    if (gatewayRes.status < 500) {
      return res.json({
        success: true,
        gatewayConnected: true,
        gatewayUrl: WHATSAPP_GATEWAY_BASE_URL,
        isLiveCloud: true,
        status: 'ONLINE'
      });
    }
  } catch {
    // Gateway offline
  }

  res.json({
    success: false,
    gatewayConnected: false,
    gatewayUrl: WHATSAPP_GATEWAY_BASE_URL,
    status: 'OFFLINE',
    message: `WhatsApp gateway at ${WHATSAPP_GATEWAY_BASE_URL} is offline. Using fallback verification.`
  });
});

// 2. Send Real WhatsApp OTP to Customer via Custom Gateway API v1
app.post('/api/whatsapp/send-otp', async (req, res) => {
  const { phone, purpose = 'LOGIN' } = req.body;
  const normalized = normalizePhone(phone);

  if (!normalized || normalized.length < 10) {
    return res.status(400).json({ success: false, error: 'Valid mobile number is required' });
  }

  // 1. Dispatch through Custom WhatsApp OTP Gateway API: POST /api/v1/otp/send
  try {
    const gatewayRes = await fetch(`${WHATSAPP_GATEWAY_BASE_URL}/api/v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': WHATSAPP_API_KEY
      },
      body: JSON.stringify({
        phone: normalized,
        app_name: 'Unavukadai Express',
        code_length: 4,
        purpose: purpose || 'LOGIN'
      }),
      signal: AbortSignal.timeout(35000)
    });

    const data = await gatewayRes.json().catch(() => ({}));
    if (gatewayRes.ok && data.success) {
      console.log(`[WhatsApp OTP v1] Successfully dispatched OTP via gateway to +${normalized}`);
      return res.json({
        success: true,
        phone: normalized,
        sentViaWhatsApp: true,
        gatewayConnected: true,
        expiresInSeconds: data.expires_in_seconds || 300,
        expiresAt: Date.now() + 60 * 1000 // 60s resend timer
      });
    }

    console.warn(`[WhatsApp OTP v1] Gateway response error:`, data.error || gatewayRes.status);
    if (data.error || (gatewayRes.status >= 400 && gatewayRes.status < 500)) {
      const friendlyError = gatewayRes.status === 429
        ? (data.error || 'Please wait 60 seconds before requesting a new WhatsApp OTP code.')
        : (data.error || `WhatsApp Gateway returned error (${gatewayRes.status})`);
      return res.status(gatewayRes.status >= 400 && gatewayRes.status < 500 ? gatewayRes.status : 400).json({
        success: false,
        error: friendlyError
      });
    }
  } catch (err) {
    console.warn(`[WhatsApp OTP v1] Gateway network error:`, err.message);
  }

  // Fallback OTP for local offline or dev testing
  const fallbackOtp = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = Date.now() + 5 * 60 * 1000;
  activeOtps.set(normalized, {
    otp: fallbackOtp,
    expiresAt,
    attempts: 0
  });

  res.json({
    success: true,
    phone: normalized,
    sentViaWhatsApp: false,
    offlineFallback: true,
    expiresAt
  });
});

// 3. Verify WhatsApp OTP with Custom Gateway API v1
app.post('/api/whatsapp/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const normalized = normalizePhone(phone);
  const enteredOtp = String(otp || '').trim();

  // Master bypass strictly restricted to non-production environment
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev && enteredOtp === '1234') {
    return res.json({ success: true, verified: true, bypass: true });
  }

  // 1. Primary Live Gateway API v1: POST /api/v1/otp/verify
  try {
    const gatewayRes = await fetch(`${WHATSAPP_GATEWAY_BASE_URL}/api/v1/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': WHATSAPP_API_KEY
      },
      body: JSON.stringify({
        phone: normalized,
        otp: enteredOtp
      }),
      signal: AbortSignal.timeout(15000)
    });

    const data = await gatewayRes.json().catch(() => ({}));
    if (data.success && data.verified) {
      console.log(`[WhatsApp OTP v1] Successfully verified OTP for +${normalized}`);
      return res.json({ success: true, verified: true });
    } else if (data.error) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: data.error
      });
    }
  } catch (err) {
    console.warn(`[WhatsApp OTP v1] Gateway verify error, checking local fallback:`, err.message);
  }

  // 2. Check local fallback OTP store
  const record = activeOtps.get(normalized);
  if (record) {
    if (Date.now() > record.expiresAt) {
      activeOtps.delete(normalized);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new code.' });
    }
    if (record.otp === enteredOtp) {
      activeOtps.delete(normalized);
      return res.json({ success: true, verified: true, fallback: true });
    }
  }

  return res.status(400).json({
    success: false,
    verified: false,
    error: 'Incorrect OTP code. Please check your WhatsApp.'
  });
});

// 4. Send Order Confirmation with Doorstep Delivery OTP (Asynchronously Non-Blocking)
app.post('/api/whatsapp/send-order-notification', async (req, res) => {
  const { orderId, customerPhone, restaurantName, grandTotal, deliveryOtp } = req.body;
  const normalized = normalizePhone(customerPhone);

  if (!normalized) {
    return res.status(400).json({ error: 'Valid phone required' });
  }

  // Dispatch real delivery OTP / confirmation to customer via WhatsApp Marketing King gateway
  try {
    const gwRes = await fetch(`${WHATSAPP_GATEWAY_BASE_URL}/api/v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': WHATSAPP_API_KEY
      },
      body: JSON.stringify({
        phone: normalized,
        app_name: 'Unavukadai Express',
        code_length: 4,
        purpose: 'DELIVERY'
      }),
      signal: AbortSignal.timeout(6000)
    });
    const gwData = await gwRes.json().catch(() => ({}));
    if (gwRes.ok && gwData.success) {
      console.log(`[WhatsApp Order v1] Sent delivery notification to +${normalized} for #${orderId}`);
      return res.json({
        success: true,
        sentViaWhatsApp: true,
        orderId,
        gatewayData: gwData
      });
    }
  } catch (err) {
    console.warn(`[WhatsApp Order v1] Gateway delivery error:`, err.message);
  }

  // Fallback response so customer checkout is never blocked
  res.json({
    success: true,
    sentViaWhatsApp: false,
    orderId,
    fallback: true
  });
});

// Initialize Database connection, migrate initial seed, and start server
async function startServer() {
  try {
    await initDatabaseConnection();
    await dbRepo.migrateSeedDataFromDbJson();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚡ Unavukadai Production API running on http://0.0.0.0:${PORT} [Engine: ${getActiveEngine()}]`);
    });
  } catch (err) {
    console.error('Fatal error starting Unavukadai API server:', err);
    process.exit(1);
  }
}

startServer();
