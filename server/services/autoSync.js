const Article = require('../models/Article');
const AutoFetchedArticle = require('../models/AutoFetchedArticle');

const slugify = (text) => {
  if (!text) return 'article';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0980-\u09FF-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const detectCategory = (title = '', description = '') => {
  const text = (title + ' ' + description).toLowerCase();
  if (text.match(/খেলা|ক্রিকেট|ফুটবল|মেসি|রোনালদো|টি-২০|টি২০|আউট|রান|গোল|উইকেট|ম্যাচ|মেডেল|অলিম্পিক|বিপিএল|আইপিএল/i)) {
    return 'Sports';
  }
  if (text.match(/রাজনীতি|নির্বাচন|ইসি|সংসদ|বিএনপি|আওয়ামী|লীগ|জামায়াত|উপজেলা|দলীয়|এমপি|মন্ত্রী|সরকার|ভোট/i)) {
    return 'Politics';
  }
  if (text.match(/বিশ্ব|ইরান|যুক্তরাষ্ট্র|ট্রাম্প|বাইডেন|পুতিন|রাশিয়া|ইউক্রেন|চীন|ভারত|পাকিস্তান|ইসরায়েল|গাজা|হামাস|ফিলিস্তিন|আন্তর্জাতিক|জাতিসংঘ/i)) {
    return 'International';
  }
  if (text.match(/অর্থনীতি|ব্যাংক|ডলার|মুদ্রাস্ফীতি|শেয়ারবাজার|বাজেট|বাণিজ্য|রপ্তানি|আমদানি|রাজস্ব|এনবিআর|টাকা|ঋণ/i)) {
    return 'Economy';
  }
  if (text.match(/প্রযুক্তি|এআই|স্মার্টফোন|মোবাইল|স্যামসাং|অ্যাপল|গুগল|ইন্টারনেট|সাইবার|ফেসবুক|হয়াটসঅ্যাপ|গ্যাজেট/i)) {
    return 'Technology';
  }
  if (text.match(/বিনোদন|চলচ্চিত্র|সিনেমা|নাটক|অভিনেতা|অভিনেত্রী|বলিউড|ঢালিউড|হলিউড|ওটিটি|গান|নায়ক|নায়িকা/i)) {
    return 'Entertainment';
  }
  if (text.match(/শিক্ষা|পরীক্ষা|এইচএসসি|এসএসসি|বিশ্ববিদ্যালয়|ভর্তি|বুয়েট|ঢাকা বিশ্ববিদ্যালয়|প্রাথমিক|শিক্ষার্থী/i)) {
    return 'Education';
  }
  if (text.match(/চাকরি|নিয়োগ|নিয়োগ|ক্যারিয়ার|সার্কুলার|আবেদন/i)) {
    return 'Jobs';
  }
  if (text.match(/স্বাস্থ্য|লাইফস্টাইল|ভ্রমণ|রেসিপি|ফ্যাশন|রোগ|চিকিৎসা|খাবার/i)) {
    return 'Lifestyle';
  }
  return 'Bangladesh';
};

const detectSubcategory = (category, title = '', description = '') => {
  const text = (title + ' ' + description).toLowerCase();
  if (category === 'Bangladesh') {
    if (text.match(/রাজধানী|ঢাকা|মিরপুর|ধানমন্ডি|উত্তরা|গুলিস্তান|সচিবালয়/i)) return 'রাজধানী';
    if (text.match(/অপরাধ|হত্যা|গ্রেপ্তার|র‌্যাব|আটক|পুলিশ|মামলা|ডাকাতি|ছিনতাই/i)) return 'অপরাধ';
    if (text.match(/পরিবেশ|বন্যা|বৃষ্টি|ঝড়|আবহাওয়া|দূষণ|তাপমাত্রা/i)) return 'পরিবেশ';
    if (text.match(/করোনা|কোভিড|ভ্যাকসিন|ডেঙ্গু|হাসপাতাল|রোগী/i)) return 'করোনাভাইরাস';
    if (text.match(/জেলা|চট্টগ্রাম|সিলেট|খুলনা|রাজশাহী|বরিশাল|রংপুর|ময়মনসিংহ|কুমিল্লা/i)) return 'জেলা';
  }
  if (category === 'Sports') {
    if (text.match(/ক্রিকেট|উইকেট|রান|আউট|বিসিবি|টাইগার/i)) return 'ক্রিকেট';
    if (text.match(/ফুটবল|গোল|মেসি|রোনালদো|ফিফা/i)) return 'বিশ্বকাপ ফুটবল';
    if (text.match(/টেনিস|ফেদেরার|নাদাল/i)) return 'টেনিস';
  }
  if (category === 'Politics') {
    if (text.match(/সংসদ|স্পিকার|অধিবেশন/i)) return 'সংসদ';
    if (text.match(/বিএনপি|আওয়ামী|লীগ|দলীয়|সভা|সমাবেশ/i)) return 'দলীয় সংবাদ';
    return 'জাতীয়';
  }
  if (category === 'International') {
    if (text.match(/ভারত|মোদি|দিল্লি/i)) return 'ভারত';
    if (text.match(/পাকিস্তান|ইসলামাবাদ|ইমরান/i)) return 'পাকিস্তান';
    if (text.match(/চীন|বেইজিং|শি জিনপিং/i)) return 'চীন';
    if (text.match(/যুক্তরাষ্ট্র|বাইডেন|ট্রাম্প|ওয়াশিংটন/i)) return 'যুক্তরাষ্ট্র';
    if (text.match(/ইরান|তেহরান/i)) return 'ইরান যুদ্ধ';
  }
  return '';
};

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const wordCount = (text || '').trim().split(/\s+/).filter(w => w.length > 0).length;
  const minutes = wordCount / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
};

const syncAutoFetchedToArticles = async () => {
  try {
    const autoArticles = await AutoFetchedArticle.find({});
    if (!autoArticles || autoArticles.length === 0) return;

    for (const item of autoArticles) {
      if (!item.title) continue;

      let baseSlug = slugify(item.title) || 'article';
      
      const existing = await Article.findOne({
        $or: [
          { title: item.title },
          { slug: baseSlug }
        ]
      });

      if (!existing) {
        let slug = baseSlug;
        let count = 1;
        while (await Article.findOne({ slug })) {
          slug = `${baseSlug}-${count++}`;
        }

        const category = detectCategory(item.title, item.description);
        const subcategory = detectSubcategory(category, item.title, item.description);
        const sourceAttribution = item.source 
          ? `<br/><hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/><p style="font-size: 12px; color: #64748b;"><strong>তথ্যসূত্র:</strong> ${item.source} (<a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">মূল লিংক</a>)</p>` 
          : '';
        const content = item.description 
          ? `<p>${item.description}</p>${sourceAttribution}` 
          : `<p>${item.title}</p>${sourceAttribution}`;

        await Article.create({
          title: item.title,
          subtitle: item.source ? `উৎস: ${item.source}` : '',
          slug,
          content,
          summary: item.description ? item.description.substring(0, 200) : item.title,
          category,
          subcategory,
          tags: [category, item.source].filter(Boolean),
          author: item.source || 'অনলাইন নিউজ',
          authorId: 'system',
          status: 'published',
          publishDate: item.pubDate || item.createdAt || new Date(),
          readingTime: calculateReadingTime(item.description || item.title),
          views: Math.floor(Math.random() * 80) + 10,
          likes: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          seo: {
            metaTitle: item.title,
            metaDescription: (item.description || item.title).substring(0, 150),
            keywords: category
          }
        });
      }
    }
  } catch (err) {
    console.error('syncAutoFetchedToArticles error:', err.message);
  }
};

module.exports = { syncAutoFetchedToArticles, detectCategory, slugify };
