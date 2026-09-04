import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, Calendar, Camera, Video, Layers } from 'lucide-react';
import { api } from '../utils/api';

const BN_CATEGORY_NAMES = {
  latest: 'সর্বশেষ',
  bangladesh: 'বাংলাদেশ',
  politics: 'রাজনীতি',
  international: 'বিশ্ব',
  economy: 'বাণিজ্য',
  opinion: 'মতামত',
  sports: 'খেলা',
  entertainment: 'বিনোদন',
  jobs: 'চাকরি',
  lifestyle: 'জীবনযাপন',
  technology: 'স্টার্টআপ ও প্রযুক্তি',
  education: 'শিক্ষা',
  religion: 'ধর্ম',
  literature: 'অন্যপাঠ',
  interview: 'সাক্ষাৎকার',
  agriculture: 'কৃষি ও প্রকৃতি',
  photo: 'ছবি',
  diaspora: 'প্রবাস',
  'women-children': 'শিশু ও নারী',
  exclusive: 'অনন্য',
  videos: 'ভিডিও',
  'media-center': 'ভিডিও',
};

const FALLBACK_CATEGORIES = [
  { name: 'সর্বশেষ', slug: 'latest', order: 0, subcategories: [{ name: 'আজকের খবর', slug: 'ajker-khobor' }, { name: 'প্রধান খবর', slug: 'prodhan-khobor' }, { name: 'ব্রেকিং নিউজ', slug: 'breaking-news' }] },
  { name: 'বাংলাদেশ', slug: 'bangladesh', order: 1, subcategories: [{ name: 'রাজধানী', slug: 'rajdhani' }, { name: 'জেলা', slug: 'jila' }, { name: 'করোনাভাইরাস', slug: 'coronavirus' }, { name: 'পরিবেশ', slug: 'poribesh' }, { name: 'অপরাধ', slug: 'oporadh' }] },
  { name: 'রাজনীতি', slug: 'politics', order: 2, subcategories: [{ name: 'জাতীয়', slug: 'jatiyo' }, { name: 'সংসদ', slug: 'songshod' }, { name: 'দলীয় সংবাদ', slug: 'doliyo-songbad' }, { name: 'নির্বাচন', slug: 'election' }] },
  { name: 'বিশ্ব', slug: 'international', order: 3, subcategories: [{ name: 'ইরান যুদ্ধ', slug: 'iran-yuddho' }, { name: 'ভারত', slug: 'bharat' }, { name: 'পাকিস্তান', slug: 'pakistan' }, { name: 'চীন', slug: 'chin' }, { name: 'মধ্যপ্রাচ্য', slug: 'moddhoprachyo' }, { name: 'যুক্তরাষ্ট্র', slug: 'joktorashtro' }, { name: 'এশিয়া', slug: 'eshia' }, { name: 'ইউরোপ', slug: 'europ' }, { name: 'আফ্রিকা', slug: 'afrika' }, { name: 'লাতিন আমেরিকা', slug: 'latin-america' }] },
  { name: 'বাণিজ্য', slug: 'economy', order: 4, subcategories: [{ name: 'শেয়ারবাজার', slug: 'sheyerbajar' }, { name: 'ব্যাংক', slug: 'bank' }, { name: 'শিল্প', slug: 'shilpo' }, { name: 'অর্থনীতি', slug: 'orthoniti' }, { name: 'বিশ্ববাণিজ্য', slug: 'bishwobanijjo' }, { name: 'বিশ্লেষণ', slug: 'bishleshon' }, { name: 'আপনার টাকা', slug: 'apnar-taka' }, { name: 'উদ্যোক্তা', slug: 'uddyokta' }, { name: 'কর্পোরেট সংবাদ', slug: 'corporate-songbad' }, { name: 'বাজেট ২০২৬-২৭', slug: 'budget-2026-27' }] },
  { name: 'খেলা', slug: 'sports', order: 5, subcategories: [{ name: 'বিশ্বকাপ ফুটবল', slug: 'worldcup-football' }, { name: 'ক্রিকেট', slug: 'cricket' }, { name: 'টেনিস', slug: 'tennis' }, { name: 'অন্য খেলা', slug: 'onno-khela' }, { name: 'সাক্ষাৎকার', slug: 'shakshatkar' }, { name: 'ফটো ফিচার', slug: 'photo-feature' }, { name: 'কুইজ', slug: 'quiz' }, { name: 'সাত রং', slug: 'shaat-rong' }, { name: 'ভিডিও', slug: 'video' }, { name: 'আজকের খেলা', slug: 'ajker-khela' }] },
  { name: 'বিনোদন', slug: 'entertainment', order: 6, subcategories: [{ name: 'টেলিভিশন', slug: 'television' }, { name: 'ওটিটি', slug: 'ott' }, { name: 'ঢালিউড', slug: 'dhallywood' }, { name: 'টলিউড', slug: 'tollywood' }, { name: 'বলিউড', slug: 'bollywood' }, { name: 'হলিউড', slug: 'hollywood' }, { name: 'বিশ্ব চলচ্চিত্র', slug: 'world-cinema' }, { name: 'গান', slug: 'music' }, { name: 'নাটক', slug: 'drama' }, { name: 'আলাপন', slug: 'alapon' }] },
  { name: 'চাকরি', slug: 'jobs', order: 7, subcategories: [{ name: 'খবর', slug: 'khobor' }, { name: 'নিয়োগ', slug: 'niyog' }, { name: 'পরামর্শ', slug: 'poramorsho' }, { name: 'সাক্ষাৎকার', slug: 'interview' }] },
  { name: 'মতামত', slug: 'opinion', order: 8, subcategories: [{ name: 'সম্পাদকীয়', slug: 'shompadokiyo' }, { name: 'কলাম', slug: 'kolam' }, { name: 'সাক্ষাৎকার', slug: 'shakshatkar' }, { name: 'স্মরণ', slug: 'shmoron' }, { name: 'প্রতিক্রিয়া', slug: 'protikriya' }, { name: 'চিঠি', slug: 'chithi' }] },
  { name: 'জীবনযাপন', slug: 'lifestyle', order: 9, subcategories: [{ name: 'ভ্রমণ', slug: 'bhromon' }, { name: 'সম্পর্ক', slug: 'shomporo' }, { name: 'সুস্থতা', slug: 'shusthota' }, { name: 'রান্না', slug: 'cooking' }, { name: 'ফ্যাশন', slug: 'fashion' }, { name: 'স্টাইল', slug: 'style' }, { name: 'রূপচর্চা', slug: 'beauty-care' }, { name: 'গৃহসজ্জা', slug: 'home-decor' }, { name: 'রসনা', slug: 'foodie' }, { name: 'কেনাকাটা', slug: 'shopping' }] },
  { name: 'স্টার্টআপ ও প্রযুক্তি', slug: 'technology', order: 10, subcategories: [{ name: 'গ্যাজেট', slug: 'gadget' }, { name: 'টিপস', slug: 'tips' }, { name: 'বিজ্ঞান', slug: 'biggan' }, { name: 'অটোমোবাইল', slug: 'automobile' }, { name: 'সাইবার-জগৎ', slug: 'cyber-world' }, { name: 'ফ্রিল্যান্সিং', slug: 'freelancing' }, { name: 'এআই', slug: 'ai' }, { name: 'কুইজ', slug: 'tech-quiz' }] },
  { name: 'শিক্ষা', slug: 'education', order: 11, subcategories: [{ name: 'ভর্তি', slug: 'bhorti' }, { name: 'পরীক্ষা', slug: 'porikkha' }, { name: 'বৃত্তি', slug: 'britti' }, { name: 'পড়াশোনা', slug: 'study' }, { name: 'উচ্চশিক্ষা', slug: 'higher-education' }, { name: 'ক্যাম্পাস', slug: 'campus' }, { name: 'গণিত ইস্কুল', slug: 'math-school' }] },
  { name: 'ধর্ম', slug: 'religion', order: 12, subcategories: [{ name: 'ইসলাম', slug: 'islam' }, { name: 'হিন্দুধর্ম', slug: 'hinduism' }, { name: 'অন্যান্য ধর্ম', slug: 'other-religions' }, { name: 'বাণী ও চিন্তা', slug: 'bani-chinta' }] },
  { name: 'অন্যপাঠ', slug: 'literature', order: 13, subcategories: [{ name: 'সাহিত্য', slug: 'sahitya' }, { name: 'কবিতা', slug: 'kobita' }, { name: 'বই আলোচনা', slug: 'boi-alochona' }, { name: 'ছোটগল্প', slug: 'chotogolpo' }] },
  { name: 'সাক্ষাৎকার', slug: 'interview', order: 14, subcategories: [{ name: 'বিশেষ সাক্ষাৎকার', slug: 'bishesh-shakshatkar' }, { name: 'রাজনৈতিক ব্যক্তিত্ব', slug: 'political-personality' }, { name: 'সাংস্কৃতিক ব্যক্তিত্ব', slug: 'cultural-personality' }] },
  { name: 'কৃষি ও প্রকৃতি', slug: 'agriculture', order: 15, subcategories: [{ name: 'কৃষি ও কৃষক', slug: 'krishi-o-krishok' }, { name: 'প্রকৃতি ও পরিবেশ', slug: 'prokriti-o-poribesh' }, { name: 'প্রাণিজগৎ', slug: 'pranijogot' }, { name: 'জলবায়ু পরিবর্তন', slug: 'climate-change' }] },
  { name: 'ছবি', slug: 'photo', order: 16, subcategories: [{ name: 'ফটোস্টোরি', slug: 'photo-story' }, { name: 'আলোচিত ছবি', slug: 'trending-photos' }, { name: 'প্রাকৃতিক দৃশ্য', slug: 'nature-photos' }, { name: 'দৈনন্দিন জীবন', slug: 'daily-life-photos' }] },
  { name: 'প্রবাস', slug: 'diaspora', order: 17, subcategories: [{ name: 'মধ্যপ্রাচ্য প্রবাস', slug: 'middle-east-diaspora' }, { name: 'ইউরোপ প্রবাস', slug: 'europe-diaspora' }, { name: 'যুক্তরাষ্ট্র প্রবাস', slug: 'usa-diaspora' }, { name: 'সাফল্য গাথা', slug: 'success-stories' }] },
  { name: 'শিশু ও নারী', slug: 'women-children', order: 18, subcategories: [{ name: 'শিশু অধিকার', slug: 'child-rights' }, { name: 'নারী নেতৃত্ব', slug: 'women-leadership' }, { name: 'প্যারেন্টিং', slug: 'parenting' }, { name: 'কন্যাশিশু', slug: 'girl-child' }] },
  { name: 'অনন্য', slug: 'exclusive', order: 19, subcategories: [{ name: 'বিশেষ প্রতিবেদন', slug: 'special-report' }, { name: 'অনুসন্ধান', slug: 'investigative' }, { name: 'ইতিহাস ঐতিহ্য', slug: 'history-heritage' }] },
];

const CategoryMegaMenu = ({ onClose, className = "" }) => {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/taxonomy/categories');
        if (res.success && Array.isArray(res.categories) && res.categories.length > 0) {
          setCategories(res.categories.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      } catch (err) {
        console.error('Failed to fetch categories for Mega Menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <nav aria-label="Category Mega Menu" className={`bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-neutral-800 shadow-xl ${className}`}>
      {/* Top Action Bar with Quick Links & Close Button */}
      <div className="bg-gray-50 dark:bg-[#18181b] border-b border-gray-200 dark:border-neutral-800 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-black text-sm sm:text-base">
            <Layers className="h-5 w-5 text-red-600" />
            <span>সকল ২০টি বিভাগ ও বিষয়সমূহ</span>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-bold">
            <Link
              to="/archive"
              onClick={handleLinkClick}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>📅 আর্কাইভ</span>
            </Link>
            <Link
              to="/category/photo"
              onClick={handleLinkClick}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Camera className="h-3.5 w-3.5 text-red-600" />
              <span>ছবি</span>
            </Link>
            <Link
              to="/media-center"
              onClick={handleLinkClick}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Video className="h-3.5 w-3.5 text-red-600" />
              <span>ভিডিও</span>
            </Link>

            {/* Explicit Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors shadow-xs ml-2 cursor-pointer"
                title="মেনু বন্ধ করুন"
              >
                <X className="h-4 w-4" />
                <span>বন্ধ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Categories & Subcategories List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 max-h-[70vh] overflow-y-auto">
        <div className="divide-y divide-gray-100 dark:divide-neutral-800/80">
          {categories.map((cat) => {
            const slugKey = (cat.slug || '').toLowerCase();
            const catName = BN_CATEGORY_NAMES[slugKey] || cat.name || (cat.slug ? (cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)) : 'বিভাগ');
            const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

            return (
              <div 
                key={cat._id || cat.slug} 
                className="py-3 flex flex-col sm:flex-row sm:items-baseline gap-y-2 gap-x-4 text-sm text-gray-800 dark:text-neutral-200 group"
              >
                {/* Category Main Header */}
                <div className="flex items-center space-x-1.5 shrink-0 min-w-[130px] sm:min-w-[150px] font-black text-gray-950 dark:text-white text-base">
                  <Link 
                    to={`/category/${cat.slug}`}
                    onClick={handleLinkClick}
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors tracking-tight flex items-center space-x-1"
                  >
                    <span>{catName}</span>
                    <ChevronRight className="h-4 w-4 stroke-[3] text-red-600 shrink-0" />
                  </Link>
                </div>

                {/* Subcategories Horizontal / Responsive Wrapped List */}
                {hasSubcategories ? (
                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300 flex-1 pl-2 sm:pl-0 border-l-2 border-red-500/20 sm:border-l-0">
                    {cat.subcategories
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((sub) => (
                        <Link
                          key={sub._id || sub.slug}
                          to={`/category/${cat.slug}/${sub.slug}`}
                          onClick={handleLinkClick}
                          className="hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-neutral-800/80 sm:bg-transparent sm:dark:bg-transparent px-2.5 py-1 sm:p-0 rounded-md sm:rounded-none border border-gray-200 sm:border-0 dark:border-neutral-700 transition-colors whitespace-nowrap"
                        >
                          {sub.name}
                        </Link>
                      ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic font-normal pl-2 sm:pl-0">
                    উপ-বিভাগ নেই
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Close Action */}
        {onClose && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-center pb-2">
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-red-600 hover:text-white text-gray-800 dark:text-neutral-200 text-xs font-bold transition-all shadow-xs"
            >
              <X className="h-4 w-4" />
              <span>মেনু বন্ধ করুন ও খবর পড়ুন</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CategoryMegaMenu;
