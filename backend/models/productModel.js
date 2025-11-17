import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    public_id: { type: String },
    url: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 360,
    },
    sku: { type: String, trim: true, index: true },
    description: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: { type: Number, min: 0 },
    discountStart: { type: Date },
    discountEnd: { type: Date },
    images: [imageSchema],
    category: { type: String, trim: true, index: true },
    subCategory: { type: String, trim: true },
    brand: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    sizes: { type: [String], default: [] },
    bestseller: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    variants: [
      new Schema(
        {
          sku: { type: String, trim: true },
          size: { type: String, trim: true },
          color: { type: String, trim: true },
          style: { type: String, trim: true },
          price: { type: Number, min: 0 },
          stock: { type: Number, default: 0, min: 0 },
          image: { type: String, trim: true },
        },
        { _id: false }
      ),
    ],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Simple text index for search across name/description
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
