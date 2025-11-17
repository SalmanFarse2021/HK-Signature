import mongoose from 'mongoose';

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 0 },
    startAt: { type: Date },
    endAt: { type: Date },
    minSubtotal: { type: Number, default: 0 },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    perCustomerLimit: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    applicableCategories: { type: [String], default: [] },
    applicableBrands: { type: [String], default: [] },
    applicableProductIds: { type: [String], default: [] },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

couponSchema.pre('save', function(next) {
  if (this.code) this.code = this.code.toUpperCase();
  next();
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;

