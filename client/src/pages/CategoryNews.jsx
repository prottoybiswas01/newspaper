import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import { Calendar, Eye } from 'lucide-react';
const API_HOST = import.meta.env.VITE_API_HOST || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

const imgSrc = (art) => {
  if (!art || !art.featuredImage) return null;
  if (art.featuredImage.startsWith('http://') || art.featuredImage.startsWith('https://') || art.featuredImage.startsWith('data:')) {
    return art.featuredImage;
  }
  return `${API_HOST}${art.featuredImage}`;
};

const BN_CATEGORY_NAMES = {
  latest: 'সর্বশেষ',
  bangladesh: 'বাংলাদেশ',
  politics: 'রাজনীতি',
  international: 'বিশ্ব',
  economy: 'বাণিজ্য',
  sports: 'খেলা',
  entertainment: 'বিনোদন',
  jobs: 'চাকরি',
  lifestyle: 'জীবনযাপন',
  opinion: 'মতামত',
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
  archive: 'আর্কাইভ',
  videos: 'ভিডিও',
};

const CategoryNews = () => {
  const { categorySlug, subSlug } = useParams();
  const [searchParams] = useSearchParams();
  const activeSubSlug = subSlug || searchParams.get('sub') || '';

  const [articles, setArticles] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Category taxonomy info (including subcategories)
  useEffect(() => {
    const fetchCategoryTaxonomy = async () => {
      try {
        const res = await api.get('/taxonomy/categories');
        if (res.success && Array.isArray(res.categories)) {
          const found = res.categories.find(c => c.slug.toLowerCase() === categorySlug.toLowerCase());
          if (found) {
            setCategoryInfo(found);
          }
        }
      } catch (err) {
        console.error('Failed to load category taxonomy info:', err);
      }
    };
    fetchCategoryTaxonomy();
  }, [categorySlug]);

  const catName = categoryInfo?.name || BN_CATEGORY_NAMES[categorySlug?.toLowerCase()] || (categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'বিভাগ');
  const activeSubInfo = categoryInfo?.subcategories?.find(s => s.slug.toLowerCase() === activeSubSlug.toLowerCase());
  const subName = activeSubInfo ? activeSubInfo.name : activeSubSlug;

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      setLoading(true);
      try {
        let url = `/articles?limit=30`;
        if (categorySlug === 'latest') {
          url = `/articles?limit=30&sort=latest`;
        } else if (categorySlug === 'photo') {
          url = `/articles?category=${encodeURIComponent('ছবি')}&limit=30`;
        } else {
          url += `&category=${encodeURIComponent(catName || categorySlug)}`;
          if (activeSubSlug) {
            url += `&subcategory=${encodeURIComponent(subName || activeSubSlug)}`;
          }
        }
        const res = await api.get(url);
        if (res.success) {
          setArticles(res.articles);
        }
      } catch (err) {
        console.error('Failed to load category news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryArticles();
  }, [categorySlug, catName, activeSubSlug, subName]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="text-xs text-gray-400 dark:text-neutral-500 font-bold mb-4 uppercase tracking-wider flex items-center space-x-1.5">
        <Link to="/" className="hover:underline">Home</Link>
        <span>➔</span>
        <Link to={`/category/${categorySlug}`} className="hover:underline text-gray-700 dark:text-neutral-300">{catName}</Link>
        {activeSubSlug && (
          <>
            <span>➔</span>
            <span className="text-red-600">{subName}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4 border-b-2 border-red-600 pb-3">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white capitalize">
          {catName} {subName ? `➔ ${subName}` : 'সংবাদ'}
        </h1>
      </div>

      {/* Subcategory Pills Navigation Bar */}
      {categoryInfo && categoryInfo.subcategories && categoryInfo.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-6 border-b border-gray-200 dark:border-neutral-800">
          <Link
            to={`/category/${categorySlug}`}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              !activeSubSlug 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
            }`}
          >
            সকল (All)
          </Link>
          {categoryInfo.subcategories
            .sort((a,b) => (a.order || 0) - (b.order || 0))
            .map(sub => (
              <Link
                key={sub._id || sub.slug}
                to={`/category/${categorySlug}/${sub.slug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeSubSlug.toLowerCase() === sub.slug.toLowerCase()
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                {sub.name}
              </Link>
            ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* News Grid Column */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-neutral-800 h-64 rounded-xl" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-neutral-800">
              <p className="text-gray-500 dark:text-neutral-400">এই বিভাগে বর্তমানে কোনো সংবাদ পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => {
                const img = imgSrc(art);
                return (
                  <div key={art._id} className="group bg-white dark:bg-[#121212] rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-xs hover:shadow-lg transition-all duration-300">
                    <Link to={`/article/${art.slug}`}>
                      {img && (
                        <img 
                          src={img} 
                          alt={art.title} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-44 object-cover" 
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="p-4 space-y-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2">
                          {art.summary}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-neutral-500 font-semibold pt-2 border-t border-gray-100 dark:border-neutral-800 mt-2">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(art.publishDate || art.createdAt).toLocaleDateString('bn-BD')}</span>
                          <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> {art.views || 0}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          <AdPlacement placement="sidebar" />
        </div>

      </div>
    </main>
  );
};

export default CategoryNews;
