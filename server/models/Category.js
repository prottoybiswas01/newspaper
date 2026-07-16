const createModel = require('./modelHelper');

const CategorySchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 }
};

module.exports = createModel('Category', CategorySchema);
