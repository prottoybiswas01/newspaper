const createModel = require('./modelHelper');

const StoryHubSchema = {
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subtitle: { type: String, default: '' },
  summary: { type: String, default: '' },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  category: { type: String, default: 'bangladesh' },
  status: { type: String, default: 'developing' }, // 'developing', 'live', 'concluded'
  active: { type: Boolean, default: true },
  isBreaking: { type: Boolean, default: false },
  keyFacts: { type: [String], default: [] },
  timeline: { type: Array, default: [] }, // [{ time, title, description, url }]
  timelineEvents: { type: Array, default: [] },
  liveUpdates: { type: Array, default: [] }, // [{ time, text, author }]
  featuredArticleIds: { type: [String], default: [] }
};

module.exports = createModel('StoryHub', StoryHubSchema);
