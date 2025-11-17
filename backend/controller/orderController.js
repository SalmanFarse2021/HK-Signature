import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
let nodemailer; try { nodemailer = await import('nodemailer'); } catch { nodemailer = null; }

function normalizeItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      product: it.product || undefined,
      productId: it.productId || it.id || it._id || undefined,
      name: String(it.name || '').trim(),
      price: Number(it.price || 0),
      qty: Number(it.qty || it.quantity || 1),
      size: it.size || undefined,
      image: it.image || it.images?.[0] || undefined,
    }))
    .filter((it) => it.name && it.price >= 0 && it.qty > 0);
}

export const createOrder = async (req, res) => {
  try {
    const {
      items: rawItems,
      address,
      shippingMethod,
      paymentMethod,
      subtotal,
      ship,
      total,
      paidNow,
      remaining,
      status,
      paymentStatus,
      customerEmail,
      userId,
    } = req.body || {};

    const items = normalizeItems(rawItems);
    if (!items.length) {
      return res.status(400).json({ success: false, message: 'Order requires at least 1 item' });
    }

    const doc = await Order.create({
      user: mongoose.isValidObjectId(userId) ? userId : undefined,
      customerEmail,
      items,
      shippingAddress: address,
      shippingMethod: shippingMethod || 'standard',
      paymentMethod: paymentMethod || 'cod',
      subtotal: Number(subtotal || 0),
      shipping: Number(ship || 0),
      total: Number(total || 0),
      paidNow: Number(paidNow || 0),
      remaining: Number(remaining || 0),
      status: status || 'pending',
      paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'advance_paid' : 'paid'),
    });

    return res.status(201).json({ success: true, order: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to create order' });
  }
};

export const listOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const status = req.query.status;
    const q = (req.query.q || '').trim();

    const criteria = {};
    if (status) criteria.status = status;
    if (q) {
      criteria.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { customerEmail: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Order.find(criteria).sort(sort).skip(skip).limit(limit),
      Order.countDocuments(criteria),
    ]);

    return res.json({ success: true, orders: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to list orders' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }
    const doc = await Order.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }
    const { status, note, trackingNumber, carrier, paymentStatus, notify, estimatedDeliveryFrom, estimatedDeliveryTo } = req.body || {};
    const doc = await Order.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status) {
      doc.status = status;
      doc.statusHistory.push({ status, note });
      if (status === 'delivered') doc.deliveredAt = new Date();
    }
    if (paymentStatus) doc.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) doc.trackingNumber = trackingNumber;
    if (carrier !== undefined) doc.carrier = carrier;
    if (estimatedDeliveryFrom !== undefined) doc.estimatedDeliveryFrom = estimatedDeliveryFrom ? new Date(estimatedDeliveryFrom) : undefined;
    if (estimatedDeliveryTo !== undefined) doc.estimatedDeliveryTo = estimatedDeliveryTo ? new Date(estimatedDeliveryTo) : undefined;

    const prevStatus = doc.status;
    await doc.save();
    // Ensure customer is recorded when order is completed
    try {
      if (status === 'delivered' && doc.customerEmail) {
        const email = (doc.customerEmail || '').trim().toLowerCase();
        if (email) {
          let existing = await User.findOne({ email });
          if (!existing) {
            const name = (doc.shippingAddress?.name || email.split('@')[0] || 'Customer').toString();
            const randomPassword = `Ord#${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
            await User.create({
              name,
              email,
              password: randomPassword,
              address: {
                line1: doc.shippingAddress?.line1,
                line2: doc.shippingAddress?.line2,
                city: doc.shippingAddress?.city,
                state: doc.shippingAddress?.state,
                postalCode: doc.shippingAddress?.zip,
                country: doc.shippingAddress?.country,
              },
              phone: doc.shippingAddress?.phone,
              isActive: true,
              segment: 'regular',
              isSuspended: false,
              notes: `Auto-created from order ${doc.orderNumber}`,
            });
          }
        }
      }
    } catch (_) {
      // ignore user upsert errors
    }
    if (notify && doc.customerEmail && nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || '587'),
          secure: String(process.env.SMTP_SECURE || 'false') === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
        const from = process.env.SMTP_FROM || 'no-reply@yourstore.local';
        const text = `Your order ${doc.orderNumber} status is now ${doc.status}.`;
        await transporter.sendMail({ from, to: doc.customerEmail, subject: `Order ${doc.orderNumber} update`, text });
      } catch {}
    }
    return res.json({ success: true, order: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to update order' });
  }
};

export const markRefund = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid order id' });
    const { status = 'requested', amount = 0, note } = req.body || {};
    const doc = await Order.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });
    doc.refundStatus = status;
    doc.refundAmount = Number(amount) || 0;
    doc.statusHistory.push({ status: `refund_${status}`, note: note || `Refund ${status}` });
    if (status === 'processed') doc.paymentStatus = 'refunded';
    await doc.save();
    return res.json({ success: true, order: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to update refund' });
  }
};

export const markReturn = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid order id' });
    const { requested = true, reason, note } = req.body || {};
    const doc = await Order.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });
    doc.returnRequested = !!requested;
    if (reason !== undefined) doc.returnReason = reason;
    doc.statusHistory.push({ status: requested ? 'return_requested' : 'return_closed', note });
    await doc.save();
    return res.json({ success: true, order: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to update return' });
  }
};

export const exportOrdersCsv = async (req, res) => {
  try {
    const items = await Order.find({}).sort('-createdAt');
    const header = ['orderNumber','date','customerEmail','status','paymentStatus','total','shippingMethod','carrier','trackingNumber'];
    const lines = [header.join(',')];
    const q = (s) => {
      if (s == null) return '';
      const v = String(s);
      return v.includes(',') || v.includes('"') || v.includes('\n') ? '"' + v.replace(/"/g,'""') + '"' : v;
    };
    for (const o of items) {
      lines.push([
        q(o.orderNumber),
        q(o.createdAt?.toISOString?.() || ''),
        q(o.customerEmail || ''),
        q(o.status),
        q(o.paymentStatus),
        o.total ?? '',
        q(o.shippingMethod || ''),
        q(o.carrier || ''),
        q(o.trackingNumber || ''),
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    return res.send(lines.join('\n'));
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Export failed' });
  }
};

export const invoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid order id' });
    const o = await Order.findById(id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    let PDFDocument;
    try { PDFDocument = (await import('pdfkit')).default; } catch (e) {
      return res.status(501).json({ success: false, message: 'PDF generator not installed. Run: npm i pdfkit' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${o.orderNumber}.pdf`);
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(20).text('Invoice', { align: 'right' });
    doc.moveDown();
    doc.fontSize(12).text(`Order: ${o.orderNumber}`);
    doc.text(`Date: ${new Date(o.createdAt).toLocaleString()}`);
    doc.text(`Customer: ${o.customerEmail || 'Guest'}`);
    doc.text(`Status: ${o.status} • Payment: ${o.paymentStatus}`);
    doc.moveDown();
    doc.text('Items:');
    doc.moveDown(0.5);
    (o.items || []).forEach((it) => {
      doc.text(`• ${it.name}  x${it.qty}  —  $${(it.price * it.qty).toFixed(2)}`);
    });
    doc.moveDown();
    doc.text(`Subtotal: $${o.subtotal?.toFixed?.(2) ?? o.total}`);
    doc.text(`Shipping: $${o.shipping?.toFixed?.(2) ?? 0}`);
    doc.text(`Total: $${o.total?.toFixed?.(2) ?? o.total}`, { align: 'right' });
    doc.end();
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to generate invoice' });
  }
};

export const labelPdf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid order id' });
    const o = await Order.findById(id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    let PDFDocument;
    try { PDFDocument = (await import('pdfkit')).default; } catch (e) {
      return res.status(501).json({ success: false, message: 'PDF generator not installed. Run: npm i pdfkit' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=label-${o.orderNumber}.pdf`);
    const doc = new PDFDocument({ margin: 20, size: 'A6' });
    doc.pipe(res);
    doc.fontSize(16).text('Shipping Label', { align: 'center' });
    doc.moveDown();
    const a = o.shippingAddress || {};
    doc.fontSize(12).text(`${a.name || ''}`);
    doc.text(`${a.line1 || ''}`);
    if (a.line2) doc.text(a.line2);
    doc.text(`${a.city || ''} ${a.state || ''} ${a.zip || ''}`);
    doc.text(`${a.country || ''}`);
    if (a.phone) doc.text(`Phone: ${a.phone}`);
    if (o.trackingNumber) doc.moveDown().text(`Tracking: ${o.trackingNumber}`);
    doc.end();
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to generate label' });
  }
};
