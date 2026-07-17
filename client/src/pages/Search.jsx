import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Search as SearchIcon, Filter, Calendar, Eye, User } from 'lucide-react';

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
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-8 flex items-center space-x-2">
        <SearchIcon className="h-7 w-7 text-blue-600" />
        <span>সংবাদ অনুসন্ধান (Advanced Search)</span>
      </h1>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="কীওয়ার্ড লিখুন (যেমন: ক্রিকেট, রাজনীতি, বিমান)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdowns filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-slate-505 block mb-1">বিভাগ (Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="">সকল বিভাগ</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Author/Reporter Filter */}
          <div>
            <label className="text-xs font-bold text-slate-505 block mb-1">লেখক (Author)</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="">সকল লেখক</option>
              {reporters.map(rep => (
                <option key={rep._id} value={rep._id}>{rep.name}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="text-xs font-bold text-slate-505 block mb-1">সাজান (Sorting)</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
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
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs transition-colors"
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
            <div key={i} className="bg-slate-200 dark:bg-slate-800 h-64 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border rounded-2xl border-slate-200/50">
          <p className="text-slate-500 font-semibold">দুঃখিত, আপনার অনুসন্ধানকৃত বিষয়ের কোনো সংবাদ পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div key={art._id} className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-xs hover:shadow-lg transition-all duration-300">
              <Link to={`/article/${art.slug}`}>
                <img
                  src={art.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                  alt={art.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400">{art.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 font-semibold border-t border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(art.publishDate || art.createdAt).toLocaleDateString('bn-BD')}</span>
                    <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> {art.views || 0}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Search;
