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
const StoryHub = require('./models/StoryHub');
const AuditLog = require('./models/AuditLog');

const seed = async () => {
  console.log('🌱 Starting Dainik Darpan Production Database Seeding...');
  await db.connectDB();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Seed Users
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
    }

    let editor = await User.findOne({ email: 'editor@news.com' });
    if (!editor) {
      editor = await User.create({
        name: 'সাদিয়া জাহান',
        email: 'editor@news.com',
        password: hashedPassword,
        role: 'Editor',
        designation: 'বার্তা সম্পাদক',
        bio: 'অনুসন্ধানী সাংবাদিকতায় ১৫ বছরের অভিজ্ঞতা। আন্তর্জাতিক রাজনীতি ও অর্থনীতি বিশ্লেষক।',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sadia'
      });
    }

    let reporter = await User.findOne({ email: 'reporter@news.com' });
    if (!reporter) {
      reporter = await User.create({
        name: 'তানভীর রহমান',
        email: 'reporter@news.com',
        password: hashedPassword,
        role: 'Reporter',
        designation: 'সিনিয়র স্টাফ রিপোর্টার',
        bio: 'জাতীয় সংসদ ও উন্নয়ন প্রকল্প বিষয়ক সিনিয়র প্রতিবেদক।',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tanvir'
      });
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
    }

    console.log('✅ Users configured.');

    // 2. Categories
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
      console.log('✅ Categories seeded.');
    }

    // 3. Story Hub
    let storyHub = await StoryHub.findOne({ slug: 'national-election-reforms' });
    if (!storyHub) {
      storyHub = await StoryHub.create({
        title: 'জাতীয় সংস্কার ও আগামীর রূপরেখা ২০২৬',
        slug: 'national-election-reforms',
        summary: 'রাষ্ট্র কাঠামো সংস্কার কমিশনের সুপারিশ, নির্বাচন ব্যবস্থার আধুনিকায়ন ও প্রধান রাজনৈতিক দলগুলোর প্রস্তুতি নিয়ে বিশেষ ফোকাস।',
        coverImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200',
        category: 'politics',
        active: true,
        isBreaking: true,
        keyFacts: [
          'নির্বাচনী সংস্কার কমিশনের পূর্ণাঙ্গ প্রতিবেদন রাষ্ট্রপতির কাছে হস্তান্তর।',
          'বায়োমেট্রিক ভোটার ভেরিফিকেশন ও প্রবাসী ভোটাধিকার কার্যকর করার প্রস্তাব।',
          'সারাদেশে নতুন সীমানা নির্ধারণ প্রক্রিয়া শুরু।'
        ],
        timeline: [
          { time: 'সকাল ১০:০০', title: 'কমিশনের যৌথ প্রেস ব্রিফিং', description: 'নির্বাচন ভবনে সাংবাদিকদের সাথে সংস্কার কমিশনের প্রশ্নোত্তর পর্ব অনুষ্ঠিত হয়।' },
          { time: 'দুপুর ০২:৩০', title: 'রাজনৈতিক দলগুলোর প্রতিক্রিয়া', description: 'বিভিন্ন রাজনৈতিক দলের শীর্ষ নেতারা সংস্কার প্রস্তাবকে ইতিবাচক হিসেবে স্বাগত জানিয়েছেন।' }
        ],
        liveUpdates: [
          { time: '১০ মিনিট আগে', text: 'জাতীয় নির্বাচন ভবনে রাজনৈতিক দলগুলোর প্রতিনিধিদের সাথে বৈঠক চলছে।', author: 'তানভীর রহমান' }
        ]
      });
      console.log('✅ Story Hub seeded.');
    }

    // 4. Articles with Block Content System & Trust Badges
    const leadExists = await Article.findOne({ slug: 'election-commission-reform-final-draft-2026' });
    if (!leadExists) {
      console.log('Seeding Block-Based Production Articles...');


      const articlesToCreate = [
        {
          title: 'নির্বাচন কমিশন সংস্কারের চূড়ান্ত খসড়া প্রকাশ: ব্যালট ও প্রবাসীদের ভোটাধিকারে যুগান্তকারী প্রস্তাব',
          subtitle: 'প্রবাসীদের জন্য ডাকযোগ ও ডিজিটাল ভোটিং ব্যবস্থার সুপারিশ, সর্বোচ্চ شفافতা নিশ্চিতের অঙ্গীকার',
          slug: 'election-commission-reform-final-draft-2026',
          category: 'রাজনীতি',
          subcategory: 'নির্বাচন',
          tags: ['নির্বাচন', 'সংস্কার', 'বাংলাদেশ', 'গণতন্ত্র'],
          author: 'তানভীর রহমান',
          authorId: reporter._id.toString(),
          authorDesignation: 'সিনিয়র স্টাফ রিপোর্টার',
          status: 'published',
          isLead: true,
          isBreaking: true,
          isFeatured: true,
          storyHubId: storyHub._id.toString(),
          featuredImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200',
          source: 'বিশেষ প্রতিনিধি',
          publishDate: new Date(),
          readingTime: 3,
          verificationStatus: 'verified',
          verifiedBy: 'সাদিয়া জাহান',
          verificationNote: 'নির্বাচন কমিশনের গেজেট ও প্রেস ব্রিফিং থেকে যাচাইকৃত।',
          aiSummary: 'নির্বাচন সংস্কার কমিশন পূর্ণাঙ্গ সুপারিশমালা পেশ করেছে। এতে প্রবাসীদের ভোটাধিকার নিশ্চিতকরণ এবং ব্যালট পেপারে আধুনিক কিউআর কোড ট্র্যাকিং চালুর প্রস্তাব রাখা হয়েছে। রাজনৈতিক দলগুলো এই সিদ্ধান্তকে সাধুবাদ জানিয়েছে।',
          keyPoints: [
            'প্রবাসী বাংলাদেশিদের জন্য ডাকযোগে ভোটদানের রূপরেখা প্রণয়ন।',
            'ভোট জালিয়াতি রোধে প্রতি ব্যালটে থাকবে ইউনিক এনক্রিপ্টেড কিউআর কোড।',
            'রাজনৈতিক দলসমূহের তহবিল ও নির্বাচনী ব্যয়ের কঠোর ডিজিটাল নিরীক্ষা।'
          ],
          factBox: [
            { label: 'কমিশন গঠন', value: 'অক্টোবর ২০২৫' },
            { label: 'মোট সুপারিশ', value: '৭২টি মূল দফা' },
            { label: 'প্রভাবিত ভোটার', value: '১২ কোটি ৪০ লাখ+' }
          ],
          timeline: [
            { time: '১৫ জানুয়ারি', title: 'খসড়া প্রস্তাবনা তৈরি', description: 'বিশেষজ্ঞ কমিটির সাথে আলোচনা সম্পন্ন।' },
            { time: '২৮ ফেব্রুয়ারি', title: 'স্টেকহোল্ডারদের মতামত গ্রহণ', description: 'বিভিন্ন রাজনৈতিক দলের সঙ্গে সংলাপ।' },
            { time: 'আজ', title: 'চূড়ান্ত প্রতিবেদন প্রকাশ', description: 'সর্বসাধারণের জন্য উন্মুক্ত করা হলো প্রতিবেদন।' }
          ],
          whatWeKnow: [
            'কমিশনের প্রতিবেদন আনুষ্ঠানিকভাবে সরকারের কাছে জমা হয়েছে।',
            'আগামী জাতীয় নির্বাচনে এ সংস্কারের সিংহভাগ কার্যকর করার পরিকল্পনা রয়েছে।'
          ],
          whatWeDontKnow: [
            'ডিজিটাল ভোটিংয়ের সফটওয়্যার অডিট কোন আন্তর্জাতিক সংস্থা পরিচালনা করবে।'
          ],
          adSettings: { autoPlacement: true, manualSlots: [3, 7], maxAds: 3 },
          division: 'ঢাকা',
          district: 'ঢাকা',
          blocks: [
            {
              id: 'b1',
              type: 'paragraph',
              content: 'নির্বাচন ব্যবস্থা সংস্কার কমিশন তাদের চূড়ান্ত প্রতিবেদন ও সুপারিশমালা আজ আনুষ্ঠানিকভাবে প্রকাশ করেছে। রাজধানীর আগারগাঁওয়ে নির্বাচন ভবনে এক জনাকীর্ণ সংবাদ সম্মেলনে এই রূপরেখা তুলে ধরেন সংস্কার কমিশনের প্রধান।',
              order: 1
            },
            {
              id: 'b2',
              type: 'heading',
              content: 'প্রবাসী ভোটারদের জন্য উন্মুক্ত হচ্ছে নতুন দুয়ার',
              metadata: { level: 2 },
              order: 2
            },
            {
              id: 'b3',
              type: 'paragraph',
              content: 'প্রতিবেদনের অন্যতম প্রধান আকর্ষণ হলো প্রায় দেড় কোটি প্রবাসী বাংলাদেশির জন্য ভোটাধিকার নিশ্চিত করার সুস্পষ্ট পথনকশা। প্রাথমিক পর্যায়ে দূতাবাসের মাধ্যমে পোস্টাল ব্যালট এবং পরবর্তীতে নিরাপদ অ্যাপের মাধ্যমে ভোটাধিকার প্রয়োগের প্রস্তাব করা হয়েছে।',
              order: 3
            },
            {
              id: 'b4',
              type: 'ad',
              content: '',
              metadata: { placement: 'article-inline-1' },
              order: 4
            },
            {
              id: 'b5',
              type: 'quote',
              content: 'জনগণের আস্থার পূর্ণ প্রতিফলন নিশ্চিত করাই আমাদের প্রধান লক্ষ্য। স্বচ্ছ ও নিরপেক্ষ প্রক্রিয়ার মাধ্যমে প্রতিটি নাগরিকের ভোটের মর্যাদা রক্ষা করা হবে।',
              metadata: { author: 'সংস্কার কমিশন প্রধান', designation: 'প্রেস ব্রিফিং ২০২৬' },
              order: 5
            },
            {
              id: 'b6',
              type: 'factbox',
              content: 'সুপারিশমালা বাস্তবায়নে সংবিধানের সংশ্লিষ্ট ধারায় প্রয়োজনীয় সংশোধনী আনার জন্য আইন মন্ত্রণালয়ে প্রস্তাব পাঠানো হয়েছে।',
              metadata: { title: 'আইনি পর্যালোচনা' },
              order: 6
            },
            {
              id: 'b7',
              type: 'paragraph',
              content: 'দেশের সব রাজনৈতিক দল এই উদ্যোগকে স্বাগত জানিয়ে বলেছে, একটি অবাধ ও সুষ্ঠু নির্বাচনের স্বার্থে এই সংস্কার অবিলম্বে বাস্তবায়ন করা জরুরি।',
              order: 7
            }
          ]
        },
        {
          title: 'মেট্রোরেলের নতুন রুটের কাজ ৯২% সম্পন্ন: মতিঝিল থেকে কমলাপুর ট্রেন চলবে আগামী মাসেই',
          subtitle: 'দৈনিক যাত্রী পরিবহন সক্ষমতা পৌঁছাবে ৭ লাখে, যানজটমুক্ত রাজধানীর স্বপ্ন বাস্তবায়নের পথে',
          slug: 'metro-rail-motijheel-kamalapur-launch-2026',
          category: 'বাংলাদেশ',
          subcategory: 'রাজধানী',
          tags: ['মেট্রোরেল', 'ঢাকা', 'উন্নয়ন', 'যোগাযোগ'],
          author: 'তানভীর রহমান',
          authorId: reporter._id.toString(),
          authorDesignation: 'সিনিয়র স্টাফ রিপোর্টার',
          status: 'published',
          isBreaking: true,
          featuredImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200',
          source: 'নিজস্ব প্রতিবেদক',
          publishDate: new Date(Date.now() - 3600000),
          readingTime: 2,
          verificationStatus: 'verified',
          verifiedBy: 'সাদিয়া জাহান',
          aiSummary: 'ঢাকা মেট্রোরেল এমআরটি লাইন-৬ এর মতিঝিল থেকে কমলাপুর অংশের ৯২ ভাগ নির্মাণ কাজ শেষ হয়েছে। আগামী মাস থেকেই এই রুটে পরীক্ষামূলক যাত্রী পরিবহন শুরু হবে বলে জানিয়েছেন প্রকল্প পরিচালক।',
          division: 'ঢাকা',
          district: 'ঢাকা',
          blocks: [
            {
              id: 'm1',
              type: 'paragraph',
              content: 'রাজধানীর যানজট নিরসনে নতুন মাইলফলক স্পর্শ করতে যাচ্ছে ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (ডিএমটিসিএল)। এমআরটি লাইন-৬ এর মতিঝিল থেকে কমলাপুর অংশের রেললাইন ও স্টেশন অবকাঠামো নির্মাণের কাজ প্রায় শেষ পর্যায়ে।',
              order: 1
            },
            {
              id: 'm2',
              type: 'image',
              content: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200',
              metadata: { caption: 'কমলাপুর মেট্রোরেল স্টেশনের সমাপ্তি পর্যায়ের নির্মাণ দৃশ্য', credit: 'দর্পণ ফটো / তানভীর' },
              order: 2
            },
            {
              id: 'm3',
              type: 'paragraph',
              content: 'প্রকল্প পরিচালকের দেওয়া তথ্যানুযায়ী, চলতি মাসের শেষ সপ্তাহ থেকেই বিদ্যুতায়ন ও স্বয়ংক্রিয় সিগন্যালিং সিস্টেমের ট্রায়াল রান শুরু হবে। সবকিছু ঠিক থাকলে আগামী মাসেই সাধারণ যাত্রীরা এই সুফল পাবেন।',
              order: 3
            }
          ]
        },
        {
          title: 'রেমিট্যান্সে নতুন ইতিহাস: এক মাসে দেশে এলো রেকর্ড ২.৮ বিলিয়ন ডলার',
          subtitle: 'বৈধ চ্যানেলে প্রণোদনা ও ব্যাংকিং সেবায় সহজীকরণের সুফল পাচ্ছে দেশের অর্থনীতি',
          slug: 'remittance-record-2-8-billion-dollars',
          category: 'বাণিজ্য',
          subcategory: 'ব্যাংক ও শেয়ারবাজার',
          tags: ['রেমিট্যান্স', 'বাংলাদেশ ব্যাংক', 'অর্থনীতি', 'প্রবাসী'],
          author: 'সাদিয়া জাহান',
          authorId: editor._id.toString(),
          authorDesignation: 'বার্তা সম্পাদক',
          status: 'published',
          isFeatured: true,
          featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
          source: 'অর্থনীতি ব্যুরো',
          publishDate: new Date(Date.now() - 7200000),
          readingTime: 3,
          verificationStatus: 'verified',
          aiSummary: 'প্রবাসী আয়ে স্মরণকালের রেকর্ড গড়েছে বাংলাদেশ। সদ্য সমাপ্ত মাসে ২.৮ বিলিয়ন মার্কিন ডলার রেমিট্যান্স এসেছে, যা বৈদেশিক মুদ্রার রিজার্ভকে শক্তিশালী করেছে।',
          division: 'চট্টগ্রাম',
          district: 'চট্টগ্রাম',
          blocks: [
            {
              id: 'e1',
              type: 'paragraph',
              content: 'দেশের প্রবাসী আয়ে একের পর এক নতুন রেকর্ড তৈরি হচ্ছে। ব্যাংকিং চ্যানেলে রেমিট্যান্স প্রেরণে সরকারের দেওয়া প্রণোদনা ও ডলারের যৌক্তিক মূল্যের কারণে ব্যাংকিং চ্যানেলে প্রবাসী আয়ের জোয়ার সৃষ্টি হয়েছে।',
              order: 1
            },
            {
              id: 'e2',
              type: 'paragraph',
              content: 'বাংলাদেশ ব্যাংকের প্রকাশিত তথ্যে দেখা যায়, সদ্য সমাপ্ত মাসে প্রবাসী বাংলাদেশিরা মোট ২.৮৪ বিলিয়ন ডলার পাঠিয়েছেন, যা গত বছরের একই সময়ের তুলনায় ৩৫ শতাংশ বেশি।',
              order: 2
            }
          ]
        },
        {
          title: 'টাইগারদের অবিস্মরণীয় জয়: শেষ ওভারে শ্রীলঙ্কাকে হারিয়ে সিরিজ নিশ্চিত বাংলাদেশের',
          subtitle: 'অলরাউন্ড নৈপুণ্যে ম্যাচসেরা হৃদয়, অধিনায়ক শান্তর প্রশংসায় ক্রিকেট বিশ্ব',
          slug: 'bangladesh-cricket-thrilling-victory-sri-lanka',
          category: 'খেলা',
          subcategory: 'ক্রিকেট',
          tags: ['ক্রিকেট', 'বাংলাদেশ', 'টাইগার', 'বিসিবি'],
          author: 'তানভীর রহমান',
          authorId: reporter._id.toString(),
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?w=1200',
          source: 'ক্রীড়া প্রতিবেদক',
          publishDate: new Date(Date.now() - 14400000),
          readingTime: 2,
          verificationStatus: 'verified',
          aiSummary: 'মিরপুর শেরেবাংলা জাতীয় স্টেডিয়ামে টানটান উত্তেজনার ম্যাচে শ্রীলঙ্কাকে ৩ উইকেটে হারিয়ে সিরিজ জিতে নিয়েছে বাংলাদেশ দল। শেষ ওভারে দুর্দান্ত ব্যাটিংয়ে জয় ছিনিয়ে আনেন তৌহিদ হৃদয়।',
          division: 'ঢাকা',
          district: 'ঢাকা',
          blocks: [
            {
              id: 's1',
              type: 'paragraph',
              content: 'মিরপুরের হোম অব ক্রিকেটে শেষ ওভারের রোমাঞ্চে ভেসে গেল গোটা স্টেডিয়াম। শ্রীলঙ্কার দেওয়া ২৪৫ রানের লক্ষ্যে ব্যাট করতে নেমে ৪ বল হাতে রেখেই জয় নিশ্চিত করে বাংলাদেশ।',
              order: 1
            }
          ]
        },
        {
          title: 'ঢাকায় উদ্বোধন হলো দক্ষিণ এশিয়ার বৃহত্তম এআই ও ডেটা সায়েন্স রিসার্চ হাব',
          subtitle: 'দেশীয় প্রকৌশলীদের নেতৃত্বে বাংলা ভাষাভিত্তিক কৃত্রিম বুদ্ধিমত্তা মডেল তৈরির ঘোষণা',
          slug: 'south-asia-largest-ai-research-hub-dhaka',
          category: 'প্রযুক্তি',
          subcategory: 'এআই ও গ্যাজেট',
          tags: ['এআই', 'প্রযুক্তি', 'গবেষণা', 'ঢাকা'],
          author: 'সাদিয়া জাহান',
          authorId: editor._id.toString(),
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
          source: 'প্রযুক্তি ডেস্ক',
          publishDate: new Date(Date.now() - 28800000),
          readingTime: 3,
          verificationStatus: 'verified',
          aiSummary: 'রাজধানীর আগারগাঁও আইসিটি টাওয়ারে দক্ষিণ এশিয়ার সর্বাধুনিক এআই রিসার্চ সেন্টার চালু হয়েছে। এখানে উন্নত সুপারকম্পিউটিং সুবিধা ও বাংলা এলএলএম গবেষণার সুযোগ থাকবে।',
          division: 'ঢাকা',
          district: 'ঢাকা',
          blocks: [
            {
              id: 't1',
              type: 'paragraph',
              content: 'বাংলা ভাষা ও সংস্কৃতির উপযোগী উন্নত কৃত্রিম বুদ্ধিমত্তা ব্যবস্থা তৈরির প্রত্যয় নিয়ে রাজধানীতে যাত্রা শুরু করল আন্তর্জাতিক মানের এআই রিসার্চ হাব। দেশি ও বিদেশি বিশ্ববিদ্যালয়ের গবেষকরা এতে যৌথভাবে কাজ করবেন।',
              order: 1
            }
          ]
        },
        {
          title: 'ভিডিও প্রতিবেদন: সুন্দরবনের গভীরে ডলফিন সংরক্ষণ ও নতুন প্রজাতির সন্ধান',
          subtitle: 'বিশেষ তথ্যচিত্র ও বিজ্ঞানীদের অন-গ্রাউন্ড অনুসন্ধানী প্রতিবেদন',
          slug: 'video-sundarbans-dolphin-conservation-documentary',
          category: 'বাংলাদেশ',
          subcategory: 'জেলা সংবাদ',
          tags: ['সুন্দরবন', 'ভিডিও', 'ডলফিন', 'প্রকৃতি'],
          author: 'তানভীর রহমান',
          authorId: reporter._id.toString(),
          status: 'published',
          multimediaType: 'video',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '০৫:৪০ মিনিট',
          transcript: 'সুন্দরবনের পশুর নদী ও কটকা চ্যানেলে পরিচালিত সাম্প্রতিক জরিপে ডলফিনের আশাব্যঞ্জক সংখ্যা পরিলক্ষিত হয়েছে। স্থানীয় বন বিভাগের সহায়তায় গবেষক দল বিশেষ অ্যাকোস্টিক ক্যামেরা স্থাপন করেছে...',
          featuredImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
          source: 'পরিবেশ ও বন্যপ্রাণী ব্যুরো',
          publishDate: new Date(Date.now() - 36000000),
          readingTime: 4,
          division: 'খুলনা',
          district: 'বাগেরহাট',
          blocks: [
            {
              id: 'v1',
              type: 'paragraph',
              content: 'সুন্দরবনের জীববৈচিত্র্য রক্ষায় ডলফিন অভয়ারণ্যগুলোর ভূমিকা অপরিসীম। উপকূলীয় জলসীমায় বিজ্ঞানীদের নতুন পর্যবেক্ষণ নিয়ে এই বিশেষ ভিডিও প্রতিবেদন।',
              order: 1
            }
          ]
        },
        {
          title: 'সিলেটের চা বাগানে পর্যটকদের উপচে পড়া ভিড়: স্থানীয় অর্থনীতিতে প্রাণের সঞ্চার',
          subtitle: 'শ্রীমঙ্গল ও জৈন্তাপুরে রেকর্ড পর্যটক সমাগম, হোটেল-রিসোর্টে শতভাগ বুকিং',
          slug: 'sylhet-tea-garden-tourism-boom-2026',
          category: 'জীবনযাপন',
          subcategory: 'ভ্রমণ',
          tags: ['সিলেট', 'ভ্রমণ', 'চা বাগান', 'পর্যটন'],
          author: 'তানভীর রহমান',
          authorId: reporter._id.toString(),
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1588880331179-bc9b93a0cb5e?w=1200',
          source: 'সিলেট প্রতিনিধি',
          publishDate: new Date(Date.now() - 43200000),
          readingTime: 2,
          division: 'সিলেট',
          district: 'মৌলভীবাজার',
          upazila: 'শ্রীমঙ্গল',
          blocks: [
            {
              id: 'sy1',
              type: 'paragraph',
              content: 'সবুজে ঘেরা পাহাড় আর চা বাগানের অপরূপ স্নিগ্ধতায় মাতোয়ারা হতে হাজারো ভ্রমণপিপাসু ছুটে আসছেন সিলেটে। ছুটির দিনে পর্যটন কেন্দ্রগুলোতে যেন পা ফেলার জায়গা নেই।',
              order: 1
            }
          ]
        },
        {
          title: 'চট্টগ্রাম বন্দরে কনটেইনার হ্যান্ডলিংয়ে নতুন রেকর্ড: গতি ফিরেছে আন্তর্জাতিক বাণিজ্যে',
          subtitle: 'ডিজিটাল টার্মিনাল ম্যানেজমেন্ট সিস্টেম চালুর পর জাহাজ জট শূন্যের কোঠায়',
          slug: 'chittagong-port-container-handling-record',
          category: 'বাণিজ্য',
          subcategory: 'ব্যাংক ও শেয়ারবাজার',
          tags: ['চট্টগ্রাম', 'বন্দর', 'বাণিজ্য', 'রপ্তানি'],
          author: 'তানভীর রহমান',
          authorId: reporter._id.toString(),
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200',
          source: 'চট্টগ্রাম ব্যুরো',
          publishDate: new Date(Date.now() - 50000000),
          readingTime: 3,
          division: 'চট্টগ্রাম',
          district: 'চট্টগ্রাম',
          blocks: [
            {
              id: 'ctg1',
              type: 'paragraph',
              content: 'দেশের অর্থনীতির লাইফলাইন খ্যাত চট্টগ্রাম বন্দর কনটেইনার হ্যান্ডলিং ও কাস্টমস ক্লিয়ারেন্সে অভাবনীয় দক্ষতা প্রদর্শন করছে। নতুন স্ক্যানার ও অটোমেটেড পদ্ধতির কারণে আমদানি-রপ্তানি কার্যক্রমে নতুন গতি সঞ্চার হয়েছে।',
              order: 1
            }
          ]
        },
        {
          title: 'রাজশাহীর আমবাগানে আগাম মুকুলের সমারোহ: বাম্পার ফলনের আশায় চাষিরা',
          subtitle: 'অনুকূল আবহাওয়া ও কৃষি কর্মকর্তাদের সার্বক্ষণিক পরামর্শে বাগান পরিচর্যা জোরদার',
          slug: 'rajshahi-mango-blossom-season-2026',
          category: 'বাংলাদেশ',
          subcategory: 'জেলা সংবাদ',
          tags: ['রাজশাহী', 'আম', 'কৃষি', 'জেলা'],
          author: 'তানভীর রহমান',
          authorId: reporter._id.toString(),
          status: 'published',
          featuredImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=1200',
          source: 'রাজশাহী প্রতিনিধি',
          publishDate: new Date(Date.now() - 60000000),
          readingTime: 2,
          division: 'রাজশাহী',
          district: 'রাজশাহী',
          upazila: 'বাঘা',
          blocks: [
            {
              id: 'raj1',
              type: 'paragraph',
              content: 'বসন্তের ফাল্গুনে আমের রাজধানী রাজশাহীর প্রতিটি বাগানে যেন হলুদ ও সুগন্ধি মুকুলের মেলা বসেছে। গত কয়েক বছরের তুলনায় এ বছর গাছে মুকুলের হার উল্লেখযোগ্য হারে বেশি।',
              order: 1
            }
          ]
        }
      ];

      for (const artData of articlesToCreate) {
        await Article.create(artData);
      }
      console.log('✅ Articles seeded successfully.');
    }

    // 5. Seed Enterprise First-Party Ads
    const adCount = await Ad.countDocuments({});
    if (adCount === 0) {
      console.log('Seeding First-Party Ads...');
      const ads = [
        {
          title: 'বিকাশ পেমেন্টে বিশেষ ক্যাশব্যাক অফার',
          advertiserName: 'bKash Limited',
          campaignName: 'Q1 Digital Freedom Campaign',
          placement: 'header',
          creativeType: 'banner',
          imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200',
          destinationUrl: 'https://www.bkash.com',
          linkUrl: 'https://www.bkash.com',
          description: 'যেকোনো অনলাইন কেনাকাটায় বিকাশ পেমেন্টে উপভোগ করুন আকর্ষণীয় ক্যাশব্যাক ও ডিসকাউন্ট।',
          ctaText: 'অফার দেখুন',
          sponsorBadge: 'বিজ্ঞাপন',
          priority: 9,
          targetDevices: ['Desktop', 'Mobile', 'Tablet'],
          targetCategories: [],
          frequencyCap: 5,
          active: true,
          status: 'active'
        },
        {
          title: 'প্রিমিয়াম রিডিং এক্সপেরিয়েন্স - অ্যাপ ডাউনলোড করুন',
          advertiserName: 'দৈনিক দর্পণ মিডিয়া',
          campaignName: 'App Launch Campaign',
          placement: 'article-inline-1',
          creativeType: 'native',
          imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
          destinationUrl: 'https://dainikdarpan.com/app',
          linkUrl: 'https://dainikdarpan.com/app',
          description: 'ব্রেকিং নিউজ সবার আগে নোটিফিকেশনে পেতে ডাউনলোড করুন দৈনিক দর্পণ স্মার্ট অ্যাপ।',
          ctaText: 'ফ্রি ইন্সটল করুন',
          sponsorBadge: 'স্পন্সরড',
          priority: 8,
          targetDevices: ['Desktop', 'Mobile', 'Tablet'],
          targetCategories: ['রাজনীতি', 'বাংলাদেশ', 'খেলা', 'বাণিজ্য'],
          frequencyCap: 3,
          active: true,
          status: 'active'
        },
        {
          title: 'গ্রামীণফোন ৫জি কানেক্টিভিটি নেটওয়ার্ক',
          advertiserName: 'Grameenphone',
          campaignName: '5G Nationwide Rollout',
          placement: 'sidebar',
          creativeType: 'banner',
          imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
          destinationUrl: 'https://www.grameenphone.com',
          linkUrl: 'https://www.grameenphone.com',
          description: 'সুপারফাস্ট ইন্টারনেট স্পিডে বদলে নিন আপনার ডিজিটাল অভিজ্ঞতা।',
          ctaText: 'প্যাক কিনুন',
          sponsorBadge: 'বিজ্ঞাপন',
          priority: 7,
          targetDevices: ['Desktop', 'Tablet'],
          targetCategories: ['প্রযুক্তি', 'বাণিজ্য'],
          frequencyCap: 4,
          active: true,
          status: 'active'
        },
        {
          title: 'দৈনিক দর্পণ হাউজ বিজ্ঞাপন - সত্য ও নিরপেক্ষতার প্রতীক',
          advertiserName: 'দৈনিক দর্পণ',
          campaignName: 'Institutional House Ad',
          placement: 'article-inline-2',
          creativeType: 'house-ad',
          imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
          destinationUrl: 'https://dainikdarpan.com',
          linkUrl: 'https://dainikdarpan.com',
          description: 'নিরপেক্ষ সংবাদ ও অনুসন্ধানী সাংবাদিকতার পাশে থাকুন। নিয়মিত খবর পড়তে বুকমার্ক করুন।',
          ctaText: 'আমাদের সম্পর্কে',
          sponsorBadge: 'দৈনিক দর্পণ',
          priority: 1,
          isHouseAd: true,
          active: true,
          status: 'active'
        }
      ];

      for (const adItem of ads) {
        await Ad.create(adItem);
      }
      console.log('✅ Ads seeded.');
    }

    console.log('🎉 Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seed();
