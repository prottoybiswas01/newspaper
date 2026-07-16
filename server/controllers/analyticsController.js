const Analytics = require('../models/Analytics');
const Article = require('../models/Article');
const User = require('../models/User');
const Ad = require('../models/Ad');
const Newsletter = require('../models/Newsletter');

// Log a page view event
const logEvent = async (req, res) => {
  try {
    const { path, articleId, device, browser, country } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    // Basic mapping or browser fallback
    let clientDevice = device || 'Desktop';
    let clientBrowser = browser || 'Chrome';
    let clientCountry = country || 'Bangladesh';

    await Analytics.create({
      eventType: 'view',
      path: path || '/',
      articleId: articleId || '',
      ip,
      device: clientDevice,
      browser: clientBrowser,
      country: clientCountry
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve dashboard statistics overview
const getDashboardStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments({});
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    const scheduledArticles = await Article.countDocuments({ status: 'scheduled' });

    const totalUsers = await User.countDocuments({});
    const reportersCount = await User.countDocuments({ role: 'Reporter' });
    const editorsCount = await User.countDocuments({ role: 'Editor' });
    const adminsCount = await User.countDocuments({ role: 'Admin' });
    const superAdminsCount = await User.countDocuments({ role: 'Super Admin' });
    const activeReporters = reportersCount + editorsCount + adminsCount + superAdminsCount;

    const totalSubscribers = await Newsletter.countDocuments({ status: 'active' });

    // Fetch all logs
    const events = await Analytics.find({});
    const pageViews = events.length;

    // Unique visitors calculated via distinct IP sets
    const uniqueIPs = new Set(events.map(e => e.ip));
    const uniqueVisitors = uniqueIPs.size;

    // Grouping telemetry details
    const deviceMap = {};
    const browserMap = {};
    const countryMap = {};

    events.forEach(e => {
      const dev = e.device || 'Desktop';
      const brow = e.browser || 'Chrome';
      const coun = e.country || 'Bangladesh';
      deviceMap[dev] = (deviceMap[dev] || 0) + 1;
      browserMap[brow] = (browserMap[brow] || 0) + 1;
      countryMap[coun] = (countryMap[coun] || 0) + 1;
    });

    // 7 days historical pageview graph array
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const count = events.filter(e => {
        const evDate = new Date(e.createdAt || e.updatedAt).toISOString().split('T')[0];
        return evDate === dateStr;
      }).length;

      chartData.push({
        date: dateStr,
        views: count
      });
    }

    // Top read articles listing
    const topArticles = await Article.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5);

    // Ad clicks and CTR ratios
    const ads = await Ad.find({});
    const adPerformance = ads.map(ad => ({
      _id: ad._id,
      title: ad.title,
      placement: ad.placement,
      impressions: ad.impressions || 0,
      clicks: ad.clicks || 0,
      ctr: ad.impressions ? parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(2)) : 0
    }));

    res.json({
      success: true,
      stats: {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          draft: draftArticles,
          scheduled: scheduledArticles
        },
        users: {
          total: totalUsers,
          activeReporters
        },
        subscribers: totalSubscribers,
        traffic: {
          pageViews,
          uniqueVisitors
        },
        devices: deviceMap,
        browsers: browserMap,
        countries: countryMap,
        chartData,
        topArticles,
        adPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  logEvent,
  getDashboardStats
};
