import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const FALLBACK_CATEGORIES = [
  { name: 'সর্বশেষ', slug: 'latest', order: 0, subcategories: [{ name: 'আজকের খবর', slug: 'ajker-khobor' }, { name: 'প্রধান খবর', slug: 'prodhan-khobor' }] },
  { name: 'বাংলাদেশ', slug: 'bangladesh', order: 1, subcategories: [{ name: 'রাজধানী', slug: 'rajdhani' }, { name: 'জেলা', slug: 'jila' }, { name: 'পরিবেশ', slug: 'poribesh' }, { name: 'অপরাধ', slug: 'oporadh' }] },
  { name: 'রাজনীতি', slug: 'politics', order: 2, subcategories: [{ name: 'জাতীয়', slug: 'jatiyo' }, { name: 'সংসদ', slug: 'songshod' }, { name: 'দলীয় সংবাদ', slug: 'doliyo-songbad' }] },
  { name: 'বিশ্ব', slug: 'international', order: 3, subcategories: [{ name: 'ইরান যুদ্ধ', slug: 'iran-yuddho' }, { name: 'ভারত', slug: 'bharat' }, { name: 'যুক্তরাষ্ট্র', slug: 'joktorashtro' }, { name: 'মধ্যপ্রাচ্য', slug: 'moddhoprachyo' }] },
  { name: 'বাণিজ্য', slug: 'economy', order: 4, subcategories: [{ name: 'শেয়ারবাজার', slug: 'sheyerbajar' }, { name: 'ব্যাংক', slug: 'bank' }, { name: 'শিল্প', slug: 'shilpo' }, { name: 'অর্থনীতি', slug: 'orthoniti' }] },
  { name: 'মতামত', slug: 'opinion', order: 5, subcategories: [{ name: 'সম্পাদকীয়', slug: 'shompadokiyo' }, { name: 'কলাম', slug: 'kolam' }, { name: 'সাক্ষাৎকার', slug: 'shakshatkar' }] },
  { name: 'খেলা', slug: 'sports', order: 6, subcategories: [{ name: 'বিশ্বকাপ ফুটবল', slug: 'worldcup-football' }, { name: 'ক্রিকেট', slug: 'cricket' }, { name: 'টেনিস', slug: 'tennis' }] },
  { name: 'বিনোদন', slug: 'entertainment', order: 7, subcategories: [{ name: 'টেলিভিশন', slug: 'television' }, { name: 'ওটিটি', slug: 'ott' }, { name: 'চলচ্চিত্র', slug: 'dhallywood' }] },
  { name: 'চাকরি', slug: 'jobs', order: 8, subcategories: [{ name: 'খবর', slug: 'khobor' }, { name: 'নিয়োগ', slug: 'niyog' }, { name: 'পরামর্শ', slug: 'poramorsho' }] },
  { name: 'জীবনযাপন', slug: 'lifestyle', order: 9, subcategories: [{ name: 'ভ্রমণ', slug: 'bhromon' }, { name: 'সম্পর্ক', slug: 'shomporo' }, { name: 'সুস্থতা', slug: 'shusthota' }, { name: 'ফ্যাশন', slug: 'fashion' }] },
  { name: 'স্টার্টআপ ও প্রযুক্তি', slug: 'technology', order: 10, subcategories: [{ name: 'গ্যাজেট', slug: 'gadget' }, { name: 'টিপস', slug: 'tips' }, { name: 'বিজ্ঞান', slug: 'biggan' }, { name: 'এআই', slug: 'ai' }] },
  { name: 'শিক্ষা', slug: 'education', order: 11, subcategories: [{ name: 'ভর্তি', slug: 'bhorti' }, { name: 'পরীক্ষা', slug: 'porikkha' }, { name: 'বৃত্তি', slug: 'britti' }] },
  { name: 'ধর্ম', slug: 'religion', order: 12, subcategories: [{ name: 'ইসলাম', slug: 'islam' }, { name: 'হিন্দুধর্ম', slug: 'hinduism' }] },
  { name: 'অন্যপাঠ', slug: 'literature', order: 13, subcategories: [{ name: 'সাহিত্য', slug: 'sahitya' }, { name: 'কবিতা', slug: 'kobita' }] },
  { name: 'সাক্ষাৎকার', slug: 'interview', order: 14, subcategories: [{ name: 'বিশেষ সাক্ষাৎকার', slug: 'bishesh-shakshatkar' }] },
  { name: 'কৃষি ও প্রকৃতি', slug: 'agriculture', order: 15, subcategories: [{ name: 'কৃষি ও কৃষক', slug: 'krishi-o-krishok' }, { name: 'পরিবেশ', slug: 'prokriti-o-poribesh' }] },
  { name: 'ছবি', slug: 'photo', order: 16, subcategories: [{ name: 'ফটোস্টোরি', slug: 'photo-story' }, { name: 'আলোচিত ছবি', slug: 'trending-photos' }] },
  { name: 'প্রবাস', slug: 'diaspora', order: 17, subcategories: [{ name: 'মধ্যপ্রাচ্য', slug: 'middle-east-diaspora' }, { name: 'ইউরোপ', slug: 'europe-diaspora' }] },
  { name: 'শিশু ও নারী', slug: 'women-children', order: 18, subcategories: [{ name: 'শিশু অধিকার', slug: 'child-rights' }, { name: 'নারী নেতৃত্ব', slug: 'women-leadership' }] },
  { name: 'অনন্য', slug: 'exclusive', order: 19, subcategories: [{ name: 'বিশেষ প্রতিবেদন', slug: 'special-report' }, { name: 'অনুসন্ধান', slug: 'investigative' }] },
];

const CategoryMegaMenu = ({ className = "" }) => {
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

  if (loading && categories.length === 0) {
    return (
      <div className={`space-y-4 py-4 px-4 animate-pulse ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-md w-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <nav aria-label="Category Mega Menu" className={`bg-white dark:bg-[#121212] border-t border-b border-gray-200 dark:border-neutral-800 shadow-xs ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="divide-y divide-gray-100 dark:divide-neutral-800/80">
          {categories.map((cat) => {
            const catName = cat.name || (cat.slug ? (cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)) : 'বিভাগ');
            const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

            return (
              <div 
                key={cat._id || cat.slug} 
                className="py-3 flex flex-col sm:flex-row sm:items-baseline gap-y-2 gap-x-3 text-sm text-gray-800 dark:text-neutral-200 group"
              >
                {/* Category Main Header */}
                <div className="flex items-center space-x-1.5 shrink-0 min-w-[120px] sm:min-w-[140px] font-black text-gray-950 dark:text-white text-base">
                  <Link 
                    to={`/category/${cat.slug}`}
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors tracking-tight"
                  >
                    {catName}
                  </Link>
                  <ChevronRight className="h-4 w-4 stroke-[3] text-red-600 shrink-0" />
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
                          className="hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-neutral-800/80 sm:bg-transparent sm:dark:bg-transparent px-2.5 py-1 sm:p-0 rounded-md sm:rounded-none border border-gray-200 sm:border-0 dark:border-neutral-700 transition-colors whitespace-nowrap"
                        >
                          {sub.name}
                        </Link>
                      ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic font-normal pl-2 sm:pl-0">
                    উপ-ক্যাটাগরি নেই
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryMegaMenu;
