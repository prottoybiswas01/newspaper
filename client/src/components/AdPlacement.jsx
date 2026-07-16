import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const AdPlacement = ({ placement }) => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await api.get(`/ads?placement=${placement}`);
        if (res.success && res.ads.length > 0) {
          // Select one random active ad if multiple exist
          const selectedAd = res.ads[Math.floor(Math.random() * res.ads.length)];
          setAd(selectedAd);

          // Record impression
          await api.post(`/ads/${selectedAd._id}/impression`);
        }
      } catch (err) {
        console.error(`Ad fetch failed for placement ${placement}:`, err);
      }
    };
    fetchAd();
  }, [placement]);

  const handleAdClick = async () => {
    if (ad) {
      try {
        await api.post(`/ads/${ad._id}/click`);
      } catch (err) {
        console.error('Failed to log ad click:', err);
      }
    }
  };

  if (!ad) return null;

  // Handle Script/HTML Embed Ads
  if (ad.type === 'script') {
    return (
      <div 
        className="ad-container overflow-hidden flex justify-center my-4 no-print"
        dangerouslySetInnerHTML={{ __html: ad.scriptCode }}
      />
    );
  }

  // Handle Image Ads
  const dimensionsClass = {
    header: 'w-full max-w-5xl h-24 sm:h-28 my-4 rounded-xl border border-slate-200/60 dark:border-slate-800/40 shadow-sm overflow-hidden flex justify-center',
    sidebar: 'w-full max-w-sm h-[400px] sm:h-[500px] my-4 rounded-xl border border-slate-200/60 dark:border-slate-800/40 shadow-sm overflow-hidden flex justify-center',
    article: 'w-full max-w-2xl h-36 my-6 rounded-xl border border-slate-200/60 dark:border-slate-800/40 shadow-sm overflow-hidden flex justify-center',
    sticky: 'fixed bottom-0 left-0 right-0 bg-slate-900/90 dark:bg-slate-950/90 text-white z-40 py-2 border-t border-slate-800 flex justify-center h-20 shadow-xl',
    popup: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
  };

  if (placement === 'popup') {
    return (
      <div className={dimensionsClass.popup}>
        <div className="relative bg-white dark:bg-slate-950 p-4 rounded-2xl max-w-lg w-11/12 border border-slate-200 dark:border-slate-850 shadow-2xl">
          <button 
            onClick={() => setAd(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            ✕
          </button>
          <a 
            href={ad.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleAdClick}
            className="block overflow-hidden rounded-lg mt-4"
          >
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
          </a>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-2 block text-center">SPONSORED ADVERTISEMENT</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${dimensionsClass[placement]} relative bg-slate-100 dark:bg-slate-900/50 flex flex-col justify-center items-center no-print`}>
      <a 
        href={ad.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={handleAdClick}
        className="w-full h-full block"
      >
        <img 
          src={ad.imageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover hover:opacity-95 transition-opacity" 
        />
      </a>
      <span className="absolute bottom-1 right-2 bg-slate-950/60 text-white text-[8px] px-1 rounded-sm tracking-widest pointer-events-none">AD</span>
    </div>
  );
};

export default AdPlacement;
