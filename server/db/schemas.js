import mongoose from 'mongoose';

// 1. Order Schema (MongoDB)
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customerName: String,
  customerPhone: { type: String, index: true },
  restaurantId: { type: String, index: true },
  restaurantName: String,
  restaurantAddress: String,
  customerAddress: String,
  locality: { type: String, index: true },
  doorNo: String,
  streetAddress: String,
  landmark: String,
  deliveryCoords: [Number],
  items: [{
    id: String,
    name: String,
    price: Number,
    isVeg: Boolean,
    restaurantId: String,
    restaurantName: String,
    quantity: Number
  }],
  itemTotal: Number,
  deliveryFee: Number,
  deliveryDistanceKm: Number,
  platformFee: Number,
  taxes: Number,
  discount: Number,
  grandTotal: Number,
  status: { 
    type: String, 
    enum: ['PLACED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
    index: true
  },
  paymentMethod: { type: String, default: 'UPI' },
  paymentStatus: { type: String, default: 'PENDING' },
  deliveryOtp: { type: String, required: true },
  riderId: { type: String, index: true, default: null },
  riderName: { type: String, default: null },
  riderPhone: { type: String, default: null },
  riderEarnings: Number,
  placedAt: String,
  etaMins: Number,
  cookingNote: String,
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// 2. Rider Location Schema (MongoDB with Geospatial Capability)
const RiderLocationSchema = new mongoose.Schema({
  riderId: { type: String, required: true, unique: true, index: true },
  riderName: String,
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  speed: Number,
  heading: Number,
  locality: String,
  orderId: String,
  updatedAt: { type: Date, default: Date.now }
});

// 3. Coupon Schema
const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  region: String,
  discountPercent: Number,
  maxDiscount: Number,
  minOrder: Number,
  discountAmount: Number,
  label: String
});

// 4. Stock Schema
const StockSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  inStock: { type: Boolean, default: true }
});

// 5. Settings Schema
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
});

export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const RiderLocationModel = mongoose.models.RiderLocation || mongoose.model('RiderLocation', RiderLocationSchema);
export const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export const StockModel = mongoose.models.Stock || mongoose.model('Stock', StockSchema);
export const SettingsModel = mongoose.models.Setting || mongoose.model('Setting', SettingsSchema);
