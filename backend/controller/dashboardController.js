import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidMatch = { paymentStatus: { $in: ['paid', 'advance_paid'] }, status: { $ne: 'cancelled' } };

    const [agg] = await Order.aggregate([
      {
        $facet: {
          totals: [
            { $match: paidMatch },
            { $group: { _id: null, orders: { $sum: 1 }, total: { $sum: '$total' } } },
          ],
          today: [
            { $match: { ...paidMatch, createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ],
          month: [
            { $match: { ...paidMatch, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          topProducts: [
            { $match: paidMatch },
            { $unwind: '$items' },
            { $group: { _id: { $ifNull: ['$items.product', '$items.productId'] }, name: { $first: '$items.name' }, qty: { $sum: '$items.qty' } } },
            { $sort: { qty: -1 } },
            { $limit: 5 },
          ],
          topCategories: [
            { $match: paidMatch },
            { $unwind: '$items' },
            { $match: { 'items.product': { $type: 'objectId' } } },
            { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
            { $unwind: '$prod' },
            { $group: { _id: '$prod.category', count: { $sum: '$items.qty' } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          customers: [
            {
              $group: {
                _id: { $ifNull: ['$customerEmail', { $toString: '$user' }] },
                firstOrder: { $min: '$createdAt' },
                orders: { $sum: 1 },
              },
            },
          ],
          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
            {
              $project: {
                orderNumber: 1,
                total: 1,
                status: 1,
                paymentStatus: 1,
                customerEmail: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalSales = agg?.totals?.[0]?.total || 0;
    const orderCount = agg?.totals?.[0]?.orders || 0;
    const todaySales = agg?.today?.[0]?.total || 0;
    const monthlyRevenue = agg?.month?.[0]?.total || 0;
    const averageOrderValue = orderCount ? totalSales / orderCount : 0;

    const byStatus = Object.fromEntries((agg?.byStatus || []).map((d) => [d._id || 'unknown', d.count]));

    const topProducts = (agg?.topProducts || []).map((p) => ({ id: p._id, name: p.name, qty: p.qty }));
    const topCategories = (agg?.topCategories || []).map((c) => ({ category: c._id || 'Uncategorized', qty: c.count }));

    const THIRTY_DAYS = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const customersArr = agg?.customers || [];
    const totalCustomers = customersArr.length;
    const newCustomers = customersArr.filter((c) => c.firstOrder >= THIRTY_DAYS).length;
    const returningCustomers = customersArr.filter((c) => c.orders > 1).length;

    // Low stock
    const lowStock = await Product.find({ isActive: true, stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock images');

    return res.json({
      success: true,
      salesSummary: {
        totalSales,
        todaySales,
        monthlyRevenue,
        averageOrderValue,
        orderCount,
      },
      ordersOverview: byStatus,
      topProducts,
      topCategories,
      customerInsights: { totalCustomers, newCustomers, returningCustomers },
      lowStock: lowStock.map((p) => ({ id: p._id, name: p.name, stock: p.stock, image: p.images?.[0]?.url })),
      recentOrders: agg?.recentOrders || [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to load dashboard metrics' });
  }
};

