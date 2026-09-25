import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial seed data
const initialDb = {
  orders: [
    {
      orderId: 'UNV-784102',
      customerName: 'Karthik Raja',
      customerPhone: '+91 98402 11223',
      restaurantId: 'res-perungalathur-1',
      restaurantName: 'SS Hyderabad Biryani',
      restaurantAddress: 'GST Road, Perungalathur',
      customerAddress: 'Peerkankaranai Main Rd, Perungalathur',
      locality: 'Perungalathur',
      items: [
        { id: 'ssh-1', name: 'Special Chicken Dum Biryani', price: 280, quantity: 2 },
        { id: 'ssh-4', name: 'Chicken 65 (Boneless)', price: 210, quantity: 1 }
      ],
      itemTotal: 770,
      deliveryFee: 35,
      platformFee: 5,
      taxes: 38,
      discount: 120,
      grandTotal: 728,
      status: 'PREPARING',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      riderId: 'rider-1',
      riderName: 'Murugan S.',
      riderPhone: '+91 98765 43210',
      riderEarnings: 65,
      placedAt: '12 mins ago',
      etaMins: 16
    },
    {
      orderId: 'UNV-649201',
      customerName: 'Deepa Lakshmi',
      customerPhone: '+91 97910 88776',
      restaurantId: 'res-vandalur-1',
      restaurantName: 'Hotel Vandalur Ananda Bhavan',
      restaurantAddress: 'Opposite Zoo Gate, Vandalur',
      customerAddress: 'Crescent Campus Staff Quarters, Vandalur',
      locality: 'Vandalur',
      items: [
        { id: 'vab-1', name: 'Ghee Podi Roast Dosa', price: 130, quantity: 2 },
        { id: 'vab-5', name: 'Vandalur Filter Kaapi', price: 35, quantity: 2 }
      ],
      itemTotal: 330,
      deliveryFee: 35,
      platformFee: 5,
      taxes: 16,
      discount: 150,
      grandTotal: 236,
      status: 'READY_FOR_PICKUP',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      riderId: null,
      riderName: null,
      riderPhone: null,
      riderEarnings: 55,
      placedAt: '18 mins ago',
      etaMins: 10
    }
  ],
  stock: {},
  coupons: [
    { code: 'PERUNGAL50', region: 'Perungalathur', discountPercent: 50, maxDiscount: 120, minOrder: 199, label: '50% OFF up to ₹120 (Perungalathur)' },
    { code: 'VANDALUR60', region: 'Vandalur', discountPercent: 60, maxDiscount: 150, minOrder: 199, label: '60% OFF up to ₹150 (Vandalur)' },
    { code: 'MANNIVAKKAM40', region: 'Mannivakkam', discountPercent: 40, maxDiscount: 100, minOrder: 149, label: '40% OFF up to ₹100 (Mannivakkam)' },
    { code: 'UNAVU50', discountPercent: 50, maxDiscount: 100, minOrder: 199, label: '50% OFF up to ₹100 (All Zones)' },
    { code: 'FREEDEL', discountAmount: 35, minOrder: 200, label: 'Free Delivery over ₹200' }
  ],
  settings: {
    merchantUpi: '8248651695-3@ybl',
    merchantName: 'Unavukadai Express'
  }
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading DB, using initial data:', err);
  }
  return initialDb;
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Initialize file if not present
if (!fs.existsSync(DB_FILE)) {
  writeDb(initialDb);
}

// SSE (Server-Sent Events) clients registry for instant cross-device broadcast
let sseClients = [];

function broadcastToClients(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

// Live Rider GPS Locations Registry
let riderLocations = {
  'rider-1': {
    riderId: 'rider-1',
    riderName: 'Murugan S.',
    lat: 12.9056,
    lng: 80.0832,
    speed: 28,
    heading: 195,
    locality: 'Perungalathur',
    updatedAt: new Date().toISOString()
  },
  'rider-2': {
    riderId: 'rider-2',
    riderName: 'Anand Kumar',
    lat: 12.8893,
    lng: 80.0815,
    speed: 22,
    heading: 170,
    locality: 'Vandalur',
    updatedAt: new Date().toISOString()
  }
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Unavukadai API', time: new Date().toISOString() });
});

// Real-Time SSE Stream Endpoint
app.get('/api/orders/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = Date.now() + Math.random();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial state immediately with riderLocations
  const db = readDb();
  res.write(`data: ${JSON.stringify({ type: 'INIT', data: { ...db, riderLocations } })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// GET Orders
app.get('/api/orders', (req, res) => {
  const db = readDb();
  res.json(db.orders || []);
});

// POST Create Order
app.post('/api/orders', (req, res) => {
  const db = readDb();
  const newOrder = {
    ...req.body,
    orderId: req.body.orderId || ('UNV-' + Math.floor(100000 + Math.random() * 900000)),
    status: 'PLACED',
    deliveryOtp: req.body.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000)),
    placedAt: 'Just now',
    createdAt: new Date().toISOString()
  };

  db.orders = [newOrder, ...(db.orders || [])];
  writeDb(db);

  broadcastToClients('ORDERS_UPDATED', db.orders);
  res.status(201).json(newOrder);
});

// PATCH Update Order Status or Rider
app.patch('/api/orders/:id', (req, res) => {
  const db = readDb();
  const orderId = req.params.id;
  let updatedOrder = null;

  db.orders = (db.orders || []).map(order => {
    if (order.orderId === orderId) {
      updatedOrder = { ...order, ...req.body };
      return updatedOrder;
    }
    return order;
  });

  if (!updatedOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  writeDb(db);
  broadcastToClients('ORDERS_UPDATED', db.orders);
  res.json(updatedOrder);
});

// DELETE Cancel Order
app.delete('/api/orders/:id', (req, res) => {
  const db = readDb();
  const orderId = req.params.id;

  db.orders = (db.orders || []).filter(o => o.orderId !== orderId);
  writeDb(db);

  broadcastToClients('ORDERS_UPDATED', db.orders);
  res.json({ success: true, orderId });
});

// GET & POST Stock
app.get('/api/stock', (req, res) => {
  const db = readDb();
  res.json(db.stock || {});
});

app.post('/api/stock/toggle', (req, res) => {
  const { itemId } = req.body;
  const db = readDb();
  db.stock = db.stock || {};
  db.stock[itemId] = db.stock[itemId] === false ? true : false;
  writeDb(db);

  broadcastToClients('STOCK_UPDATED', db.stock);
  res.json(db.stock);
});

// GET & POST Coupons
app.get('/api/coupons', (req, res) => {
  const db = readDb();
  res.json(db.coupons || []);
});

app.post('/api/coupons', (req, res) => {
  const db = readDb();
  const newCoupon = req.body;
  db.coupons = [newCoupon, ...(db.coupons || [])];
  writeDb(db);

  broadcastToClients('COUPONS_UPDATED', db.coupons);
  res.status(201).json(newCoupon);
});

// GET & POST Rider GPS Locations
app.get('/api/riders/locations', (req, res) => {
  res.json(riderLocations);
});

app.post('/api/riders/location', (req, res) => {
  const { riderId, lat, lng, speed, heading, orderId, riderName } = req.body;
  if (!riderId || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'riderId, lat and lng are required' });
  }

  riderLocations[riderId] = {
    riderId,
    riderName: riderName || riderLocations[riderId]?.riderName || 'Murugan S.',
    lat: Number(lat),
    lng: Number(lng),
    speed: speed || 25,
    heading: heading || 0,
    orderId: orderId || null,
    updatedAt: new Date().toISOString()
  };

  broadcastToClients('RIDER_LOCATION_UPDATED', riderLocations[riderId]);
  res.json(riderLocations[riderId]);
});

// GET & POST Platform Settings (e.g. Merchant UPI ID)
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings || { merchantUpi: '8248651695-3@ybl', merchantName: 'Unavukadai Express' });
});

app.post('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...(db.settings || {}), ...req.body };
  writeDb(db);
  broadcastToClients('SETTINGS_UPDATED', db.settings);
  res.json(db.settings);
});

// POST Reset Orders for Clean Production Launch
app.post('/api/orders/reset', (req, res) => {
  const db = readDb();
  db.orders = [];
  writeDb(db);
  broadcastToClients('ORDERS_UPDATED', []);
  res.json({ success: true, message: 'All test orders cleared for production launch' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Unavukadai Production API running on http://0.0.0.0:${PORT}`);
});
