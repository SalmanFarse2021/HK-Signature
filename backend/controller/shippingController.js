import ShippingSettings from '../models/shippingSettingsModel.js';

async function getOrCreateSettings() {
  let settings = await ShippingSettings.findOne();
  if (!settings) {
    settings = await ShippingSettings.create({
      carriers: [
        { name: 'DHL', code: 'dhl', trackingUrl: 'https://www.dhl.com/global-en/home/tracking.html?tracking-id={tracking}' },
        { name: 'FedEx', code: 'fedex', trackingUrl: 'https://www.fedex.com/apps/fedextrack/?tracknumbers={tracking}' },
        { name: 'Local Courier', code: 'local', trackingUrl: 'https://google.com/search?q={tracking}' },
      ],
      zones: [
        {
          name: 'Domestic',
          countries: [],
          regions: [],
          methods: [
            { code: 'standard', label: 'Standard', baseRate: 3, perKg: 0, freeOver: 50, estimatedMinDays: 2, estimatedMaxDays: 5 },
            { code: 'express', label: 'Express', baseRate: 7, perKg: 0, freeOver: 0, estimatedMinDays: 1, estimatedMaxDays: 2 },
          ],
        },
        {
          name: 'International',
          countries: ['*'],
          regions: [],
          methods: [
            { code: 'standard', label: 'Standard Intl', baseRate: 10, perKg: 2, freeOver: 200, estimatedMinDays: 7, estimatedMaxDays: 14 },
            { code: 'express', label: 'Express Intl', baseRate: 20, perKg: 3, freeOver: 0, estimatedMinDays: 3, estimatedMaxDays: 6 },
          ],
        },
      ],
    });
  }
  return settings;
}

export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to load shipping settings' });
  }
};

export const saveSettings = async (req, res) => {
  try {
    const payload = req.body || {};
    let settings = await getOrCreateSettings();
    settings.carriers = Array.isArray(payload.carriers) ? payload.carriers : settings.carriers;
    settings.zones = Array.isArray(payload.zones) ? payload.zones : settings.zones;
    settings.updatedAt = new Date();
    await settings.save();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to save shipping settings' });
  }
};

function pickZone(settings, country = '', region = '') {
  const c = (country || '').toUpperCase();
  const r = (region || '').toUpperCase();
  // Match by country or wildcard
  const zones = settings.zones || [];
  let z = zones.find((z) => z.countries?.includes(c));
  if (!z) z = zones.find((z) => z.countries?.includes('*')) || zones[0];
  return z;
}

export const quoteShipping = async (req, res) => {
  try {
    const { country = '', state = '', method = 'standard', weight = '1', subtotal = '0' } = req.query || {};
    const w = Math.max(0, parseFloat(weight || '0')) || 0;
    const sub = Math.max(0, parseFloat(subtotal || '0')) || 0;
    const settings = await getOrCreateSettings();
    const zone = pickZone(settings, country, state);
    const m = (zone?.methods || []).find((m) => m.code === method) || (zone?.methods || [])[0];
    if (!m) return res.status(404).json({ success: false, message: 'No method available' });
    let price = m.baseRate + (m.perKg || 0) * w;
    if (m.freeOver && sub >= m.freeOver) price = 0;
    const eta = {
      minDays: m.estimatedMinDays || 3,
      maxDays: m.estimatedMaxDays || 7,
    };
    return res.json({ success: true, zone: zone?.name, method: { code: m.code, label: m.label }, price, eta });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to quote' });
  }
};

