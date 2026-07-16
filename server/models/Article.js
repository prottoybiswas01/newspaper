const createModel = require('./modelHelper');

const ArticleSchema = {
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String, default: '' },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  author: { type: String, required: true }, // User Name or User ID
  authorId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'scheduled', 'archived'], 
    default: 'draft' 
  },
  isAiGenerated: { 
    type: Boolean, 
    default: false 
  },
  aiStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  featuredImage: { type: String, default: '' },
  images: { type: [String], default: [] },
  videoUrl: { type: String, default: '' },
  publishDate: { type: Date },
  scheduledDate: { type: Date },
  readingTime: { type: Number, default: 1 },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: { type: String, default: '' }
  }
};

module.exports = createModel('Article', ArticleSchema);
