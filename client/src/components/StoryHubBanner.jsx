import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ChevronRight, Clock, Flame } from 'lucide-react';

const StoryHubBanner = ({ hub }) => {
  if (!hub || !hub.active) return null;

  return (
    <div className="my-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-800 text-white p-5 shadow-lg relative overflow-hidden group">
      {/* Background decorative pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 bg-white/20 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider animate-pulse">
              <Radio className="h-3 w-3 text-red-200" />
              <span>চলমান বিশেষ কভারেজ</span>
            </span>
            {hub.isBreaking && (
              <span className="flex items-center space-x-0.5 bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                <Flame className="h-3 w-3 fill-current" />
                <span>ব্রেকিং ইভেন্ট</span>
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-2xl font-black leading-tight tracking-tight">
            {hub.title}
          </h3>

          {hub.summary && (
            <p className="text-xs sm:text-sm text-red-100 line-clamp-2 leading-relaxed">
              {hub.summary}
            </p>
          )}

          {/* Key Facts snippet */}
          {hub.keyFacts && hub.keyFacts.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-red-100 font-medium">
              {hub.keyFacts.slice(0, 2).map((fact, idx) => (
                <span key={idx} className="bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                  • {fact}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Link */}
        <Link
          to={`/story-hub/${hub.slug}`}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm shadow-md transition-all flex-shrink-0 self-start md:self-center"
        >
          <span>পূর্ণাঙ্গ হাব দেখুন</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default StoryHubBanner;
