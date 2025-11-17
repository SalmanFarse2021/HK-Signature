import mongoose from 'mongoose';

const { Schema } = mongoose;

const methodSchema = new Schema(
  {
    code: { type: String, required: true },
    label: { type: String, required: true },
    baseRate: { type: Number, default: 0 },
    perKg: { type: Number, default: 0 },
    freeOver: { type: Number, default: 0 },
    estimatedMinDays: { type: Number, default: 3 },
    estimatedMaxDays: { type: Number, default: 7 },
  },
  { _id: false }
);

const zoneSchema = new Schema(
  {
    name: { type: String, required: true },
    countries: { type: [String], default: [] },
    regions: { type: [String], default: [] },
    methods: { type: [methodSchema], default: [] },
  },
  { _id: true }
);

const carrierSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    trackingUrl: { type: String, required: true },
  },
  { _id: true }
);

const settingsSchema = new Schema(
  {
    carriers: { type: [carrierSchema], default: [] },
    zones: { type: [zoneSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ShippingSettings =
  mongoose.models.ShippingSettings || mongoose.model('ShippingSettings', settingsSchema);

export default ShippingSettings;

