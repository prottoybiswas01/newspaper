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
        { name: 'Bangladesh', slug: 'bangladesh', order: 1 },
        { name: 'International', slug: 'international', order: 2 },
        { name: 'Politics', slug: 'politics', order: 3 },
        { name: 'Economy', slug: 'economy', order: 4 },
        { name: 'Sports', slug: 'sports', order: 5 },
        { name: 'Entertainment', slug: 'entertainment', order: 6 },
        { name: 'Technology', slug: 'technology', order: 7 },
        { name: 'Education', slug: 'education', order: 8 },
        { name: 'Jobs', slug: 'jobs', order: 9 },
        { name: 'Lifestyle', slug: 'lifestyle', order: 10 },
        { name: 'Opinion', slug: 'opinion', order: 11 },
        { name: 'Videos', slug: 'videos', order: 12 },
        { name: 'Photo Gallery', slug: 'photo-gallery', order: 13 }
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
      const articles = [
        {
          title: 'বাংলাদেশ বিমানের নতুন আন্তর্জাতিক রুট চালু',
          subtitle: 'ভ্রমণপিপাসুদের জন্য দারুণ খবর',
          slug: 'biman-bangladesh-new-route',
          content: '<p>বাংলাদেশ বিমান তাদের বহরে নতুন রুটের সংখ্যা বাড়াতে কাজ করছে। আগামী মাস থেকে ঢাকা থেকে ইতালির রোমে নিয়মিত সরাসরি ফ্লাইট চলাচল শুরু হবে। বিমান বাংলাদেশ এয়ারলাইন্সের পক্ষ থেকে এক প্রেস বিজ্ঞপ্তিতে এই তথ্য নিশ্চিত করা হয়েছে।</p><p>যাত্রীরা বিমানের আধুনিক বোয়িং ৭৮৭ ড্রিমলাইনার উড়োজাহাজে এই রুটে যাতায়াত করতে পারবেন। এতে করে ইউরোপে বসবাসকারী প্রবাসী বাংলাদেশিদের যাতায়াত আরও সাশ্রয়ী ও আরামদায়ক হবে বলে ধারণা করা হচ্ছে। টিকিট বুকিং আগামীকাল থেকে উন্মুক্ত করা হবে।</p>',
          summary: 'বাংলাদেশ বিমান তাদের বহরে নতুন রুটের সংখ্যা বাড়াতে কাজ করছে। আগামী মাস থেকে ঢাকা থেকে ইতালির রোমে সরাসরি ফ্লাইট চলাচল শুরু হবে।',
          category: 'Bangladesh',
          tags: ['Dhaka', 'Economy'],
          author: 'Tanvir Rahman',
          authorId: reporterId,
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60',
          views: 1250,
          likes: 45,
          shares: 20,
          publishDate: new Date(Date.now() - 3600000 * 24 * 2) // 2 days ago
        },
        {
          title: 'Tech Giants Announce Breakthrough in Quantum Computing',
          subtitle: 'Future of computing is closer than we think',
          slug: 'quantum-computing-breakthrough',
          content: '<p>Leading tech firms have collaboratively unveiled a robust, error-corrected quantum processor operating at room temperatures. This marks a major milestone towards replacing silicon chips in complex scientific research pipelines.</p><p>Security analysts warn that cryptography systems must evolve quickly to support post-quantum encryption standards before commercial availability, projected within five years.</p>',
          summary: 'Tech companies announce major breakthrough in quantum computing hardware with error-corrected room temperature processing.',
          category: 'Technology',
          tags: ['Tech', 'AI'],
          author: 'Sadia Jahan',
          authorId: editorId,
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60',
          views: 940,
          likes: 80,
          shares: 35,
          publishDate: new Date(Date.now() - 3600000 * 12) // 12 hours ago
        },
        {
          title: 'বিশ্বকাপ ক্রিকেটের চূড়ান্ত দল ঘোষণা করল বাংলাদেশ',
          subtitle: 'তরুণদের প্রাধান্য দিয়ে দল গঠন',
          slug: 'bangladesh-cricket-world-cup-squad',
          content: '<p>আসন্ন বিশ্বকাপ ক্রিকেটের জন্য ১৫ সদস্যের চূড়ান্ত দল ঘোষণা করেছে বাংলাদেশ ক্রিকেট বোর্ড (বিসিবি)। এবারের স্কোয়াডে অভিজ্ঞ খেলোয়াড়দের পাশাপাশি বেশ কয়েকজন প্রতিভাবান তরুণ খেলোয়াড়কে সুযোগ দেওয়া হয়েছে।</p><p>প্রধান নির্বাচক জানান, কন্ডিশন ও সাম্প্রতিক পারফরম্যান্স বিবেচনা করে এই দল গঠন করা হয়েছে। তরুণ অলরাউন্ডার ও স্পিন বোলারদের ওপর বাড়তি ভরসা রাখা হচ্ছে। পুরো দল আগামী সপ্তাহে প্রশিক্ষণের জন্য রওনা হবে।</p>',
          summary: 'আসন্ন বিশ্বকাপের জন্য বাংলাদেশ দল ঘোষণা করা হয়েছে। তরুণ ও অভিজ্ঞদের সমন্বয়ে ১৫ সদস্যের স্কোয়াড গঠন করা হয়েছে।',
          category: 'Sports',
          tags: ['Cricket'],
          author: 'Tanvir Rahman',
          authorId: reporterId,
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1540747737956-37872404af0b?w=800&auto=format&fit=crop&q=60',
          views: 2450,
          likes: 310,
          shares: 112,
          publishDate: new Date()
        },
        {
          title: 'পদ্মা সেতুতে রেকর্ড পরিমাণ টোল আদায়',
          subtitle: 'যোগাযোগ ও অর্থনীতিতে বড় প্রভাব',
          slug: 'padma-bridge-record-toll-collection',
          content: '<p>পদ্মা সেতুতে গত ২৪ ঘণ্টায় রেকর্ড পরিমাণ টোল আদায় হয়েছে। পবিত্র ঈদকে কেন্দ্র করে দক্ষিণবঙ্গের হাজার হাজার যানবাহনের পারাপারের কারণে টোল আদায়ের এই নতুন মাইলফলক স্পর্শ হয়েছে বলে জানিয়েছে সেতু কর্তৃপক্ষ।</p><p>যোগাযোগ ব্যবস্থার এই বৈপ্লবিক পরিবর্তন দেশের জিডিপি প্রবৃদ্ধিতে গুরুত্বপূর্ণ ভূমিকা রাখছে। ব্যবসা-বাণিজ্য ও কৃষি সামগ্রী স্থানান্তরে সময় ও খরচ অর্ধেকের নিচে নেমে এসেছে।</p>',
          summary: 'ঈদের ছুটিতে পদ্মা সেতুতে রেকর্ড পরিমাণ টোল আদায় হয়েছে। সড়ক ও অর্থনৈতিক সেক্টরে সেতুটির প্রভাব দিন দিন দৃশ্যমান হচ্ছে।',
          category: 'Economy',
          tags: ['Economy', 'Dhaka'],
          author: 'Tanvir Rahman',
          authorId: reporterId,
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800&auto=format&fit=crop&q=60',
          views: 1800,
          likes: 215,
          shares: 98,
          publishDate: new Date(Date.now() - 3600000 * 24 * 5) // 5 days ago
        },
        {
          title: 'Draft Article on Green Hydrogen',
          subtitle: 'Work in progress',
          slug: 'draft-green-hydrogen-news',
          content: '<p>Green hydrogen could represent the next leap in renewable energy. By using water electrolysis powered by solar grids, it produces zero carbon footprint. This draft explores industrial challenges.</p>',
          summary: 'An investigative draft examining clean energy solutions with green hydrogen.',
          category: 'Technology',
          tags: ['Tech'],
          author: 'Tanvir Rahman',
          authorId: reporterId,
          status: 'draft',
          featuredImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=60',
          views: 0,
          likes: 0,
          shares: 0
        }
      ];

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
