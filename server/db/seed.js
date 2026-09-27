import { getSupabaseClient } from './supabase.js';
import { RESTAURANTS } from '../../src/data/mockData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function seed() {
  console.log('🌱 Starting Supabase database seed...');
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('❌ Supabase client not initialized. Check SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  // 1. Seed Settings
  console.log('Seeding settings...');
  const settingsData = [
    { key: 'merchantUpi', value: { value: '8248651695-3@ybl' } },
    { key: 'merchantName', value: { value: 'Unavukadai Express' } },
    { key: 'appName', value: { value: 'Unavukadai' } },
    { key: 'suburbanHubs', value: { hubs: ['Perungalathur', 'Vandalur', 'Mannivakkam'] } }
  ];
  const { error: settingsErr } = await supabase.from('settings').upsert(settingsData, { onConflict: 'key' });
  if (settingsErr) console.warn('Settings seed warning:', settingsErr.message);
  else console.log('✓ Settings seeded');

  // 2. Seed Coupons
  console.log('Seeding coupons...');
  const couponsData = [
    { code: 'PERUNGAL50', region: 'Perungalathur', discount_percent: 50, max_discount: 120, min_order: 199, label: '50% OFF up to ₹120 (Perungalathur)' },
    { code: 'VANDALUR60', region: 'Vandalur', discount_percent: 60, max_discount: 150, min_order: 199, label: '60% OFF up to ₹150 (Vandalur)' },
    { code: 'MANNIVAKKAM40', region: 'Mannivakkam', discount_percent: 40, max_discount: 100, min_order: 149, label: '40% OFF up to ₹100 (Mannivakkam)' },
    { code: 'UNAVU50', region: 'All', discount_percent: 50, max_discount: 100, min_order: 199, label: '50% OFF up to ₹100 (All Zones)' },
    { code: 'FREEDEL', region: 'All', discount_amount: 35, min_order: 200, label: 'Free Delivery over ₹200' }
  ];
  const { error: couponsErr } = await supabase.from('coupons').upsert(couponsData, { onConflict: 'code' });
  if (couponsErr) console.warn('Coupons seed warning:', couponsErr.message);
  else console.log('✓ Coupons seeded');

  // 3. Seed Restaurants & Menu Items
  console.log('Seeding restaurants and menu items...');
  const restaurantRows = [];
  const menuRows = [];

  for (const r of RESTAURANTS) {
    restaurantRows.push({
      id: r.id,
      name: r.name,
      region: r.region,
      cuisines: r.cuisines,
      rating: r.rating,
      rating_count: r.ratingCount,
      delivery_time: r.deliveryTime,
      delivery_time_mins: r.deliveryTimeMins,
      distance: r.distance,
      cost_for_two: r.costForTwo,
      offer: r.offer,
      pure_veg: r.pureVeg,
      delivery: r.delivery,
      dining_out: r.diningOut,
      nightlife: r.nightlife,
      image: r.image,
      address: r.address,
      safety_score: r.safetyScore
    });

    if (r.menu) {
      for (const m of r.menu) {
        menuRows.push({
          id: m.id,
          restaurant_id: r.id,
          name: m.name,
          price: m.price,
          rating: m.rating,
          votes: m.votes,
          is_veg: m.isVeg,
          in_stock: m.inStock,
          category: m.category,
          description: m.description,
          image: m.image,
          best_seller: Boolean(m.bestSeller)
        });
      }
    }
  }

  const { error: restErr } = await supabase.from('restaurants').upsert(restaurantRows, { onConflict: 'id' });
  if (restErr) console.warn('Restaurants seed warning:', restErr.message);
  else console.log(`✓ ${restaurantRows.length} Restaurants seeded`);

  const { error: menuErr } = await supabase.from('menu_items').upsert(menuRows, { onConflict: 'id' });
  if (menuErr) console.warn('Menu items seed warning:', menuErr.message);
  else console.log(`✓ ${menuRows.length} Menu items seeded`);

  // 4. Seed Orders from db.json
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (raw.orders && raw.orders.length > 0) {
        console.log(`Seeding ${raw.orders.length} initial orders from db.json...`);
        const orderRows = raw.orders.slice(0, 10).map(o => ({
          order_id: o.orderId,
          customer_name: o.customerName || 'Gourmet Foodie',
          customer_phone: o.customerPhone || '918248651695',
          restaurant_id: o.restaurantId,
          restaurant_name: o.restaurantName,
          restaurant_address: o.restaurantAddress,
          customer_address: o.customerAddress,
          locality: o.locality,
          door_no: o.doorNo || '',
          street_address: o.streetAddress || '',
          landmark: o.landmark || '',
          delivery_coords: o.deliveryCoords,
          items: o.items || [],
          item_total: o.itemTotal,
          delivery_fee: o.deliveryFee,
          delivery_distance_km: o.deliveryDistanceKm,
          platform_fee: o.platformFee,
          taxes: o.taxes,
          discount: o.discount,
          grand_total: o.grandTotal,
          status: o.status,
          payment_method: o.paymentMethod || 'UPI',
          payment_status: o.paymentStatus || 'PENDING',
          delivery_otp: o.deliveryOtp || '1234',
          rider_id: o.riderId,
          rider_name: o.riderName,
          rider_phone: o.riderPhone,
          rider_earnings: o.riderEarnings,
          placed_at: o.placedAt,
          eta_mins: o.etaMins,
          cooking_note: o.cookingNote || ''
        }));

        const { error: ordersErr } = await supabase.from('orders').upsert(orderRows, { onConflict: 'order_id' });
        if (ordersErr) console.warn('Orders seed warning:', ordersErr.message);
        else console.log(`✓ ${orderRows.length} Orders seeded`);
      }
    } catch (err) {
      console.warn('Could not parse db.json:', err.message);
    }
  }

  // 5. Seed Rider Locations
  console.log('Seeding initial rider locations...');
  const riderData = [
    {
      rider_id: 'rider-suburban-1',
      rider_name: 'Muthu K (SpeedStar)',
      rider_phone: '+91 98401 23456',
      lat: 12.9056,
      lng: 80.0832,
      speed: 32,
      heading: 45,
      locality: 'Perungalathur Hub',
      status: 'AVAILABLE'
    },
    {
      rider_id: 'rider-suburban-2',
      rider_name: 'Saravanan R (Express)',
      rider_phone: '+91 98402 34567',
      lat: 12.8882,
      lng: 80.0821,
      speed: 28,
      heading: 120,
      locality: 'Vandalur Crescent',
      status: 'AVAILABLE'
    },
    {
      rider_id: 'rider-suburban-3',
      rider_name: 'Karthik S (EcoRider)',
      rider_phone: '+91 98403 45678',
      lat: 12.8941,
      lng: 80.0534,
      speed: 25,
      heading: 90,
      locality: 'Mannivakkam Mudichur',
      status: 'AVAILABLE'
    }
  ];
  const { error: riderErr } = await supabase.from('rider_locations').upsert(riderData, { onConflict: 'rider_id' });
  if (riderErr) console.warn('Rider locations seed warning:', riderErr.message);
  else console.log(`✓ ${riderData.length} Riders seeded`);

  console.log('🎉 Supabase database seeding complete!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
