import Media from '../../models/mediaModel.js';
import { cloudinary } from '../../config/cloudinary.js';

function uploadAuto(buffer, folder = 'media') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
    stream.end(buffer);
  });
}

export const listMedia = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '24', 10), 1), 100);
    const skip = (page - 1) * limit;
    const type = req.query.type || undefined;
    const filters = {};
    if (type) filters.type = type;
    const [items, total] = await Promise.all([
      Media.find(filters).sort('-createdAt').skip(skip).limit(limit),
      Media.countDocuments(filters),
    ]);
    return res.json({ success: true, media: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
    const uploaded = await Promise.all(files.map((f) => uploadAuto(f.buffer)));
    const docs = await Promise.all(
      uploaded.map((r) =>
        Media.create({
          type: r.resource_type === 'video' ? 'video' : 'image',
          title: undefined,
          description: undefined,
          url: r.secure_url,
          public_id: r.public_id,
          format: r.format,
          width: r.width,
          height: r.height,
          duration: r.duration,
        })
      )
    );
    return res.status(201).json({ success: true, items: docs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Media.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (doc.public_id) {
      try {
        await cloudinary.uploader.destroy(doc.public_id, { resource_type: doc.type === 'video' ? 'video' : 'image' });
      } catch (_) {}
    }
    await doc.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Delete failed' });
  }
};

