require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const taxonomyRoutes = require('./routes/taxonomyRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adRoutes = require('./routes/adRoutes');
const pollRoutes = require('./routes/pollRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingRoutes = require('./routes/settingRoutes');
const autoFetchedRoutes = require('./routes/autoFetchedRoutes');
const auditRoutes = require('./routes/auditRoutes');
const storyHubRoutes = require('./routes/storyHubRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database middleware error:', err);
  }
  next();
});

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
app.use('/api', apiLimiter);

// Serve uploads statically (use /tmp/uploads on Vercel)
const uploadsStaticPath = process.env.VERCEL 
  ? '/tmp/uploads' 
  : path.join(__dirname, 'public', 'uploads');
app.use('/uploads', express.static(uploadsStaticPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/auto-fetched', autoFetchedRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/story-hubs', storyHubRoutes);

// Dynamic robots.txt route (Protects admin & private APIs from crawling)
app.get('/robots.txt', (req, res) => {
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const siteUrl = `${protocol}://${host}`;

  const robots = `# Robots.txt for Dainik Darpan News Portal
User-agent: *
Allow: /
Allow: /category/
Allow: /article/
Allow: /search
Allow: /media-center
Allow: /archive
Allow: /story-hub/

# Disallow Private & Administrative Panels
Disallow: /admin
Disallow: /admin/*
Disallow: /login-admin
Disallow: /api/
Disallow: /api/*

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/news-sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.status(200).send(robots);
});

// Dynamic Google News XML Sitemap
app.get('/news-sitemap.xml', async (req, res) => {
  try {
    const Article = require('./models/Article');
    // Google News only indexes articles from the last 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const articles = await Article.find({
      status: 'published',
      publishDate: { $gte: twoDaysAgo }
    }).sort({ publishDate: -1 }).limit(100);

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const siteUrl = `${protocol}://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    articles.forEach(art => {
      const pubDate = art.publishDate || art.createdAt || new Date();
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/article/${art.slug}</loc>\n`;
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>দৈনিক দর্পণ</news:name>\n`;
      xml += `        <news:language>bn</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${new Date(pubDate).toISOString()}</news:publication_date>\n`;
      xml += `      <news:title><![CDATA[${art.title}]]></news:title>\n`;
      if (art.tags && art.tags.length > 0) {
        xml += `      <news:keywords><![CDATA[${art.tags.join(', ')}]]></news:keywords>\n`;
      }
      xml += `    </news:news>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('News Sitemap error:', error);
    res.status(500).send('Error generating News Sitemap');
  }
});

// Dynamic General XML Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const Article = require('./models/Article');
    const StoryHub = require('./models/StoryHub');
    
    const [articles, storyHubs] = await Promise.all([
      Article.find({ status: 'published' }).select('slug publishDate updatedAt').sort({ publishDate: -1 }),
      StoryHub.find({ active: true }).select('slug updatedAt')
    ]);
    
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const siteUrl = `${protocol}://${host}`;
    
    const categories = ['bangladesh', 'international', 'politics', 'economy', 'sports', 'entertainment', 'technology', 'opinion', 'media-center', 'archive'];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Homepage
    xml += `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Categories
    categories.forEach(cat => {
      xml += `  <url>\n    <loc>${siteUrl}/category/${cat}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Story Hubs
    storyHubs.forEach(hub => {
      xml += `  <url>\n    <loc>${siteUrl}/story-hub/${hub.slug}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });
    
    // Articles
    articles.forEach(art => {
      const date = art.publishDate || art.updatedAt || new Date();
      xml += `  <url>\n    <loc>${siteUrl}/article/${art.slug}</loc>\n    <lastmod>${new Date(date).toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Dynamic RSS Feed Route
app.get('/rss.xml', async (req, res) => {
  try {
    const Article = require('./models/Article');
    const articles = await Article.find({ status: 'published' }).sort({ publishDate: -1 }).limit(20);
    
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const siteUrl = `${protocol}://${host}`;
    
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    rss += `<channel>\n`;
    rss += `  <title>দৈনিক দর্পণ | Mirror News</title>\n`;
    rss += `  <link>${siteUrl}</link>\n`;
    rss += `  <description>সর্বশেষ, নিরপেক্ষ ও সত্য সংবাদ সবার আগে পাঠকের কাছে পৌছে দিতে অঙ্গিকারবদ্ধ অনলাইন নিউজ পোর্টাল।</description>\n`;
    rss += `  <language>bn</language>\n`;
    rss += `  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    
    articles.forEach(art => {
      const date = art.publishDate || art.createdAt || new Date();
      rss += `  <item>\n`;
      rss += `    <title><![CDATA[${art.title}]]></title>\n`;
      rss += `    <link>${siteUrl}/article/${art.slug}</link>\n`;
      rss += `    <guid>${siteUrl}/article/${art.slug}</guid>\n`;
      rss += `    <pubDate>${new Date(date).toUTCString()}</pubDate>\n`;
      rss += `    <description><![CDATA[${art.summary || art.subtitle || ''}]]></description>\n`;
      rss += `  </item>\n`;
    });
    
    rss += `</channel>\n`;
    rss += `</rss>`;
    
    res.header('Content-Type', 'application/xml');
    res.status(200).send(rss);
  } catch (error) {
    console.error('RSS generation error:', error);
    res.status(500).send('Error generating RSS feed');
  }
});

// Base Route / Health Check
app.get('/', (req, res) => {
  res.json({
    name: 'Enterprise News Portal API',
    version: '2.0.0',
    status: 'Running',
    system: 'Dainik Darpan Production Engine'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start background cron scheduler (every 60s checks for scheduled articles)
setInterval(async () => {
  try {
    const Article = require('./models/Article');
    const now = new Date();
    const due = await Article.find({
      status: 'scheduled',
      scheduledDate: { $lte: now }
    });
    for (const art of due) {
      await Article.findByIdAndUpdate(art._id, {
        $set: {
          status: 'published',
          publishDate: art.scheduledDate || now
        }
      });
      console.log(`[Scheduler] Auto-published scheduled article: "${art.title}"`);
    }
  } catch (e) {
    // Silently ignore cron check errors
  }
}, 60000);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
  });
}

module.exports = app;
