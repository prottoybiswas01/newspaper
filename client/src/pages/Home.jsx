import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import PollWidget from '../components/PollWidget';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Eye, Heart, PlayCircle, Image as ImageIcon, Clock } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

const timeAgo = (dateStr, language) => {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return language === 'bn' ? 'এইমাত্র' : 'Just now';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return language === 'bn' ? `${m} মিনিট আগে` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return language === 'bn' ? `${h} ঘণ্টা আগে` : `${h}h ago`;
  }
  const days = Math.floor(diff / 86400);
  if (days === 1) return language === 'bn' ? 'গতকাল' : 'Yesterday';
  return d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
};

const ArticleCard = ({ art, size = 'md', showImage = true, language }) => {
  if (!art) return null;
  const imgSrc = art.featuredImage || FALLBACK_IMG;
  const date = timeAgo(art.publishDate || art.createdAt, language);

  if (size === 'hero') {
    return (
      <Link to={`/article/${art.slug}`} className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-video w-full overflow-hidden">
          <img src={imgSrc} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.src = FALLBACK_IMG; }} />
          <div className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs uppercase px-3 py-1 rounded-full tracking-wider shadow">
            {art.category}
          </div>
        </div>
        <div className="p-5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight transition-colors line-clamp-3">
            {art.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">{art.summary}</p>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {date}</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {art.views || 0}</span>
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {art.likes || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (size === 'sm-row') {
    return (
      <Link to={`/article/${art.slug}`} className="group flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 rounded-lg p-2 -mx-2 transition-colors">
        {showImage && (
          <img src={imgSrc} alt={art.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = FALLBACK_IMG; }} />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2 transition-colors">{art.title}</h4>
          <span className="text-[10px] text-slate-400 mt-1 block">{date}</span>
        </div>
      </Link>
    );
  }

  // md = grid card
  return (
    <Link to={`/article/${art.slug}`} className="group block bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md transition-shadow overflow-hidden">
      {showImage && (
        <div className="relative w-full h-44 overflow-hidden">
          <img src={imgSrc} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = FALLBACK_IMG; }} />
          <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
            {art.category}
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 leading-snug transition-colors line-clamp-3">{art.title}</h3>
        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{art.summary}</p>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-semibold">
          <span>{date}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {art.views || 0}</span>
        </div>
      </div>
    </Link>
  );
};

const SectionHeader = ({ title, slug, language }) => (
  <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2 mb-4">
    <h2 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
      {title}
    </h2>
    <Link to={`/category/${slug}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
      {language === 'bn' ? 'আরও দেখুন →' : 'View More →'}
    </Link>
  </div>
);

const Home = () => {
  const [heroArticle, setHeroArticle] = useState(null);
  const [secondaryArticles, setSecondaryArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [mostRead, setMostRead] = useState([]);
  const [layoutSections, setLayoutSections] = useState([]);
  const { language, t } = useLanguage();

  useEffect(() => {
    const logHomepageView = async () => {
      try {
        await api.post('/analytics/log', {
          path: '/',
          device: window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop'),
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari'
        });
      } catch (err) {}
    };
    logHomepageView();
  }, []);

  useEffect(() => {
    const fetchHomeNews = async () => {
      try {
        // Fetch latest articles — first 10 for hero + secondary strip
        const resLatest = await api.get('/articles?limit=10&sort=latest');
        if (resLatest.success && resLatest.articles.length > 0) {
          setHeroArticle(resLatest.articles[0]);
          setSecondaryArticles(resLatest.articles.slice(1, 6));
          setLatestArticles(resLatest.articles);
        }

        // Popular articles for sidebar
        const resPopular = await api.get('/articles?limit=5&sort=popular');
        if (resPopular.success) setMostRead(resPopular.articles);

        // Homepage layout sections from DB
        let config = [];
        try {
          const resConfig = await api.get('/settings/homepage_layout');
          if (resConfig.success && Array.isArray(resConfig.value) && resConfig.value.length > 0) {
            config = resConfig.value;
          }
        } catch (err) {}

        if (config.length === 0) {
          config = [
            { category: 'Bangladesh', layout: 'grid' },
            { category: 'Politics', layout: 'hero' },
            { category: 'Sports', layout: 'grid' },
            { category: 'Technology', layout: 'list' },
          ];
        }

        // Fetch articles per category
        const fetchedSections = await Promise.all(
          config.map(async (sec) => {
            try {
              const limit = sec.layout === 'list' ? 5 : sec.layout === 'hero' ? 4 : 4;
              const resArticles = await api.get(`/articles?category=${encodeURIComponent(sec.category)}&limit=${limit}&sort=latest`);
              if (resArticles.success && resArticles.articles.length > 0) {
                return { category: sec.category, layout: sec.layout, articles: resArticles.articles };
              }
            } catch (err) {
              console.error(`Failed to fetch ${sec.category}`, err);
            }
            return null;
          })
        );

        setLayoutSections(fetchedSections.filter(Boolean));
      } catch (err) {
        console.error('Failed to load home news:', err);
      }
    };
    fetchHomeNews();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner Ad */}
      <AdPlacement placement="header" />

      {/* ── HERO + SECONDARY STRIP ── */}
      {heroArticle && (
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero (left 2/3) */}
          <div className="lg:col-span-2">
            <ArticleCard art={heroArticle} size="hero" language={language} />
          </div>

          {/* Secondary strip (right 1/3) */}
          <div className="flex flex-col gap-3">
            {secondaryArticles.map((art) => (
              <ArticleCard key={art._id} art={art} size="sm-row" language={language} />
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left / Center: Dynamic layout sections (8/12) */}
        <div className="lg:col-span-8 space-y-10">

          {layoutSections.map((sec, idx) => {
            const slug = sec.category.toLowerCase().replace(/\s+/g, '-');
            const label = t(slug) || sec.category;

            return (
              <section key={`${sec.category}-${idx}`}>
                <SectionHeader title={label} slug={slug} language={language} />

                {/* GRID layout: 2-column card grid */}
                {sec.layout === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {sec.articles.slice(0, 4).map(art => (
                      <ArticleCard key={art._id} art={art} size="md" language={language} />
                    ))}
                  </div>
                )}

                {/* LIST layout: thumbnail row */}
                {sec.layout === 'list' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 space-y-1">
                    {sec.articles.slice(0, 5).map(art => (
                      <ArticleCard key={art._id} art={art} size="sm-row" language={language} />
                    ))}
                  </div>
                )}

                {/* HERO layout: big card left + small list right */}
                {sec.layout === 'hero' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <ArticleCard art={sec.articles[0]} size="md" language={language} />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-4 space-y-1">
                      {sec.articles.slice(1, 5).map(art => (
                        <ArticleCard key={art._id} art={art} size="sm-row" showImage={false} language={language} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {/* Media Center placeholder */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-850">
            <h2 className="text-lg font-black border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-red-500" />
              <span>{language === 'bn' ? 'ভিডিও ও ছবি কেন্দ্র' : 'Media Center'}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { img: 'https://images.unsplash.com/photo-1540747737956-37872404af0b?w=400', label: language === 'bn' ? 'ক্রীড়া মাঠের সেরা মুহূর্তসমূহ' : 'Sports Best Moments', type: 'video' },
                { img: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=400', label: language === 'bn' ? 'পদ্মা সেতুর যোগাযোগ ভূমিকা' : 'Role of Padma Bridge', type: 'video' },
                { img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', label: language === 'bn' ? 'আকাশপথে বিমানের নতুন স্বপ্নযাত্রা' : 'Aviation Dreams', type: 'photo' },
              ].map((item, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden group aspect-video">
                  <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    {item.type === 'video'
                      ? <PlayCircle className="h-10 w-10 text-white fill-red-600 stroke-none drop-shadow" />
                      : <ImageIcon className="h-9 w-9 text-white drop-shadow" />}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-bold truncate">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (4/12) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Latest News */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              {language === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
            </h2>
            <div className="space-y-3">
              {latestArticles.slice(0, 7).map((art, index) => (
                <div key={art._id} className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800/50 pb-3 last:border-0">
                  <span className="text-lg font-black text-slate-300 dark:text-slate-700 leading-none w-6 flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <Link to={`/article/${art.slug}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 leading-snug block line-clamp-2 transition-colors">
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{timeAgo(art.publishDate || art.createdAt, language)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Ad */}
          <AdPlacement placement="sidebar" />

          {/* Poll Widget */}
          <PollWidget />

          {/* Most Read */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              {language === 'bn' ? 'পাঠকপ্রিয় সংবাদ' : 'Most Read'}
            </h2>
            <div className="space-y-3">
              {mostRead.map((art, index) => (
                <div key={art._id} className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800/50 pb-3 last:border-0">
                  <span className="text-2xl font-black text-blue-100 dark:text-blue-950 leading-none w-7 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <Link to={`/article/${art.slug}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 leading-snug block line-clamp-2 transition-colors">
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {art.views} {language === 'bn' ? 'বার পঠিত' : 'views'}
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
