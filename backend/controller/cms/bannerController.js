import Banner from '../../models/bannerModel.js';
import { cloudinary } from '../../config/cloudinary.js';

function normalizeImages(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr
    .filter(Boolean)
    .map((img) => (typeof img === 'string' ? { url: img } : img))
    .filter((x) => x && x.url);
}

function uploadStream(buffer, folder = 'banners') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, res) => {
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

export const listPublicBanners = async (req, res) => {
  try {
    const now = new Date();
    const items = await Banner.find({
      active: true,
      $and: [
        { $or: [ { startAt: { $exists: false } }, { startAt: null }, { startAt: { $lte: now } } ] },
        { $or: [ { endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now } } ] },
      ],
    }).sort('position createdAt');
    return res.json({ success: true, banners: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const listAdminBanners = async (req, res) => {
  try {
    const items = await Banner.find({}).sort('position createdAt');
    return res.json({ success: true, banners: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const saveBanner = async (req, res) => {
  try {
    const id = req.body._id;
    let images = normalizeImages(req.body.images);
    if (req.files && req.files.length) {
      const uploaded = await Promise.all(req.files.map((f) => uploadStream(f.buffer)));
      images = images.concat(uploaded.map((r) => ({ public_id: r.public_id, url: r.secure_url })));
    }
    const doc = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      ctaLabel: req.body.ctaLabel,
      ctaUrl: req.body.ctaUrl,
      images,
      position: req.body.position != null ? Number(req.body.position) : 0,
      active: parseBoolean(req.body.active, true),
      startAt: req.body.startAt ? new Date(req.body.startAt) : undefined,
      endAt: req.body.endAt ? new Date(req.body.endAt) : undefined,
    };

    let banner;
    if (id) {
      banner = await Banner.findById(id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      Object.assign(banner, doc);
      await banner.save();
    } else {
      banner = await Banner.create(doc);
    }
    return res.json({ success: true, banner });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Save failed' });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ success: false, message: 'Not found' });
    // delete images best-effort
    for (const img of banner.images || []) {
      if (img.public_id) {
        try { await cloudinary.uploader.destroy(img.public_id); } catch (_) {}
      }
    }
    await banner.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Delete failed' });
  }
};

// (no hero-specific helpers; hero uses static fallback on frontend)
