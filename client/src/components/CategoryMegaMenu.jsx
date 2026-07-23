import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const CategoryMegaMenu = ({ className = "" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/taxonomy/categories');
        if (res.success && Array.isArray(res.categories)) {
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

  if (loading) {
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
    <nav aria-label="Category Mega Menu" className={`bg-white dark:bg-slate-900 border-t border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {categories.map((cat) => {
            const catName = cat.name || (cat.slug ? (cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)) : 'বিভাগ');
            const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

            return (
              <div 
                key={cat._id || cat.slug} 
                className="py-3 flex flex-col sm:flex-row sm:items-baseline gap-y-2 gap-x-3 text-sm text-slate-800 dark:text-slate-200 group"
              >
                {/* Category Main Header */}
                <div className="flex items-center space-x-1.5 shrink-0 min-w-[120px] sm:min-w-[140px] font-black text-slate-900 dark:text-white text-base">
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
                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 pl-2 sm:pl-0 border-l-2 border-red-500/20 sm:border-l-0">
                    {cat.subcategories
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((sub) => (
                        <Link
                          key={sub._id || sub.slug}
                          to={`/category/${cat.slug}/${sub.slug}`}
                          className="hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800/60 sm:bg-transparent sm:dark:bg-transparent px-2.5 py-1 sm:p-0 rounded-md sm:rounded-none border border-slate-150 sm:border-0 dark:border-slate-700/50 transition-colors whitespace-nowrap"
                        >
                          {sub.name}
                        </Link>
                      ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic font-normal pl-2 sm:pl-0">
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
