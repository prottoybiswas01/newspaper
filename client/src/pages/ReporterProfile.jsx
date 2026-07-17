import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Calendar, Mail, FileText, ArrowLeft, Facebook, Twitter, Linkedin } from 'lucide-react';

const ReporterProfile = () => {
  const { id } = useParams();
  const [reporter, setReporter] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/auth/reporters/${id}`);
        if (res.success) {
          setReporter(res.reporter);
          setArticles(res.articles);
        }
      } catch (err) {
        console.error('Failed to load reporter details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto mb-4" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto mb-3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  if (!reporter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-700">রিপোর্টার খুঁজে পাওয়া যায়নি।</h2>
        <Link to="/" className="text-blue-600 hover:underline">হোমপেজে ফিরে যান</Link>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>হোমপেজে ফিরে যান</span>
      </Link>

      {/* Reporter Header Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm mb-10 flex flex-col md:flex-row items-center gap-6">
        <img 
          src={reporter.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${reporter.name}`} 
          alt={reporter.name} 
          className="h-24 w-24 rounded-full border border-slate-350 dark:border-slate-800 object-cover bg-slate-100"
        />
        <div className="flex-1 text-center md:text-left space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">
            {reporter.role}
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{reporter.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">{reporter.bio || 'এই লেখকের কোনো জীবনবৃত্তান্ত এখনো যোগ করা হয়নি।'}</p>
          
          {/* Social Links */}
          {reporter.socialLinks && (
            <div className="flex justify-center md:justify-start space-x-3 pt-2">
              {reporter.socialLinks.facebook && (
                <a href={reporter.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600">
                  <Facebook className="h-4.5 w-4.5" />
                </a>
              )}
              {reporter.socialLinks.twitter && (
                <a href={reporter.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-500">
                  <Twitter className="h-4.5 w-4.5" />
                </a>
              )}
              {reporter.socialLinks.linkedin && (
                <a href={reporter.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-700">
                  <Linkedin className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          )}
        </div>
        
        {/* Total stats */}
        <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-8 text-center shrink-0">
          <div className="flex items-center space-x-2 text-slate-450 justify-center mb-1">
            <FileText className="h-5 w-5 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider">প্রকাশিত সংবাদ</span>
          </div>
          <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{reporter.articleCount}</span>
        </div>
      </div>

      {/* Articles list */}
      <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6 border-b pb-2">
        {reporter.name}-এর প্রকাশিত খবরসমূহ
      </h2>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border rounded-xl border-slate-200/50">
          <p className="text-slate-500 italic">বর্তমানে লেখকের কোনো প্রকাশিত সংবাদ নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map(art => (
            <div key={art._id} className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-xs hover:shadow-lg transition-all duration-300">
              <Link to={`/article/${art.slug}`}>
                <img 
                  src={art.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'} 
                  alt={art.title} 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{art.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 leading-snug transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <div className="flex items-center text-[10px] text-slate-400 pt-2 font-semibold">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(art.publishDate || art.createdAt).toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default ReporterProfile;
