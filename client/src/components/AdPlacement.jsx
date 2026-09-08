import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { api } from '../utils/api';
import { ExternalLink, X } from 'lucide-react';

const API_HOST = import.meta.env.VITE_API_HOST || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

const parseImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${API_HOST}${url}`;
};

// Check local daily frequency cap per ad creative
const isFrequencyCapExceeded = (adId, cap = 3) => {
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
  const impressionRecorded = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAd = async () => {
      setLoading(true);
      try {
        const device = window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
        const catParam = category ? `&category=${encodeURIComponent(category)}` : '';
        const artParam = articleId ? `&articleId=${encodeURIComponent(articleId)}` : '';

        const res = await api.get(`/ads/serve?placement=${placement}${catParam}${artParam}&device=${device}`);

        if (isMounted && res.success && res.ad) {
          const fetchedAd = res.ad;
          
          // Check frequency cap
          if (fetchedAd._id && isFrequencyCapExceeded(fetchedAd._id, fetchedAd.frequencyCap || 4)) {
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

  // Reserved CLS Dimensions Container Styles
  const dimensionClasses = {
    header: 'w-full max-w-5xl min-h-[90px] sm:min-h-[110px] my-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs flex justify-center',
    sidebar: 'w-full max-w-sm min-h-[250px] sm:min-h-[350px] my-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs flex justify-center',
    'article-inline-1': 'w-full max-w-2xl min-h-[120px] sm:min-h-[160px] my-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs flex justify-center',
    'article-inline-2': 'w-full max-w-2xl min-h-[120px] sm:min-h-[160px] my-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs flex justify-center',
    'article-inline-3': 'w-full max-w-2xl min-h-[120px] sm:min-h-[160px] my-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs flex justify-center',
    article: 'w-full max-w-2xl min-h-[120px] sm:min-h-[160px] my-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs flex justify-center',
    'homepage-mid': 'w-full min-h-[100px] sm:min-h-[130px] my-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs flex justify-center',
    sticky: 'fixed bottom-0 left-0 right-0 bg-neutral-900/95 text-white z-40 py-2 border-t border-neutral-800 flex justify-center h-20 shadow-2xl',
    popup: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs'
  };

  const containerClass = dimensionClasses[placement] || dimensionClasses.article;

  // Loading skeleton state to prevent layout shift
  if (loading) {
    return (
      <div className={`${containerClass} bg-gray-50/70 dark:bg-neutral-900/40 animate-pulse flex items-center justify-center ${className} no-print`}>
        <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-neutral-600 font-bold">
          বিজ্ঞাপন লোড হচ্ছে...
        </span>
      </div>
    );
  }

  // Popup Modal Ad
  if (placement === 'popup') {
    return (
      <div className={containerClass}>
        <div className="relative bg-white dark:bg-[#121212] p-4 rounded-2xl max-w-lg w-11/12 border border-gray-200 dark:border-neutral-800 shadow-2xl">
          <button 
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 text-xs font-bold transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <a 
            href={ad.destinationUrl || ad.linkUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer sponsored" 
            onClick={handleAdClick}
            className="block overflow-hidden rounded-lg mt-4"
          >
            <img 
              src={parseImageUrl(ad.imageUrl)} 
              alt={ad.title} 
              className="w-full h-auto object-cover hover:scale-102 transition-transform duration-300" 
            />
          </a>
          <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-bold">
            <span>{ad.sponsorBadge || 'বিজ্ঞাপন'}</span>
            <span>{ad.advertiserName}</span>
          </div>
        </div>
      </div>
    );
  }

  // HTML / Script Creative (Safely Sanitized Sandbox)
  if (ad.creativeType === 'script' || (ad.type === 'script' && ad.scriptCode)) {
    return (
      <div className={`${containerClass} bg-white dark:bg-[#121212] relative overflow-hidden flex flex-col justify-center items-center ${className} no-print`}>
        <span className="absolute top-1 right-2 text-[9px] uppercase tracking-wider font-bold text-gray-400 dark:text-neutral-500 pointer-events-none">
          {ad.sponsorBadge || 'বিজ্ঞাপন'}
        </span>
        <div 
          className="w-full h-full flex justify-center items-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ad.scriptCode, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] }) }}
        />
      </div>
    );
  }

  // Native / In-Article Rich Creative Card
  if (ad.creativeType === 'native' || ad.creativeType === 'sponsored-card') {
    return (
      <div className={`w-full max-w-3xl my-6 p-4 rounded-2xl border border-red-200/60 dark:border-red-950/40 bg-gradient-to-r from-red-50/40 via-white to-gray-50 dark:from-red-950/10 dark:via-[#121212] dark:to-[#181818] shadow-xs flex flex-col sm:flex-row items-center gap-4 ${className} no-print`}>
        {ad.imageUrl && (
          <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-neutral-800">
            <img 
              src={parseImageUrl(ad.imageUrl)} 
              alt={ad.title}
              loading="lazy" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        <div className="flex-grow space-y-1 text-left w-full">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              {ad.sponsorBadge || 'স্পন্সরড'}
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">
              {ad.advertiserName || 'স্পন্সর পার্টনার'}
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-black text-gray-950 dark:text-white leading-tight">
            {ad.title}
          </h4>
          {ad.description && (
            <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2">
              {ad.description}
            </p>
          )}
        </div>
        <a 
          href={ad.destinationUrl || ad.linkUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer sponsored" 
          onClick={handleAdClick}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex-shrink-0 transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"
        >
          <span>{ad.ctaText || 'বিস্তারিত'}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  // Banner & Standard Display Ads
  return (
    <div className={`${containerClass} bg-gray-50 dark:bg-[#121212] relative overflow-hidden flex flex-col justify-center items-center ${className} no-print`}>
      <a 
        href={ad.destinationUrl || ad.linkUrl || '#'} 
        target="_blank" 
        rel="noopener noreferrer sponsored" 
        onClick={handleAdClick}
        className="w-full h-full block relative group"
      >
        {ad.imageUrl ? (
          <img 
            src={parseImageUrl(ad.imageUrl)} 
            alt={ad.title} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" 
          />
        ) : (
          <div className="p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-xs font-bold text-gray-900 dark:text-white">{ad.title}</span>
            {ad.description && <p className="text-[11px] text-gray-500 mt-1">{ad.description}</p>}
          </div>
        )}
      </a>
      {/* Visible Sponsored Badge */}
      <span className="absolute bottom-1 right-2 bg-black/75 backdrop-blur-xs text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest pointer-events-none">
        {ad.sponsorBadge || 'বিজ্ঞাপন'}
      </span>
    </div>
  );
};

export default AdPlacement;
