import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import { cloudinary } from '../config/cloudinary.js';

function parseImages(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr
    .filter(Boolean)
    .map((img) => {
      if (typeof img === 'string') return { url: img };
      if (typeof img === 'object' && (img.url || img.public_id)) {
        return { url: img.url, public_id: img.public_id };
      }
      return null;
    })
    .filter(Boolean);
}

function uploadBufferToCloudinary(buffer, folder = 'products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

function parseSizes(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean);
  // If JSON string
  try {
    const arr = JSON.parse(val);
    if (Array.isArray(arr)) return arr.map(String).map((s) => s.trim()).filter(Boolean);
  } catch (_) {}
  // Comma-separated
  return String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseTags(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean);
  return String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseDate(val) {
  if (!val) return undefined;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseVariants(val) {
  if (!val) return [];
  if (typeof val === 'string') {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return arr;
    } catch (_) {
      // fall through
    }
  }
  if (Array.isArray(val)) return val;
  return [];
}

export const addProduct = async (req, res) => {
  try {
    const { name, price } = req.body || {};
    if (!name || price == null) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    // Collect images from body and files (if any)
    let images = parseImages(req.body.images);
    if (req.files && req.files.length) {
      const uploaded = await Promise.all(
        req.files.map((f) => uploadBufferToCloudinary(f.buffer, 'products'))
      );
      images = images.concat(uploaded.map((r) => ({ public_id: r.public_id, url: r.secure_url })));
    }

    const payload = {
      name: req.body.name,
      sku: req.body.sku,
      description: req.body.description,
      price: Number(req.body.price),
      salePrice: req.body.salePrice != null ? Number(req.body.salePrice) : undefined,
      discountStart: parseDate(req.body.discountStart),
      discountEnd: parseDate(req.body.discountEnd),
      images,
      category: req.body.category,
      subCategory: req.body.subCategory,
      brand: req.body.brand,
      stock: req.body.stock != null ? Number(req.body.stock) : undefined,
      sizes: parseSizes(req.body.sizes),
      bestseller: String(req.body.bestseller || '').toLowerCase() === 'true',
      tags: parseTags(req.body.tags),
      variants: parseVariants(req.body.variants),
    };

    if ((!payload.stock || payload.stock === 0) && Array.isArray(payload.variants) && payload.variants.length) {
      payload.stock = payload.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
    }

    const product = await Product.create(payload);
    return res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const listProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';

    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.brand) filters.brand = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = Number(req.query.maxPrice);
    }

    let criteria = { ...filters };
    if (req.query.search) {
      // Prefer $text if available, otherwise fallback to regex
      criteria = {
        ...filters,
        $or: [
          { $text: { $search: req.query.search } },
          { name: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      Product.find(criteria).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(criteria),
    ]);

    return res.json({
      success: true,
      products: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Best effort: delete cloudinary images if public_id present
    if (product.images?.length) {
      for (const img of product.images) {
        if (img?.public_id) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await cloudinary.uploader.destroy(img.public_id);
          } catch (e) {
            // non-fatal
          }
        }
      }
    }

    await product.deleteOne();
    return res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Handle image removals by public_id
    const removePublicIds = Array.isArray(req.body.removePublicIds)
      ? req.body.removePublicIds
      : req.body.removePublicIds
      ? [req.body.removePublicIds]
      : [];

    if (removePublicIds.length) {
      // Remove from Cloudinary (best effort) and from product.images
      for (const pid of removePublicIds) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await cloudinary.uploader.destroy(pid);
        } catch (_) {
          // ignore
        }
      }
      product.images = product.images.filter((img) => !removePublicIds.includes(img.public_id));
    }

    // Upload any new files
    if (req.files && req.files.length) {
      const uploaded = await Promise.all(
        req.files.map((f) => uploadBufferToCloudinary(f.buffer, 'products'))
      );
      const newImgs = uploaded.map((r) => ({ public_id: r.public_id, url: r.secure_url }));
      const replace = String(req.body.replaceImages || '').toLowerCase() === 'true';
      if (replace) {
        // Delete existing images from Cloudinary
        for (const img of product.images) {
          if (img?.public_id) {
            try {
              // eslint-disable-next-line no-await-in-loop
              await cloudinary.uploader.destroy(img.public_id);
            } catch (_) {
              // ignore
            }
          }
        }
        product.images = newImgs;
      } else {
        product.images = [...product.images, ...newImgs];
      }
    }

    // Update other fields
    const updatable = ['name', 'sku', 'description', 'price', 'salePrice', 'category', 'subCategory', 'brand', 'stock', 'isActive', 'bestseller'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) {
        if (k === 'price' || k === 'salePrice' || k === 'stock') product[k] = Number(req.body[k]);
        else product[k] = req.body[k];
      }
    });

    // Sizes may arrive as array / csv / json
    if (req.body.sizes !== undefined) {
      product.sizes = parseSizes(req.body.sizes);
    }

    if (req.body.discountStart !== undefined) product.discountStart = parseDate(req.body.discountStart);
    if (req.body.discountEnd !== undefined) product.discountEnd = parseDate(req.body.discountEnd);
    if (req.body.tags !== undefined) product.tags = parseTags(req.body.tags);
    if (req.body.variants !== undefined) {
      const variants = parseVariants(req.body.variants).map((v) => ({
        sku: v.sku,
        size: v.size,
        color: v.color,
        style: v.style,
        price: v.price != null ? Number(v.price) : undefined,
        stock: v.stock != null ? Number(v.stock) : 0,
        image: v.image,
      }));
      product.variants = variants;
    }

    await product.save();
    return res.json({ success: true, message: 'Product updated', product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const uploadProductImages = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const results = await Promise.all(
      files.map((f) => uploadBufferToCloudinary(f.buffer, 'products'))
    );
    const images = results.map((r) => ({ public_id: r.public_id, url: r.secure_url }));
    return res.status(201).json({ success: true, message: 'Images uploaded', images });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
  }
};

// CSV Export/Import
function toCsvValue(v) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export const exportProductsCsv = async (req, res) => {
  try {
    const items = await Product.find({}).sort('-createdAt');
    const header = ['id','name','sku','description','price','salePrice','discountStart','discountEnd','category','subCategory','brand','stock','sizes','tags','images','variants'];
    const rows = [header.join(',')];
    for (const p of items) {
      const images = (p.images || []).map((i) => i.url).join('|');
      const sizes = (p.sizes || []).join('|');
      const tags = (p.tags || []).join('|');
      const variants = JSON.stringify(p.variants || []);
      const row = [
        p._id,
        p.name,
        p.sku || '',
        p.description || '',
        p.price != null ? p.price : '',
        p.salePrice != null ? p.salePrice : '',
        p.discountStart ? p.discountStart.toISOString() : '',
        p.discountEnd ? p.discountEnd.toISOString() : '',
        p.category || '',
        p.subCategory || '',
        p.brand || '',
        p.stock != null ? p.stock : '',
        sizes,
        tags,
        images,
        variants,
      ].map(toCsvValue).join(',');
      rows.push(row);
    }
    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Export failed' });
  }
};

export const importProductsCsv = async (req, res) => {
  try {
    const buf = req.file?.buffer;
    if (!buf) return res.status(400).json({ success: false, message: 'CSV file required' });
    const text = buf.toString('utf8');

    // Simple CSV parse (handles quotes) – minimal implementation
    function parseCsv(str) {
      const lines = str.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return { header: [], rows: [] };
      // naive split by comma respecting quotes
      const split = (line) => {
        const out = [];
        let cur = '';
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQ && line[i+1] === '"') { cur += '"'; i++; }
            else inQ = !inQ;
          } else if (ch === ',' && !inQ) {
            out.push(cur); cur = '';
          } else {
            cur += ch;
          }
        }
        out.push(cur);
        return out;
      };
      const header = split(lines[0]).map((h) => h.trim());
      const rows = lines.slice(1).map((l) => split(l));
      return { header, rows };
    }

    const { header, rows } = parseCsv(text);
    const idx = (name) => header.indexOf(name);
    const updated = [];
    const created = [];

    for (const cols of rows) {
      if (!cols || cols.length === 0) continue;
      const id = cols[idx('id')] || '';
      const name = cols[idx('name')];
      if (!name) continue;
      const doc = {
        name,
        sku: cols[idx('sku')] || undefined,
        description: cols[idx('description')] || undefined,
        price: cols[idx('price')] ? Number(cols[idx('price')]) : undefined,
        salePrice: cols[idx('salePrice')] ? Number(cols[idx('salePrice')]) : undefined,
        discountStart: cols[idx('discountStart')] || undefined,
        discountEnd: cols[idx('discountEnd')] || undefined,
        category: cols[idx('category')] || undefined,
        subCategory: cols[idx('subCategory')] || undefined,
        brand: cols[idx('brand')] || undefined,
        stock: cols[idx('stock')] ? Number(cols[idx('stock')]) : undefined,
        sizes: (cols[idx('sizes')] || '').split('|').filter(Boolean),
        tags: (cols[idx('tags')] || '').split('|').filter(Boolean),
        images: (cols[idx('images')] || '').split('|').filter(Boolean).map((url) => ({ url })),
        variants: (() => { try { const v = JSON.parse(cols[idx('variants')] || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } })(),
      };
      // Dates
      if (doc.discountStart) doc.discountStart = new Date(doc.discountStart);
      if (doc.discountEnd) doc.discountEnd = new Date(doc.discountEnd);

      if (id) {
        const existing = await Product.findById(id);
        if (existing) {
          Object.assign(existing, doc);
          await existing.save();
          updated.push(existing._id);
          continue;
        }
      }
      const createdDoc = await Product.create(doc);
      created.push(createdDoc._id);
    }

    return res.json({ success: true, created: created.length, updated: updated.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Import failed' });
  }
};
