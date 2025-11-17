import mongoose from 'mongoose';

const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true, index: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    url: { type: String, required: true },
    public_id: { type: String },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);
export default Media;

