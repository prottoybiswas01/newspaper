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

const DEFAULT_CATEGORIES_LIST = [
  { name: 'সর্বশেষ', slug: 'latest', order: 0 },
  { name: 'বাংলাদেশ', slug: 'bangladesh', order: 1 },
  { name: 'রাজনীতি', slug: 'politics', order: 2 },
  { name: 'বিশ্ব', slug: 'international', order: 3 },
  { name: 'বাণিজ্য', slug: 'economy', order: 4 },
  { name: 'মতামত', slug: 'opinion', order: 5 },
  { name: 'খেলা', slug: 'sports', order: 6 },
  { name: 'বিনোদন', slug: 'entertainment', order: 7 },
  { name: 'চাকরি', slug: 'jobs', order: 8 },
  { name: 'জীবনযাপন', slug: 'lifestyle', order: 9 },
  { name: 'স্টার্টআপ ও প্রযুক্তি', slug: 'technology', order: 10 },
  { name: 'শিক্ষা', slug: 'education', order: 11 },
  { name: 'ধর্ম', slug: 'religion', order: 12 },
  { name: 'অন্যপাঠ', slug: 'literature', order: 13 },
  { name: 'সাক্ষাৎকার', slug: 'interview', order: 14 },
  { name: 'কৃষি ও প্রকৃতি', slug: 'agriculture', order: 15 },
  { name: 'ছবি', slug: 'photo', order: 16 },
  { name: 'প্রবাস', slug: 'diaspora', order: 17 },
  { name: 'শিশু ও নারী', slug: 'women-children', order: 18 },
  { name: 'অনন্য', slug: 'exclusive', order: 19 }
];

const DEFAULT_SUBCATEGORIES = {
  latest: [
    { _id: "sub_lat_1", name: "আজকের খবর", slug: "ajker-khobor", order: 0 },
    { _id: "sub_lat_2", name: "প্রধান খবর", slug: "prodhan-khobor", order: 1 },
    { _id: "sub_lat_3", name: "ব্রেকিং নিউজ", slug: "breaking-news", order: 2 }
  ],
  bangladesh: [
    { _id: "sub_bd_1", name: "রাজধানী", slug: "rajdhani", order: 0 },
    { _id: "sub_bd_2", name: "জেলা", slug: "jila", order: 1 },
    { _id: "sub_bd_3", name: "করোনাভাইরাস", slug: "coronavirus", order: 2 },
    { _id: "sub_bd_4", name: "পরিবেশ", slug: "poribesh", order: 3 },
    { _id: "sub_bd_5", name: "অপরাধ", slug: "oporadh", order: 4 }
  ],
  international: [
    { _id: "sub_int_1", name: "ইরান যুদ্ধ", slug: "iran-yuddho", order: 0 },
    { _id: "sub_int_2", name: "ভারত", slug: "bharat", order: 1 },
    { _id: "sub_int_3", name: "পাকিস্তান", slug: "pakistan", order: 2 },
    { _id: "sub_int_4", name: "চীন", slug: "chin", order: 3 },
    { _id: "sub_int_5", name: "মধ্যপ্রাচ্য", slug: "moddhoprachyo", order: 4 },
    { _id: "sub_int_6", name: "যুক্তরাষ্ট্র", slug: "joktorashtro", order: 5 },
    { _id: "sub_int_7", name: "এশিয়া", slug: "eshia", order: 6 },
    { _id: "sub_int_8", name: "ইউরোপ", slug: "europ", order: 7 },
    { _id: "sub_int_9", name: "আফ্রিকা", slug: "afrika", order: 8 },
    { _id: "sub_int_10", name: "লাতিন আমেরিকা", slug: "latin-america", order: 9 }
  ],
  politics: [
    { _id: "sub_pol_1", name: "জাতীয়", slug: "jatiyo", order: 0 },
    { _id: "sub_pol_2", name: "সংসদ", slug: "songshod", order: 1 },
    { _id: "sub_pol_3", name: "দলীয় সংবাদ", slug: "doliyo-songbad", order: 2 },
    { _id: "sub_pol_4", name: "নির্বাচন", slug: "election", order: 3 }
  ],
  economy: [
    { _id: "sub_eco_1", name: "শেয়ারবাজার", slug: "sheyerbajar", order: 0 },
    { _id: "sub_eco_2", name: "ব্যাংক", slug: "bank", order: 1 },
    { _id: "sub_eco_3", name: "শিল্প", slug: "shilpo", order: 2 },
    { _id: "sub_eco_4", name: "অর্থনীতি", slug: "orthoniti", order: 3 },
    { _id: "sub_eco_5", name: "বিশ্ববাণিজ্য", slug: "bishwobanijjo", order: 4 },
    { _id: "sub_eco_6", name: "বিশ্লেষণ", slug: "bishleshon", order: 5 },
    { _id: "sub_eco_7", name: "আপনার টাকা", slug: "apnar-taka", order: 6 },
    { _id: "sub_eco_8", name: "উদ্যোক্তা", slug: "uddyokta", order: 7 },
    { _id: "sub_eco_9", name: "কর্পোরেট সংবাদ", slug: "corporate-songbad", order: 8 },
    { _id: "sub_eco_10", name: "বাজেট ২০২৬-২৭", slug: "budget-2026-27", order: 9 }
  ],
  sports: [
    { _id: "sub_spt_1", name: "বিশ্বকাপ ফুটবল", slug: "worldcup-football", order: 0 },
    { _id: "sub_spt_2", name: "ক্রিকেট", slug: "cricket", order: 1 },
    { _id: "sub_spt_3", name: "টেনিস", slug: "tennis", order: 2 },
    { _id: "sub_spt_4", name: "অন্য খেলা", slug: "onno-khela", order: 3 },
    { _id: "sub_spt_5", name: "সাক্ষাৎকার", slug: "shakshatkar", order: 4 },
    { _id: "sub_spt_6", name: "ফটো ফিচার", slug: "photo-feature", order: 5 },
    { _id: "sub_spt_7", name: "কুইজ", slug: "quiz", order: 6 },
    { _id: "sub_spt_8", name: "সাত রং", slug: "shaat-rong", order: 7 },
    { _id: "sub_spt_9", name: "ভিডিও", slug: "video", order: 8 },
    { _id: "sub_spt_10", name: "আজকের খেলা", slug: "ajker-khela", order: 9 }
  ],
  entertainment: [
    { _id: "sub_ent_1", name: "টেলিভিশন", slug: "television", order: 0 },
    { _id: "sub_ent_2", name: "ওটিটি", slug: "ott", order: 1 },
    { _id: "sub_ent_3", name: "ঢালিউড", slug: "dhallywood", order: 2 },
    { _id: "sub_ent_4", name: "টলিউড", slug: "tollywood", order: 3 },
    { _id: "sub_ent_5", name: "বলিউড", slug: "bollywood", order: 4 },
    { _id: "sub_ent_6", name: "হলিউড", slug: "hollywood", order: 5 },
    { _id: "sub_ent_7", name: "বিশ্ব চলচ্চিত্র", slug: "bishwo-cholochitro", order: 6 },
    { _id: "sub_ent_8", name: "গান", slug: "gan", order: 7 },
    { _id: "sub_ent_9", name: "নাটক", slug: "natok", order: 8 },
    { _id: "sub_ent_10", name: "আলাপন", slug: "alapon", order: 9 }
  ],
  lifestyle: [
    { _id: "sub_life_1", name: "ভ্রমণ", slug: "bhromon", order: 0 },
    { _id: "sub_life_2", name: "সম্পর্ক", slug: "shomporo", order: 1 },
    { _id: "sub_life_3", name: "সুস্থতা", slug: "shusthota", order: 2 },
    { _id: "sub_life_4", name: "রাশি", slug: "rashi", order: 3 },
    { _id: "sub_life_5", name: "ফ্যাশন", slug: "fashion", order: 4 },
    { _id: "sub_life_6", name: "স্টাইল", slug: "style", order: 5 },
    { _id: "sub_life_7", name: "রূপচর্চা", slug: "rupchorcha", order: 6 },
    { _id: "sub_life_8", name: "গৃহসজ্জা", slug: "grihoshojja", order: 7 },
    { _id: "sub_life_9", name: "রসনা", slug: "roshona", order: 8 },
    { _id: "sub_life_10", name: "কেনাকাটা", slug: "kenakata", order: 9 }
  ],
  jobs: [
    { _id: "sub_job_1", name: "খবর", slug: "khobor", order: 0 },
    { _id: "sub_job_2", name: "নিয়োগ", slug: "niyog", order: 1 },
    { _id: "sub_job_3", name: "পরামর্শ", slug: "poramorsho", order: 2 },
    { _id: "sub_job_4", name: "সাক্ষাৎকার", slug: "shakshatkar", order: 3 }
  ],
  technology: [
    { _id: "sub_tech_1", name: "গ্যাজেট", slug: "gadget", order: 0 },
    { _id: "sub_tech_2", name: "টিপস", slug: "tips", order: 1 },
    { _id: "sub_tech_3", name: "বিজ্ঞান", slug: "biggan", order: 2 },
    { _id: "sub_tech_4", name: "অটোমোবাইল", slug: "automobile", order: 3 },
    { _id: "sub_tech_5", name: "সাইবার-জগৎ", slug: "cyber-jogot", order: 4 },
    { _id: "sub_tech_6", name: "ফ্রিল্যান্সিং", slug: "freelancing", order: 5 },
    { _id: "sub_tech_7", name: "এআই", slug: "ai", order: 6 },
    { _id: "sub_tech_8", name: "কুইজ", slug: "quiz", order: 7 }
  ],
  education: [
    { _id: "sub_edu_1", name: "ভর্তি", slug: "bhorti", order: 0 },
    { _id: "sub_edu_2", name: "পরীক্ষা", slug: "porikkha", order: 1 },
    { _id: "sub_edu_3", name: "বৃত্তি", slug: "britti", order: 2 },
    { _id: "sub_edu_4", name: "পড়াশোনা", slug: "porashona", order: 3 },
    { _id: "sub_edu_5", name: "উচ্চশিক্ষা", slug: "uchchoshikkha", order: 4 },
    { _id: "sub_edu_6", name: "ক্যাম্পাস", slug: "campus", order: 5 },
    { _id: "sub_edu_7", name: "গণিত ইস্কুল", slug: "gonit-ischool", order: 6 }
  ],
  opinion: [
    { _id: "sub_op_1", name: "সম্পাদকীয়", slug: "shompadokiyo", order: 0 },
    { _id: "sub_op_2", name: "কলাম", slug: "kolam", order: 1 },
    { _id: "sub_op_3", name: "সাক্ষাৎকার", slug: "shakshatkar", order: 2 },
    { _id: "sub_op_4", name: "স্মরণ", slug: "shmoron", order: 3 },
    { _id: "sub_op_5", name: "প্রতিক্রিয়া", slug: "protikriya", order: 4 },
    { _id: "sub_op_6", name: "চিঠি", slug: "chithi", order: 5 }
  ],
  religion: [
    { _id: "sub_rel_1", name: "ইসলাম", slug: "islam", order: 0 },
    { _id: "sub_rel_2", name: "হিন্দুধর্ম", slug: "hinduism", order: 1 },
    { _id: "sub_rel_3", name: "অন্যান্য ধর্ম", slug: "other-religions", order: 2 },
    { _id: "sub_rel_4", name: "বাণী ও চিন্তা", slug: "bani-chinta", order: 3 }
  ],
  literature: [
    { _id: "sub_lit_1", name: "সাহিত্য", slug: "sahitya", order: 0 },
    { _id: "sub_lit_2", name: "কবিতা", slug: "kobita", order: 1 },
    { _id: "sub_lit_3", name: "বই আলোচনা", slug: "boi-alochona", order: 2 },
    { _id: "sub_lit_4", name: "ছোটগল্প", slug: "chotogolpo", order: 3 }
  ],
  interview: [
    { _id: "sub_intv_1", name: "বিশেষ সাক্ষাৎকার", slug: "bishesh-shakshatkar", order: 0 },
    { _id: "sub_intv_2", name: "রাজনৈতিক ব্যক্তিত্ব", slug: "political-personality", order: 1 },
    { _id: "sub_intv_3", name: "সাংস্কৃতিক ব্যক্তিত্ব", slug: "cultural-personality", order: 2 }
  ],
  agriculture: [
    { _id: "sub_agr_1", name: "কৃষি ও কৃষক", slug: "krishi-o-krishok", order: 0 },
    { _id: "sub_agr_2", name: "প্রকৃতি ও পরিবেশ", slug: "prokriti-o-poribesh", order: 1 },
    { _id: "sub_agr_3", name: "প্রাণিজগৎ", slug: "pranijogot", order: 2 },
    { _id: "sub_agr_4", name: "জলবায়ু পরিবর্তন", slug: "climate-change", order: 3 }
  ],
  photo: [
    { _id: "sub_pht_1", name: "ফটোস্টোরি", slug: "photo-story", order: 0 },
    { _id: "sub_pht_2", name: "আলোচিত ছবি", slug: "trending-photos", order: 1 },
    { _id: "sub_pht_3", name: "প্রাকৃতিক দৃশ্য", slug: "nature-photos", order: 2 },
    { _id: "sub_pht_4", name: "দৈনন্দিন জীবন", slug: "daily-life-photos", order: 3 }
  ],
  diaspora: [
    { _id: "sub_dia_1", name: "মধ্যপ্রাচ্য প্রবাস", slug: "middle-east-diaspora", order: 0 },
    { _id: "sub_dia_2", name: "ইউরোপ প্রবাস", slug: "europe-diaspora", order: 1 },
    { _id: "sub_dia_3", name: "যুক্তরাষ্ট্র প্রবাস", slug: "usa-diaspora", order: 2 },
    { _id: "sub_dia_4", name: "সাফল্য গাথা", slug: "success-stories", order: 3 }
  ],
  "women-children": [
    { _id: "sub_wnc_1", name: "শিশু অধিকার", slug: "child-rights", order: 0 },
    { _id: "sub_wnc_2", name: "নারী নেতৃত্ব", slug: "women-leadership", order: 1 },
    { _id: "sub_wnc_3", name: "প্যারেন্টিং", slug: "parenting", order: 2 },
    { _id: "sub_wnc_4", name: "কন্যাশিশু", slug: "girl-child", order: 3 }
  ],
  exclusive: [
    { _id: "sub_exc_1", name: "বিশেষ প্রতিবেদন", slug: "special-report", order: 0 },
    { _id: "sub_exc_2", name: "অনুসন্ধান", slug: "investigative", order: 1 },
    { _id: "sub_exc_3", name: "ইতিহাস ঐতিহ্য", slug: "history-heritage", order: 2 }
  ]
};

const BN_NAME_BY_SLUG = {
  latest: 'সর্বশেষ',
  bangladesh: 'বাংলাদেশ',
  politics: 'রাজনীতি',
  international: 'বিশ্ব',
  economy: 'বাণিজ্য',
  opinion: 'মতামত',
  sports: 'খেলা',
  entertainment: 'বিনোদন',
  jobs: 'চাকরি',
  lifestyle: 'জীবনযাপন',
  technology: 'তথ্যপ্রযুক্তি',
  education: 'শিক্ষা',
  religion: 'ধর্ম',
  literature: 'সাহিত্য ও সংস্কৃতি',
  interview: 'সাক্ষাৎকার',
  agriculture: 'কৃষি ও প্রকৃতি',
  photo: 'ছবি',
  diaspora: 'প্রবাস',
  'women-children': 'নারী ও শিশু',
  exclusive: 'অনন্য',
  videos: 'ভিডিও',
  'media-center': 'ভিডিও',
};

const getCategories = async (req, res) => {
  try {
    const rawCategories = await Category.find({}).sort({ order: 1 });
    
    // If DB has custom categories, map them; otherwise ensure default 20 categories
    let finalCategories = [];
    if (rawCategories.length > 0) {
      finalCategories = rawCategories.map(raw => {
        const c = raw.toObject ? raw.toObject() : { ...raw };
        const slugKey = (c.slug || '').toLowerCase();
        let subs = Array.isArray(c.subcategories) && c.subcategories.length > 0
          ? c.subcategories
          : (DEFAULT_SUBCATEGORIES[slugKey] || []);

        const bnName = BN_NAME_BY_SLUG[slugKey] || c.name || (c.slug ? c.slug.charAt(0).toUpperCase() + c.slug.slice(1) : 'বিভাগ');

        return {
          _id: c._id ? c._id.toString() : (c.id || c.slug),
          name: bnName,
          slug: c.slug || '',
          order: c.order !== undefined ? c.order : 0,
          subcategories: subs.sort((a,b) => (a.order || 0) - (b.order || 0))
        };
      });
    } else {
      finalCategories = DEFAULT_CATEGORIES_LIST.map((c) => ({
        _id: `cat_${c.slug}`,
        name: c.name,
        slug: c.slug,
        order: c.order,
        subcategories: (DEFAULT_SUBCATEGORIES[c.slug] || []).sort((a,b) => (a.order || 0) - (b.order || 0))
      }));
    }

    res.json({ success: true, categories: finalCategories.sort((a, b) => (a.order || 0) - (b.order || 0)) });
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
