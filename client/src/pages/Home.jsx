import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import PollWidget from '../components/PollWidget';
import CategoryMegaMenu from '../components/CategoryMegaMenu';
import ErrorBoundary from '../components/ErrorBoundary';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Heart, Clock, PlayCircle, Image as ImageIcon, ChevronRight, Inbox, Camera } from 'lucide-react';

// ── helpers ────────────────────────────────────────────────
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
  if (diff < 60)   return lang === 'bn' ? 'এইমাত্র' : 'Just now';
  if (diff < 3600) return lang === 'bn' ? `${Math.floor(diff/60)} মিনিট আগে` : `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return lang === 'bn' ? `${Math.floor(diff/3600)} ঘণ্টা আগে` : `${Math.floor(diff/3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  return new Date(dateStr).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day:'numeric', month:'short' });
};

// ── sub-components ─────────────────────────────────────────

/** Big featured card (top-left hero) */
const HeroCard = ({ art, lang }) => {
  if (!art) return null;
  const img = imgSrc(art);
  return (
    <Link to={`/article/${art.slug}`} className="group block relative overflow-hidden rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 hover:shadow-xl transition-shadow duration-300 w-full">
      {img && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img src={img} alt={art.title}
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => { e.target.style.display = 'none'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
            {art.category}
          </span>
        </div>
      )}
      <div className="p-4">
        {!img && (
          <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider mb-2.5">
            {art.category}
          </span>
        )}
        <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-neutral-100 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-3">
          {art.title}
        </h2>
        <p className="text-xs text-gray-600 dark:text-neutral-400 mt-2 line-clamp-2">{art.summary}</p>
        <div className="flex items-center gap-3 mt-4 text-[11px] text-gray-400 dark:text-neutral-500 font-semibold border-t border-gray-100 dark:border-neutral-800 pt-3">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(art.publishDate || art.createdAt, lang)}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{art.views || 0}</span>
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{art.likes || 0}</span>
        </div>
      </div>
    </Link>
  );
};

/** Vertical secondary card (Image, Title, Summary, Meta) */
const SecondaryCard = ({ art, lang }) => {
  if (!art) return null;
  const img = imgSrc(art);
  return (
    <Link to={`/article/${art.slug}`} className="group flex flex-col justify-between bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-all duration-300 h-full">
      <div>
        {img && (
          <div className="relative h-40 overflow-hidden flex-shrink-0">
            <img src={img} alt={art.title}
              loading="lazy" decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.style.display = 'none'; }} />
          </div>
        )}
        <div className="p-3.5 space-y-2">
          {!img && (
            <span className="inline-block bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              {art.category}
            </span>
          )}
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-neutral-100 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
            {art.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {art.summary}
          </p>
        </div>
      </div>
      <div className="p-3.5 pt-0">
        <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold mt-1">
          {timeAgo(art.publishDate || art.createdAt, lang)}
        </div>
      </div>
    </Link>
  );
};

/** Thumbnail row card */
const RowCard = ({ art, lang, index }) => {
  if (!art) return null;
  const img = imgSrc(art);
  return (
    <Link to={`/article/${art.slug}`} className="group flex gap-3 items-start py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800/40 rounded-lg px-2 -mx-2 transition-colors">
      {img && (
        <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={img} alt={art.title}
            loading="lazy" decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-800 dark:text-neutral-200 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
          {art.title}
        </h3>
        <span className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1 block">
          {timeAgo(art.publishDate || art.createdAt, lang)}
          {index !== undefined && <span className="text-red-500 font-black ml-2">#{index + 1}</span>}
        </span>
      </div>
    </Link>
  );
};

/** Grid card (image top, text below) */
const GridCard = ({ art, lang }) => {
  if (!art) return null;
  const img = imgSrc(art);
  return (
    <Link to={`/article/${art.slug}`} className="group flex flex-col justify-between bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-shadow h-full">
      <div>
        {img && (
          <div className="relative h-44 overflow-hidden">
            <img src={img} alt={art.title}
              loading="lazy" decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.style.display = 'none'; }} />
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              {art.category}
            </span>
          </div>
        )}
        <div className="p-3.5">
          {!img && (
            <span className="inline-block bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider mb-2">
              {art.category}
            </span>
          )}
          <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 leading-snug line-clamp-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {art.title}
          </h3>
        </div>
      </div>
      <div className="p-3.5 pt-0">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-neutral-500 font-semibold">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(art.publishDate || art.createdAt, lang)}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{art.views || 0}</span>
        </div>
      </div>
    </Link>
  );
};

/** Section header with View More */
const SectionHead = ({ label, slug, lang }) => (
  <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-4">
    <h2 className="text-sm sm:text-base font-black text-gray-950 dark:text-white uppercase tracking-wide flex items-center gap-2">
      <span className="block w-1.5 h-4 bg-red-600 rounded-xs" />
      {label}
    </h2>
    <Link to={`/category/${slug}`} className="flex items-center gap-0.5 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline">
      {lang === 'bn' ? 'আরও' : 'More'} <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

/** Prothom-Alo Style Photo Gallery Section (PDF Page 3) */
const PhotoGallerySection = ({ articles = [], lang }) => {
  const photoArticles = articles.filter(a => a.featuredImage).slice(0, 5);
  if (photoArticles.length === 0) return null;

  const featured = photoArticles[0];
  const sidePhotos = photoArticles.slice(1, 5);
  const featuredImg = imgSrc(featured);

  return (
    <section className="bg-slate-50 dark:bg-[#121212] p-5 sm:p-7 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-950 dark:text-white tracking-tight">
              {lang === 'bn' ? 'ফটো গ্যালারি' : 'Photo Gallery'}
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
              {lang === 'bn' ? 'ছবির গল্প ও আলোচিত মুহূর্ত' : 'Stories in Pictures'}
            </p>
          </div>
        </div>

        <Link 
          to="/category/photo" 
          className="flex items-center space-x-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-700 shadow-xs"
        >
          <span>{lang === 'bn' ? 'আরও' : 'More'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Gallery Grid: Big Hero (L) + 4 Mini Cards (R) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Big Featured Photo Card */}
        {featured && (
          <div className="lg:col-span-7">
            <Link 
              to={`/article/${featured.slug}`} 
              className="group relative block h-80 sm:h-96 rounded-xl overflow-hidden shadow-md bg-neutral-900"
            >
              {featuredImg && (
                <img 
                  src={featuredImg} 
                  alt={featured.title} 
                  loading="lazy" 
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              )}
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              {/* Photo Count Badge (Top-Left) */}
              <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                <Camera className="h-3 w-3 text-red-400" />
                <span>১/{photoArticles.length} ছবি</span>
              </div>

              {/* Title & Description (Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1.5 text-white">
                <span className="inline-block px-2 py-0.5 rounded-sm bg-red-600 text-[10px] font-black uppercase tracking-wider">
                  {featured.category}
                </span>
                <h3 className="text-base sm:text-lg font-black leading-snug group-hover:text-red-300 transition-colors line-clamp-2">
                  {featured.title}
                </h3>
                {featured.summary && (
                  <p className="text-xs text-neutral-300 line-clamp-2 hidden sm:block">
                    {featured.summary}
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Right: 4 Smaller Photo Cards (2x2 Grid) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
          {sidePhotos.map((art, idx) => {
            const sideImg = imgSrc(art);
            return (
              <Link 
                key={art._id || idx} 
                to={`/article/${art.slug}`} 
                className="group flex flex-col bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video sm:h-28 overflow-hidden bg-neutral-800">
                  {sideImg && (
                    <img 
                      src={sideImg} 
                      alt={art.title} 
                      loading="lazy" 
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  )}
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1 border border-white/10">
                    <Camera className="h-2.5 w-2.5 text-red-400" />
                    <span>১টি ছবি</span>
                  </div>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1 block">
                    {timeAgo(art.publishDate || art.createdAt, lang)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* Bottom CTA Button (PDF Page 3: সব ছবি দেখুন) */}
      <div className="pt-2 text-center">
        <Link 
          to="/category/photo" 
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black transition-transform hover:scale-105 shadow-md shadow-red-600/20"
        >
          <Camera className="h-4 w-4" />
          <span>{lang === 'bn' ? 'সব ছবি দেখুন' : 'View All Photos'}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

// ── main component ──────────────────────────────────────────
const Home = () => {
  const [topArticles, setTopArticles]       = useState([]);   // first 10 latest (for top grid)
  const [latestArticles, setLatestArticles] = useState([]);   // sidebar latest
  const [mostRead, setMostRead]             = useState([]);
  const [layoutSections, setLayoutSections] = useState([]);
  const [loading, setLoading]               = useState(true);
  const { language: lang, t } = useLanguage();

  // analytics ping
  useEffect(() => {
    api.post('/analytics/log', {
      path: '/',
      device: window.innerWidth < 768 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop',
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/articles/homepage');
        if (res.success) {
          setTopArticles(res.topArticles || []);
          setLatestArticles(res.topArticles || []);
          setMostRead(res.mostRead || []);
          setLayoutSections(res.layoutSections || []);
        }
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // derive hero + grid articles from topArticles
  const hero       = topArticles[0] || null;
  const secondary  = topArticles.slice(1, 4);   // 3 row-cards next to hero
  const gridRow    = topArticles.slice(4, 8);   // 4-card grid below

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-pulse">
        {/* Header Ad skeleton */}
        <div className="h-24 bg-gray-100 dark:bg-neutral-800 rounded-2xl w-full" />

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="h-72 bg-gray-100 dark:bg-neutral-800 rounded-xl" />
            <div className="h-6 bg-gray-100 dark:bg-neutral-800 rounded-md w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-neutral-800 rounded-md w-full" />
          </div>
          <div className="lg:col-span-4 space-y-4 p-4 bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-neutral-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-20 h-16 bg-gray-100 dark:bg-neutral-800 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-neutral-800 rounded-md w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-3 space-y-4 p-4 bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-neutral-800">
            <div className="h-5 bg-gray-100 dark:bg-neutral-800 rounded-md w-1/2 mb-4" />
          </div>
        </div>
      </main>
    );
  }

  if (topArticles.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AdPlacement placement="header" />
        <div className="text-center py-20 bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-2xl">
          <Inbox className="h-12 w-12 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-1">
            {lang === 'bn' ? 'বর্তমানে কোনো প্রকাশিত সংবাদ নেই' : 'No Published News Available'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {lang === 'bn' ? 'অ্যাডমিন বা রিপোর্টার দ্বারা সংবাদ প্রকাশিত হলে তা এখানে স্বয়ংক্রিয়ভাবে দেখাবে।' : 'Articles will show up here as soon as published.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* ═══ SECTION PARTITION: Header Advertisement ═══ */}
      <ErrorBoundary isSection={true} sectionName="হেডার বিজ্ঞাপন">
        <AdPlacement placement="header" />
      </ErrorBoundary>

      {/* ═══ SECTION PARTITION: Top Hero & Latest News Grid ═══ */}
      <ErrorBoundary isSection={true} sectionName="প্রধান সংবাদ ও সর্বশেষ তালিকা">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Hero card — left 5/12 */}
          <div className="lg:col-span-5">
            <HeroCard art={hero} lang={lang} />
          </div>

          {/* Middle strip: 3 secondary cards — middle 4/12 */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {secondary.map(art => (
              <SecondaryCard key={art._id} art={art} lang={lang} />
            ))}
          </div>

          {/* Right: Latest News sidebar — 3/12 */}
          <div className="lg:col-span-3 bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-neutral-100 uppercase tracking-wide">
                {lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
              </h2>
              <Link to="/category/latest" className="text-[10px] font-bold text-red-600 hover:underline flex items-center">
                {lang === 'bn' ? 'আরও' : 'More'} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-0">
              {latestArticles.slice(0, 7).map((art, i) => (
                <div key={art._id} className="flex gap-2.5 items-start py-2.5 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                  <span className="text-base font-black text-gray-300 dark:text-neutral-700 w-5 flex-shrink-0 leading-none">{String(i+1).padStart(2,'0')}</span>
                  <div className="min-w-0">
                    <Link to={`/article/${art.slug}`} className="text-xs font-bold text-gray-800 dark:text-neutral-200 hover:text-red-600 dark:hover:text-red-400 leading-snug block line-clamp-2 transition-colors">
                      {art.title}
                    </Link>
                    <span className="text-[9px] text-gray-400 dark:text-neutral-500 mt-0.5 block">{timeAgo(art.publishDate || art.createdAt, lang)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* ═══ SECTION PARTITION: Middle Advertisement ═══ */}
      <ErrorBoundary isSection={true} sectionName="মধ্যবর্তী বিজ্ঞাপন">
        <AdPlacement placement="mid" />
      </ErrorBoundary>

      {/* ═══ SECTION PARTITION: 4-Card Grid Row ═══ */}
      {gridRow.length > 0 && (
        <ErrorBoundary isSection={true} sectionName="সংবাদ গ্রিড বিভাগ">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {gridRow.map(art => <GridCard key={art._id} art={art} lang={lang} />)}
          </div>
        </ErrorBoundary>
      )}

      {/* ═══ SECTION PARTITION: Photo Gallery Section (Prothom-Alo Style) ═══ */}
      <ErrorBoundary isSection={true} sectionName="ছবি গ্যালারি বিভাগ">
        <PhotoGallerySection articles={topArticles} lang={lang} />
      </ErrorBoundary>

      {/* ═══ SECTION PARTITION: Category Sections & Interactive Sidebar ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Dynamic category sections */}
        <div className="lg:col-span-8 space-y-10">
          <ErrorBoundary isSection={true} sectionName="ক্যাটাগরি ভিত্তিক সংবাদ">
            <div className="space-y-10">
              {layoutSections.map((sec, idx) => {
                const slug  = sec.category.toLowerCase().replace(/\s+/g,'-');
                const label = t(slug) || sec.category;
                return (
                  <section key={`${sec.category}-${idx}`} className="bg-white dark:bg-[#121212] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800">
                    <SectionHead label={label} slug={slug} lang={lang} />

                    {/* Prothom-Alo Style Layout: Big featured left + 4-Grid right */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-6">
                        <GridCard art={sec.articles[0]} lang={lang} />
                      </div>
                      <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {sec.articles.slice(1, 5).map(a => (
                          <SecondaryCard key={a._id} art={a} lang={lang} />
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </ErrorBoundary>

          {/* Media Center / Video block */}
          {topArticles.filter(a => a.videoUrl).length > 0 && (
            <ErrorBoundary isSection={true} sectionName="ভিডিও গ্যালারি">
              <div className="bg-[#111111] text-white p-5 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                  <h2 className="text-base font-black flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-red-500" />
                    <span>{lang === 'bn' ? 'ভিডিও গ্যালারি' : 'Video Gallery'}</span>
                  </h2>
                  <Link to="/media-center" className="text-xs font-bold text-red-400 hover:underline flex items-center">
                    {lang === 'bn' ? 'সব ভিডিও' : 'All Videos'} <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topArticles.filter(a => a.videoUrl).slice(0, 3).map((art) => {
                    const img = imgSrc(art);
                    return (
                      <Link key={art._id} to={`/article/${art.slug}`} className="relative rounded-lg overflow-hidden group aspect-video bg-neutral-900 block">
                        {img && (
                          <img src={img} alt={art.title}
                            loading="lazy" decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <PlayCircle className="h-10 w-10 text-white fill-red-600 stroke-none drop-shadow"/>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 text-xs font-bold truncate">{art.title}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ErrorBoundary>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sidebar Ad */}
          <ErrorBoundary isSection={true} sectionName="সাইডবার বিজ্ঞাপন">
            <AdPlacement placement="sidebar" />
          </ErrorBoundary>

          {/* Poll Widget */}
          <ErrorBoundary isSection={true} sectionName="অনলাইন জরিপ ও মতামত">
            <PollWidget />
          </ErrorBoundary>

          {/* Most Read Sidebar */}
          <ErrorBoundary isSection={true} sectionName="পাঠকপ্রিয় সংবাদ তালিকা">
            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-xl p-5">
              <h2 className="text-sm font-black text-gray-900 dark:text-neutral-100 border-b-2 border-red-600 pb-2 mb-4 uppercase tracking-wide">
                {lang === 'bn' ? 'পাঠকপ্রিয় সংবাদ' : 'Most Read'}
              </h2>
              <div className="space-y-0">
                {mostRead.map((art, i) => (
                  <div key={art._id} className="flex gap-3 items-start py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                    <span className="text-2xl font-black text-gray-200 dark:text-neutral-800 leading-none w-7 flex-shrink-0">{i+1}</span>
                    <div className="min-w-0">
                      <Link to={`/article/${art.slug}`} className="text-sm font-bold text-gray-800 dark:text-neutral-200 hover:text-red-600 leading-snug block line-clamp-2 transition-colors">
                        {art.title}
                      </Link>
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                        <Eye className="h-3 w-3"/>{art.views} {lang==='bn'?'বার পঠিত':'views'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </main>
  );
};

export default Home;
