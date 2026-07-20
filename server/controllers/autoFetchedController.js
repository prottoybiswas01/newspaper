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

// Helper RSS feeds list for Node-side fetching
const RSS_SOURCES = [
  { name: 'Prothom Alo', url: 'https://www.prothomalo.com/feed/' },
  { name: 'Kaler Kantho', url: 'https://www.kalerkantho.com/rss.xml' },
  { name: 'Jago News 24', url: 'https://www.jagonews24.com/rss/rss.xml' },
  { name: 'bdnews24', url: 'https://bangla.bdnews24.com/?widgetName=rssfeed&widgetId=1151&getXmlFeed=true' },
  { name: 'banglanews24', url: 'https://www.banglanews24.com/rss/rss.xml' },
  { name: 'Daily Star Bangla', url: 'https://bangla.thedailystar.net/rss.xml' }
];

// Automatically delete articles older than start of current day (Midnight reset)
const cleanupOldArticles = async () => {
  try {
    const startOfToday = getStartOfToday();
    const result = await AutoFetchedArticle.deleteMany({
      $or: [
        { createdAt: { $lt: startOfToday } },
        { pubDate: { $lt: startOfToday } }
      ]
    });
    if (result && result.deletedCount > 0) {
      console.log(`🧹 Midnight Cleanup: Removed ${result.deletedCount} old auto-fetched articles from previous days.`);
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
};

// GET /api/auto-fetched - Fetch today's auto-fetched articles
exports.getAutoFetchedArticles = async (req, res) => {
  try {
    // 1. Perform 24-hour midnight cleanup first
    await cleanupOldArticles();

    const enabled = await isAutoFetchEnabled();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Only show today's articles
    const startOfToday = getStartOfToday();
    let query = {
      $or: [
        { createdAt: { $gte: startOfToday } },
        { pubDate: { $gte: startOfToday } }
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

    // Perform midnight cleanup
    await cleanupOldArticles();

    let newCount = 0;
    for (const src of RSS_SOURCES) {
      try {
        const response = await fetch(src.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(4000)
        });
        if (!response.ok) continue;
        const xml = await response.text();
        const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

        for (const itemXml of itemMatches) {
          const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
          const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
          const dateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);

          const title = titleMatch ? titleMatch[1].trim() : '';
          const link = linkMatch ? linkMatch[1].trim() : '';
          const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
          const pubDate = dateMatch ? new Date(dateMatch[1]) : new Date();

          if (!title || !link) continue;

          // Check duplicate
          const existing = await AutoFetchedArticle.findOne({ link });
          if (!existing) {
            await AutoFetchedArticle.create({
              title,
              link,
              description: description.substring(0, 1000),
              pubDate,
              source: src.name
            });
            newCount++;
          }
        }
      } catch (err) {
        // Continue to next feed if one fails
      }
    }

    res.json({
      success: true,
      enabled: true,
      inserted: newCount,
      message: `অটো-সার্চ সম্পন্ন হয়েছে! ${newCount}টি নতুন সংবাদ যুক্ত করা হয়েছে।`
    });
  } catch (error) {
    console.error('Trigger fetch error:', error);
    res.status(500).json({ success: false, message: 'স্বয়ংক্রিয় নিউজ সার্চের সময় ত্রুটি ঘটেছে।' });
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
