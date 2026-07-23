require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Tag = require('./models/Tag');
const Article = require('./models/Article');
const Comment = require('./models/Comment');
const Ad = require('./models/Ad');
const Poll = require('./models/Poll');
const Newsletter = require('./models/Newsletter');
const Analytics = require('./models/Analytics');

const seed = async () => {
  console.log('🌱 Starting Database Seeding...');
  
  // Make sure database checks are run
  await db.connectDB();

  try {
    // 1. Seed Users
    const userCount = await User.countDocuments({});
    let reporterId = '';
    let editorId = '';
    
    if (userCount === 0) {
      console.log('Seeding Users...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@news.com',
        password: hashedPassword,
        role: 'Super Admin',
        bio: 'Chief Executive and System Owner of Professional News Portal.',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=superadmin'
      });

      const editor = await User.create({
        name: 'Sadia Jahan',
        email: 'editor@news.com',
        password: hashedPassword,
        role: 'Editor',
        bio: 'Chief Editor of News Portal. Veteran journalist with 15+ years experience.',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sadia'
      });
      editorId = editor._id.toString();

      const reporter = await User.create({
        name: 'Tanvir Rahman',
        email: 'reporter@news.com',
        password: hashedPassword,
        role: 'Reporter',
        bio: 'Lead political reporter based in Dhaka. Cover sports and international affairs too.',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tanvir'
      });
      reporterId = reporter._id.toString();

      const moderator = await User.create({
        name: 'Moderator Kamal',
        email: 'moderator@news.com',
        password: hashedPassword,
        role: 'Moderator',
        bio: 'Content Moderator.',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=kamal'
      });

      const seoManager = await User.create({
        name: 'SEO Manager Fahim',
        email: 'seo@news.com',
        password: hashedPassword,
        role: 'SEO Manager',
        bio: 'Search Engine Optimization Manager.',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=fahim'
      });

      console.log('✅ Users seeded successfully. Default password is: password123');
    } else {
      const uRep = await User.findOne({ role: 'Reporter' });
      const uEd = await User.findOne({ role: 'Editor' });
      reporterId = uRep ? uRep._id.toString() : 'mock_rep_id';
      editorId = uEd ? uEd._id.toString() : 'mock_ed_id';
    }

    // 2. Seed Categories
    const catCount = await Category.countDocuments({});
    if (catCount === 0) {
      console.log('Seeding Categories...');
      const categories = [
        { 
          name: 'Bangladesh', slug: 'bangladesh', order: 1,
          subcategories: [
            { _id: 'sub_bd_1', name: 'রাজধানী', slug: 'rajdhani', order: 0 },
            { _id: 'sub_bd_2', name: 'জেলা', slug: 'jila', order: 1 },
            { _id: 'sub_bd_3', name: 'করোনাভাইরাস', slug: 'coronavirus', order: 2 },
            { _id: 'sub_bd_4', name: 'পরিবেশ', slug: 'poribesh', order: 3 },
            { _id: 'sub_bd_5', name: 'অপরাধ', slug: 'oporadh', order: 4 }
          ]
        },
        { 
          name: 'International', slug: 'international', order: 2,
          subcategories: [
            { _id: 'sub_int_1', name: 'ইরান যুদ্ধ', slug: 'iran-yuddho', order: 0 },
            { _id: 'sub_int_2', name: 'ভারত', slug: 'bharat', order: 1 },
            { _id: 'sub_int_3', name: 'পাকিস্তান', slug: 'pakistan', order: 2 },
            { _id: 'sub_int_4', name: 'চীন', slug: 'chin', order: 3 },
            { _id: 'sub_int_5', name: 'মধ্যপ্রাচ্য', slug: 'moddhoprachyo', order: 4 },
            { _id: 'sub_int_6', name: 'যুক্তরাষ্ট্র', slug: 'joktorashtro', order: 5 },
            { _id: 'sub_int_7', name: 'এশিয়া', slug: 'eshia', order: 6 },
            { _id: 'sub_int_8', name: 'ইউরোপ', "slug": 'europ', order: 7 },
            { _id: 'sub_int_9', name: 'আফ্রিকা', slug: 'afrika', order: 8 },
            { _id: 'sub_int_10', name: 'লাতিন আমেরিকা', slug: 'latin-america', order: 9 }
          ]
        },
        { 
          name: 'Politics', slug: 'politics', order: 3,
          subcategories: [
            { _id: 'sub_pol_1', name: 'জাতীয়', slug: 'jatiyo', order: 0 },
            { _id: 'sub_pol_2', name: 'সংসদ', slug: 'songshod', order: 1 },
            { _id: 'sub_pol_3', name: 'দলীয় সংবাদ', slug: 'doliyo-songbad', order: 2 }
          ]
        },
        { 
          name: 'Economy', slug: 'economy', order: 4,
          subcategories: [
            { _id: 'sub_eco_1', name: 'শেয়ারবাজার', slug: 'sheyerbajar', order: 0 },
            { _id: 'sub_eco_2', name: 'ব্যাংক', slug: 'bank', order: 1 },
            { _id: 'sub_eco_3', name: 'শিল্প', slug: 'shilpo', order: 2 },
            { _id: 'sub_eco_4', name: 'অর্থনীতি', slug: 'orthoniti', order: 3 },
            { _id: 'sub_eco_5', name: 'বিশ্ববাণিজ্য', slug: 'bishwobanijjo', order: 4 },
            { _id: 'sub_eco_6', name: 'বিশ্লেষণ', slug: 'bishleshon', order: 5 },
            { _id: 'sub_eco_7', name: 'আপনার টাকা', slug: 'apnar-taka', order: 6 },
            { _id: 'sub_eco_8', name: 'উদ্যোক্তা', slug: 'uddyokta', order: 7 },
            { _id: 'sub_eco_9', name: 'কর্পোরেট সংবাদ', slug: 'corporate-songbad', order: 8 },
            { _id: 'sub_eco_10', name: 'বাজেট ২০২৬-২৭', slug: 'budget-2026-27', order: 9 }
          ]
        },
        { 
          name: 'Sports', slug: 'sports', order: 5,
          subcategories: [
            { _id: 'sub_spt_1', name: 'বিশ্বকাপ ফুটবল', slug: 'worldcup-football', order: 0 },
            { _id: 'sub_spt_2', name: 'ক্রিকেট', slug: 'cricket', order: 1 },
            { _id: 'sub_spt_3', name: 'টেনিস', slug: 'tennis', order: 2 },
            { _id: 'sub_spt_4', name: 'অন্য খেলা', slug: 'onno-khela', order: 3 },
            { _id: 'sub_spt_5', name: 'সাক্ষাৎকার', slug: 'shakshatkar', order: 4 },
            { _id: 'sub_spt_6', name: 'ফটো ফিচার', slug: 'photo-feature', order: 5 },
            { _id: 'sub_spt_7', name: 'কুইজ', slug: 'quiz', order: 6 },
            { _id: 'sub_spt_8', name: 'সাত রং', slug: 'shaat-rong', order: 7 },
            { _id: 'sub_spt_9', name: 'ভিডিও', slug: 'video', order: 8 },
            { _id: 'sub_spt_10', name: 'আজকের খেলা', slug: 'ajker-khela', order: 9 }
          ]
        },
        { 
          name: 'Entertainment', slug: 'entertainment', order: 6,
          subcategories: [
            { _id: 'sub_ent_1', name: 'টেলিভিশন', slug: 'television', order: 0 },
            { _id: 'sub_ent_2', name: 'ওটিটি', slug: 'ott', order: 1 },
            { _id: 'sub_ent_3', name: 'ঢালিউড', slug: 'dhallywood', order: 2 },
            { _id: 'sub_ent_4', name: 'টলিউড', slug: 'tollywood', order: 3 },
            { _id: 'sub_ent_5', name: 'বলিউড', slug: 'bollywood', order: 4 },
            { _id: 'sub_ent_6', name: 'হলিউড', slug: 'hollywood', order: 5 },
            { _id: 'sub_ent_7', name: 'বিশ্ব চলচ্চিত্র', slug: 'bishwo-cholochitro', order: 6 },
            { _id: 'sub_ent_8', name: 'গান', slug: 'gan', order: 7 },
            { _id: 'sub_ent_9', name: 'নাটক', slug: 'natok', order: 8 },
            { _id: 'sub_ent_10', name: 'আলাপন', slug: 'alapon', order: 9 }
          ]
        },
        { 
          name: 'Technology', slug: 'technology', order: 7,
          subcategories: [
            { _id: 'sub_tech_1', name: 'গ্যাজেট', slug: 'gadget', order: 0 },
            { _id: 'sub_tech_2', name: 'টিপস', slug: 'tips', order: 1 },
            { _id: 'sub_tech_3', name: 'বিজ্ঞান', slug: 'biggan', order: 2 },
            { _id: 'sub_tech_4', name: 'অটোমোবাইল', slug: 'automobile', order: 3 },
            { _id: 'sub_tech_5', name: 'সাইবার-জগৎ', slug: 'cyber-jogot', order: 4 },
            { _id: 'sub_tech_6', name: 'ফ্রিল্যান্সিং', slug: 'freelancing', order: 5 },
            { _id: 'sub_tech_7', name: 'এআই', slug: 'ai', order: 6 },
            { _id: 'sub_tech_8', name: 'কুইজ', slug: 'quiz', order: 7 }
          ]
        },
        { 
          name: 'Education', slug: 'education', order: 8,
          subcategories: [
            { _id: 'sub_edu_1', name: 'ভর্তি', slug: 'bhorti', order: 0 },
            { _id: 'sub_edu_2', name: 'পরীক্ষা', slug: 'porikkha', order: 1 },
            { _id: 'sub_edu_3', name: 'বৃত্তি', slug: 'britti', order: 2 },
            { _id: 'sub_edu_4', name: 'পড়াশোনা', slug: 'porashona', order: 3 },
            { _id: 'sub_edu_5', name: 'উচ্চশিক্ষা', slug: 'uchchoshikkha', order: 4 },
            { _id: 'sub_edu_6', name: 'ক্যাম্পাস', slug: 'campus', order: 5 },
            { _id: 'sub_edu_7', name: 'গণিত ইস্কুল', slug: 'gonit-ischool', order: 6 }
          ]
        },
        { 
          name: 'Jobs', slug: 'jobs', order: 9,
          subcategories: [
            { _id: 'sub_job_1', name: 'খবর', slug: 'khobor', order: 0 },
            { _id: 'sub_job_2', name: 'নিয়োগ', slug: 'niyog', order: 1 },
            { _id: 'sub_job_3', name: 'পরামর্শ', slug: 'poramorsho', order: 2 },
            { _id: 'sub_job_4', name: 'সাক্ষাৎকার', slug: 'shakshatkar', order: 3 }
          ]
        },
        { 
          name: 'Lifestyle', slug: 'lifestyle', order: 10,
          subcategories: [
            { _id: 'sub_life_1', name: 'ভ্রমণ', slug: 'bhromon', order: 0 },
            { _id: 'sub_life_2', name: 'সম্পর্ক', slug: 'shomporo', order: 1 },
            { _id: 'sub_life_3', name: 'সুস্থতা', slug: 'shusthota', order: 2 },
            { _id: 'sub_life_4', name: 'রাশি', slug: 'rashi', order: 3 },
            { _id: 'sub_life_5', name: 'ফ্যাশন', slug: 'fashion', order: 4 },
            { _id: 'sub_life_6', name: 'স্টাইল', slug: 'style', order: 5 },
            { _id: 'sub_life_7', name: 'রূপচর্চা', slug: 'rupchorcha', order: 6 },
            { _id: 'sub_life_8', name: 'গৃহসজ্জা', slug: 'grihoshojja', order: 7 },
            { _id: 'sub_life_9', name: 'রসনা', slug: 'roshona', order: 8 },
            { _id: 'sub_life_10', name: 'কেনাকাটা', slug: 'kenakata', "order": 9 }
          ]
        },
        { 
          name: 'Opinion', slug: 'opinion', order: 11,
          subcategories: [
            { _id: 'sub_op_1', name: 'সম্পাদকীয়', slug: 'shompadokiyo', order: 0 },
            { _id: 'sub_op_2', name: 'কলাম', slug: 'kolam', order: 1 },
            { _id: 'sub_op_3', name: 'সাক্ষাৎকার', slug: 'shakshatkar', order: 2 },
            { _id: 'sub_op_4', name: 'স্মরণ', slug: 'shmoron', order: 3 },
            { _id: 'sub_op_5', name: 'প্রতিক্রিয়া', slug: 'protikriya', order: 4 },
            { _id: 'sub_op_6', name: 'চিঠি', slug: 'chithi', order: 5 }
          ]
        },
        { name: 'Videos', slug: 'videos', order: 12, subcategories: [] },
        { name: 'Photo Gallery', slug: 'photo-gallery', order: 13, subcategories: [] }
      ];

      for (const cat of categories) {
        await Category.create(cat);
      }
      console.log('✅ Categories seeded.');
    }

    // 3. Seed Tags
    const tagCount = await Tag.countDocuments({});
    if (tagCount === 0) {
      console.log('Seeding Tags...');
      const tags = [
        { name: 'Dhaka', slug: 'dhaka' },
        { name: 'Cricket', slug: 'cricket' },
        { name: 'AI', slug: 'ai' },
        { name: 'Politics', slug: 'politics' },
        { name: 'Economy', slug: 'economy' },
        { name: 'Tech', slug: 'tech' },
        { name: 'Cinema', slug: 'cinema' }
      ];
      for (const t of tags) {
        await Tag.create(t);
      }
      console.log('✅ Tags seeded.');
    }

    // 4. Seed Articles
    const articleCount = await Article.countDocuments({});
    if (articleCount === 0) {
      console.log('Seeding Articles...');
      const articles = [];

      for (const art of articles) {
        await Article.create(art);
      }
      console.log('✅ Articles seeded.');
    }

    // 5. Seed Comments
    const commentCount = await Comment.countDocuments({});
    if (commentCount === 0) {
      console.log('Seeding Comments...');
      const matchedArticles = await Article.find({ status: 'published' });
      if (matchedArticles.length > 0) {
        const artId = matchedArticles[0]._id.toString();
        const artTitle = matchedArticles[0].title;

        await Comment.create({
          articleId: artId,
          articleTitle: artTitle,
          authorName: 'রহিম উল্লাহ',
          authorEmail: 'rahim@gmail.com',
          authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=rahim',
          content: 'দারুণ খবর! রোম ফ্লাইট চালু হওয়ায় ইউরোপ প্রবাসী হাজার হাজার মানুষের অনেক বড় উপকার হবে। বিমানের সেবার মান উন্নত রাখা প্রয়োজন।',
          status: 'approved'
        });

        await Comment.create({
          articleId: artId,
          articleTitle: artTitle,
          authorName: 'Guest Reader',
          authorEmail: 'reader1@gmail.com',
          authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=reader1',
          content: 'টিকিটের দাম কত নির্ধারণ করা হয়েছে? প্রবাসীদের কথা চিন্তা করে একটু কম রাখা উচিত।',
          status: 'pending'
        });
      }
      console.log('✅ Comments seeded.');
    }

    // 6. Seed Ads
    const adCount = await Ad.countDocuments({});
    if (adCount === 0) {
      console.log('Seeding Ads...');
      await Ad.create({
        title: 'Header Banner Ad',
        placement: 'header',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=1200&h=200&fit=crop',
        linkUrl: 'https://www.google.com',
        active: true,
        impressions: 120,
        clicks: 8
      });

      await Ad.create({
        title: 'Sidebar Premium Ad',
        placement: 'sidebar',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=400&h=600&fit=crop',
        linkUrl: 'https://www.google.com',
        active: true,
        impressions: 245,
        clicks: 14
      });

      await Ad.create({
        title: 'Popup Newsletter Ad',
        placement: 'popup',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
        linkUrl: 'https://www.google.com',
        active: false, // Inactive by default
        impressions: 0,
        clicks: 0
      });
      console.log('✅ Ads seeded.');
    }

    // 7. Seed Poll
    const pollCount = await Poll.countDocuments({});
    if (pollCount === 0) {
      console.log('Seeding Survey Polls...');
      await Poll.create({
        question: 'আপনি কি মনে করেন এআই (AI) আগামী ১০ বছরের মধ্যে সাংবাদিকদের কাজ দখল করবে?',
        options: [
          { option: 'হ্যাঁ, সম্পূর্ণভাবে', votes: 124 },
          { option: 'না, এটি শুধুমাত্র একটি সহযোগী প্রযুক্তি হিসেবে থাকবে', votes: 412 },
          { option: 'আংশিক প্রভাব ফেলবে, তবে মানুষের সৃজনশীলতা প্রয়োজনীয় থাকবে', votes: 235 },
          { option: 'মন্তব্য নেই', votes: 19 }
        ],
        status: 'active',
        votedUserIds: []
      });
      console.log('✅ Polls seeded.');
    }

    // 8. Seed Newsletter
    const nsCount = await Newsletter.countDocuments({});
    if (nsCount === 0) {
      await Newsletter.create({ email: 'subscriber1@gmail.com', status: 'active' });
      await Newsletter.create({ email: 'subscriber2@gmail.com', status: 'active' });
      console.log('✅ Subscribers seeded.');
    }

    // 9. Seed Traffic Analytics (Builds historical pageviews chart)
    const analyticsCount = await Analytics.countDocuments({});
    if (analyticsCount === 0) {
      console.log('Seeding Analytics events for charts...');
      
      const devices = ['Desktop', 'Mobile', 'Tablet'];
      const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
      const countries = ['Bangladesh', 'United States', 'United Kingdom', 'Saudi Arabia', 'Canada'];

      // Generate traffic events across the last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        // Random volume between 25 and 65 pageviews per day
        const dailyVolume = Math.floor(Math.random() * 40) + 25;
        for (let j = 0; j < dailyVolume; j++) {
          const randDevice = devices[Math.floor(Math.random() * devices.length)];
          const randBrowser = browsers[Math.floor(Math.random() * browsers.length)];
          const randCountry = countries[Math.floor(Math.random() * countries.length)];
          
          const event = await Analytics.create({
            eventType: 'view',
            path: '/',
            ip: `192.168.1.${Math.floor(Math.random() * 254)}`,
            device: randDevice,
            browser: randBrowser,
            country: randCountry
          });
          
          // Override date properties in JSON model directly or through Mongoose timestamps
          // (db.isFallback() handles file write. Let's adjust target directly by modifying timestamp/createdAt)
          await Analytics.findByIdAndUpdate(event._id, {
            createdAt: d,
            timestamp: d
          });
        }
      }
      console.log('✅ Analytics logs seeded.');
    }

    console.log('🎉 Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error Seeding Database:', error.message);
    process.exit(1);
  }
};

seed();
