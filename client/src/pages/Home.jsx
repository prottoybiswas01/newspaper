import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import PollWidget from '../components/PollWidget';
import StoryHubBanner from '../components/StoryHubBanner';
import LocalNewsWidget from '../components/LocalNewsWidget';
import { useLanguage } from '../context/LanguageContext';
import { 
  Eye, Heart, Clock, PlayCircle, Image as ImageIcon, 
  ChevronRight, Inbox, Camera, Radio, Sparkles, TrendingUp, Music, Bookmark 
} from 'lucide-react';

const API_HOST = import.meta.env.VITE_API_HOST || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

const imgSrc = (art) => {
  if (!art || !art.featuredImage) return null;
  if (art.featuredImage.startsWith('http://') || art.featuredImage.startsWith('https://') || art.featuredImage.startsWith('data:')) {
    return art.featuredImage;
  }
  return `${API_HOST}${art.featuredImage}`;
};

const timeAgo = (dateStr, lang) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return lang === 'bn' ? 'এইমাত্র' : 'Just now';
  if (diff < 3600) return lang === 'bn' ? `${Math.floor(diff/60)} মিনিট আগে` : `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return lang === 'bn' ? `${Math.floor(diff/3600)} ঘণ্টা আগে` : `${Math.floor(diff/3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  return new Date(dateStr).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day:'numeric', month:'short' });
};

const LeadStoryCard = ({ art, lang }) => {
  if (!art) return null;
  const img = imgSrc(art);
  return (
    <Link 
      to={`/article/${art.slug}`} 
      className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 hover:shadow-2xl transition-all duration-300 w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {img && (
          <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[420px] overflow-hidden">
            <img 
              src={img} 
              alt={art.title}
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
              {art.category}
            </span>
          </div>
        )}
        <div className={`${img ? 'lg:col-span-5' : 'lg:col-span-12'} p-6 sm:p-8 flex flex-col justify-between`}>
          <div>
            {!img && (
              <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider mb-3">
                {art.category}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 dark:text-white leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {art.title}
            </h2>
            {art.subtitle && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-300 font-medium mt-3 line-clamp-3 leading-relaxed">
                {art.subtitle}
              </p>
            )}
            {art.summary && !art.subtitle && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 mt-3 line-clamp-3 leading-relaxed">
                {art.summary}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-6 text-xs text-gray-400 dark:text-neutral-500 font-semibold border-t border-gray-100 dark:border-neutral-800 pt-4">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{timeAgo(art.publishDate || art.createdAt, lang)}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{art.views || 0}</span>
            {art.verificationStatus === 'verified' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-auto text-[11px]">
                ✓ যাচাইকৃত
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const SecondaryCard = ({ art, lang }) => {
  if (!art) return null;
  const img = imgSrc(art);
  return (
    <Link 
      to={`/article/${art.slug}`} 
      className="group flex flex-col justify-between bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
    >
      <div>
        {img && (
          <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-neutral-800">
            <img 
              src={img} 
              alt={art.title}
              loading="lazy" 
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              {art.category}
            </span>
          </div>
        )}
        <div className="p-4 space-y-2">
          {!img && (
            <span className="inline-block bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              {art.category}
            </span>
          )}
          <h3 className="text-sm sm:text-base font-extrabold text-gray-950 dark:text-neutral-100 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
            {art.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {art.summary}
          </p>
        </div>
      </div>
      <div className="p-4 pt-0 flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500 font-semibold border-t border-gray-100 dark:border-neutral-800/60 mt-2">
        <span>{timeAgo(art.publishDate || art.createdAt, lang)}</span>
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{art.views || 0}</span>
      </div>
    </Link>
  );
};

const CompactListCard = ({ art, lang }) => {
  if (!art) return null;
  const img = imgSrc(art);
  return (
    <Link 
      to={`/article/${art.slug}`} 
      className="group flex items-start space-x-3 p-3 rounded-xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-neutral-800/80 hover:bg-gray-50 dark:hover:bg-neutral-900/60 transition-colors"
    >
      {img && (
        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-neutral-800">
          <img src={img} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="flex-grow min-w-0">
        <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider block mb-0.5">
          {art.category}
        </span>
        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
          {art.title}
        </h4>
        <span className="text-[10px] text-gray-400 mt-1 block">
          {timeAgo(art.publishDate || art.createdAt, lang)}
        </span>
      </div>
    </Link>
  );
};

const Home = () => {
  const { language } = useLanguage();
  const [data, setData] = useState({
    leadArticle: null,
    breakingNews: [],
    topArticles: [],
    mostRead: [],
    multimediaArticles: [],
    activeStoryHub: null,
    layoutSections: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const res = await api.get('/articles/homepage');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepage();
  }, []);

  const { leadArticle, topArticles, mostRead, multimediaArticles, activeStoryHub, layoutSections } = data;

  // Split secondary top articles
  const secondaryTop = topArticles.filter(a => a._id !== leadArticle?._id).slice(0, 4);
  const compactTop = topArticles.filter(a => a._id !== leadArticle?._id).slice(4, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Top Header Banner Advertisement */}
      <AdPlacement placement="header" />

      {/* Active Major Developing Story Hub Banner */}
      {activeStoryHub && <StoryHubBanner hub={activeStoryHub} />}

      {/* ─── SECTION 1: LEAD STORY & TOP SPOTLIGHT ─── */}
      <section>
        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span>শীর্ষ সংবাদ ও বিশেষ কভারেজ</span>
        </div>

        {/* Big Lead Story Spotlight */}
        {leadArticle && (
          <div className="mb-6">
            <LeadStoryCard art={leadArticle} lang={language} />
          </div>
        )}

        {/* Secondary Top Stories Grid + Sidebar (Most Read & Poll) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Middle 8 cols: 4 Secondary Grid Cards */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {secondaryTop.map((art) => (
                <SecondaryCard key={art._id} art={art} lang={language} />
              ))}
            </div>

            {compactTop.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {compactTop.map((art) => (
                  <CompactListCard key={art._id} art={art} lang={language} />
                ))}
              </div>
            )}
          </div>

          {/* Right 4 cols: Most Read + Sidebar Ad + Poll */}
          <div className="lg:col-span-4 space-y-6">
            {/* Most Read Box */}
            <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center space-x-1.5 text-red-600 font-black text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>সর্বাধিক পঠিত</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Top 5</span>
              </div>
              <div className="space-y-3">
                {mostRead.map((art, idx) => (
                  <Link
                    key={art._id}
                    to={`/article/${art.slug}`}
                    className="group flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-neutral-800/60 last:border-0 last:pb-0"
                  >
                    <span className="text-2xl font-black text-red-600/60 dark:text-red-500/50 leading-none">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {timeAgo(art.publishDate || art.createdAt, language)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Ad Placement */}
            <AdPlacement placement="sidebar" />

            {/* Poll Widget */}
            <PollWidget />
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: "আমার এলাকার খবর" (LOCAL NEWS SELECTOR) ─── */}
      <section>
        <LocalNewsWidget />
      </section>

      {/* Middle Banner Advertisement */}
      <AdPlacement placement="homepage-mid" />

      {/* ─── SECTION 3: MULTIMEDIA & VIDEO CENTER ─── */}
      {multimediaArticles && multimediaArticles.length > 0 && (
        <section className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-600 rounded-xl text-white">
                <PlayCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">মাল্টিমিডিয়া ও ভিডিও হাব</h3>
                <p className="text-xs text-neutral-400">অন-গ্রাউন্ড অনুসন্ধানী ভিডিও, পডকাস্ট ও ফটো ফিচার</p>
              </div>
            </div>
            <Link to="/media-center" className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1">
              সব ভিডিও দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {multimediaArticles.map((art) => (
              <Link
                key={art._id}
                to={`/article/${art.slug}`}
                className="group flex flex-col justify-between bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-red-500/50 transition-all duration-300"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-neutral-800">
                    {art.featuredImage && (
                      <img 
                        src={imgSrc(art)} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                    </div>
                    {art.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {art.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-red-400 tracking-wider">
                      {art.multimediaType === 'podcast' ? 'পডকাস্ট' : (art.multimediaType === 'gallery' ? 'ফটো ফিচার' : 'ভিডিও সংবাদ')}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h4>
                  </div>
                </div>
                <div className="p-4 pt-0 text-[11px] text-neutral-500 border-t border-neutral-800/80 mt-2 flex items-center justify-between">
                  <span>{timeAgo(art.publishDate || art.createdAt, language)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{art.views || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── SECTION 4: CATEGORY STRIPS ─── */}
      {layoutSections && layoutSections.length > 0 && (
        <div className="space-y-10">
          {layoutSections.map((section, idx) => (
            <section key={idx} className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-5 bg-red-600 rounded-full" />
                  <h3 className="text-base sm:text-lg font-black text-gray-950 dark:text-white">
                    {section.category}
                  </h3>
                </div>
                <Link
                  to={`/category/${encodeURIComponent(section.category)}`}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  আরও সংবাদ <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.articles.map((art) => (
                  <SecondaryCard key={art._id} art={art} lang={language} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
