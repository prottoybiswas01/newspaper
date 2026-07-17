import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import PollWidget from '../components/PollWidget';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Heart, Clock, PlayCircle, Image as ImageIcon, ChevronRight } from 'lucide-react';

// ── helpers ────────────────────────────────────────────────
const FALLBACK = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

const imgSrc = (art) => art?.featuredImage || FALLBACK;

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
const HeroCard = ({ art, lang }) => art ? (
  <Link to={`/article/${art.slug}`} className="group flex flex-col justify-between relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/40 hover:shadow-xl transition-shadow duration-300 h-full">
    <div>
      <div className="relative h-72 md:h-80 overflow-hidden">
        <img src={imgSrc(art)} alt={art.title}
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={e => { e.target.src = FALLBACK; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
          {art.category}
        </span>
      </div>
      <div className="p-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
          {art.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{art.summary}</p>
      </div>
    </div>
    <div className="p-4 pt-0">
      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800/40 pt-3">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(art.publishDate || art.createdAt, lang)}</span>
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{art.views || 0}</span>
        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{art.likes || 0}</span>
      </div>
    </div>
  </Link>
) : null;

/** Vertical secondary card (Image, Title, Summary, Meta) */
const SecondaryCard = ({ art, lang }) => art ? (
  <Link to={`/article/${art.slug}`} className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-700/40 overflow-hidden hover:shadow-md transition-all duration-300 h-full">
    <div>
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        <img src={imgSrc(art)} alt={art.title}
          loading="lazy" decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = FALLBACK; }} />
      </div>
      <div className="p-3.5 space-y-2">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {art.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {art.summary}
        </p>
      </div>
    </div>
    <div className="p-3.5 pt-0">
      <div className="text-[10px] text-slate-400 font-semibold mt-1">
        {timeAgo(art.publishDate || art.createdAt, lang)}
      </div>
    </div>
  </Link>
) : null;

/** Thumbnail row card */
const RowCard = ({ art, lang, index }) => art ? (
  <Link to={`/article/${art.slug}`} className="group flex gap-3 items-start py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 rounded-lg px-2 -mx-2 transition-colors">
    <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-lg">
      <img src={imgSrc(art)} alt={art.title}
        loading="lazy" decoding="async"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={e => { e.target.src = FALLBACK; }} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
        {art.title}
      </h3>
      <span className="text-[10px] text-slate-400 mt-1 block">{timeAgo(art.publishDate || art.createdAt, lang)}</span>
    </div>
  </Link>
) : null;

/** Grid card (image top, text below) */
const GridCard = ({ art, lang }) => art ? (
  <Link to={`/article/${art.slug}`} className="group block bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-700/40 overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative h-44 overflow-hidden">
      <img src={imgSrc(art)} alt={art.title}
        loading="lazy" decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={e => { e.target.src = FALLBACK; }} />
      <span className="absolute top-2 left-2 bg-blue-700/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
        {art.category}
      </span>
    </div>
    <div className="p-3.5">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {art.title}
      </h3>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-semibold">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(art.publishDate || art.createdAt, lang)}</span>
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{art.views || 0}</span>
      </div>
    </div>
  </Link>
) : null;

/** Section header with View More */
const SectionHead = ({ label, slug, lang }) => (
  <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-4">
    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
      <span className="block w-1 h-4 bg-red-600 rounded-full" />
      {label}
    </h2>
    <Link to={`/category/${slug}`} className="flex items-center gap-0.5 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline">
      {lang === 'bn' ? 'আরও' : 'More'} <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

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
        const [r1, r2, rc] = await Promise.all([
          api.get('/articles?limit=10&sort=latest'),
          api.get('/articles?limit=5&sort=popular'),
          api.get('/settings/homepage_layout').catch(() => null)
        ]);

        if (r1 && r1.success) {
          setTopArticles(r1.articles);
          setLatestArticles(r1.articles);
        }

        if (r2 && r2.success) {
          setMostRead(r2.articles);
        }

        let cfg = [];
        if (rc && rc.success && Array.isArray(rc.value) && rc.value.length > 0) {
          cfg = rc.value;
        }

        if (!cfg.length) {
          cfg = [
            { category: 'Bangladesh', layout: 'grid' },
            { category: 'Politics',   layout: 'hero' },
            { category: 'Sports',     layout: 'grid' },
            { category: 'Technology', layout: 'list' },
          ];
        }

        const sections = await Promise.all(cfg.map(async sec => {
          try {
            const limit = sec.layout === 'list' ? 5 : 4;
            const r = await api.get(`/articles?category=${encodeURIComponent(sec.category)}&limit=${limit}&sort=latest`);
            if (r.success && r.articles.length > 0)
              return { ...sec, articles: r.articles };
          } catch (_) {}
          return null;
        }));
        setLayoutSections(sections.filter(Boolean));
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
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hero skeleton */}
          <div className="lg:col-span-5 space-y-4">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
          </div>

          {/* Row list skeleton */}
          <div className="lg:col-span-4 space-y-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-20 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:col-span-3 space-y-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2 border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-0">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Grid Row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Header Ad */}
      <AdPlacement placement="header" />

      {/* ══ TOP SECTION: Hero (L) + Row cards (M) + Latest sidebar (R) ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Hero card — left 5/12 */}
        <div className="lg:col-span-5 flex">
          <HeroCard art={hero} lang={lang} />
        </div>

        {/* Middle strip: 3 secondary cards — middle 4/12 */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {secondary.map(art => (
            <SecondaryCard key={art._id} art={art} lang={lang} />
          ))}
        </div>

        {/* Right: Latest News sidebar — 3/12 */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-700/40 p-4">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b-2 border-red-600 pb-2 mb-3 uppercase tracking-wide">
            {lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
          </h2>
          <div className="space-y-0">
            {latestArticles.slice(0, 7).map((art, i) => (
              <div key={art._id} className="flex gap-2.5 items-start py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-base font-black text-slate-200 dark:text-slate-700 w-5 flex-shrink-0 leading-none">{String(i+1).padStart(2,'0')}</span>
                <div className="min-w-0">
                  <Link to={`/article/${art.slug}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 leading-snug block line-clamp-2 transition-colors">
                    {art.title}
                  </Link>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">{timeAgo(art.publishDate || art.createdAt, lang)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad strip */}
      <AdPlacement placement="mid" />

      {/* ══ 4-CARD GRID ROW ══ */}
      {gridRow.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {gridRow.map(art => <GridCard key={art._id} art={art} lang={lang} />)}
        </div>
      )}

      {/* ══ MAIN BODY: Dynamic sections (L 8/12) + Sidebar (R 4/12) ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: dynamic category sections */}
        <div className="lg:col-span-8 space-y-10">
          {layoutSections.map((sec, idx) => {
            const slug  = sec.category.toLowerCase().replace(/\s+/g,'-');
            const label = t(slug) || sec.category;
            return (
              <section key={`${sec.category}-${idx}`}>
                <SectionHead label={label} slug={slug} lang={lang} />

                {/* GRID: 2×2 cards */}
                {sec.layout === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {sec.articles.slice(0,4).map(a => <GridCard key={a._id} art={a} lang={lang} />)}
                  </div>
                )}

                {/* HERO: big card left + list right */}
                {sec.layout === 'hero' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <GridCard art={sec.articles[0]} lang={lang} />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/40 rounded-xl p-4 space-y-0">
                      {sec.articles.slice(1,5).map(a => (
                        <RowCard key={a._id} art={a} lang={lang} />
                      ))}
                    </div>
                  </div>
                )}

                {/* LIST: thumbnail rows */}
                {sec.layout === 'list' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/40 rounded-xl p-4 space-y-0">
                    {sec.articles.slice(0,5).map(a => (
                      <RowCard key={a._id} art={a} lang={lang} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {/* Media center */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl">
            <h2 className="text-base font-black border-b border-slate-700 pb-3 mb-4 flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-red-500" />
              {lang === 'bn' ? 'ভিডিও ও ছবি কেন্দ্র' : 'Media Center'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { img:'https://images.unsplash.com/photo-1540747737956-37872404af0b?w=400', label: lang==='bn'?'ক্রীড়া মাঠের সেরা মুহূর্তসমূহ':'Sports Best Moments', t:'video' },
                { img:'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=400', label: lang==='bn'?'পদ্মা সেতুর যোগাযোগ ভূমিকা':'Role of Padma Bridge', t:'video' },
                { img:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', label: lang==='bn'?'আকাশপথে বিমানের স্বপ্নযাত্রা':'Aviation Dreams', t:'photo' },
              ].map((m,i)=>(
                <div key={i} className="relative rounded-lg overflow-hidden group aspect-video">
                  <img src={m.img} alt={m.label}
                    loading="lazy" decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    {m.t==='video'
                      ? <PlayCircle className="h-10 w-10 text-white fill-red-600 stroke-none drop-shadow"/>
                      : <ImageIcon className="h-9 w-9 text-white drop-shadow"/>}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-bold truncate">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sidebar Ad */}
          <AdPlacement placement="sidebar" />

          {/* Poll */}
          <PollWidget />

          {/* Most Read */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/40 rounded-xl p-5">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b-2 border-red-600 pb-2 mb-4 uppercase tracking-wide">
              {lang === 'bn' ? 'পাঠকপ্রিয় সংবাদ' : 'Most Read'}
            </h2>
            <div className="space-y-0">
              {mostRead.map((art, i) => (
                <div key={art._id} className="flex gap-3 items-start py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-2xl font-black text-slate-100 dark:text-slate-800 leading-none w-7 flex-shrink-0">{i+1}</span>
                  <div className="min-w-0">
                    <Link to={`/article/${art.slug}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-red-600 leading-snug block line-clamp-2 transition-colors">
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Eye className="h-3 w-3"/>{art.views} {lang==='bn'?'বার পঠিত':'views'}
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
