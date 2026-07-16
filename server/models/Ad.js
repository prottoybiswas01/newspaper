const createModel = require('./modelHelper');

const AdSchema = {
  title: { type: String, required: true },
  placement: { 
    type: String, 
    enum: ['header', 'sidebar', 'article', 'popup', 'sticky'], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['image', 'script'], 
    default: 'image' 
  },
  imageUrl: { type: String, default: '' },
  linkUrl: { type: String, default: '' },
  scriptCode: { type: String, default: '' }, // For Google AdSense or Custom HTML
  active: { type: Boolean, default: true },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 }
};

module.exports = createModel('Ad', AdSchema);
