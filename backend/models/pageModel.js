import mongoose from 'mongoose';

const { Schema } = mongoose;

const pageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true }, // HTML/Markdown
    meta: {
      description: { type: String, trim: true },
      keywords: { type: [String], default: [] },
    },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);
export default Page;

