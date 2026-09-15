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

const CategoryMegaMenu = ({ onClose, className = "" }) => {
  const [categories, setCategories] = useState([]);
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
            <span>সকল {categories.length > 0 ? `${categories.length}টি ` : ''}বিভাগ ও বিষয়সমূহ</span>
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
                {hasSubcategories && (
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
