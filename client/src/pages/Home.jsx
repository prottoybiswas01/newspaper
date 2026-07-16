import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import PollWidget from '../components/PollWidget';
import { Calendar, Eye, Heart, Share2, PlayCircle, Image as ImageIcon } from 'lucide-react';

const Home = () => {
  const [heroArticle, setHeroArticle] = useState(null);
  const [politicsArticles, setPoliticsArticles] = useState([]);
  const [sportsArticles, setSportsArticles] = useState([]);
  const [techArticles, setTechArticles] = useState([]);
  const [opinionArticles, setOpinionArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [mostRead, setMostRead] = useState([]);

  useEffect(() => {
    // Record general homepage load log
    const logHomepageView = async () => {
      try {
        await api.post('/analytics/log', {
          path: '/',
          device: window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop'),
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari'
        });
      } catch (err) {
        console.error('Analytics log failed:', err);
      }
    };
    logHomepageView();
  }, []);

  useEffect(() => {
    const fetchHomeNews = async () => {
      try {
        // Fetch latest articles
        const resLatest = await api.get('/articles?limit=10&sort=latest');
        if (resLatest.success && resLatest.articles.length > 0) {
          setLatestArticles(resLatest.articles);
          setHeroArticle(resLatest.articles[0]); // First item is hero
        }

        // Fetch popular articles
        const resPopular = await api.get('/articles?limit=5&sort=popular');
        if (resPopular.success) {
          setMostRead(resPopular.articles);
        }

        // Fetch category-specific articles
        const resPol = await api.get('/articles?category=Politics&limit=4');
        if (resPol.success) setPoliticsArticles(resPol.articles);

        const resSports = await api.get('/articles?category=Sports&limit=4');
        if (resSports.success) setSportsArticles(resSports.articles);

        const resTech = await api.get('/articles?category=Technology&limit=4');
        if (resTech.success) setTechArticles(resTech.articles);

        const resOpinion = await api.get('/articles?category=Opinion&limit=3');
        if (resOpinion.success) setOpinionArticles(resOpinion.articles);

      } catch (err) {
        console.error('Failed to load news content:', err);
      }
    };
    fetchHomeNews();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner Advertisement Slot */}
      <AdPlacement placement="header" />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Hero & Category Blocks (8/12 grid) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Section */}
          {heroArticle && (
            <div className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-xs hover:shadow-xl transition-all duration-300">
              <Link to={`/article/${heroArticle.slug}`} className="block">
                <div className="relative aspect-video w-full overflow-hidden">
                  <img 
                    src={heroArticle.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'} 
                    alt={heroArticle.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow">
                    {heroArticle.category}
                  </div>
                </div>
                <div className="p-6">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight transition-colors">
                    {heroArticle.title}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {heroArticle.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-slate-400" /> {new Date(heroArticle.publishDate || heroArticle.createdAt).toLocaleDateString('bn-BD')}</span>
                    <div className="flex space-x-3">
                      <span className="flex items-center"><Eye className="h-3.5 w-3.5 mr-1" /> {heroArticle.views || 0}</span>
                      <span className="flex items-center"><Heart className="h-3.5 w-3.5 mr-1" /> {heroArticle.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Politics News Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">রাজনীতি (Politics)</h2>
              <Link to="/category/politics" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">আরও দেখুন ➔</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {politicsArticles.slice(0, 4).map(art => (
                <div key={art._id} className="group bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-shadow">
                  <Link to={`/article/${art.slug}`}>
                    <img src={art.featuredImage} alt={art.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 leading-snug transition-colors">{art.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{art.summary}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Technology News Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">তথ্যপ্রযুক্তি (Technology)</h2>
              <Link to="/category/technology" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">আরও দেখুন ➔</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techArticles.slice(0, 4).map(art => (
                <div key={art._id} className="group bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-shadow">
                  <Link to={`/article/${art.slug}`}>
                    <img src={art.featuredImage} alt={art.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 leading-snug transition-colors">{art.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{art.summary}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Photo & Video Gallery Highlight Blocks */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-850">
            <h2 className="text-lg font-black border-b border-slate-800 pb-3 mb-4 flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-red-500" />
              <span>ভিডিও ও ছবি কেন্দ্র (Media Center)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative rounded-lg overflow-hidden group aspect-video">
                <img src="https://images.unsplash.com/photo-1540747737956-37872404af0b?w=400" alt="Video cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="h-10 w-10 text-white fill-red-600 stroke-none drop-shadow" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-xs font-bold truncate">ক্রীড়া ময়দানের সেরা মুহূর্তসমূহ</div>
              </div>
              <div className="relative rounded-lg overflow-hidden group aspect-video">
                <img src="https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=400" alt="Video cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="h-10 w-10 text-white fill-red-600 stroke-none drop-shadow" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-xs font-bold truncate">যোগাযোগ খাতে পদ্মা সেতুর ভূমিকা</div>
              </div>
              <div className="relative rounded-lg overflow-hidden group aspect-video">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400" alt="Photo album" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <ImageIcon className="h-9 w-9 text-white drop-shadow" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-xs font-bold truncate">আকাশপথে বিমানের নতুন স্বপ্নযাত্রা</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sidebars & Widgets (4/12 grid) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Latest News feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              সর্বশেষ সংবাদ (Latest)
            </h2>
            <div className="space-y-4">
              {latestArticles.slice(0, 6).map((art, index) => (
                <div key={art._id} className="flex space-x-3 items-start border-b border-slate-150 dark:border-slate-850/50 pb-3 last:border-b-0">
                  <span className="text-lg font-black text-slate-350 dark:text-slate-600 leading-none">0{index + 1}</span>
                  <div className="space-y-1">
                    <Link to={`/article/${art.slug}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 leading-snug block">
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(art.publishDate || art.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Banner Ad */}
          <AdPlacement placement="sidebar" />

          {/* Survey Poll widget */}
          <PollWidget />

          {/* Most Read stories */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              পাঠকপ্রিয় সংবাদ (Most Read)
            </h2>
            <div className="space-y-4">
              {mostRead.map((art, index) => (
                <div key={art._id} className="group flex items-center justify-between space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0">
                  <div className="space-y-1">
                    <Link to={`/article/${art.slug}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 leading-snug block">
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                      <Eye className="h-3 w-3 mr-1" /> {art.views} পঠিত
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
};

export default Home;
