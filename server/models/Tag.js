const createModel = require('./modelHelper');

const TagSchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
};

module.exports = createModel('Tag', TagSchema);
