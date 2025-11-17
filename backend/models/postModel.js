import mongoose from 'mongoose';

const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    public_id: { type: String },
    url: { type: String, required: true },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    type: { type: String, enum: ['blog', 'lookbook'], default: 'blog', index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, trim: true, maxlength: 1000 },
    content: { type: String, trim: true }, // HTML/Markdown
    coverImage: imageSchema,
    gallery: { type: [imageSchema], default: [] },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', content: 'text', tags: 1 });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;

