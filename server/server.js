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

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & AI Writer
connectDB().then(() => {
  initAiWriterAndScheduler();
});

// Middleware
app.use(cors({
  origin: '*', // For local dev flexibility, adjust in production
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

// Base Route / Health Check
app.get('/', (req, res) => {
  res.json({
    name: 'Enterprise News Portal API',
    version: '1.0.0',
    status: 'Running'
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

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
  });
}

// Initialize AI Writer and Scheduler background worker
async function initAiWriterAndScheduler() {
  try {
    const User = require('./models/User');
    const Article = require('./models/Article');
    const geminiService = require('./services/geminiService');
    const bcrypt = require('bcryptjs');

    // Seed AI Writer user
    let aiWriter = await User.findOne({ email: 'ai.writer@news.com' });
    if (!aiWriter) {
      const hashedPassword = await bcrypt.hash('aiwriterpassword123', 10);
      aiWriter = await User.create({
        name: 'এআই রিপোর্টার (AI Writer)',
        email: 'ai.writer@news.com',
        password: hashedPassword,
        role: 'Reporter'
      });
      console.log('✅ Seeded system AI Writer account.');
    }

    // Set up interval scheduler (every 20 minutes)
    // 20 minutes = 1,200,000 ms
    const INTERVAL_MS = 20 * 60 * 1000;
    
    const triggerScheduledResearch = async () => {
      console.log('🤖 Starting scheduled AI news research...');
      try {
        const payload = await geminiService.researchAndWriteArticle();
        const readingTime = Math.max(1, Math.ceil((payload.content || '').trim().split(/\s+/).length / 200));
        
        // Simple clean slugify
        const slug = (payload.title || 'ai-news')
          .toLowerCase()
          .replace(/[^\w\u0980-\u09FF-]+/g, '')
          .replace(/\s+/g, '-') + '-' + Date.now();

        await Article.create({
          title: payload.title,
          subtitle: payload.subtitle || '',
          slug,
          content: payload.content || '<p></p>',
          summary: payload.summary || '',
          category: payload.category || 'Bangladesh',
          tags: payload.tags || [],
          author: aiWriter.name,
          authorId: aiWriter._id.toString(),
          isAiGenerated: true,
          aiStatus: 'pending',
          status: 'draft',
          readingTime
        });
        console.log('✅ Scheduled AI news draft saved successfully.');
      } catch (err) {
        console.error('❌ Scheduled AI news research failed:', err.message);
      }
    };

    // Run interval
    setInterval(triggerScheduledResearch, INTERVAL_MS);
    console.log('⏰ AI News Researcher background scheduler started (20-minute interval).');
  } catch (err) {
    console.error('❌ Failed to initialize AI Writer seeding or scheduler:', err);
  }
}

module.exports = app;
