require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

const purgeMongoDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('No MONGODB_URI found in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB Atlas:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas successfully.');

    const collections = await mongoose.connection.db.collections();
    console.log(`Found ${collections.length} collections in MongoDB Atlas.`);

    for (const collection of collections) {
      const colName = collection.collectionName;
      // Keep system indices or users if needed, but user wants ALL fake news, comments, ads, polls, autofetched articles cleared
      if (colName === 'users') {
        console.log(` Skipping '${colName}' collection (preserving user accounts for login).`);
        continue;
      }
      if (colName === 'categories' || colName === 'tags') {
        console.log(` Skipping '${colName}' taxonomy collection (preserving categories & tags structure).`);
        continue;
      }

      const count = await collection.countDocuments();
      const res = await collection.deleteMany({});
      console.log(`🗑️  Cleared collection '${colName}': deleted ${res.deletedCount} of ${count} documents.`);
    }

    console.log('\n🎉 MongoDB Atlas Cloud Database fully purged of all fake news, articles, comments, polls, ads, and auto-fetched logs!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error purging MongoDB Atlas:', err.message);
    process.exit(1);
  }
};

purgeMongoDB();
