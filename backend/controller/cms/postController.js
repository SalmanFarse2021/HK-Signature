import Post from '../../models/postModel.js';
import { cloudinary } from '../../config/cloudinary.js';

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

function uploadAuto(buffer, folder = 'posts') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
    stream.end(buffer);
  });
}

function parseBoolean(v, fallback = false) {
  if (v === true || v === false) return v;
  const s = String(v || '').trim().toLowerCase();
  if (!s) return fallback;
  return ['true', '1', 'yes', 'on'].includes(s);
}

export const listPublicPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;
    const type = req.query.type || undefined;
    const q = (req.query.q || '').trim();
    const filters = { published: true };
    if (type) filters.type = type;
    let criteria = { ...filters };
    if (q) criteria.$text = { $search: q };
    const [items, total] = await Promise.all([
      Post.find(criteria).sort('-publishedAt -createdAt').skip(skip).limit(limit),
      Post.countDocuments(criteria),
    ]);
    return res.json({ success: true, posts: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const getPublicPost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const criteria = idOrSlug.match(/^[a-f0-9]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
    const post = await Post.findOne({ ...criteria, published: true });
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const listAdminPosts = async (req, res) => {
  try {
    const items = await Post.find({}).sort('-createdAt');
    return res.json({ success: true, posts: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const savePost = async (req, res) => {
  try {
    const id = req.body._id;
    const type = req.body.type || 'blog';
    const title = req.body.title || '';
    let slug = (req.body.slug || slugify(title)).toLowerCase();
    let coverImage = req.body.coverImage || undefined;
    let gallery = Array.isArray(req.body.gallery) ? req.body.gallery : [];
    const tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : (req.body.tags || '').split(',').map((s) => s.trim()).filter(Boolean);

    // uploads: cover (single) and gallery (array)
    if (req.files?.cover?.[0]) {
      const resUp = await uploadAuto(req.files.cover[0].buffer, 'posts');
      coverImage = { public_id: resUp.public_id, url: resUp.secure_url };
    }
    if (req.files?.gallery?.length) {
      const ups = await Promise.all(req.files.gallery.map((f) => uploadAuto(f.buffer, 'posts')));
      gallery = gallery.concat(ups.map((r) => ({ public_id: r.public_id, url: r.secure_url })));
    }

    const doc = {
      type,
      title,
      slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      coverImage,
      gallery,
      tags,
      published: parseBoolean(req.body.published, false),
      publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : undefined,
    };

    let post;
    if (id) {
      post = await Post.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      Object.assign(post, doc);
      await post.save();
    } else {
      post = await Post.create(doc);
    }
    return res.json({ success: true, post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Save failed' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    const images = [];
    if (post.coverImage?.public_id) images.push(post.coverImage.public_id);
    for (const img of post.gallery || []) {
      if (img.public_id) images.push(img.public_id);
    }
    for (const pid of images) {
      try { await cloudinary.uploader.destroy(pid, { resource_type: 'image' }); } catch (_) {}
    }
    await post.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Delete failed' });
  }
};
