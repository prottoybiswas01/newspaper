const createModel = require('./modelHelper');

const AdSchema = {
  title: { type: String, required: true },
  advertiserName: { type: String, default: 'Direct Advertiser' },
  campaignName: { type: String, default: 'General Campaign' },
  
  // Placement slot
  placement: { 
    type: String, 
    enum: [
      'header', 
      'sidebar', 
      'article', 
      'article-inline-1', 
      'article-inline-2', 
      'article-inline-3', 
      'sticky', 
      'popup', 
      'homepage-mid', 
      'feed'
    ], 
    required: true 
  },
  
  // Creative format
  creativeType: { 
    type: String, 
    enum: [
      'banner', 
      'native', 
      'in-article', 
      'sponsored-card', 
      'sticky-bottom', 
      'video', 
      'house-ad', 
      'sponsored-content'
    ], 
    default: 'banner' 
  },

  // Legacy type fallback
  type: { 
    type: String, 
    enum: ['image', 'script', 'video', 'html'], 
    default: 'image' 
  },

  imageUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  linkUrl: { type: String, default: '' },
  destinationUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  ctaText: { type: String, default: 'বিস্তারিত জানুন' },
  sponsorBadge: { type: String, default: 'বিজ্ঞাপন' },
  scriptCode: { type: String, default: '' }, // For AdSense or verified HTML
  
  // Campaign schedule & status
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'completed', 'draft'], 
    default: 'active' 
  },
  active: { type: Boolean, default: true },

  // Targeting & Priority
  priority: { type: Number, default: 5 }, // 1 (lowest) to 10 (highest)
  targetDevices: { type: [String], default: ['Desktop', 'Mobile', 'Tablet'] },
  targetCategories: { type: [String], default: [] }, // empty = all categories
  targetArticles: { type: [String], default: [] },   // specific article IDs/slugs
  
  // Frequency Control
  frequencyCap: { type: Number, default: 3 }, // max impressions per user per day
  isHouseAd: { type: Boolean, default: false },

  // Metrics
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 }
};

module.exports = createModel('Ad', AdSchema);

