import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { MapPin, ChevronRight, Clock, Eye, Sparkles } from 'lucide-react';

const BD_DIVISIONS = {
  'ঢাকা': ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'মুন্সীগঞ্জ', 'মানিকগঞ্জ', 'নরসিংদী', 'টাঙ্গাইল', 'ফরিদপুর', 'গোপালগঞ্জ', 'মাদারীপুর', 'শরীয়তপুর', 'রাজবাড়ী', 'কিশোরগঞ্জ'],
  'চট্টগ্রাম': ['চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'ফেনী', 'নোয়াখালী', 'লক্ষ্মীপুর', 'রাঙ্গামাটি', 'খাগড়াছড়ি', 'বান্দরবান'],
  'রাজশাহী': ['রাজশাহী', 'বগুড়া', 'পাবনা', 'সিরাজগঞ্জ', 'নাটোর', 'নওগাঁ', 'চাঁপাইনবাবগঞ্জ', 'জয়পুরহাট'],
  'খুলনা': ['খুলনা', 'যশোর', 'বাগেরহাট', 'সাতক্ষীরা', 'কুষ্টিয়া', 'ঝিনাইদহ', 'মাগুরা', 'নড়াইল', 'মেহেরপুর', 'চুয়াডাঙ্গা'],
  'সিলেট': ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'],
  'বরিশাল': ['বরিশাল', 'পটুয়াখালী', 'ভোলা', 'পিরোজপুর', 'বরগুনা', 'ঝালকাঠি'],
  'রংপুর': ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'গাইবান্ধা', 'নীলফামারী', 'পঞ্চগড়', 'ঠাকুরগাঁও', 'লালমনিরহাট'],
  'ময়মনসিংহ': ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা', 'শেরপুর']
};

const LocalNewsWidget = () => {
  const [division, setDivision] = useState(() => localStorage.getItem('user_local_division') || 'ঢাকা');
  const [district, setDistrict] = useState(() => localStorage.getItem('user_local_district') || 'ঢাকা');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_local_division', division);
    localStorage.setItem('user_local_district', district);

    const fetchLocalNews = async () => {
      setLoading(true);
      try {
        // Priority 1: Exact district match
        let localArticles = [];
        if (district) {
          const resDist = await api.get(`/articles?district=${encodeURIComponent(district)}&limit=4`);
          if (resDist.success && resDist.articles && resDist.articles.length > 0) {
            localArticles = resDist.articles;
          }
        }

        // Priority 2: Division match if district has no news
        if (localArticles.length === 0 && division) {
          const resDiv = await api.get(`/articles?division=${encodeURIComponent(division)}&limit=4`);
          if (resDiv.success && resDiv.articles && resDiv.articles.length > 0) {
            localArticles = resDiv.articles;
          }
        }

        // Priority 3: Fallback to general Bangladesh news
        if (localArticles.length === 0) {
          const fallbackRes = await api.get(`/articles?category=বাংলাদেশ&limit=4`);
          if (fallbackRes.success && fallbackRes.articles) {
            localArticles = fallbackRes.articles;
          }
        }

        setArticles(localArticles);
      } catch (err) {
        console.error('Local news fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalNews();
  }, [division, district]);

  const handleDivisionChange = (newDiv) => {
    setDivision(newDiv);
    const districts = BD_DIVISIONS[newDiv] || [];
    setDistrict(districts[0] || '');
  };

  const availableDistricts = BD_DIVISIONS[division] || [];

  return (
    <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs">
      {/* Header & Location Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-950 dark:text-white">
              আমার এলাকার খবর
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
              আপনার বিভাগ ও জেলা নির্বাচন করে স্থানীয় সংবাদ পড়ুন
            </p>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={division}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-gray-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            {Object.keys(BD_DIVISIONS).map((div) => (
              <option key={div} value={div}>{div} বিভাগ</option>
            ))}
          </select>

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-gray-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            {availableDistricts.map((dis) => (
              <option key={dis} value={dis}>{dis}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Local Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-neutral-800 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-neutral-500 text-center py-6">
          এই এলাকার কোনো সংবাদ পাওয়া যায়নি।
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((art) => (
            <Link
              key={art._id}
              to={`/article/${art.slug}`}
              className="group flex flex-col justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-neutral-900/40 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-gray-200/60 dark:border-neutral-800/60 hover:border-red-300 dark:hover:border-red-900/50 transition-all duration-300"
            >
              <div>
                {art.featuredImage && (
                  <div className="relative h-28 rounded-lg overflow-hidden mb-2.5 bg-gray-200 dark:bg-neutral-800">
                    <img 
                      src={art.featuredImage} 
                      alt={art.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {art.district || art.division || district}
                    </span>
                  </div>
                )}
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-neutral-100 line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {art.title}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400 dark:text-neutral-500 border-t border-gray-100 dark:border-neutral-800 pt-2">
                <span>{new Date(art.publishDate || art.createdAt).toLocaleDateString('bn-BD')}</span>
                <span className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                  পড়ুন <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalNewsWidget;
