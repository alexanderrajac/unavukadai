import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getActiveEngine, getPgPool, DB_ENGINE } from './connection.js';
import { getSupabaseClient } from './supabase.js';
import { OrderModel, RiderLocationModel, CouponModel, StockModel, SettingsModel } from './schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-Memory Fast Cache for Atomic Store
let cache = {
  orders: [],
  stock: {},
  coupons: [],
  settings: {
    merchantUpi: '8248651695-3@ybl',
    merchantName: 'Unavukadai Express'
  },
  riderLocations: {}
};

// POSIX Atomic File Writer with fsync and safe atomic rename
function atomicWriteFileSync(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(7)}`;
  const jsonContent = JSON.stringify(data, null, 2);

  const fd = fs.openSync(tmpPath, 'w');
  try {
    fs.writeFileSync(fd, jsonContent, 'utf8');
    fs.fsyncSync(fd); // Guarantees flush to disk blocks
  } finally {
    fs.closeSync(fd);
  }

  fs.renameSync(tmpPath, filePath); // POSIX Atomic operation
}

function loadInitialFileCache() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      cache = { ...cache, ...parsed };
    }
  } catch (err) {
    console.error('⚠️ Error reading initial DB cache:', err.message);
  }
}

// -------------------------------------------------------------
// REPOSITORY METHODS (UNIFIED MONGO / POSTGRES / ATOMIC STORE)
// -------------------------------------------------------------

export async function getOrders() {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) return data.map(mapPgOrderToApp);
    } catch (err) {
      console.warn('⚠️ Supabase getOrders fallback to cache:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    return await OrderModel.find().sort({ createdAt: -1 }).lean();
  }

  if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return res.rows.map(mapPgOrderToApp);
  }

  return cache.orders || [];
}

export async function createOrder(orderData) {
  const engine = getActiveEngine();
  const orderId = orderData.orderId || ('UNV-' + Math.floor(100000 + Math.random() * 900000));
  const newOrder = {
    ...orderData,
    orderId,
    status: 'PLACED',
    deliveryOtp: orderData.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000)),
    placedAt: 'Just now',
    createdAt: new Date().toISOString()
  };

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      const row = {
        order_id: newOrder.orderId,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        restaurant_id: newOrder.restaurantId,
        restaurant_name: newOrder.restaurantName,
        restaurant_address: newOrder.restaurantAddress,
        customer_address: newOrder.customerAddress,
        locality: newOrder.locality,
        door_no: newOrder.doorNo || '',
        street_address: newOrder.streetAddress || '',
        landmark: newOrder.landmark || '',
        delivery_coords: newOrder.deliveryCoords || [],
        items: newOrder.items || [],
        item_total: newOrder.itemTotal,
        delivery_fee: newOrder.deliveryFee,
        delivery_distance_km: newOrder.deliveryDistanceKm,
        platform_fee: newOrder.platformFee,
        taxes: newOrder.taxes,
        discount: newOrder.discount,
        grand_total: newOrder.grandTotal,
        status: newOrder.status,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        delivery_otp: newOrder.deliveryOtp,
        rider_id: newOrder.riderId || null,
        rider_name: newOrder.riderName || null,
        rider_phone: newOrder.riderPhone || null,
        rider_earnings: newOrder.riderEarnings || 60,
        placed_at: newOrder.placedAt,
        eta_mins: newOrder.etaMins || 25,
        cooking_note: newOrder.cookingNote || ''
      };
      const { data, error } = await supabase.from('orders').insert([row]).select().single();
      if (!error && data) return mapPgOrderToApp(data);
    } catch (err) {
      console.warn('⚠️ Supabase createOrder fallback to cache:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    const created = await OrderModel.create(newOrder);
    return created.toObject();
  }

  if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    const q = `
      INSERT INTO orders (
        order_id, customer_name, customer_phone, restaurant_id, restaurant_name,
        restaurant_address, customer_address, locality, door_no, street_address,
        landmark, delivery_coords, items, item_total, delivery_fee, delivery_distance_km,
        platform_fee, taxes, discount, grand_total, status, payment_method, payment_status,
        delivery_otp, rider_id, rider_name, rider_phone, rider_earnings, placed_at, eta_mins, cooking_note, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
      RETURNING *;
    `;
    const vals = [
      newOrder.orderId, newOrder.customerName, newOrder.customerPhone, newOrder.restaurantId,
      newOrder.restaurantName, newOrder.restaurantAddress, newOrder.customerAddress, newOrder.locality,
      newOrder.doorNo || '', newOrder.streetAddress || '', newOrder.landmark || '',
      JSON.stringify(newOrder.deliveryCoords || []), JSON.stringify(newOrder.items || []),
      newOrder.itemTotal, newOrder.deliveryFee, newOrder.deliveryDistanceKm, newOrder.platformFee,
      newOrder.taxes, newOrder.discount, newOrder.grandTotal, newOrder.status, newOrder.paymentMethod,
      newOrder.paymentStatus, newOrder.deliveryOtp, newOrder.riderId || null, newOrder.riderName || null,
      newOrder.riderPhone || null, newOrder.riderEarnings || 60, newOrder.placedAt, newOrder.etaMins || 25,
      newOrder.cookingNote || '', newOrder.createdAt
    ];
    const res = await pool.query(q, vals);
    return mapPgOrderToApp(res.rows[0]);
  }

  // Atomic fallback
  cache.orders = [newOrder, ...(cache.orders || [])];
  atomicWriteFileSync(DB_FILE, cache);
  return newOrder;
}

export async function updateOrder(orderId, updates) {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      const dbUpdates = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.riderId) dbUpdates.rider_id = updates.riderId;
      if (updates.riderName) dbUpdates.rider_name = updates.riderName;
      if (updates.riderPhone) dbUpdates.rider_phone = updates.riderPhone;
      if (updates.etaMins) dbUpdates.eta_mins = updates.etaMins;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase.from('orders').update(dbUpdates).eq('order_id', orderId).select().single();
      if (!error && data) return mapPgOrderToApp(data);
    } catch (err) {
      console.warn('⚠️ Supabase updateOrder fallback to cache:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    return await OrderModel.findOneAndUpdate({ orderId }, { $set: updates }, { new: true }).lean();
  }

  if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    const setClauses = [];
    const vals = [orderId];
    let i = 2;

    if (updates.status) { setClauses.push(`status = $${i++}`); vals.push(updates.status); }
    if (updates.riderId) { setClauses.push(`rider_id = $${i++}`); vals.push(updates.riderId); }
    if (updates.riderName) { setClauses.push(`rider_name = $${i++}`); vals.push(updates.riderName); }
    if (updates.riderPhone) { setClauses.push(`rider_phone = $${i++}`); vals.push(updates.riderPhone); }
    if (updates.etaMins) { setClauses.push(`eta_mins = $${i++}`); vals.push(updates.etaMins); }

    if (setClauses.length > 0) {
      const q = `UPDATE orders SET ${setClauses.join(', ')} WHERE order_id = $1 RETURNING *`;
      const res = await pool.query(q, vals);
      return res.rows[0] ? mapPgOrderToApp(res.rows[0]) : null;
    }
  }

  let updatedOrder = null;
  cache.orders = (cache.orders || []).map(order => {
    if (order.orderId === orderId) {
      updatedOrder = { ...order, ...updates };
      return updatedOrder;
    }
    return order;
  });

  if (updatedOrder) {
    atomicWriteFileSync(DB_FILE, cache);
  }
  return updatedOrder;
}

export async function deleteOrder(orderId) {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('orders').delete().eq('order_id', orderId);
      return true;
    } catch (err) {
      console.warn('⚠️ Supabase deleteOrder fallback:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    await OrderModel.deleteOne({ orderId });
    return true;
  }

  if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    await pool.query('DELETE FROM orders WHERE order_id = $1', [orderId]);
    return true;
  }

  cache.orders = (cache.orders || []).filter(o => o.orderId !== orderId);
  atomicWriteFileSync(DB_FILE, cache);
  return true;
}

export async function resetOrders() {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('orders').delete().neq('order_id', '');
    } catch (err) {
      console.warn('⚠️ Supabase resetOrders fallback:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    await OrderModel.deleteMany({});
  } else if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    await pool.query('DELETE FROM orders');
  }

  cache.orders = [];
  atomicWriteFileSync(DB_FILE, cache);
  return true;
}

// -------------------------------------------------------------
// RIDER LOCATIONS REPOSITORY
// -------------------------------------------------------------

export async function getRiderLocations() {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('rider_locations').select('*');
      if (!error && data && data.length > 0) {
        const map = {};
        data.forEach(r => {
          map[r.rider_id] = {
            riderId: r.rider_id,
            riderName: r.rider_name,
            lat: Number(r.lat),
            lng: Number(r.lng),
            speed: r.speed,
            heading: r.heading,
            locality: r.locality,
            orderId: r.order_id,
            updatedAt: r.updated_at
          };
        });
        return map;
      }
    } catch (err) {
      console.warn('⚠️ Supabase getRiderLocations fallback:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    const riders = await RiderLocationModel.find().lean();
    const map = {};
    riders.forEach(r => { map[r.riderId] = r; });
    return map;
  }

  if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    const res = await pool.query('SELECT * FROM rider_locations');
    const map = {};
    res.rows.forEach(r => {
      map[r.rider_id] = {
        riderId: r.rider_id,
        riderName: r.rider_name,
        lat: Number(r.lat),
        lng: Number(r.lng),
        speed: r.speed,
        heading: r.heading,
        locality: r.locality,
        orderId: r.order_id,
        updatedAt: r.updated_at
      };
    });
    return map;
  }

  return cache.riderLocations || {};
}

export async function updateRiderLocation(locationData) {
  const engine = getActiveEngine();
  const riderId = locationData.riderId;

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      const row = {
        rider_id: riderId,
        rider_name: locationData.riderName || 'Rider',
        lat: locationData.lat,
        lng: locationData.lng,
        speed: locationData.speed || 25,
        heading: locationData.heading || 0,
        locality: locationData.locality || '',
        order_id: locationData.orderId || null,
        updated_at: new Date().toISOString()
      };
      await supabase.from('rider_locations').upsert(row, { onConflict: 'rider_id' });
      return locationData;
    } catch (err) {
      console.warn('⚠️ Supabase updateRiderLocation fallback:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    return await RiderLocationModel.findOneAndUpdate(
      { riderId },
      { $set: { ...locationData, updatedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();
  }

  if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    const q = `
      INSERT INTO rider_locations (rider_id, rider_name, lat, lng, speed, heading, locality, order_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (rider_id) DO UPDATE SET
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        speed = EXCLUDED.speed,
        heading = EXCLUDED.heading,
        order_id = EXCLUDED.order_id,
        updated_at = NOW()
      RETURNING *;
    `;
    const vals = [
      riderId, locationData.riderName || 'Rider', locationData.lat, locationData.lng,
      locationData.speed || 25, locationData.heading || 0, locationData.locality || '',
      locationData.orderId || null
    ];
    await pool.query(q, vals);
    return locationData;
  }

  cache.riderLocations = cache.riderLocations || {};
  cache.riderLocations[riderId] = {
    ...locationData,
    updatedAt: new Date().toISOString()
  };
  atomicWriteFileSync(DB_FILE, cache);
  return cache.riderLocations[riderId];
}

// -------------------------------------------------------------
// STOCK, COUPONS & SETTINGS REPOSITORY
// -------------------------------------------------------------

export async function getStock() {
  const engine = getActiveEngine();
  if (engine === DB_ENGINE.MONGO) {
    const records = await StockModel.find().lean();
    const map = {};
    records.forEach(r => { map[r.itemId] = r.inStock; });
    return map;
  }
  return cache.stock || {};
}

export async function toggleStock(itemId) {
  cache.stock = cache.stock || {};
  cache.stock[itemId] = cache.stock[itemId] === false ? true : false;

  const engine = getActiveEngine();
  if (engine === DB_ENGINE.MONGO) {
    await StockModel.findOneAndUpdate({ itemId }, { inStock: cache.stock[itemId] }, { upsert: true });
  }

  atomicWriteFileSync(DB_FILE, cache);
  return cache.stock;
}

export async function getCoupons() {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data && data.length > 0) {
        return data.map(c => ({
          code: c.code,
          region: c.region,
          discountPercent: c.discount_percent,
          maxDiscount: c.max_discount,
          minOrder: c.min_order,
          discountAmount: c.discount_amount,
          label: c.label
        }));
      }
    } catch (err) {
      console.warn('⚠️ Supabase getCoupons fallback:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    const res = await CouponModel.find().lean();
    if (res && res.length > 0) return res;
  }
  return cache.coupons || [];
}

export async function createCoupon(coupon) {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('coupons').upsert({
        code: coupon.code,
        region: coupon.region || 'All',
        discount_percent: coupon.discountPercent,
        max_discount: coupon.maxDiscount,
        min_order: coupon.minOrder,
        discount_amount: coupon.discountAmount,
        label: coupon.label
      }, { onConflict: 'code' });
    } catch (err) {
      console.warn('⚠️ Supabase createCoupon fallback:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    await CouponModel.create(coupon);
  }
  cache.coupons = [coupon, ...(cache.coupons || [])];
  atomicWriteFileSync(DB_FILE, cache);
  return coupon;
}

export async function getSettings() {
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.SUPABASE) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data && data.length > 0) {
        const result = {};
        data.forEach(item => {
          result[item.key] = item.value?.value !== undefined ? item.value.value : item.value;
        });
        return result;
      }
    } catch (err) {
      console.warn('⚠️ Supabase getSettings fallback:', err.message);
    }
  }

  if (engine === DB_ENGINE.MONGO) {
    const doc = await SettingsModel.findOne({ key: 'platform' }).lean();
    if (doc?.value) return doc.value;
  }
  return cache.settings || { merchantUpi: '8248651695-3@ybl', merchantName: 'Unavukadai Express' };
}

export async function updateSettings(newSettings) {
  cache.settings = { ...(cache.settings || {}), ...newSettings };
  const engine = getActiveEngine();
  if (engine === DB_ENGINE.MONGO) {
    await SettingsModel.findOneAndUpdate({ key: 'platform' }, { value: cache.settings }, { upsert: true });
  }
  atomicWriteFileSync(DB_FILE, cache);
  return cache.settings;
}

// -------------------------------------------------------------
// SEED MIGRATION: Migrates db.json into DB on first boot
// -------------------------------------------------------------
export async function migrateSeedDataFromDbJson() {
  loadInitialFileCache();
  const engine = getActiveEngine();

  if (engine === DB_ENGINE.MONGO) {
    const count = await OrderModel.countDocuments();
    if (count === 0 && cache.orders?.length > 0) {
      console.log(`📦 Migrating ${cache.orders.length} initial orders from db.json into MongoDB...`);
      await OrderModel.insertMany(cache.orders);
      console.log('✅ Seed migration into MongoDB complete.');
    }
  } else if (engine === DB_ENGINE.POSTGRES) {
    const pool = getPgPool();
    const countRes = await pool.query('SELECT COUNT(*) FROM orders');
    if (parseInt(countRes.rows[0].count, 10) === 0 && cache.orders?.length > 0) {
      console.log(`📦 Migrating ${cache.orders.length} initial orders from db.json into PostgreSQL...`);
      for (const ord of cache.orders) {
        await createOrder(ord);
      }
      console.log('✅ Seed migration into PostgreSQL complete.');
    }
  }
}

// Helper to map postgres column snake_case to app camelCase
function mapPgOrderToApp(row) {
  if (!row) return null;
  return {
    orderId: row.order_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name,
    restaurantAddress: row.restaurant_address,
    customerAddress: row.customer_address,
    locality: row.locality,
    doorNo: row.door_no,
    streetAddress: row.street_address,
    landmark: row.landmark,
    deliveryCoords: typeof row.delivery_coords === 'string' ? JSON.parse(row.delivery_coords) : row.delivery_coords,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    itemTotal: Number(row.item_total),
    deliveryFee: Number(row.delivery_fee),
    deliveryDistanceKm: Number(row.delivery_distance_km),
    platformFee: Number(row.platform_fee),
    taxes: Number(row.taxes),
    discount: Number(row.discount),
    grandTotal: Number(row.grand_total),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    deliveryOtp: row.delivery_otp,
    riderId: row.rider_id,
    riderName: row.rider_name,
    riderPhone: row.rider_phone,
    riderEarnings: Number(row.rider_earnings),
    placedAt: row.placed_at,
    etaMins: row.eta_mins,
    cookingNote: row.cooking_note,
    createdAt: row.created_at
  };
}
