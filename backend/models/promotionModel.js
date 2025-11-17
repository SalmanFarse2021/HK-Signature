import mongoose from 'mongoose';

const { Schema } = mongoose;

const promotionSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['percent', 'flat', 'bogo', 'free_shipping_over'], required: true },
    value: { type: Number, default: 0 },
    threshold: { type: Number, default: 0 },
    startAt: { type: Date },
    endAt: { type: Date },
    active: { type: Boolean, default: true },
    categories: { type: [String], default: [] },
    brands: { type: [String], default: [] },
    productIds: { type: [String], default: [] },
    flashSale: { type: Boolean, default: false },
    seasonalTag: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);
export default Promotion;

