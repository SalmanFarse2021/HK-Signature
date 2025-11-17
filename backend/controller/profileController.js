import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import bcrypt from 'bcrypt';
import { cloudinary } from '../config/cloudinary.js';

export async function getSelfProfile(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function updateSelfProfile(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.address !== undefined) updates.address = req.body.address;
    const user = await User.findByIdAndUpdate(uid, updates, { new: true });
    return res.json({ success: true, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function changePassword(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    const user = await User.findById(uid).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword; // pre-save hook hashes when modified
    await user.save();
    return res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

export async function listMyOrders(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;
    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const criteria = { $or: [{ user: uid }, { customerEmail: user.email }] };
    const [items, total] = await Promise.all([
      Order.find(criteria).sort('-createdAt').skip(skip).limit(limit),
      Order.countDocuments(criteria),
    ]);
    return res.json({ success: true, orders: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

function uploadBufferToCloudinary(buffer, folder = 'avatars') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

export async function uploadAvatar(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const file = req.file;
    if (!file?.buffer) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const up = await uploadBufferToCloudinary(file.buffer, 'avatars');
    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // best-effort delete previous
    if (user.avatar?.public_id) {
      try { await cloudinary.uploader.destroy(user.avatar.public_id); } catch (_) {}
    }
    user.avatar = { public_id: up.public_id, url: up.secure_url };
    await user.save();
    return res.status(201).json({ success: true, avatar: user.avatar, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
  }
}
