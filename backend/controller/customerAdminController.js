import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
let nodemailer; try { nodemailer = await import('nodemailer'); } catch { nodemailer = null; }

export const listCustomers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();
    const segment = (req.query.segment || '').trim();

    const filters = { role: { $ne: 'admin' } };
    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (segment) filters.segment = segment;

    const [items, total] = await Promise.all([
      User.aggregate([
        { $match: filters },
        {
          $lookup: {
            from: 'orders',
            let: { uid: '$_id', email: '$email' },
            pipeline: [
              { $match: { $expr: { $or: [ { $eq: ['$user', '$$uid'] }, { $eq: ['$customerEmail', '$$email'] } ] } } },
              { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, last: { $max: '$createdAt' } } },
            ],
            as: 'stats',
          },
        },
        { $addFields: {
            orderCount: { $ifNull: [ { $arrayElemAt: ['$stats.count', 0] }, 0 ] },
            totalSpent: { $ifNull: [ { $arrayElemAt: ['$stats.total', 0] }, 0 ] },
            lastOrderAt: { $ifNull: [ { $arrayElemAt: ['$stats.last', 0] }, null ] },
          } },
        { $project: { password: 0, __v: 0, stats: 0 } },
        { $sort: { totalSpent: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      User.countDocuments(filters),
    ]);

    return res.json({ success: true, customers: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to load customers' });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid customer id' });
    const user = await User.findById(id).select('-password -__v');
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

    const orders = await Order.find({ $or: [ { user: user._id }, { customerEmail: user.email } ] })
      .sort('-createdAt')
      .limit(20)
      .select('orderNumber total status paymentStatus createdAt');
    const stats = await Order.aggregate([
      { $match: { $or: [ { user: user._id }, { customerEmail: user.email } ] } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, last: { $max: '$createdAt' } } },
    ]);
    const s = stats[0] || { total: 0, count: 0, last: null };
    return res.json({ success: true, customer: user, stats: { totalSpent: s.total || 0, orderCount: s.count || 0, lastOrderAt: s.last || null }, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid customer id' });
    const allowed = ['name','segment','isSuspended','isActive','notes'];
    const update = {};
    for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password -__v');
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.json({ success: true, customer: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Update failed' });
  }
};

export const notifyCustomer = async (req, res) => {
  try {
    if (!nodemailer) return res.status(501).json({ success: false, message: 'Email not available. Install and configure SMTP.' });
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid customer id' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
    const { subject, message } = req.body || {};
    if (!subject || !message) return res.status(400).json({ success: false, message: 'Subject and message are required' });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || '587'),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    const from = process.env.SMTP_FROM || 'no-reply@yourstore.local';
    await transporter.sendMail({ from, to: user.email, subject, text: message });
    return res.json({ success: true, message: 'Notification sent' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to send notification' });
  }
};

export const blacklistCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid customer id' });
    const user = await User.findByIdAndUpdate(id, { segment: 'blacklisted', isSuspended: true }, { new: true }).select('-password -__v');
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.json({ success: true, customer: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to blacklist customer' });
  }
};

