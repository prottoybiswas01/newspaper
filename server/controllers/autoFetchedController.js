const AutoFetchedArticle = require('../models/AutoFetchedArticle');
const Setting = require('../models/Setting');

// Helper to get start of today (Midnight 00:00:00)
const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to check if auto-fetching is enabled
const isAutoFetchEnabled = async () => {
  try {
    const setting = await Setting.findOne({ key: 'auto_fetch_enabled' });
    if (!setting) return true; // Default to enabled
    return setting.value === true || setting.value === 'true';
  } catch (err) {
    return true;
  }
};

// Helper RSS feeds list for Node-side fetching (10 top Bengali portals)
const RSS_SOURCES = [
  { name: 'প্রথম আলো', url: 'https://www.prothomalo.com/feed/' },
  { name: 'কালের কণ্ঠ', url: 'https://www.kalerkantho.com/rss.xml' },
  { name: 'জাগো নিউজ ২৪', url: 'https://www.jagonews24.com/rss/rss.xml' },
  { name: 'বিডিনিউজ ২৪', url: 'https://bangla.bdnews24.com/?widgetName=rssfeed&widgetId=1151&getXmlFeed=true' },
  { name: 'বাংলানিউজ ২৪', url: 'https://www.banglanews24.com/rss/rss.xml' },
  { name: 'ডেইলি স্টার বাংলা', url: 'https://bangla.thedailystar.net/rss.xml' },
  { name: 'সময় টিভি', url: 'https://somoynews.tv/rss/rss.xml' },
  { name: 'ডিবিসি নিউজ', url: 'https://dbcnews.tv/rss.xml' },
  { name: 'বার্তা ২৪', url: 'https://barta24.com/rss.xml' },
  { name: 'ঢাকা পোস্ট', url: 'https://www.dhakapost.com/rss' }
];

// Helper to decode HTML entities and clean titles
const cleanText = (str) => {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

// Strip portal suffixes from official headline
const cleanOfficialTitle = (rawTitle) => {
  if (!rawTitle) return '';
  let title = cleanText(rawTitle);
  // Remove portal names appended at the end of headlines
  title = title.replace(/\s*[\|\-–—]\s*(প্রথম\s*আলো|Prothom\s*Alo|কালের\s*কণ্ঠ|Kaler\s*Kantho|জাগো\s*নিউজ\s*২৪|Jago\s*News\s*24|বিডিনিউজ\s*২৪|bdnews24(\.com)?|বাংলানিউজ\s*২৪|banglanews24(\.com)?|ডেইলি\s*স্টার\s*বাংলা|Daily\s*Star|সময়\s*টিভি|Somoy\s*TV|ডিবিসি\s*নিউজ|DBC\s*News|ঢাকা\s*পোস্ট|Dhaka\s*Post|যুগান্তর|Jugantor|ইত্তেফাক|Ittefaq|সমকাল|Samakal|নয়া\s*দিগন্ত|বাংলা\s*ট্রিবিউন|মানবজমিন)[\s\S]*$/gi, '').trim();
  return title;
};

// Automatically delete articles older than 24 hours
const cleanupOldArticles = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await AutoFetchedArticle.deleteMany({
      createdAt: { $lt: cutoff }
    });
    if (result && result.deletedCount > 0) {
      console.log(`🧹 24-Hour Cleanup: Removed ${result.deletedCount} old auto-fetched articles.`);
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
};

// Extract image url from RSS XML item block
const extractImageFromXmlItem = (itemXml) => {
  if (!itemXml) return '';
  
  // 1. Check enclosure tag
  const encMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (encMatch && encMatch[1]) return encMatch[1];

  // 2. Check media:content tag
  const mediaMatch = itemXml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (mediaMatch && mediaMatch[1]) return mediaMatch[1];

  // 3. Check media:thumbnail tag
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (thumbMatch && thumbMatch[1]) return thumbMatch[1];

  // 4. Check img tag inside description or content:encoded
  const imgMatch = itemXml.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  return '';
};

// GET /api/auto-fetched - Fetch today's auto-fetched articles
exports.getAutoFetchedArticles = async (req, res) => {
  try {
    // 1. Perform 24-hour cleanup
    await cleanupOldArticles();

    const enabled = await isAutoFetchEnabled();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Show articles from the last 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let query = {
      $or: [
        { createdAt: { $gte: cutoff } },
        { pubDate: { $gte: cutoff } }
      ]
    };

    if (search) {
      query = {
        $and: [
          query,
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { source: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]
          }
        ]
      };
    }

    const articles = await AutoFetchedArticle.find(query)
      .sort({ pubDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AutoFetchedArticle.countDocuments(query);

    res.status(200).json({
      success: true,
      enabled,
      articles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching auto fetched articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auto-fetched articles'
    });
  }
};

// GET /api/auto-fetched/status - Check ON/OFF toggle status
exports.getAutoFetchStatus = async (req, res) => {
  try {
    const enabled = await isAutoFetchEnabled();
    res.json({ success: true, enabled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auto-fetched/status - Toggle ON/OFF auto-fetch
exports.toggleAutoFetchStatus = async (req, res) => {
  try {
    const { enabled } = req.body;
    let setting = await Setting.findOne({ key: 'auto_fetch_enabled' });
    if (setting) {
      setting.value = Boolean(enabled);
      await setting.save();
    } else {
      setting = await Setting.create({ key: 'auto_fetch_enabled', value: Boolean(enabled) });
    }

    res.json({
      success: true,
      enabled: setting.value,
      message: setting.value
        ? 'অটো-ফেচিং অন করা হয়েছে (Auto-fetching is now ON)'
        : 'অটো-ফেচিং অফ করা হয়েছে (Auto-fetching is now OFF)'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auto-fetched/trigger - Manually trigger RSS auto-fetch
exports.triggerAutoFetch = async (req, res) => {
  try {
    const enabled = await isAutoFetchEnabled();
    if (!enabled) {
      return res.status(200).json({
        success: false,
        enabled: false,
        message: 'অটো-ফেচিং বর্তমানে অফ রাখা হয়েছে। অন করার পর নিউজ সার্চ সম্ভব।'
      });
    }

    // Perform cleanup
    await cleanupOldArticles();

    let newCount = 0;

    // Fetch all feeds concurrently
    const feedPromises = RSS_SOURCES.map(async (src) => {
      try {
        const response = await fetch(src.url, {
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
          },
          signal: AbortSignal.timeout(6000)
        });
        if (!response.ok) return [];
        const xml = await response.text();
        const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

        const items = [];
        for (const itemXml of itemMatches) {
          const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
          const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
          const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
          const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

          const rawTitle = titleMatch ? cleanText(titleMatch[1]) : '';
          const title = cleanOfficialTitle(rawTitle);
          const link = linkMatch ? cleanText(linkMatch[1]) : '';
          let description = descMatch ? cleanText(descMatch[1]) : '';
          const pubDate = dateMatch ? new Date(cleanText(dateMatch[1])) : new Date();
          const featuredImage = extractImageFromXmlItem(itemXml);

          if (!title || !link) continue;

          // Strip "আরও পড়ুন..." teaser links inside descriptions
          description = description.replace(/আরও\s*পড়ুন[\s\S]*/gi, '').replace(/\.{3,}$/g, '').trim();

          items.push({
            title,
            link,
            description: description.substring(0, 1000),
            featuredImage: featuredImage || '',
            pubDate: isNaN(pubDate.getTime()) ? new Date() : pubDate,
            source: src.name
          });
        }
        return items;
      } catch (err) {
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        for (const item of result.value) {
          try {
            const existing = await AutoFetchedArticle.findOne({ link: item.link });
            if (!existing) {
              await AutoFetchedArticle.create(item);
              newCount++;
            } else if (!existing.featuredImage && item.featuredImage) {
              await AutoFetchedArticle.findByIdAndUpdate(existing._id, { $set: { featuredImage: item.featuredImage } });
            }
          } catch (e) {
            // Ignore duplicate collision
          }
        }
      }
    }

    res.json({
      success: true,
      enabled: true,
      inserted: newCount,
      message: `অটো-সার্চ সম্পন্ন হয়েছে! ${newCount}টি নতুন সংবাদ সংগৃহীত হয়েছে।`
    });
  } catch (error) {
    console.error('Trigger fetch error:', error);
    res.status(500).json({ success: false, message: 'স্বয়ংক্রিয় নিউজ সার্চের সময় ত্রুটি ঘটেছে।' });
  }
};

// POST /api/auto-fetched/extract - Scrape/extract complete full article text, high-res image & official headline
exports.extractFullArticleContent = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, message: 'Failed to fetch news page' });
    }

    const html = await response.text();

    const decodeHtmlEntities = (text) => {
      if (!text) return '';
      return text
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    };

    // 1. Extract Official Title from OpenGraph meta or H1
    let officialTitle = '';
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      officialTitle = cleanOfficialTitle(ogTitleMatch[1]);
    }
    if (!officialTitle) {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        officialTitle = cleanOfficialTitle(h1Match[1]);
      }
    }

    // 2. Extract Featured Image from OpenGraph meta or Twitter meta
    let featuredImage = '';
    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i) ||
                       html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                       html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if (ogImgMatch && ogImgMatch[1]) {
      featuredImage = decodeHtmlEntities(ogImgMatch[1]).trim();
    }

    // 3. Extract Portal / Source name from og:site_name or domain
    let sourceName = '';
    const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogSiteMatch && ogSiteMatch[1]) {
      sourceName = decodeHtmlEntities(ogSiteMatch[1]).trim();
    }
    if (!sourceName) {
      if (url.includes('prothomalo')) sourceName = 'প্রথম আলো';
      else if (url.includes('kalerkantho')) sourceName = 'কালের কণ্ঠ';
      else if (url.includes('jagonews24')) sourceName = 'জাগো নিউজ ২৪';
      else if (url.includes('bdnews24')) sourceName = 'বিডিনিউজ ২৪';
      else if (url.includes('banglanews24')) sourceName = 'বাংলানিউজ ২৪';
      else if (url.includes('thedailystar')) sourceName = 'ডেইলি স্টার বাংলা';
      else if (url.includes('somoynews')) sourceName = 'সময় টিভি';
      else if (url.includes('dhakapost')) sourceName = 'ঢাকা পোস্ট';
      else if (url.includes('jugantor')) sourceName = 'যুগান্তর';
      else if (url.includes('samakal')) sourceName = 'সমকাল';
      else if (url.includes('ittefaq')) sourceName = 'ইত্তেফাক';
    }

    // 4. Extract clean article paragraphs
    const pMatches = html.match(/<p[^\>]*>[\s\S]*?<\/p>/gi) || [];
    const badPatterns = [
      /আরও\s*পড়ুন/i, /আরও\s*দেখুন/i, /READ\s*MORE/i, /পাঠকপ্রিয়/i, /লিখতে\s*পারেন/i,
      /আজই\s*আপনার\s*লেখাটি/i, /সম্পাদক\s*:/i, /সর্বস্বত্ব/i, /কমফোর্ট/i, /প্রগতি\s*সরণি/i,
      /বিজ্ঞাপন/i, /ফাইল\s*ছবি/i, /সর্বশেষ\s*-/i, /শেয়ার\s*করুন/i, /লাইক\s*দিন/i,
      /ফলো\s*করুন/i, /সাবস্ক্রাইব/i, /Copyright/i, /মন্তব্য\s*করুন/i, /গোপনীয়তা\s*নীতি/i
    ];

    const cleanParagraphs = pMatches
      .map(p => decodeHtmlEntities(p.replace(/<[^>]*>/g, '').trim()))
      .filter(p => p.length > 25 && !badPatterns.some(pattern => pattern.test(p)));

    if (cleanParagraphs.length === 0) {
      return res.json({ 
        success: false, 
        message: 'Could not extract full text',
        title: officialTitle,
        featuredImage,
        source: sourceName,
        sourceUrl: url
      });
    }

    const htmlContent = cleanParagraphs.map(p => `<p>${p}</p>`).join('\n');
    const summary = cleanParagraphs[0] ? cleanParagraphs[0].substring(0, 250) : '';

    res.json({
      success: true,
      title: officialTitle,
      featuredImage,
      source: sourceName,
      sourceUrl: url,
      content: htmlContent,
      summary,
      paragraphCount: cleanParagraphs.length
    });
  } catch (error) {
    console.error('Extract article error:', error.message);
    res.status(500).json({ success: false, message: 'Extracting full article content failed' });
  }
};

// DELETE /api/auto-fetched/:id - Delete a fetched log item
exports.deleteAutoFetchedArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AutoFetchedArticle.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Article log not found' });
    }
    res.status(200).json({ success: true, message: 'Article log deleted successfully' });
  } catch (error) {
    console.error('Error deleting auto fetched article:', error);
    res.status(500).json({ success: false, message: 'Failed to delete article log' });
  }
};
