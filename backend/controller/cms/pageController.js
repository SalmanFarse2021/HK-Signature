import Page from '../../models/pageModel.js';

export const getPublicPage = async (req, res) => {
  try {
    const key = (req.params.key || '').toLowerCase();
    const page = await Page.findOne({ key, published: true });
    if (!page) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, page });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const listAdminPages = async (req, res) => {
  try {
    const items = await Page.find({}).sort('key');
    return res.json({ success: true, pages: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
};

export const savePage = async (req, res) => {
  try {
    const id = req.body._id;
    const doc = {
      key: (req.body.key || '').toLowerCase(),
      title: req.body.title,
      content: req.body.content,
      meta: req.body.meta || undefined,
      published: req.body.published !== undefined ? !!req.body.published : true,
    };
    if (!doc.key) return res.status(400).json({ success: false, message: 'Key is required' });
    let page;
    if (id) {
      page = await Page.findById(id);
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      Object.assign(page, doc);
      await page.save();
    } else {
      page = await Page.findOneAndUpdate({ key: doc.key }, doc, { new: true, upsert: true, setDefaultsOnInsert: true });
    }
    return res.json({ success: true, page });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Save failed' });
  }
};

