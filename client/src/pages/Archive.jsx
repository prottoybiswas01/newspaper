import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Calendar, Inbox, Eye } from 'lucide-react';

const Archive = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Date picker states
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  const fetchArchiveNews = async () => {
    setLoading(true);
    try {
      // Fetch articles
      const res = await api.get('/articles?limit=50&sort=latest');
      if (res.success) {
        // Filter articles on client-side by date matching selectedDate
        const filtered = res.articles.filter(art => {
          const artDate = new Date(art.publishDate || art.createdAt).toISOString().split('T')[0];
          return artDate === selectedDate;
        });
        setArticles(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveNews();
  }, [selectedDate]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-8 flex items-center space-x-2">
        <Calendar className="h-7 w-7 text-blue-600" />
        <span>সংবাদ আর্কাইভ (News Archive)</span>
      </h1>

      {/* Date selector toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">তারিখ নির্বাচন করুন</h3>
          <p className="text-xs text-slate-400">নির্দিষ্ট দিনের প্রকাশিত সংবাদ খুঁজে বের করুন।</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-350 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold w-full sm:w-64"
          />
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-200 dark:bg-slate-800 h-64 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
          <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold mb-2">এই তারিখে কোনো সংবাদ প্রকাশিত হয়নি।</p>
          <span className="text-xs text-slate-400">অনুগ্রহ করে অন্য একটি তারিখ নির্বাচন করুন।</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div key={art._id} className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-xs hover:shadow-lg transition-all duration-300">
              <Link to={`/article/${art.slug}`}>
                <img
                  src={art.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                  alt={art.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{art.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 leading-snug transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 font-semibold border-t border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(art.publishDate || art.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
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

export default Archive;
