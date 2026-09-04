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
      <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white mb-8 flex items-center space-x-2">
        <Calendar className="h-7 w-7 text-red-600" />
        <span>সংবাদ আর্কাইভ (News Archive)</span>
      </h1>

      {/* Date selector toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 mb-1">তারিখ নির্বাচন করুন</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">নির্দিষ্ট দিনের প্রকাশিত সংবাদ খুঁজে বের করুন।</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-xl text-gray-900 dark:text-neutral-100 bg-white dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-semibold w-full sm:w-64"
          />
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-neutral-800 h-64 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-2xl">
          <Inbox className="h-12 w-12 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-neutral-300 font-semibold mb-2">এই তারিখে কোনো সংবাদ প্রকাশিত হয়নি।</p>
          <span className="text-xs text-gray-400 dark:text-neutral-500">অনুগ্রহ করে অন্য একটি তারিখ নির্বাচন করুন।</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div key={art._id} className="group bg-white dark:bg-[#121212] rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-xs hover:shadow-lg transition-all duration-300">
              <Link to={`/article/${art.slug}`}>
                <img
                  src={art.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                  alt={art.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">{art.category}</span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 leading-snug transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-neutral-500 pt-2 font-semibold border-t border-gray-100 dark:border-neutral-800">
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
