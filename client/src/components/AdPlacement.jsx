import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { api } from '../utils/api';
import { ExternalLink, X, Megaphone, Sparkles } from 'lucide-react';

const API_HOST = import.meta.env.VITE_API_HOST || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

const parseImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${API_HOST}${url}`;
};

// Check local daily frequency cap per ad creative
const isFrequencyCapExceeded = (adId, cap = 8) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `ad_freq_${adId}_${today}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    return count >= cap;
  } catch (e) {
    return false;
  }
};

const recordLocalImpression = (adId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `ad_freq_${adId}_${today}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (count + 1).toString());
  } catch (e) {
    // Ignore storage errors
  }
};

const AdPlacement = ({ 
  placement = 'header', 
  category = '', 
  articleId = '',
  className = ''
}) => {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const impressionRecorded = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAd = async () => {
      setLoading(true);
      setImgError(false);
      try {
        const device = window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
        const catParam = category ? `&category=${encodeURIComponent(category)}` : '';
        const artParam = articleId ? `&articleId=${encodeURIComponent(articleId)}` : '';

        const res = await api.get(`/ads/serve?placement=${placement}${catParam}${artParam}&device=${device}`);

        if (isMounted && res.success && res.ad) {
          const fetchedAd = res.ad;
          
          // Check frequency cap only for non-house ads
          if (!fetchedAd.isHouseAd && fetchedAd._id && isFrequencyCapExceeded(fetchedAd._id, fetchedAd.frequencyCap || 8)) {
            setAd(null);
            setLoading(false);
            return;
          }

          setAd(fetchedAd);

          // Record impression telemetry only once
          if (!impressionRecorded.current && fetchedAd._id) {
            impressionRecorded.current = true;
            recordLocalImpression(fetchedAd._id);
            api.post(`/ads/${fetchedAd._id}/impression`).catch(() => null);
          }
        }
      } catch (err) {
        console.error(`Ad serving failed for ${placement}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAd();

    return () => {
      isMounted = false;
    };
  }, [placement, category, articleId]);

  const handleAdClick = () => {
    if (ad && ad._id) {
      api.post(`/ads/${ad._id}/click`).catch(() => null);
    }
  };

  if (dismissed || (!ad && !loading)) return null;

  // Reserved standard IAB news banner dimension constraints
  const dimensionClasses = {
    header: 'w-full max-w-6xl min-h-[80px] sm:min-h-[95px] md:min-h-[105px] my-4 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs flex justify-center items-center',
    'header-top': 'w-full max-w-6xl min-h-[80px] sm:min-h-[95px] md:min-h-[105px] my-4 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs flex justify-center items-center',
    sidebar: 'w-full max-w-[340px] min-h-[250px] sm:min-h-[280px] my-4 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs flex justify-center items-center',
    'sidebar-right': 'w-full max-w-[340px] min-h-[250px] sm:min-h-[280px] my-4 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs flex justify-center items-center',
    'sidebar-left': 'w-full max-w-[340px] min-h-[250px] sm:min-h-[280px] my-4 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs flex justify-center items-center',
    'article-inline-1': 'w-full max-w-3xl my-6 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs',
    'article-inline-2': 'w-full max-w-3xl my-6 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs',
    'article-inline-3': 'w-full max-w-3xl my-6 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs',
    article: 'w-full max-w-3xl my-6 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs',
    'homepage-mid': 'w-full max-w-6xl min-h-[85px] sm:min-h-[105px] my-6 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xs flex justify-center items-center',
    sticky: 'fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md text-white py-2.5 px-4 border-t border-neutral-800 shadow-2xl flex items-center justify-center',
    'sticky-bottom': 'fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md text-white py-2.5 px-4 border-t border-neutral-800 shadow-2xl flex items-center justify-center',
    popup: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4'
  };

  const containerClass = dimensionClasses[placement] || dimensionClasses.article;

  if (loading) {
    return null;
  }

  // 1. Popup Modal Ad
  if (placement === 'popup') {
    return (
      <div className={containerClass}>
        <div className="relative bg-white dark:bg-[#121212] p-5 rounded-3xl max-w-lg w-11/12 border border-gray-200 dark:border-neutral-800 shadow-2xl">
          <button 
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
          <a 
            href={ad.destinationUrl || ad.linkUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer sponsored" 
            onClick={handleAdClick}
            className="block overflow-hidden rounded-2xl mt-4 max-h-[300px]"
          >
            {ad.imageUrl && !imgError ? (
              <img 
                src={parseImageUrl(ad.imageUrl)} 
                alt={ad.title} 
                onError={() => setImgError(true)}
                className="w-full h-full max-h-[300px] object-cover hover:scale-102 transition-transform duration-300" 
              />
            ) : (
              <div className="p-6 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl text-center space-y-2">
                <h4 className="text-base font-black">{ad.title}</h4>
                {ad.description && <p className="text-xs opacity-90">{ad.description}</p>}
              </div>
            )}
          </a>
          <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold">
            <span className="bg-red-50 dark:bg-neutral-800 px-2 py-0.5 rounded text-red-600 dark:text-red-400 font-black">
              {ad.sponsorBadge || 'বিজ্ঞাপন'}
            </span>
            <span>{ad.advertiserName}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Floating Sticky Bottom Bar
  if (placement === 'sticky' || placement === 'sticky-bottom' || ad.creativeType === 'sticky-bottom') {
    return (
      <div className={`${dimensionClasses.sticky} ${className} no-print`}>
        <div className="max-w-6xl w-full flex items-center justify-between gap-4">
          <a
            href={ad.destinationUrl || ad.linkUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleAdClick}
            className="flex items-center gap-3 flex-1 overflow-hidden group"
          >
            {ad.imageUrl && !imgError && (
              <img
                src={parseImageUrl(ad.imageUrl)}
                alt={ad.title}
                onError={() => setImgError(true)}
                className="h-11 w-16 sm:h-12 sm:w-20 object-cover rounded-xl shrink-0 border border-white/10"
              />
            )}
            <div className="truncate">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded tracking-wider shrink-0">
                  {ad.sponsorBadge || 'বিজ্ঞাপন'}
                </span>
                <span className="text-[11px] text-gray-300 font-semibold truncate hidden sm:inline">
                  {ad.advertiserName}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-red-400 transition-colors truncate">
                {ad.title}
              </h4>
            </div>
          </a>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={ad.destinationUrl || ad.linkUrl || '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleAdClick}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-md"
            >
              <span>{ad.ctaText || 'অফারটি দেখুন'}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. HTML / Script Creative (Sanitized Sandbox)
  if (ad.creativeType === 'script' || (ad.type === 'script' && ad.scriptCode)) {
    return (
      <div className={`${containerClass} bg-white dark:bg-[#121212] relative overflow-hidden flex flex-col justify-center items-center ${className} no-print`}>
        <span className="absolute top-1 right-2 text-[9px] uppercase tracking-wider font-bold text-gray-400 dark:text-neutral-500 pointer-events-none z-10">
          {ad.sponsorBadge || 'বিজ্ঞাপন'}
        </span>
        <div 
          className="w-full h-full flex justify-center items-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ad.scriptCode, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] }) }}
        />
      </div>
    );
  }

  // 4. In-Article & Native Sponsored Creative Cards (লাইনের মাঝখানে / লেখার মাঝখানে)
  const isInlineOrNative = 
    ad.creativeType === 'in-article' || 
    ad.creativeType === 'native' || 
    ad.creativeType === 'sponsored-card' ||
    ad.creativeType === 'sponsored-content' ||
    placement.startsWith('article-inline-');

  if (isInlineOrNative) {
    return (
      <div className={`w-full max-w-3xl my-6 p-4 sm:p-5 rounded-2xl border border-red-200/80 dark:border-red-950/40 bg-gradient-to-r from-red-50/50 via-white to-gray-50/70 dark:from-red-950/20 dark:via-[#121212] dark:to-[#181818] shadow-xs flex flex-col sm:flex-row items-center gap-4 ${className} no-print`}>
        {ad.imageUrl && !imgError && (
          <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <img 
              src={parseImageUrl(ad.imageUrl)} 
              alt={ad.title}
              onError={() => setImgError(true)}
              loading="lazy" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        <div className="flex-grow space-y-1.5 text-left w-full">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              {ad.sponsorBadge || 'স্পন্সরড'}
            </span>
            <span className="text-xs font-bold text-gray-600 dark:text-neutral-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {ad.advertiserName || 'স্পন্সর পার্টনার'}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-black text-gray-950 dark:text-white leading-snug">
            {ad.title}
          </h4>
          {ad.description && (
            <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {ad.description}
            </p>
          )}
        </div>
        <a 
          href={ad.destinationUrl || ad.linkUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer sponsored" 
          onClick={handleAdClick}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shrink-0 transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-md cursor-pointer"
        >
          <span>{ad.ctaText || 'বিস্তারিত জানুন'}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  // 5. Sidebar Column Cards & Standard Display Banners (ডানে/বায়ে বা সাইডবার ৩০০x২৫০)
  if (placement.startsWith('sidebar')) {
    return (
      <div className={`w-full max-w-[340px] my-5 mx-auto rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#121212] overflow-hidden shadow-xs ${className} no-print`}>
        <div className="relative group">
          <a
            href={ad.destinationUrl || ad.linkUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleAdClick}
            className="block overflow-hidden"
          >
            {ad.imageUrl && !imgError ? (
              <div className="h-44 sm:h-48 overflow-hidden bg-gray-100 dark:bg-neutral-800">
                <img
                  src={parseImageUrl(ad.imageUrl)}
                  alt={ad.title}
                  onError={() => setImgError(true)}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="p-5 bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white flex flex-col justify-center min-h-[160px]">
                <Megaphone className="h-6 w-6 text-white/80 mb-2" />
                <h4 className="text-sm font-black leading-tight">{ad.title}</h4>
              </div>
            )}
          </a>
          <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest pointer-events-none">
            {ad.sponsorBadge || 'বিজ্ঞাপন'}
          </span>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
            <span>{ad.advertiserName || 'বিজ্ঞাপনদাতা'}</span>
            <span className="text-red-600 dark:text-red-400">অফার</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white leading-snug line-clamp-2">
            {ad.title}
          </h4>
          {ad.description && (
            <p className="text-[11px] text-gray-600 dark:text-neutral-400 line-clamp-2">
              {ad.description}
            </p>
          )}
          <a
            href={ad.destinationUrl || ad.linkUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleAdClick}
            className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <span>{ad.ctaText || 'বিস্তারিত জানুন'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  // 6. Header Top / Homepage Mid Leaderboard Banner (উপরের দিকে ও মাঝের ব্যানার)
  return (
    <div className={`${containerClass} bg-gradient-to-r from-gray-50 via-white to-gray-100 dark:from-[#141414] dark:via-[#121212] dark:to-[#181818] relative overflow-hidden flex flex-col justify-center items-center ${className} no-print`}>
      <a 
        href={ad.destinationUrl || ad.linkUrl || '#'} 
        target="_blank" 
        rel="noopener noreferrer sponsored" 
        onClick={handleAdClick}
        className="w-full h-full block relative group overflow-hidden"
      >
        {ad.imageUrl && !imgError ? (
          <img 
            src={parseImageUrl(ad.imageUrl)} 
            alt={ad.title} 
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
            className="w-full h-full min-h-[80px] object-cover group-hover:opacity-95 transition-opacity" 
          />
        ) : (
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left h-full gap-3">
            <div>
              <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">{ad.title}</span>
              {ad.description && <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 line-clamp-1">{ad.description}</p>}
            </div>
            <span className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl shrink-0">
              {ad.ctaText || 'অফার দেখুন'}
            </span>
          </div>
        )}
      </a>
      {/* Visible Sponsored Badge */}
      <span className="absolute bottom-1.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest pointer-events-none z-10">
        {ad.sponsorBadge || 'বিজ্ঞাপন'}
      </span>
    </div>
  );
};

export default AdPlacement;
