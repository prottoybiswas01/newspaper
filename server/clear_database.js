require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./config/db');
const Article = require('./models/Article');
const Comment = require('./models/Comment');
const Ad = require('./models/Ad');
const Poll = require('./models/Poll');
const Newsletter = require('./models/Newsletter');
const Analytics = require('./models/Analytics');
const AutoFetchedArticle = require('./models/AutoFetchedArticle');
const fs = require('fs');
const path = require('path');

const clearDatabase = async () => {
  console.log('🧹 Starting Total Database Cleanup...');
  
  await db.connectDB();

  try {
    // 1. Clear Mongo Collections / Fallback JSON Models
    const articleRes = await Article.deleteMany({});
    const commentRes = await Comment.deleteMany({});
    const adRes = await Ad.deleteMany({});
    const pollRes = await Poll.deleteMany({});
    const nsRes = await Newsletter.deleteMany({});
    const analyticsRes = await Analytics.deleteMany({});
    const autoFetchRes = await AutoFetchedArticle.deleteMany({});

    console.log(`✅ Articles deleted: ${articleRes.deletedCount || 0}`);
    console.log(`✅ Comments deleted: ${commentRes.deletedCount || 0}`);
    console.log(`✅ Ads deleted: ${adRes.deletedCount || 0}`);
    console.log(`✅ Polls deleted: ${pollRes.deletedCount || 0}`);
    console.log(`✅ Subscribers deleted: ${nsRes.deletedCount || 0}`);
    console.log(`✅ Analytics deleted: ${analyticsRes.deletedCount || 0}`);
    console.log(`✅ Auto-fetched articles deleted: ${autoFetchRes.deletedCount || 0}`);

    // 2. Ensure JSON data files are completely cleared
    const DATA_DIR = path.join(__dirname, 'data');
    const jsonFiles = [
      'articles.json',
      'comments.json',
      'ads.json',
      'polls.json',
      'newsletters.json',
      'analyticss.json',
      'autofetchedarticles.json'
    ];

    for (const file of jsonFiles) {
      const filePath = path.join(DATA_DIR, file);
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    }

    console.log('🎉 Database and JSON files fully cleared. Website is now 100% clean.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
};

clearDatabase();
