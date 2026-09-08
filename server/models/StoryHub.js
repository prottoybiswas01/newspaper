const createModel = require('./modelHelper');

const StoryHubSchema = {
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  category: { type: String, default: 'bangladesh' },
  active: { type: Boolean, default: true },
  isBreaking: { type: Boolean, default: false },
  keyFacts: { type: [String], default: [] },
  timeline: { type: Array, default: [] }, // [{ time, title, description, url }]
  liveUpdates: { type: Array, default: [] }, // [{ time, text, author }]
  featuredArticleIds: { type: [String], default: [] }
};

module.exports = createModel('StoryHub', StoryHubSchema);
