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

    // Seed Gemini API keys list in database
    const Setting = require('./models/Setting');
    let dbKeys = await Setting.findOne({ key: 'gemini_api_keys' });
    if (!dbKeys) {
      const keysText = [
        "AQ.Ab8RN6I4gpEPPnEb7u3aVAeoKhIHt5JEEzvFgDuoYENiAppTAA",
        "AQ.Ab8RN6JP6wvHqeC37_4tXK_AVRCWzR24aP_dQ-KbRLaBCzcavA",
        "AQ.Ab8RN6IzEfpep7fOx2UWq3HQ7w0inm2-YVSd6rfVaUzqU2ldfQ",
        "AQ.Ab8RN6Jk_nvyoWTN9wj4BIsAlWL8HnCiUDPbj96RJvhgL_vBoQ",
        "AQ.Ab8RN6IBy0rtE2o8g464yvh6L74yVeBqpVXzwWwae58BfecZuw",
        "AQ.Ab8RN6LMe6DyvZjtouwlyBZyfbW3-s6Sx78mlK21gGgAqL3reA",
        "AQ.Ab8RN6JQzKlEGPGCasKoPrTTS00ru0kEd2sp1-eXTcMdVGxzsw",
        "AQ.Ab8RN6LwT7znPkhPsOyiEGNFbqjuqFhBYsOivH5C7m6pb5uMRw",
        "AQ.Ab8RN6Kg29L3yk-jwTXj9I9yjUih9tMKOGkV9-Qcu_65aHCb5Q",
        "AQ.Ab8RN6Ki-hK7GvOwUVQ0FA8BzhNWvkz05AoaLNVjgf3FwbeEng",
        "AQ.Ab8RN6J07YArRKyYZb0xFCGJigqvxlfsams7I5qTVEhk3wbFww",
        "AQ.Ab8RN6JV8qfZIrEAjJtFtNaCpFLVnMakjUu2FoEwrgWqKqfuKw",
        "AQ.Ab8RN6LpDhpQKWKy17htDj3JKIvy-dnd16aJTMBzAAXxTiq3Nw",
        "AQ.Ab8RN6L7zpWXuotj5aNjLUX6J25ywtwHvj9NKl-g-CHuaooJxA",
        "AQ.Ab8RN6JohLCOutH7oVrqGiGPLDZOI9edUnrlGdpcLYXIUkRgaw",
        "AQ.Ab8RN6LXcSyXAWejJIHomXoLSH2hzozwO1wsvApSH39SJjtjYA",
        "AQ.Ab8RN6LoiAd4Y_CUIMih4Od1IPkyKaLtJTo5fmKS50EVBPA9Hg",
        "AQ.Ab8RN6J1pMCEpkHfoW-U141KD3Ft29r42H0vkVcxY3XKfaiuGg",
        "AQ.Ab8RN6IsY2eWASvYllrdNOW0jCTuNaG3FCmLDA5wpe5YTS_lJA",
        "AQ.Ab8RN6K7gauJf_43sRaNF4PhhMbpu0QBSfRixiF3lxx89XfDbg",
        "AQ.Ab8RN6JixV3OQgFlkHeLF1J4qoVvquEKmu_Ope2RVA9Z0BW98Q",
        "AQ.Ab8RN6J_Em9YT60_i-jk0k0YTOpF8-MJk0cSzxUvSgdhbHHiYA",
        "AQ.Ab8RN6JbwU0d96Cbe0Z39gtkZVgXaYAQdyt4Oux6dbmHbphi9g",
        "AQ.Ab8RN6Jj7EQkwRBdZpiNAO1ucXljHH95QMU-dfe4cuQTKsyjiQ",
        "AQ.Ab8RN6JQh87DaKGdh0UtWBERjLFMrpZnyLDXdaxG0jgISQeGcA",
        "AQ.Ab8RN6KTmgbovpmh7d83-RIlgdqquH0N3w0CjAPs7JAFkmt8YA",
        "AQ.Ab8RN6LaZDWHfC1vFpO51e7bdc2q3rrGjOlg83CJ6kFWgK4M4g",
        "AQ.Ab8RN6I5UA6doaqcpREU7919PfDKKiBmialCvPa3ltlSF3PuTQ",
        "AQ.Ab8RN6K_z8L_UecinoMu61GCmTtj4n0cX8LVYb4LuiGv3uG5Lw",
        "AQ.Ab8RN6IzwbQ9fRIGj6leYIYMLyrC7MsUhlTcdcOtgH9zQLYMKw",
        "AQ.Ab8RN6IJ1L1Nkf__MRG7voF9TND5pZpsyOgQBC7BDftY7eOJQA",
        "AQ.Ab8RN6IeV6BM_CfrpUUt-4_LtMyiISC_u14RMSw4IeNarsS4UA",
        "AQ.Ab8RN6JhwD9Csh1ALc1wbU2gVjA13xNwvKE8_jDhKn9gNbPm1g",
        "AQ.Ab8RN6Ll8gTxHEqtBnhP_CXYsCWpc0BUd4ZxWZlgvMWoSZqplQ",
        "AQ.Ab8RN6JPc-vjYS8s4UZR-lprFIZEJeyBVXjVsNNg89Yuo5llwg",
        "AQ.Ab8RN6JIa4ccE_N5TXbtXasl5Wu4RSXYnBjb929vKCHIa-QklA",
        "AQ.Ab8RN6JdPA_qSXtHVRXI-OATTRyOjaaPQbqdrluyQn2qpSFsdQ",
        "AQ.Ab8RN6KMEVH4M1VbZ8c2zmCfo8JscCmjWU10fp-Scqg_9wGKqg",
        "AQ.Ab8RN6J2EzEls3wdwh9u0FqVPBq_MI9xIAijUrvFE9Z-E8IIKA",
        "AQ.Ab8RN6IOk0dome6iAQYSk1RK-BElI6hOPPGA6EAcUqwbvc_Qcg",
        "AQ.Ab8RN6Inct93iXjm1sX3udbGTjTRbJOI9k_YjGmcAY_KqoL_0w",
        "AQ.Ab8RN6L74kSnPGY-OkNMhaZmaphoqrjHFjl-bkx-DPklHnL3Hw",
        "AQ.Ab8RN6LgvPXoHStCx_P2WhPFm4TGOhTR1Ky3E2LMnR1IelE0Bg",
        "AQ.Ab8RN6JSGXHfXi8VWdaZyAduJpipjWtd6n3U72vtD1kkBcpnLA",
        "AQ.Ab8RN6LoBYI4UwpmVpcym8XJ9ovDJYLCXOBwcTPThOKFJTFNTA",
        "AQ.Ab8RN6IjhRi4S6m9H63d4TwRsBmXo0PGtCfoznu-4pATFZe7-Q",
        "AQ.Ab8RN6J5IF7VcG1Wd5fiKkaTvL5-pCd7jCbjMi56R2MDci0xIA",
        "AQ.Ab8RN6LyQOKHhrCaWpBuisYdbVa6yht5rnnW2MFmbY_k9c5ntg",
        "AQ.Ab8RN6KOtRzlOWs5ymwXi-tP7nS-mwOAkdyaKcHllvfI52T2uw",
        "AQ.Ab8RN6IXub2_UlxxBTBzb__g81vdgjDmNN3msBr4FFXQgiSznA",
        "AQ.Ab8RN6KSXlwcVK1RK0UT7BsUqGlP43cLLBQXt3Ngi8Vjd9R6bg",
        "AQ.Ab8RN6I0GXTOw5vuxLkWuisO6dh2s_s2L6mbgnJRJ9kw2yIVKA",
        "AQ.Ab8RN6L9B3mtxGYxZ6KuUrAz5uk2QSBHE0rvScDMgDwHc04iYg",
        "AQ.Ab8RN6K1cnNkWUxAIkSiWFpzEWO0YK6xiZqSyO4Z_1yYByNVkA",
        "AQ.Ab8RN6LKwQNIi7FZSnep4zl4fTuQzHPIdhebOqQhXSXtykY-FA",
        "AQ.Ab8RN6IxV31VsRK36DNf_iqzgxFFcACjNiurtr18Qk1eqN5cyg",
        "AQ.Ab8RN6LdLAIoMChom2myJ8G2wgeMuwVRH90juYJG6Or33GxbZQ",
        "AQ.Ab8RN6Jk-HREqpC9gTMf4syXCrM_OmsSoAjdwxEEIWlLQx9Vfg",
        "AQ.Ab8RN6Kr-JWaumvN3T3iAvKAT5qlEHotsOJQ7fSRRNwaS6RUAg",
        "AQ.Ab8RN6LtopQ0KG29RCPZhZsrpRBZNysQnxP5wJGx2MWpAAciuw",
        "AQ.Ab8RN6Kk1K2b1TbDjjw8vUFZZ5VTkwagjyzGubhR6H6_L20eHw",
        "AQ.Ab8RN6LdqZN2VcmlsfXvIJL799sOXafaxmvpY4bsASEMtol-0w",
        "AQ.Ab8RN6IYeK0uFhk8i99AzckDsgjn1WR4EoPcIf3abEjcyViS5Q",
        "AQ.Ab8RN6LjyIwKBSqneGlXnUneIso7mWz4RqbwNIcS0ngJbWQQIQ",
        "AQ.Ab8RN6KhecwxQDa5AVm16pz7z9aTuB2F_UmVbOX1lwcktx9_lg",
        "AQ.Ab8RN6JMHaLXsXfAf3vB3GWfsuzE8QNx_i9vWZIrIQqM6mtEYA",
        "AQ.Ab8RN6KEplM2c-Ltsj6nRNzwkQau28-N61Cl68WYY-HojXIWLw",
        "AQ.Ab8RN6JbML6pgNcf_ZYmafcFtQcLAO9njah8qe5-iX3Vl3btiA"
      ].join('\n');
      await Setting.create({ key: 'gemini_api_keys', value: keysText });
      console.log('✅ Seeded Gemini API Keys list in database.');
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
