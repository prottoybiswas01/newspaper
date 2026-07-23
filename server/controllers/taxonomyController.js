const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Article = require('../models/Article');

const generateSlug = (text) => {
  if (!text) return '';
  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0980-\u09FF-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  return slug || 'subcat-' + Date.now();
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ order: 1 });
    // Normalize subcategories array
    const normalized = categories.map(c => ({
      ...c,
      subcategories: Array.isArray(c.subcategories) ? c.subcategories.sort((a,b) => (a.order || 0) - (b.order || 0)) : []
    }));
    res.json({ success: true, categories: normalized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, order, subcategories } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const slug = generateSlug(name);
    
    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const formattedSubs = Array.isArray(subcategories) ? subcategories.map((sub, idx) => ({
      _id: sub._id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
      name: sub.name,
      slug: sub.slug || generateSlug(sub.name),
      order: sub.order !== undefined ? sub.order : idx
    })) : [];

    const category = await Category.create({ 
      name, 
      slug, 
      order: order || 0,
      subcategories: formattedSubs
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, order, subcategories } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (order !== undefined) {
      updateData.order = order;
    }
    if (subcategories !== undefined && Array.isArray(subcategories)) {
      updateData.subcategories = subcategories.map((sub, idx) => ({
        _id: sub._id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
        name: sub.name,
        slug: sub.slug || generateSlug(sub.name),
        order: sub.order !== undefined ? sub.order : idx
      }));
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    res.json({ success: true, category: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SUBCATEGORY CONTROLLERS

const addSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Subcategory name is required' });
    }

    const cat = await Category.findById(id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    const slug = generateSlug(name);
    
    // Check if subcategory slug already exists in this category
    if (subs.some(s => s.slug === slug || s.name === name)) {
      return res.status(400).json({ success: false, message: 'Subcategory already exists in this category' });
    }

    const newSub = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name,
      slug,
      order: order !== undefined ? Number(order) : subs.length
    };

    subs.push(newSub);
    const updated = await Category.findByIdAndUpdate(id, { $set: { subcategories: subs } }, { new: true });
    res.status(201).json({ success: true, category: updated, subcategory: newSub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { name, order } = req.body;

    const cat = await Category.findById(id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    let subs = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];
    const subIdx = subs.findIndex(s => s._id === subId || s.slug === subId);
    
    if (subIdx === -1) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    if (name) {
      subs[subIdx].name = name;
      subs[subIdx].slug = generateSlug(name);
    }
    if (order !== undefined) {
      subs[subIdx].order = Number(order);
    }

    const updated = await Category.findByIdAndUpdate(id, { $set: { subcategories: subs } }, { new: true });
    res.json({ success: true, category: updated, subcategory: subs[subIdx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const { id, subId } = req.params;

    const cat = await Category.findById(id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    let subs = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];
    const filteredSubs = subs.filter(s => s._id !== subId && s.slug !== subId);

    const updated = await Category.findByIdAndUpdate(id, { $set: { subcategories: filteredSubs } }, { new: true });
    res.json({ success: true, category: updated, message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TAG CONTROLLERS

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find({}).sort({ name: 1 });
    res.json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tag name is required' });
    }
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const exists = await Tag.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Tag already exists' });
    }

    const tag = await Tag.create({ name, slug });
    res.status(201).json({ success: true, tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    const updated = await Tag.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    res.json({ success: true, tag: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Merge source tag into target tag in all articles and delete source tag
const mergeTags = async (req, res) => {
  try {
    const { sourceTagSlug, targetTagSlug } = req.body;
    if (!sourceTagSlug || !targetTagSlug) {
      return res.status(400).json({ success: false, message: 'Source and target tag slugs are required' });
    }

    const sourceTag = await Tag.findOne({ slug: sourceTagSlug });
    const targetTag = await Tag.findOne({ slug: targetTagSlug });

    if (!sourceTag || !targetTag) {
      return res.status(404).json({ success: false, message: 'Source or target tag not found' });
    }

    // Find all articles containing source tag
    const articles = await Article.find({ tags: sourceTag.name });
    
    for (const article of articles) {
      // Remove source tag name and add target tag name if not already exists
      let updatedTags = article.tags.filter(t => t !== sourceTag.name);
      if (!updatedTags.includes(targetTag.name)) {
        updatedTags.push(targetTag.name);
      }
      await Article.findByIdAndUpdate(article._id, { $set: { tags: updatedTags } });
    }

    // Delete source tag
    await Tag.findByIdAndDelete(sourceTag._id);

    res.json({ 
      success: true, 
      message: `Merged tag '${sourceTag.name}' into '${targetTag.name}'. Updated ${articles.length} articles.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  mergeTags
};
