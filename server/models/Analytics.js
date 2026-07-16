const createModel = require('./modelHelper');

const AnalyticsSchema = {
  eventType: { type: String, enum: ['view', 'click'], default: 'view' },
  path: { type: String, default: '' },
  articleId: { type: String, default: '' },
  ip: { type: String, default: '' },
  device: { type: String, default: 'Desktop' }, // Desktop, Mobile, Tablet
  browser: { type: String, default: 'Chrome' }, // Chrome, Firefox, Safari, Edge, etc.
  country: { type: String, default: 'Bangladesh' }
};

module.exports = createModel('Analytics', AnalyticsSchema);
