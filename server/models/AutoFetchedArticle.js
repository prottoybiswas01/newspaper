const createModel = require('./modelHelper');

const AutoFetchedArticleSchema = {
  title: { type: String, required: true },
  link: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  pubDate: { type: Date },
  source: { type: String, default: '' }
};

module.exports = createModel('AutoFetchedArticle', AutoFetchedArticleSchema);
