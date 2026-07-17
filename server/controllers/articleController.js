const Article = require('../models/Article');
const User = require('../models/User');

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

// @desc    Create a new article
// @route   POST /api/articles
const createArticle = async (req, res) => {
  try {
    const { title, subtitle, content, summary, category, tags, status, featuredImage, videoUrl, scheduledDate, seo } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Title, content, and category are required' });
    }

    // Slug generation
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = 'article';
    let slug = baseSlug;
    let count = 1;
    
    // Ensure uniqueness
    while (await Article.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const readingTime = calculateReadingTime(content);
    
    const articleData = {
      title,
      subtitle: subtitle || '',
      slug,
      content,
      summary: summary || content.substring(0, 150).replace(/<[^>]*>/g, '') + '...',
      category,
      tags: tags || [],
      author: req.user.name,
      authorId: req.user.id,
      status: status || 'draft',
      featuredImage: featuredImage || '',
      videoUrl: videoUrl || '',
      readingTime,
      seo: seo || { metaTitle: title, metaDescription: summary || '', keywords: (tags || []).join(', ') }
    };

    if (status === 'scheduled' && scheduledDate) {
      articleData.scheduledDate = new Date(scheduledDate);
    } else if (status === 'published') {
      articleData.publishDate = new Date();
    }

    const article = await Article.create(articleData);

    // Automatically register tags in Taxonomy Tag collection
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
        console.error("Failed to auto-seed taxonomy tags:", err);
      }
    }

    res.status(201).json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get articles (filtered & paginated)
// @route   GET /api/articles
const getArticles = async (req, res) => {
  try {
    const { category, tag, authorId, status, search, limit, skip, sort } = req.query;

    const query = {};

    // For public routes, only return published articles
    if (status && ['published', 'draft', 'scheduled', 'archived'].includes(status)) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (category) query.category = { $regex: new RegExp('^' + category.trim() + '$', 'i') };
    if (tag) query.tags = tag; // Matches tag in the tags array
    if (authorId) query.authorId = authorId;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Default sorting is latest publishDate or createdAt
    let sortOption = { publishDate: -1, createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { views: -1, publishDate: -1 };
    } else if (sort === 'oldest') {
      sortOption = { publishDate: 1, createdAt: 1 };
    }

    const limitNum = parseInt(limit, 10) || 12;
    const skipNum = parseInt(skip, 10) || 0;

    const articles = await Article.find(query)
      .sort(sortOption)
      .skip(skipNum)
      .limit(limitNum);

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      total,
      count: articles.length,
      articles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get article by slug (public details, increments views)
// @route   GET /api/articles/slug/:slug
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find article
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

// @desc    Update an article
// @route   PUT /api/articles/:id
const updateArticle = async (req, res) => {
  try {
    const { title, subtitle, content, summary, category, tags, status, featuredImage, videoUrl, scheduledDate, seo } = req.body;
    
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Permissions check: Only creator or Editor/Admin/Super Admin can edit
    const isAuthor = article.authorId === req.user.id;
    const isStaff = ['Editor', 'Admin', 'Super Admin'].includes(req.user.role);
    if (!isAuthor && !isStaff) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this article' });
    }

    const updateData = {};
    if (title) {
      updateData.title = title;
      // Regenerate slug if title changes and it's draft
      if (article.status === 'draft') {
        let baseSlug = slugify(title);
        let slug = baseSlug;
        let count = 1;
        while (await Article.findOne({ slug, _id: { $ne: article._id } })) {
          slug = `${baseSlug}-${count++}`;
        }
        updateData.slug = slug;
      }
    }
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (content) {
      updateData.content = content;
      updateData.readingTime = calculateReadingTime(content);
      if (!summary) {
        updateData.summary = content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';
      }
    }
    if (summary !== undefined) updateData.summary = summary;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (seo) updateData.seo = seo;

    if (status) {
      updateData.status = status;
      // Only set publishDate when transitioning FROM non-published TO published
      // (not when updating an already-published article)
      if (status === 'published' && article.status !== 'published') {
        updateData.publishDate = new Date();
      } else if (status === 'scheduled' && scheduledDate) {
        updateData.scheduledDate = new Date(scheduledDate);
      }
      // If article is already published and we're just updating content,
      // DO NOT touch publishDate - keep original order
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

    // Automatically register tags in Taxonomy Tag collection
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
        console.error("Failed to auto-seed taxonomy tags on update:", err);
      }
    }

    res.json({ success: true, article: updated });
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

    // Only creator, Editor, Admin or Super Admin can delete
    const isAuthor = article.authorId === req.user.id;
    const isStaff = ['Editor', 'Admin', 'Super Admin'].includes(req.user.role);
    if (!isAuthor && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Article.findByIdAndDelete(req.params.id);
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

// @desc    Share an article (logs share metrics)
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

// Helper function to call unofficial Google Translate API
const translateText = async (text, targetLang) => {
  if (!text || text.trim() === '') return '';
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    if (!response.ok) {
      throw new Error('Google Translate API failed');
    }
    const data = await response.json();
    if (data && data[0]) {
      const translatedString = data[0].map(x => x[0]).join('');
      return translatedString;
    }
    return text;
  } catch (err) {
    console.error('Translation error:', err.message);
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

    const cleanHtml = (html) => {
      if (!html) return '';
      return html
        .replace(/<\/\s+([a-zA-Z0-9]+)>/g, '</$1>')
        .replace(/<\s+([a-zA-Z0-9]+)>/g, '<$1>')
        .replace(/&nbsp;/g, ' ');
    };

    const translatedTitle = await translateText(title, targetLang);
    const translatedSubtitle = await translateText(subtitle, targetLang);
    const translatedSummary = await translateText(summary, targetLang);
    
    let translatedContent = '';
    if (content) {
      translatedContent = await translateText(content, targetLang);
      translatedContent = cleanHtml(translatedContent);
    }

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

// @desc    Get all homepage unified dataset (top, most read, layout sections)
// @route   GET /api/articles/homepage
const getHomepageData = async (req, res) => {
  try {
    const Setting = require('../models/Setting');
    
    // 1. Fetch top articles (latest 10)
    const topArticles = await Article.find({ status: 'published' })
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(10);
      
    // 2. Fetch popular articles (most read 5)
    const mostRead = await Article.find({ status: 'published' })
      .sort({ views: -1, publishDate: -1 })
      .limit(5);
      
    // 3. Fetch homepage layout settings
    const layoutSetting = await Setting.findOne({ key: 'homepage_layout' });
    let cfg = layoutSetting ? layoutSetting.value : [
      { category: 'Bangladesh', layout: 'grid' },
      { category: 'Politics',   layout: 'hero' },
      { category: 'Sports',     layout: 'grid' },
      { category: 'Technology', layout: 'list' },
    ];
    
    if (!Array.isArray(cfg)) {
      cfg = [];
    }
    
    // 4. Fetch articles for each category row in parallel
    const layoutSections = await Promise.all(cfg.map(async (sec) => {
      const limit = sec.layout === 'list' ? 5 : 4;
      const articles = await Article.find({ 
        status: 'published',
        category: { $regex: new RegExp('^' + sec.category.trim() + '$', 'i') }
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
      topArticles,
      mostRead,
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
  translateArticle
};
