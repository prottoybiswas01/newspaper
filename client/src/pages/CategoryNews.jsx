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

  const catName = categoryInfo ? categoryInfo.name : categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const activeSubInfo = categoryInfo?.subcategories?.find(s => s.slug.toLowerCase() === activeSubSlug.toLowerCase());
  const subName = activeSubInfo ? activeSubInfo.name : activeSubSlug;

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      setLoading(true);
      try {
        let url = `/articles?category=${encodeURIComponent(catName)}&limit=30`;
        if (activeSubSlug) {
          url += `&subcategory=${encodeURIComponent(subName || activeSubSlug)}`;
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
      <div className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-wider flex items-center space-x-1.5">
        <Link to="/" className="hover:underline">Home</Link>
        <span>➔</span>
        <Link to={`/category/${categorySlug}`} className="hover:underline text-slate-700 dark:text-slate-300">{catName}</Link>
        {activeSubSlug && (
          <>
            <span>➔</span>
            <span className="text-red-600">{subName}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4 border-b-2 border-red-600 pb-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 capitalize">
          {catName} {subName ? `➔ ${subName}` : 'সংবাদ'}
        </h1>
      </div>

      {/* Subcategory Pills Navigation Bar */}
      {categoryInfo && categoryInfo.subcategories && categoryInfo.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <Link
            to={`/category/${categorySlug}`}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              !activeSubSlug 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                <div key={i} className="bg-slate-200 dark:bg-slate-800 h-64 rounded-xl" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-250/10">
              <p className="text-slate-500">এই বিভাগে বর্তমানে কোনো সংবাদ পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => {
                const img = imgSrc(art);
                return (
                  <div key={art._id} className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-xs hover:shadow-lg transition-all duration-300">
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
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {art.summary}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
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
