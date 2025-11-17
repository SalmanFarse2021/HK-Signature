import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    size: { type: String },
    image: { type: String },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String,
  },
  { _id: false }
);

const statusEntrySchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customerEmail: { type: String },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: addressSchema,
    shippingMethod: { type: String, enum: ['standard', 'express', 'pickup'], default: 'standard' },
    paymentMethod: { type: String, enum: ['stripe', 'bkash', 'cod'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'advance_paid', 'paid', 'refunded'], default: 'pending' },
    status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending', index: true },
    statusHistory: [statusEntrySchema],
    trackingNumber: { type: String },
    carrier: { type: String },
    // Refunds & returns
    refundStatus: { type: String, enum: ['none', 'requested', 'approved', 'rejected', 'processed'], default: 'none' },
    refundAmount: { type: Number, min: 0 },
    returnRequested: { type: Boolean, default: false },
    returnReason: { type: String },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paidNow: { type: Number, default: 0, min: 0 },
    remaining: { type: Number, default: 0, min: 0 },
    deliveredAt: { type: Date },
    estimatedDeliveryFrom: { type: Date },
    estimatedDeliveryTo: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.orderNumber = `ORD-${ts}-${rnd}`;
  }
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [{ status: this.status || 'pending', note: 'Order created' }];
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
