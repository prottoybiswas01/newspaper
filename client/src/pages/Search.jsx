import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Search as SearchIcon, Filter, Calendar, Eye, User } from 'lucide-react';

const API_HOST = import.meta.env.VITE_API_HOST || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

const imgSrc = (art) => {
  if (!art || !art.featuredImage) return null;
  if (art.featuredImage.startsWith('http://') || art.featuredImage.startsWith('https://') || art.featuredImage.startsWith('data:')) {
    return art.featuredImage;
  }
  return `${API_HOST}${art.featuredImage}`;
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [category, setCategory] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [sort, setSort] = useState('latest');
  
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state with URL search param
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Load categories and authors on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const catRes = await api.get('/taxonomy/categories');
        if (catRes.success) setCategories(catRes.categories);

        const repRes = await api.get('/auth/reporters');
        if (repRes.success) setReporters(repRes.reporters);
      } catch (err) {
        console.error(err);
      }
    };
    loadFilters();
  }, []);

  // Fetch results when search criteria changes
  const executeSearch = async () => {
    setLoading(true);
    try {
      let endpoint = `/articles?limit=30&sort=${sort}`;
      if (searchTerm) endpoint += `&search=${encodeURIComponent(searchTerm)}`;
      if (category) endpoint += `&category=${encodeURIComponent(category)}`;
      if (authorId) endpoint += `&authorId=${encodeURIComponent(authorId)}`;

      const res = await api.get(endpoint);
      if (res.success) {
        setArticles(res.articles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [searchTerm, category, authorId, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white mb-8 flex items-center space-x-2">
        <SearchIcon className="h-7 w-7 text-red-600" />
        <span>সংবাদ অনুসন্ধান (Advanced Search)</span>
      </h1>

      {/* Filter panel */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="কীওয়ার্ড লিখুন (যেমন: ক্রিকেট, রাজনীতি, বিমান)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-neutral-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdowns filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-neutral-400 block mb-1">বিভাগ (Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-neutral-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-neutral-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="">সকল বিভাগ</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Author/Reporter Filter */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-neutral-400 block mb-1">লেখক (Author)</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-neutral-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-neutral-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="">সকল লেখক</option>
              {reporters.map(rep => (
                <option key={rep._id} value={rep._id}>{rep.name}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-neutral-400 block mb-1">সাজান (Sorting)</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 dark:border-neutral-700 bg-white dark:bg-[#18181b] text-gray-800 dark:text-neutral-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="latest">নতুন প্রথম</option>
              <option value="popular">জনপ্রিয় প্রথম</option>
              <option value="oldest">পুরনো প্রথম</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setCategory(''); setAuthorId(''); setSort('latest'); }}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-bold rounded-lg text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-neutral-800 h-64 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#121212] border rounded-2xl border-gray-200 dark:border-neutral-800">
          <p className="text-gray-500 dark:text-neutral-400 font-semibold">দুঃখিত, আপনার অনুসন্ধানকৃত বিষয়ের কোনো সংবাদ পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      className="w-full h-40 object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold text-red-600 dark:text-red-400">{art.category}</span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 transition-colors leading-snug">
                      {art.title}
                    </h3>
                    <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-neutral-500 pt-2 font-semibold border-t border-gray-100 dark:border-neutral-800">
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
    </main>
  );
};

export default Search;
