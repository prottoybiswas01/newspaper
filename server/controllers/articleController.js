const Article = require('../models/Article');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\u0980-\u09FF-]+/g, '') // Keep alphanumeric, dashes, and Bengali script characters
    .replace(/--+/g, '-') // Collapse consecutive dashes
    .replace(/^-+/, '') // Trim leading dashes
    .replace(/-+$/, ''); // Trim trailing dashes
};

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const wordCount = (text || '').trim().split(/\s+/).filter(w => w.length > 0).length;
  const minutes = wordCount / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
};

// Converts block structure into plain text / html for legacy readers & search index
const blocksToHtml = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks.map(b => {
    if (!b || !b.type) return '';
    switch (b.type) {
      case 'heading': {
        const level = b.metadata?.level || 2;
        return `<h${level}>${b.content || ''}</h${level}>`;
      }
      case 'paragraph':
        return `<p>${b.content || ''}</p>`;
      case 'image':
        return `<figure><img src="${b.content || b.metadata?.url || ''}" alt="${b.metadata?.caption || ''}" /><figcaption>${b.metadata?.caption || ''}</figcaption></figure>`;
      case 'quote':
        return `<blockquote><p>${b.content || ''}</p><cite>${b.metadata?.author || ''}</cite></blockquote>`;
      case 'video':
        return `<div class="video-embed"><iframe src="${b.content || ''}"></iframe></div>`;
      case 'audio':
        return `<div class="audio-embed"><audio controls src="${b.content || ''}"></audio></div>`;
      case 'factbox':
      case 'callout':
        return `<div class="fact-box"><h4>${b.metadata?.title || 'গুরুত্বপূর্ণ তথ্য'}</h4><p>${b.content || ''}</p></div>`;
      case 'divider':
        return `<hr />`;
      default:
        return `<p>${b.content || ''}</p>`;
    }
  }).join('\n');
};

const CATEGORY_SYNONYMS = {
  'bangladesh': ['bangladesh', 'বাংলাদেশ'],
  'বাংলাদেশ': ['bangladesh', 'বাংলাদেশ'],
  'politics': ['politics', 'রাজনীতি'],
  'রাজনীতি': ['politics', 'রাজনীতি'],
  'international': ['international', 'বিশ্ব', 'আন্তর্জাতিক'],
  'বিশ্ব': ['international', 'বিশ্ব', 'আন্তর্জাতিক'],
  'economy': ['economy', 'বাণিজ্য', 'অর্থনীতি'],
  'বাণিজ্য': ['economy', 'বাণিজ্য', 'অর্থনীতি'],
  'sports': ['sports', 'খেলা', 'খেলাধুলা'],
  'খেলা': ['sports', 'খেলা', 'খেলাধুলা'],
  'entertainment': ['entertainment', 'বিনোদন'],
  'বিনোদন': ['entertainment', 'বিনোদন'],
  'jobs': ['jobs', 'চাকরি', 'চাকরি-বাকরি'],
  'চাকরি': ['jobs', 'চাকরি', 'চাকরি-বাকরি'],
  'lifestyle': ['lifestyle', 'জীবনযাপন', 'লাইফস্টাইল'],
  'জীবনযাপন': ['lifestyle', 'জীবনযাপন', 'লাইফস্টাইল'],
  'opinion': ['opinion', 'মতামত'],
  'মতামত': ['opinion', 'মতামত'],
  'technology': ['technology', 'প্রযুক্তি', 'স্টার্টআপ ও প্রযুক্তি', 'তথ্যপ্রযুক্তি'],
  'প্রযুক্তি': ['technology', 'প্রযুক্তি', 'স্টার্টআপ ও প্রযুক্তি', 'তথ্যপ্রযুক্তি'],
  'education': ['education', 'শিক্ষা'],
  'শিক্ষা': ['education', 'শিক্ষা'],
  'religion': ['religion', 'ধর্ম'],
  'ধর্ম': ['religion', 'ধর্ম'],
  'literature': ['literature', 'সাহিত্য', 'অন্যপাঠ', 'সাহিত্য ও সংস্কৃতি'],
  'অন্যপাঠ': ['literature', 'সাহিত্য', 'অন্যপাঠ', 'সাহিত্য ও সংস্কৃতি'],
  'interview': ['interview', 'সাক্ষাৎকার'],
  'সাক্ষাৎকার': ['interview', 'সাক্ষাৎকার'],
  'agriculture': ['agriculture', 'কৃষি', 'কৃষি ও প্রকৃতি', 'কৃষি ও পরিবেশ'],
  'photo': ['photo', 'ছবি', 'ফটো', 'photo-gallery'],
  'ছবি': ['photo', 'ছবি', 'ফটো', 'photo-gallery'],
  'diaspora': ['diaspora', 'প্রবাস'],
  'women-children': ['women-children', 'নারী ও শিশু', 'শিশু ও নারী'],
  'exclusive': ['exclusive', 'অনন্য', 'বিশেষ আয়োজন', 'বিশেষ প্রতিবেদন'],
  'videos': ['videos', 'ভিডিও', 'media-center'],
  'ভিডিও': ['videos', 'ভিডিও', 'media-center'],
};

// Auto-publish scheduled articles if scheduledDate has passed
const processScheduledArticles = async () => {
  try {
    const now = new Date();
    const scheduled = await Article.find({
      status: 'scheduled',
      scheduledDate: { $lte: now }
    });

    for (const art of scheduled) {
      await Article.findByIdAndUpdate(art._id, {
        $set: {
          status: 'published',
          publishDate: art.scheduledDate || now
        }
      });
    }
  } catch (err) {
    // Silently ignore background check errors
  }
};

// @desc    Create a new article (supports blocks & legacy content)
// @route   POST /api/articles
const createArticle = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      content,
      blocks,
      summary,
      category,
      subcategory,
      tags,
      status,
      featuredImage,
      images,
      videoUrl,
      audioUrl,
      scheduledDate,
      seo,
      source,
      sourceUrl,
      verificationStatus,
      verificationNote,
      aiSummary,
      keyPoints,
      factBox,
      timeline,
      whatWeKnow,
      whatWeDontKnow,
      adSettings,
      division,
      district,
      upazila,
      multimediaType,
      duration,
      transcript,
      galleryImages,
      isLead,
      isBreaking,
      isFeatured,
      storyHubId
    } = req.body;

    if (!title || (!content && (!blocks || blocks.length === 0)) || !category) {
      return res.status(400).json({ success: false, message: 'Title, content/blocks, and category are required' });
    }

    // Slug generation
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = 'article';
    let slug = baseSlug;
    let count = 1;
    
    while (await Article.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const finalHtmlContent = content || blocksToHtml(blocks);
    const readingTime = calculateReadingTime(finalHtmlContent);
    const articleStatus = status || 'draft';
    
    const articleData = {
      title,
      subtitle: subtitle || '',
      slug,
      content: finalHtmlContent,
      blocks: Array.isArray(blocks) ? blocks : [],
      summary: summary || finalHtmlContent.substring(0, 150).replace(/<[^>]*>/g, '') + '...',
      category,
      subcategory: subcategory || '',
      tags: tags || [],
      author: req.user.name,
      authorId: req.user.id,
      authorDesignation: req.user.designation || 'প্রতিবেদক',
      status: articleStatus,
      featuredImage: featuredImage || '',
      images: images || [],
      videoUrl: videoUrl || '',
      audioUrl: audioUrl || '',
      source: source || '',
      sourceUrl: sourceUrl || '',
      readingTime,
      views: 0,
      likes: 0,
      shares: 0,
      
      // Trust features
      verificationStatus: verificationStatus || 'unverified',
      verifiedBy: verificationStatus === 'verified' ? req.user.name : '',
      verificationNote: verificationNote || '',
      aiSummary: aiSummary || '',
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      factBox: Array.isArray(factBox) ? factBox : [],
      timeline: Array.isArray(timeline) ? timeline : [],
      whatWeKnow: Array.isArray(whatWeKnow) ? whatWeKnow : [],
      whatWeDontKnow: Array.isArray(whatWeDontKnow) ? whatWeDontKnow : [],
      corrections: [],

      // Ad Settings
      adSettings: adSettings || { autoPlacement: true, manualSlots: [], maxAds: 3 },

      // Location
      division: division || '',
      district: district || '',
      upazila: upazila || '',

      // Multimedia
      multimediaType: multimediaType || 'none',
      duration: duration || '',
      transcript: transcript || '',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],

      // Placement flags
      isLead: Boolean(isLead),
      isBreaking: Boolean(isBreaking),
      isFeatured: Boolean(isFeatured),
      storyHubId: storyHubId || '',

      revisions: [
        {
          version: 1,
          savedAt: new Date(),
          savedBy: req.user.name,
          title,
          content: finalHtmlContent,
          blocks: Array.isArray(blocks) ? blocks : []
        }
      ],

      seo: seo || {
        metaTitle: title,
        metaDescription: summary || title,
        keywords: (tags || []).join(', ')
      }
    };

    if (articleStatus === 'published') {
      articleData.publishDate = new Date();
    } else if (articleStatus === 'scheduled' && scheduledDate) {
      articleData.scheduledDate = new Date(scheduledDate);
    }

    const article = await Article.create(articleData);

    // Auto-register tags in Taxonomy Tag collection
    if (tags && tags.length > 0) {
      try {
        const Tag = require('../models/Tag');
        for (const tName of tags) {
          const tSlug = tName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          if (tSlug) {
            const exists = await Tag.findOne({ slug: tSlug });
            if (!exists) {
              await Tag.create({ name: tName, slug: tSlug });
            }
          }
        }
      } catch (err) {
        // Tag seed failure ignored
      }
    }

    // Audit log
    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'article.create',
      targetType: 'Article',
      targetId: article._id ? article._id.toString() : '',
      targetTitle: article.title,
      details: `Created article with status: ${articleStatus}`
    }).catch(() => null);

    res.status(201).json({ success: true, article });
  } catch (error) {
    console.error('createArticle error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get articles (with rich filters, pagination, local news, multimedia)
// @route   GET /api/articles
const getArticles = async (req, res) => {
  try {
    await processScheduledArticles();

    const {
      page = 1,
      limit = 12,
      skip,
      category,
      subcategory,
      tag,
      search,
      authorId,
      status,
      sort,
      division,
      district,
      upazila,
      multimediaType,
      storyHubId,
      isLead,
      isBreaking
    } = req.query;

    const query = {};

    // Status filter
    if (status && ['published', 'draft', 'review', 'scheduled', 'updated', 'archived', 'trash'].includes(status)) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (category) {
      const trimmedCat = category.trim();
      const synonyms = CATEGORY_SYNONYMS[trimmedCat.toLowerCase()] || CATEGORY_SYNONYMS[trimmedCat] || [trimmedCat];
      const pattern = synonyms.map(s => `^${s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`).join('|');
      query.category = { $regex: new RegExp(pattern, 'i') };
    }

    if (subcategory) query.subcategory = { $regex: new RegExp('^' + subcategory.trim() + '$', 'i') };
    if (tag) query.tags = tag;
    if (authorId) query.authorId = authorId;
    if (division) query.division = { $regex: new RegExp('^' + division.trim() + '$', 'i') };
    if (district) query.district = { $regex: new RegExp('^' + district.trim() + '$', 'i') };
    if (upazila) query.upazila = { $regex: new RegExp('^' + upazila.trim() + '$', 'i') };
    if (multimediaType && multimediaType !== 'none') query.multimediaType = multimediaType;
    if (storyHubId) query.storyHubId = storyHubId;
    if (isLead === 'true') query.isLead = true;
    if (isBreaking === 'true') query.isBreaking = true;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { publishDate: -1, createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { views: -1, publishDate: -1 };
    } else if (sort === 'oldest') {
      sortOption = { publishDate: 1, createdAt: 1 };
    }

    const limitNum = parseInt(limit, 10) || 12;
    const skipNum = skip !== undefined ? parseInt(skip, 10) : (parseInt(page, 10) - 1) * limitNum;

    const articles = await Article.find(query)
      .sort(sortOption)
      .skip(skipNum)
      .limit(limitNum);

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      total,
      count: articles.length,
      page: parseInt(page, 10) || 1,
      totalPages: Math.ceil(total / limitNum),
      articles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get article by slug (increments views)
// @route   GET /api/articles/slug/:slug
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const article = await Article.findOne({ slug });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment views
    await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an article (supports blocks, versioning & audit logs)
// @route   PUT /api/articles/:id
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Permissions check
    const isAuthor = article.authorId === req.user.id;
    const isStaff = ['Editor', 'Admin', 'Super Admin'].includes(req.user.role);
    if (!isAuthor && !isStaff) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this article' });
    }

    const updateData = { ...req.body };

    // If blocks provided, ensure HTML sync
    if (updateData.blocks && Array.isArray(updateData.blocks)) {
      updateData.content = updateData.content || blocksToHtml(updateData.blocks);
    }

    if (updateData.content) {
      updateData.readingTime = calculateReadingTime(updateData.content);
      if (!updateData.summary && !article.summary) {
        updateData.summary = updateData.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';
      }
    }

    // Status management
    if (updateData.status) {
      if (updateData.status === 'published' && article.status !== 'published') {
        updateData.publishDate = new Date();
      } else if (updateData.status === 'scheduled' && updateData.scheduledDate) {
        updateData.scheduledDate = new Date(updateData.scheduledDate);
      }
    }

    // Revisions snapshot: keep last 15 revisions
    const currentRevisions = Array.isArray(article.revisions) ? article.revisions : [];
    const nextVersion = currentRevisions.length + 1;
    const newRevision = {
      version: nextVersion,
      savedAt: new Date(),
      savedBy: req.user.name,
      title: article.title,
      content: article.content,
      blocks: article.blocks || []
    };
    updateData.revisions = [newRevision, ...currentRevisions].slice(0, 15);

    const updated = await Article.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

    // Audit log
    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'article.update',
      targetType: 'Article',
      targetId: req.params.id,
      targetTitle: updated.title,
      details: `Updated article status to ${updated.status}`
    }).catch(() => null);

    res.json({ success: true, article: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore a previous article revision
// @route   POST /api/articles/:id/restore-revision
const restoreRevision = async (req, res) => {
  try {
    const { version } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const revision = (article.revisions || []).find(r => r.version === Number(version));
    if (!revision) {
      return res.status(404).json({ success: false, message: 'Revision version not found' });
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, {
      $set: {
        title: revision.title,
        content: revision.content,
        blocks: revision.blocks || []
      }
    }, { new: true });

    res.json({ success: true, article: updated, message: `Version ${version} restored successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add editorial correction notice
// @route   POST /api/articles/:id/correction
const addCorrection = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, message: 'Correction note is required' });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const corrections = Array.isArray(article.corrections) ? article.corrections : [];
    corrections.push({ date: new Date(), note, author: req.user.name });

    const updated = await Article.findByIdAndUpdate(req.params.id, {
      $set: { corrections }
    }, { new: true });

    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'article.correction',
      targetType: 'Article',
      targetId: req.params.id,
      targetTitle: updated.title,
      details: `Added correction: ${note.substring(0, 80)}...`
    }).catch(() => null);

    res.json({ success: true, corrections: updated.corrections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate AI Summary & Key Points
// @route   POST /api/articles/generate-summary
const generateSummary = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content && !title) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const plainText = (content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = plainText.split(/[।!?\n]/).map(s => s.trim()).filter(s => s.length > 20);

    // AI summary synthesis logic (Bengali key bullets)
    const keyBullets = sentences.slice(0, 3);
    const summaryText = keyBullets.join('। ') + (keyBullets.length > 0 ? '।' : '');

    res.json({
      success: true,
      aiSummary: summaryText || 'সংবাদের সংক্ষিপ্ত বিবরণ প্রস্তুত করা হয়েছে।',
      keyPoints: keyBullets.length > 0 ? keyBullets : ['প্রধান তথ্যাদি যাচাইকৃত।']
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an article
// @route   DELETE /api/articles/:id
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const isAuthor = article.authorId === req.user.id;
    const isStaff = ['Editor', 'Admin', 'Super Admin'].includes(req.user.role);
    if (!isAuthor && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Article.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'article.delete',
      targetType: 'Article',
      targetId: req.params.id,
      targetTitle: article.title,
      details: 'Deleted article'
    }).catch(() => null);

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like an article
// @route   POST /api/articles/:id/like
const likeArticle = async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, likes: updated.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Share an article
// @route   POST /api/articles/:id/share
const shareArticle = async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, shares: updated.shares });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper for translation
const translateText = async (text, targetLang) => {
  if (!text || text.trim() === '') return '';
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    if (!response.ok) throw new Error('Google Translate API failed');
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(x => x[0]).join('');
    }
    return text;
  } catch (err) {
    return text;
  }
};

// @desc    Translate article fields
// @route   POST /api/articles/translate
const translateArticle = async (req, res) => {
  try {
    const { title, subtitle, summary, content, targetLang } = req.body;
    if (!targetLang) {
      return res.status(400).json({ success: false, message: 'Target language is required' });
    }

    const translatedTitle = await translateText(title, targetLang);
    const translatedSubtitle = await translateText(subtitle, targetLang);
    const translatedSummary = await translateText(summary, targetLang);
    const translatedContent = content ? await translateText(content, targetLang) : '';

    res.json({
      success: true,
      translated: {
        title: translatedTitle,
        subtitle: translatedSubtitle,
        summary: translatedSummary,
        content: translatedContent
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get homepage unified dataset (lead, breaking, most read, layout sections, multimedia, story hub)
// @route   GET /api/articles/homepage
const getHomepageData = async (req, res) => {
  try {
    await processScheduledArticles();
    const Setting = require('../models/Setting');
    const StoryHub = require('../models/StoryHub');
    
    // 1. Lead & Breaking News
    const leadArticle = await Article.findOne({ status: 'published', isLead: true })
      .sort({ publishDate: -1, createdAt: -1 });

    const breakingNews = await Article.find({ status: 'published', isBreaking: true })
      .select('title slug publishDate')
      .sort({ publishDate: -1 })
      .limit(8);

    // 2. Top articles (latest 10)
    const topArticles = await Article.find({ status: 'published' })
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(10);
      
    // 3. Most read 5
    const mostRead = await Article.find({ status: 'published' })
      .sort({ views: -1, publishDate: -1 })
      .limit(5);

    // 4. Multimedia section
    const multimediaArticles = await Article.find({
      status: 'published',
      multimediaType: { $in: ['video', 'podcast', 'gallery', 'explainer'] }
    })
    .sort({ publishDate: -1 })
    .limit(6);

    // 5. Active Story Hub
    const activeStoryHub = await StoryHub.findOne({ active: true }).sort({ createdAt: -1 });

    // 6. Homepage category layout sections
    const layoutSetting = await Setting.findOne({ key: 'homepage_layout' });
    let cfg = layoutSetting ? layoutSetting.value : [
      { category: 'বাংলাদেশ', layout: 'grid' },
      { category: 'রাজনীতি',   layout: 'hero' },
      { category: 'বিশ্ব',     layout: 'grid' },
      { category: 'বাণিজ্য',   layout: 'list' },
      { category: 'খেলা',     layout: 'grid' },
      { category: 'প্রযুক্তি', layout: 'grid' },
      { category: 'বিনোদন',   layout: 'list' },
      { category: 'জীবনযাপন', layout: 'grid' },
      { category: 'মতামত',     layout: 'list' }
    ];
    
    if (!Array.isArray(cfg)) cfg = [];
    
    const layoutSections = await Promise.all(cfg.map(async (sec) => {
      const limit = sec.layout === 'list' ? 5 : 4;
      const trimmedCat = (sec.category || '').trim();
      const synonyms = CATEGORY_SYNONYMS[trimmedCat.toLowerCase()] || CATEGORY_SYNONYMS[trimmedCat] || [trimmedCat];
      const pattern = synonyms.map(s => `^${s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`).join('|');

      const articles = await Article.find({ 
        status: 'published',
        category: { $regex: new RegExp(pattern, 'i') }
      })
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(limit);
      
      if (articles.length > 0) {
        return {
          category: sec.category,
          layout: sec.layout,
          articles
        };
      }
      return null;
    }));
    
    res.json({
      success: true,
      leadArticle: leadArticle || (topArticles.length > 0 ? topArticles[0] : null),
      breakingNews,
      topArticles,
      mostRead,
      multimediaArticles,
      activeStoryHub,
      layoutSections: layoutSections.filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticleBySlug,
  getHomepageData,
  updateArticle,
  deleteArticle,
  likeArticle,
  shareArticle,
  translateArticle,
  restoreRevision,
  addCorrection,
  generateSummary
};
