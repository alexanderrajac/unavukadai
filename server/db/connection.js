import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_ENGINE = {
  MONGO: 'mongodb',
  POSTGRES: 'postgres',
  ATOMIC_FALLBACK: 'atomic_store'
};

let activeEngine = DB_ENGINE.ATOMIC_FALLBACK;
let pgPool = null;

// Connect to Database based on Environment
export async function initDatabaseConnection() {
  const mongoUri = process.env.MONGODB_URI;
  const postgresUrl = process.env.DATABASE_URL;

  // 1. Try MongoDB if MONGODB_URI is provided
  if (mongoUri) {
    try {
      console.log('🔄 Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***@'));
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      activeEngine = DB_ENGINE.MONGO;
      console.log('✅ Connected to MongoDB successfully.');
      return { engine: activeEngine };
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, attempting fallback:', err.message);
    }
  }

  // 2. Try PostgreSQL if DATABASE_URL is provided
  if (postgresUrl) {
    try {
      console.log('🔄 Connecting to PostgreSQL...');
      pgPool = new pg.Pool({
        connectionString: postgresUrl,
        connectionTimeoutMillis: 5000
      });
      await pgPool.query('SELECT NOW()');
      activeEngine = DB_ENGINE.POSTGRES;
      console.log('✅ Connected to PostgreSQL successfully.');
      await initPostgresTables();
      return { engine: activeEngine, pool: pgPool };
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection failed, attempting fallback:', err.message);
    }
  }

  // 3. Resilient POSIX Atomic Transactional Store (Zero-Config Default)
  activeEngine = DB_ENGINE.ATOMIC_FALLBACK;
  console.log('⚡ Active DB Engine: Atomic Transactional Storage with POSIX fsync & atomic file swapping (No external DB required or unconfigured)');
  return { engine: activeEngine };
}

// PostgreSQL Table Initialization
async function initPostgresTables() {
  if (!pgPool) return;
  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(150),
        customer_phone VARCHAR(30),
        restaurant_id VARCHAR(100),
        restaurant_name VARCHAR(150),
        restaurant_address TEXT,
        customer_address TEXT,
        locality VARCHAR(100),
        door_no VARCHAR(50),
        street_address TEXT,
        landmark TEXT,
        delivery_coords JSONB,
        items JSONB,
        item_total NUMERIC,
        delivery_fee NUMERIC,
        delivery_distance_km NUMERIC,
        platform_fee NUMERIC,
        taxes NUMERIC,
        discount NUMERIC,
        grand_total NUMERIC,
        status VARCHAR(50),
        payment_method VARCHAR(50),
        payment_status VARCHAR(50),
        delivery_otp VARCHAR(10),
        rider_id VARCHAR(50),
        rider_name VARCHAR(100),
        rider_phone VARCHAR(30),
        rider_earnings NUMERIC,
        placed_at VARCHAR(100),
        eta_mins INT,
        cooking_note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rider_locations (
        rider_id VARCHAR(50) PRIMARY KEY,
        rider_name VARCHAR(100),
        lat NUMERIC,
        lng NUMERIC,
        speed INT,
        heading INT,
        locality VARCHAR(100),
        order_id VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(50) PRIMARY KEY,
        region VARCHAR(100),
        discount_percent INT,
        max_discount NUMERIC,
        min_order NUMERIC,
        discount_amount NUMERIC,
        label TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(50) PRIMARY KEY,
        value JSONB
      );

      CREATE TABLE IF NOT EXISTS stock (
        item_id VARCHAR(100) PRIMARY KEY,
        in_stock BOOLEAN DEFAULT TRUE
      );
    `);
    console.log('✅ PostgreSQL schemas verified and ready.');
  } finally {
    client.release();
  }
}

export function getActiveEngine() {
  return activeEngine;
}

export function getPgPool() {
  return pgPool;
}
