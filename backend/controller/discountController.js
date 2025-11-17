import mongoose from 'mongoose';
import Coupon from '../models/couponModel.js';
import Promotion from '../models/promotionModel.js';
import Order from '../models/orderModel.js';

const nowInRange = (start, end) => {
  const now = new Date();
  if (start && now < new Date(start)) return false;
  if (end && now > new Date(end)) return false;
  return true;
};

function calcItemDiscount(item, type, value) {
  const line = Number(item.price) * Number(item.qty || 1);
  if (type === 'percent') return (line * value) / 100;
  if (type === 'flat') return Math.min(value, line);
  return 0;
}

export const listCoupons = async (req, res) => {
  try {
    const items = await Coupon.find({}).sort('-createdAt');
    return res.json({ success: true, coupons: items });
  } catch (err) { return res.status(500).json({ success: false, message: err?.message }); }
};

export const saveCoupon = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload._id) {
      const doc = await Coupon.create(payload);
      return res.status(201).json({ success: true, coupon: doc });
    }
    const doc = await Coupon.findByIdAndUpdate(payload._id, payload, { new: true });
    return res.json({ success: true, coupon: doc });
  } catch (err) { return res.status(500).json({ success: false, message: err?.message }); }
};

export const deleteCoupon = async (req, res) => {
  try { await Coupon.findByIdAndDelete(req.params.id); return res.json({ success: true }); } catch (err) { return res.status(500).json({ success: false, message: err?.message }); }
};

export const listPromotions = async (req, res) => {
  try { const items = await Promotion.find({}).sort('-createdAt'); return res.json({ success: true, promotions: items }); } catch (err) { return res.status(500).json({ success: false, message: err?.message }); }
};

export const savePromotion = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload._id) {
      const doc = await Promotion.create(payload);
      return res.status(201).json({ success: true, promotion: doc });
    }
    const doc = await Promotion.findByIdAndUpdate(payload._id, payload, { new: true });
    return res.json({ success: true, promotion: doc });
  } catch (err) { return res.status(500).json({ success: false, message: err?.message }); }
};

export const deletePromotion = async (req, res) => {
  try { await Promotion.findByIdAndDelete(req.params.id); return res.json({ success: true }); } catch (err) { return res.status(500).json({ success: false, message: err?.message }); }
};

export const applyDiscounts = async (req, res) => {
  try {
    const { items = [], subtotal = 0, email = '', couponCode = '', shippingPrice = 0 } = req.body || {};
    const sub = Number(subtotal) || 0;
    const code = String(couponCode || '').trim().toUpperCase();

    let couponDiscount = 0;
    let appliedCoupon = null;
    if (code) {
      const c = await Coupon.findOne({ code });
      if (c && c.active && nowInRange(c.startAt, c.endAt) && sub >= (c.minSubtotal || 0)) {
        // usage limits checked loosely (not per-customer in this simple pass)
        if (!c.maxUses || (c.usedCount || 0) < c.maxUses) {
          // apply across applicable items or all
          const applicable = items.filter((it) => {
            const catOk = !c.applicableCategories?.length || c.applicableCategories.includes(it.category);
            const brandOk = !c.applicableBrands?.length || c.applicableBrands.includes(it.brand);
            const prodOk = !c.applicableProductIds?.length || c.applicableProductIds.includes(String(it.id || it.productId || it._id || ''));
            return catOk && brandOk && prodOk;
          });
          const base = applicable.length ? applicable.reduce((s, it)=> s + (Number(it.price)*Number(it.qty||1)), 0) : sub;
          couponDiscount = c.type === 'percent' ? (base * c.value)/100 : Math.min(c.value, base);
          if (couponDiscount > 0) appliedCoupon = { code: c.code, type: c.type, value: c.value };
        }
      }
    }

    // Promotions
    const promos = await Promotion.find({ active: true });
    let promoDiscount = 0;
    let freeShipping = false;
    const appliedPromos = [];
    for (const p of promos) {
      if (!nowInRange(p.startAt, p.endAt)) continue;
      if (p.type === 'free_shipping_over') {
        if (sub >= (p.threshold || 0)) { freeShipping = true; appliedPromos.push({ name: p.name, type: p.type }); }
        continue;
      }
      if (p.type === 'bogo') {
        // Simple BOGO across matching items (buy 1 get 1 free of same product)
        const match = items.filter((it)=>
          (!p.categories?.length || p.categories.includes(it.category)) &&
          (!p.brands?.length || p.brands.includes(it.brand)) &&
          (!p.productIds?.length || p.productIds.includes(String(it.id || it.productId || it._id || '')))
        );
        for (const it of match) {
          const freeQty = Math.floor(Number(it.qty||1)/2);
          if (freeQty>0) { promoDiscount += freeQty * Number(it.price||0); }
        }
        if (match.length) appliedPromos.push({ name: p.name, type: p.type });
        continue;
      }
      // percent/flat on matching items, else whole cart
      const match = items.filter((it)=>
        (!p.categories?.length || p.categories.includes(it.category)) &&
        (!p.brands?.length || p.brands.includes(it.brand)) &&
        (!p.productIds?.length || p.productIds.includes(String(it.id || it.productId || it._id || '')))
      );
      const base = match.length ? match.reduce((s,it)=> s + Number(it.price)*Number(it.qty||1), 0) : sub;
      const d = p.type === 'percent' ? (base * (p.value||0))/100 : Math.min(p.value||0, base);
      if (d>0) { promoDiscount += d; appliedPromos.push({ name: p.name, type: p.type, value: p.value }); }
    }

    const shippingDiscount = freeShipping ? shippingPrice : 0;
    const discount = couponDiscount + promoDiscount + shippingDiscount;
    return res.json({ success: true, discount, couponDiscount, promoDiscount, shippingDiscount, freeShipping, appliedCoupon, appliedPromos });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to apply discounts' });
  }
};

export const listActivePromotionsPublic = async (req, res) => {
  try {
    const items = await Promotion.find({ active: true }).sort('-createdAt');
    const active = items.filter((p) => nowInRange(p.startAt, p.endAt)).map((p) => ({
      _id: p._id,
      name: p.name,
      type: p.type,
      value: p.value,
      threshold: p.threshold,
      flashSale: p.flashSale,
      seasonalTag: p.seasonalTag,
      startAt: p.startAt,
      endAt: p.endAt,
    }));
    return res.json({ success: true, promotions: active });
  } catch (err) { return res.status(500).json({ success: false, message: err?.message || 'Failed to load promotions' }); }
};
