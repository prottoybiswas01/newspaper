import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Flame } from 'lucide-react';

const BreakingTicker = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/articles?limit=5&sort=latest');
        if (res.success) {
          setArticles(res.articles);
        }
      } catch (err) {
        console.error('Ticker fetch failed:', err);
      }
    };
    fetchLatest();
  }, []);

  if (articles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden flex items-center relative z-20 no-print">
      {/* Ticker Title */}
      <div className="bg-red-700 px-4 py-1 flex items-center space-x-1 text-xs font-black uppercase tracking-wider relative z-30 shadow-[4px_0_12px_rgba(0,0,0,0.15)] shrink-0">
        <Flame className="h-4.5 w-4.5 fill-current animate-pulse text-yellow-300" />
        <span>ব্রেকিং নিউজ</span>
      </div>

      {/* Scrolling text container */}
      <div className="relative w-full flex items-center">
        <div className="animate-ticker flex space-x-12 pl-6 font-semibold text-sm">
          {articles.map((art) => (
            <Link 
              key={art._id} 
              to={`/article/${art.slug}`} 
              className="hover:underline transition duration-200 inline-flex items-center space-x-2"
            >
              <span className="text-yellow-300">•</span>
              <span>{art.title}</span>
            </Link>
          ))}
          {/* Duplicate headlines to ensure continuous looping */}
          {articles.map((art) => (
            <Link 
              key={`${art._id}-dup`} 
              to={`/article/${art.slug}`} 
              className="hover:underline transition duration-200 inline-flex items-center space-x-2"
            >
              <span className="text-yellow-300">•</span>
              <span>{art.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakingTicker;
