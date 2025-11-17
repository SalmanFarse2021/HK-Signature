import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    public_id: { type: String },
    url: { type: String, required: true },
  },
  { _id: false }
);

const bannerSchema = new Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    ctaLabel: { type: String, trim: true },
    ctaUrl: { type: String, trim: true },
    images: { type: [imageSchema], default: [] },
    position: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
    startAt: { type: Date },
    endAt: { type: Date },
  },
  { timestamps: true }
);

bannerSchema.index({ active: 1, position: 1 });

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
export default Banner;
