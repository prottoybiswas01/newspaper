require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Tag = require('./models/Tag');
const Article = require('./models/Article');
const Comment = require('./models/Comment');
const Ad = require('./models/Ad');
const StoryHub = require('./models/StoryHub');
const AuditLog = require('./models/AuditLog');

const seed = async () => {
  console.log('🌱 Initializing Dainik Darpan Production Database...');
  await db.connectDB();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Ensure Staff & Admin Roles Exist
    let superAdmin = await User.findOne({ email: 'superadmin@news.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'সুপার অ্যাডমিন',
        email: 'superadmin@news.com',
        password: hashedPassword,
        role: 'Super Admin',
        designation: 'প্রধান নির্বাহী ও সম্পাদক',
        bio: 'দৈনিক দর্পণ ডিজিটাল পাবলিশিং নেটওয়ার্কের প্রধান নির্বাহী।',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=superadmin'
      });
      console.log('✅ Super Admin account created: superadmin@news.com (pass: password123)');
    }

    let editor = await User.findOne({ email: 'editor@news.com' });
    if (!editor) {
      editor = await User.create({
        name: 'সাদিয়া জাহান',
        email: 'editor@news.com',
        password: hashedPassword,
        role: 'Editor',
        designation: 'বার্তা সম্পাদক',
        bio: 'অনুসন্ধানী সাংবাদিকতায় অভিজ্ঞ বার্তা সম্পাদক।',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sadia'
      });
      console.log('✅ Editor account created: editor@news.com (pass: password123)');
    }

    let reporter = await User.findOne({ email: 'reporter@news.com' });
    if (!reporter) {
      reporter = await User.create({
        name: 'তানভীর রহমান',
        email: 'reporter@news.com',
        password: hashedPassword,
        role: 'Reporter',
        designation: 'স্টাফ রিপোর্টার',
        bio: 'জাতীয় ও আঞ্চলিক সংবাদ প্রতিবেদক।',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tanvir'
      });
      console.log('✅ Reporter account created: reporter@news.com (pass: password123)');
    }

    let adManager = await User.findOne({ email: 'admanager@news.com' });
    if (!adManager) {
      adManager = await User.create({
        name: 'আরিফ মাহমুদ',
        email: 'admanager@news.com',
        password: hashedPassword,
        role: 'Ad Manager',
        designation: 'বিজ্ঞাপন ও বিপণন প্রধান',
        bio: 'ডিজিটাল মনিটাইজেশন ও ক্যাম্পেইন বিশেষজ্ঞ।',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=arif'
      });
      console.log('✅ Ad Manager account created: admanager@news.com (pass: password123)');
    }

    // 2. Base Categories (Taxonomy)
    const catCount = await Category.countDocuments({});
    if (catCount === 0) {
      const categories = [
        { 
          name: 'বাংলাদেশ', slug: 'bangladesh', order: 1,
          subcategories: [
            { _id: 'sub_1', name: 'জাতীয়', slug: 'national', order: 1 },
            { _id: 'sub_2', name: 'রাজধানী', slug: 'capital', order: 2 },
            { _id: 'sub_3', name: 'জেলা সংবাদ', slug: 'district', order: 3 },
            { _id: 'sub_4', name: 'আইন-আদালত', slug: 'law', order: 4 }
          ]
        },
        { 
          name: 'রাজনীতি', slug: 'politics', order: 2,
          subcategories: [
            { _id: 'sub_5', name: 'নির্বাচন', slug: 'election', order: 1 },
            { _id: 'sub_6', name: 'সংসদ', slug: 'parliament', order: 2 }
          ]
        },
        { 
          name: 'আন্তর্জাতিক', slug: 'international', order: 3,
          subcategories: [
            { _id: 'sub_7', name: 'মধ্যপ্রাচ্য', slug: 'middle-east', order: 1 },
            { _id: 'sub_8', name: 'যুক্তরাষ্ট্র', slug: 'usa', order: 2 },
            { _id: 'sub_9', name: 'এশিয়া', slug: 'asia', order: 3 }
          ]
        },
        { 
          name: 'বাণিজ্য', slug: 'economy', order: 4,
          subcategories: [
            { _id: 'sub_10', name: 'ব্যাংক ও শেয়ারবাজার', slug: 'banking', order: 1 },
            { _id: 'sub_11', name: 'মুদ্রাস্ফীতি', slug: 'inflation', order: 2 }
          ]
        },
        { 
          name: 'খেলা', slug: 'sports', order: 5,
          subcategories: [
            { _id: 'sub_12', name: 'ক্রিকেট', slug: 'cricket', order: 1 },
            { _id: 'sub_13', name: 'ফুটবল', slug: 'football', order: 2 }
          ]
        },
        { 
          name: 'প্রযুক্তি', slug: 'technology', order: 6,
          subcategories: [
            { _id: 'sub_14', name: 'এআই ও গ্যাজেট', slug: 'ai-gadgets', order: 1 },
            { _id: 'sub_15', name: 'স্টার্টআপ', slug: 'startups', order: 2 }
          ]
        },
        { 
          name: 'বিনোদন', slug: 'entertainment', order: 7,
          subcategories: [
            { _id: 'sub_16', name: 'সিনেমা', slug: 'cinema', order: 1 },
            { _id: 'sub_17', name: 'ওটিটি ও টিভি', slug: 'ott', order: 2 }
          ]
        },
        { 
          name: 'জীবনযাপন', slug: 'lifestyle', order: 8,
          subcategories: [
            { _id: 'sub_18', name: 'স্বাস্থ্য', slug: 'health', order: 1 },
            { _id: 'sub_19', name: 'ভ্রমণ', slug: 'travel', order: 2 }
          ]
        },
        { name: 'মতামত', slug: 'opinion', order: 9, subcategories: [] }
      ];

      for (const cat of categories) {
        await Category.create(cat);
      }
      console.log('✅ Base taxonomy categories initialized.');
    }

    console.log('🎉 System Setup Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Setup Error:', error);
    process.exit(1);
  }
};

seed();
