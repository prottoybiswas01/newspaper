const createModel = require('./modelHelper');

const CategorySchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 },
  subcategories: { type: Array, default: [] }
};

module.exports = createModel('Category', CategorySchema);
