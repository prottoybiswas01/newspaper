import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { PlayCircle, Image as ImageIcon, Film, Inbox } from 'lucide-react';

const API_HOST = import.meta.env.VITE_API_HOST || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

const imgSrc = (art) => {
  if (!art || !art.featuredImage) return null;
  if (art.featuredImage.startsWith('http://') || art.featuredImage.startsWith('https://') || art.featuredImage.startsWith('data:')) {
    return art.featuredImage;
  }
  return `${API_HOST}${art.featuredImage}`;
};

const MediaCenter = () => {
  const [videoArticles, setVideoArticles] = useState([]);
  const [photoArticles, setPhotoArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await api.get('/articles?limit=30&sort=latest');
        if (res.success && Array.isArray(res.articles)) {
          // Filter video articles (category Videos or has videoUrl)
          const videos = res.articles.filter(a => a.category === 'Videos' || (a.videoUrl && a.videoUrl.trim() !== ''));
          // Filter photo articles (category Photo Gallery or has featuredImage)
          const photos = res.articles.filter(a => a.category === 'Photo Gallery' || a.featuredImage);
          
          setVideoArticles(videos);
          setPhotoArticles(photos);
        }
      } catch (err) {
        console.error('MediaCenter fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-8 border-b pb-2 flex items-center space-x-2">
        <Film className="h-7 w-7 text-blue-600" />
        <span>মিডিয়া সেন্টার (Media Center)</span>
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-200 dark:bg-slate-800 h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Video Gallery Section */}
          <section className="mb-12">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-red-500" />
              <span>ভিডিও গ্যালারি (Video Gallery)</span>
            </h2>
            {videoArticles.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 font-semibold text-sm">কোনো ভিডিও সংবাদ পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videoArticles.map((vid) => {
                  const img = imgSrc(vid);
                  return (
                    <Link key={vid._id} to={`/article/${vid.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 block">
                      <div className="relative aspect-video bg-slate-800">
                        {img && (
                          <img src={img} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <PlayCircle className="h-12 w-12 text-white fill-red-600 stroke-none drop-shadow" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">{vid.title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Photo Gallery Section */}
          <section>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <span>আলোকচিত্র গ্যালারি (Photo Gallery)</span>
            </h2>
            {photoArticles.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 font-semibold text-sm">কোনো আলোকচিত্র পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photoArticles.map((ph) => {
                  const img = imgSrc(ph);
                  return (
                    <Link key={ph._id} to={`/article/${ph.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 block">
                      <div className="relative aspect-video overflow-hidden bg-slate-800">
                        {img && (
                          <img src={img} alt={ph.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">{ph.title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default MediaCenter;
