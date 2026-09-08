const createModel = require('./modelHelper');

const ArticleSchema = {
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  content: { type: String, default: '' }, // Legacy HTML fallback
  blocks: { type: Array, default: [] },   // Ordered content blocks: [{ id, type, content, metadata, order }]
  summary: { type: String, default: '' },
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  tags: { type: [String], default: [] },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  authorDesignation: { type: String, default: 'প্রতিবেদক' },
  status: { 
    type: String, 
    enum: ['draft', 'review', 'scheduled', 'published', 'updated', 'archived', 'trash'], 
    default: 'draft' 
  },
  featuredImage: { type: String, default: '' },
  images: { type: [String], default: [] },
  videoUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  source: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  publishDate: { type: Date },
  scheduledDate: { type: Date },
  readingTime: { type: Number, default: 1 },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  
  // Editorial Trust & Fact Verification
  verificationStatus: { 
    type: String, 
    enum: ['verified', 'unverified', 'developing'], 
    default: 'unverified' 
  },
  verifiedBy: { type: String, default: '' },
  verificationNote: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  keyPoints: { type: [String], default: [] },
  factBox: { type: Array, default: [] },
  timeline: { type: Array, default: [] }, // [{ time, title, description }]
  whatWeKnow: { type: [String], default: [] },
  whatWeDontKnow: { type: [String], default: [] },
  corrections: { type: Array, default: [] }, // [{ date, note }]

  // Ad Settings per article
  adSettings: {
    autoPlacement: { type: Boolean, default: true },
    manualSlots: { type: [Number], default: [] },
    maxAds: { type: Number, default: 3 }
  },

  // Versioning & Revisions
  revisions: { type: Array, default: [] }, // [{ version, savedAt, savedBy, title, content, blocks }]
  
  // Local News Taxonomy
  division: { type: String, default: '' },
  district: { type: String, default: '' },
  upazila: { type: String, default: '' },

  // Multimedia
  multimediaType: { 
    type: String, 
    enum: ['none', 'standard', 'video', 'podcast', 'gallery', 'explainer', 'liveblog', 'audio'], 
    default: 'none' 
  },
  duration: { type: String, default: '' },
  transcript: { type: String, default: '' },
  galleryImages: { type: Array, default: [] }, // [{ url, caption, credit }]

  // Editorial Placement Flags
  isLead: { type: Boolean, default: false },
  isBreaking: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  storyHubId: { type: String, default: '' },

  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    ogImage: { type: String, default: '' }
  }
};

module.exports = createModel('Article', ArticleSchema);

