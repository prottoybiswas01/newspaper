import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../utils/api';
import { Radio, Clock, CheckCircle2, FileText, ChevronRight, Share2, Flame, ArrowLeft } from 'lucide-react';
import AdPlacement from '../components/AdPlacement';

const StoryHubPage = () => {
  const { slug } = useParams();
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHub = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/story-hubs/${slug}`);
        if (res.success) {
          setHubData(res);
        }
      } catch (err) {
        console.error('Failed to load story hub:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHub();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded-xl w-2/3 mx-auto mb-6" />
        <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-2xl w-full mb-6" />
      </div>
    );
  }

  if (!hubData || !hubData.hub) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">স্টোরি হাব পাওয়া যায়নি</h2>
        <Link to="/" className="mt-4 inline-flex items-center text-red-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> মূল পাতায় ফিরে যান
        </Link>
      </div>
    );
  }

  const { hub, articles = [] } = hubData;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{hub.title} | বিশেষ স্টোরি হাব | দৈনিক দর্পণ</title>
        <meta name="description" content={hub.summary} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-neutral-400 mb-4">
        <Link to="/" className="hover:text-red-600">হোম</Link>
        <span>/</span>
        <span className="text-red-600 font-bold">স্টোরি হাব</span>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-6 sm:p-10 mb-8 border border-neutral-800 shadow-xl">
        {hub.coverImage && (
          <div className="absolute inset-0 z-0 opacity-25">
            <img src={hub.coverImage} alt={hub.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider animate-pulse">
              <Radio className="h-3.5 w-3.5" />
              <span>লাইভ বিশেষ কভারেজ</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
            {hub.title}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
            {hub.summary}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Updates & Attached Stories */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Updates Ticker */}
          {hub.liveUpdates && hub.liveUpdates.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-red-200 dark:border-red-950/40 shadow-xs">
              <div className="flex items-center space-x-2 text-xs font-black text-red-600 uppercase tracking-wider mb-4">
                <Flame className="h-4 w-4 fill-current" />
                <span>সর্বশেষ লাইভ আপডেট</span>
              </div>
              <div className="space-y-4 border-l-2 border-red-500 ml-2 pl-4">
                {hub.liveUpdates.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-white dark:border-neutral-900" />
                    <span className="text-[11px] font-extrabold text-red-600 dark:text-red-400 block">{item.time}</span>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-neutral-100 mt-1 leading-relaxed">
                      {item.text}
                    </p>
                    {item.author && (
                      <span className="text-[10px] text-gray-400 mt-1 block">— {item.author}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles in this Hub */}
          <div>
            <h2 className="text-xl font-black text-gray-950 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <span>এই ঘটনার বিস্তারিত প্রতিবেদনসমূহ ({articles.length})</span>
            </h2>

            {articles.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500 italic">এখনও কোনো প্রতিবেদন যুক্ত করা হয়নি।</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {articles.map((art) => (
                  <Link
                    key={art._id}
                    to={`/article/${art.slug}`}
                    className="group bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {art.featuredImage && (
                        <div className="h-40 overflow-hidden bg-gray-100 dark:bg-neutral-800">
                          <img 
                            src={art.featuredImage} 
                            alt={art.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider">
                          {art.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-gray-950 dark:text-white leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {art.title}
                        </h3>
                        {art.summary && (
                          <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2">
                            {art.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 pt-0 flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500 font-semibold border-t border-gray-100 dark:border-neutral-800/60 mt-2">
                      <span>{new Date(art.publishDate || art.createdAt).toLocaleDateString('bn-BD')}</span>
                      <span className="flex items-center gap-0.5 text-red-600 font-bold">পড়ুন <ChevronRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Key Facts & Timeline */}
        <div className="space-y-6">
          {/* Key Facts Box */}
          {hub.keyFacts && hub.keyFacts.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs">
              <h3 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <span>এক নজরে মূল পয়েন্টসমূহ</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-800 dark:text-neutral-200 leading-relaxed font-medium">
                {hub.keyFacts.map((fact, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          {hub.timeline && hub.timeline.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 shadow-xs">
              <h3 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-red-600" />
                <span>ঘটনাক্রম ও টাইমলাইন</span>
              </h3>
              <div className="space-y-4 border-l-2 border-red-500 ml-2 pl-3">
                {hub.timeline.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white dark:border-neutral-900" />
                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 block">{ev.time}</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{ev.title}</h4>
                    {ev.description && <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">{ev.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar Advertisement */}
          <AdPlacement placement="sidebar" />
        </div>
      </div>
    </div>
  );
};

export default StoryHubPage;
