require('dotenv').config();
const db = require('./config/db');
const Article = require('./models/Article');
const { getHomepageData, getArticles } = require('./controllers/articleController');

const test = async () => {
  await db.connectDB();

  console.log('--- Testing Article Collection ---');
  const count = await Article.countDocuments({ status: 'published' });
  console.log('Published Articles Count:', count);

  const sample = await Article.find({ status: 'published' }).limit(5);
  sample.forEach((art, i) => {
    console.log(`[${i+1}] Title: ${art.title}`);
    console.log(`    Category: ${art.category} | Status: ${art.status} | Slug: ${art.slug}`);
  });

  console.log('\n--- Testing Controller Endpoint Logic (Public) ---');
  const mockReq = { query: {} };
  const mockRes = {
    json: (data) => {
      console.log('Public Endpoint Response Success:', data.success);
      if (data.topArticles) {
        console.log('Top Articles Count for Public Homepage:', data.topArticles.length);
      }
      if (data.articles) {
        console.log('Public Articles List Count:', data.articles.length);
      }
    },
    status: () => mockRes
  };

  await getHomepageData(mockReq, mockRes);
  await getArticles(mockReq, mockRes);

  process.exit(0);
};

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
