import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calendar, Eye, Heart, Share2, Printer, 
  ZoomIn, ZoomOut, RotateCcw, Clock, User, MessageSquare, Tags
} from 'lucide-react';

const ArticleDetails = () => {
  const toast = useToast();
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const [article, setArticle] = useState(null);
  const [translatedArticle, setTranslatedArticle] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16); // Base size in px

  // Guest comment state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/articles/slug/${slug}`);
        if (res.success && res.article) {
          setArticle(res.article);
          setLikeCount(res.article.likes || 0);
          
          // Fetch comments, related articles and log analytics view in parallel
          const [commentsRes, relatedRes] = await Promise.all([
            api.get(`/comments/article/${res.article._id}`),
            api.get(`/articles?category=${res.article.category}&limit=3`),
            api.post('/analytics/log', {
              path: `/article/${slug}`,
              articleId: res.article._id,
              device: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
            }).catch(() => null)
          ]);

          if (commentsRes && commentsRes.success) {
            setComments(commentsRes.comments);
          }

          if (relatedRes && relatedRes.success) {
            // Exclude current article
            const filtered = relatedRes.articles.filter(a => a._id !== res.article._id);
            setRelated(filtered);
          }
        }
      } catch (err) {
        console.error('Failed to load article details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
    setIsLiked(false);
  }, [slug]);

  // Translation hook: translates article to English if language === 'en'
  useEffect(() => {
    if (!article) return;
    if (language === 'en') {
      const translate = async () => {
        setTranslating(true);
        try {
          const res = await api.post('/articles/translate', {
            title: article.title,
            subtitle: article.subtitle,
            summary: article.summary,
            content: article.content,
            targetLang: 'en'
          });
          if (res.success) {
            setTranslatedArticle({
              ...article,
              title: res.translated.title,
              subtitle: res.translated.subtitle,
              summary: res.translated.summary,
              content: res.translated.content
            });
          }
        } catch (err) {
          console.error('Translation error:', err);
        } finally {
          setTranslating(false);
        }
      };
      translate();
    } else {
      setTranslatedArticle(null);
    }
  }, [language, article]);

  const displayArticle = translatedArticle || article;

  const handleLike = async () => {
    if (isLiked || !article) return;
    try {
      const res = await api.post(`/articles/${article._id}/like`);
      if (res.success) {
        setLikeCount(res.likes);
        setIsLiked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      await api.post(`/articles/${article._id}/share`);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert('আর্টিকেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
      } else {
        toast.info(window.location.href);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!article || !commentName || !commentEmail || !commentContent) return;

    setCommentSuccess('');
    setCommentError('');
    try {
      const res = await api.post('/comments', {
        articleId: article._id,
        authorName: commentName,
        authorEmail: commentEmail,
        content: commentContent
      });

      if (res.success) {
        setCommentSuccess('আপনার মন্তব্য সফলভাবে জমা হয়েছে এবং এটি মডারেটরের অনুমোদনের অপেক্ষায় আছে।');
        setCommentContent('');
      } else {
        setCommentError(res.message || 'মন্তব্য প্রকাশে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setCommentError('নেটওয়ার্ক সংযোগ ত্রুটি।');
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  if (loading || translating) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mx-auto mb-6" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 mx-auto mb-10" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full mb-6" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full mb-3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6 mb-3" />
      </div>
    );
  }

  if (!displayArticle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-700">{t('noArticles')}</h2>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">{t('back')}</Link>
      </div>
    );
  }

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print-container">
      {/* Header Info */}
      <header className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider no-print">
          <Link to={`/category/${displayArticle.category.toLowerCase()}`} className="hover:underline">
            {t(displayArticle.category.toLowerCase())}
          </Link>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 leading-tight mb-4">
          {displayArticle.title}
        </h1>

        {displayArticle.subtitle && (
          <h2 className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
            {displayArticle.subtitle}
          </h2>
        )}

        {/* Action Controls & Reporter Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-y border-slate-200/60 dark:border-slate-800/40 py-4 gap-4 no-print">
          
          {/* Author/Reporter info */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-slate-800 rounded-full p-2 text-blue-600 dark:text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <Link to={`/reporter/${displayArticle.authorId}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600">
                {displayArticle.author}
              </Link>
              <div className="flex items-center text-xs text-slate-400 space-x-2 mt-0.5">
                <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {new Date(displayArticle.publishDate || displayArticle.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
                <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {displayArticle.readingTime || 3} {language === 'bn' ? 'মিনিট পাঠ' : 'min read'}</span>
              </div>
            </div>
          </div>

          {/* Controls: Zoom, Print, Share, Like */}
          <div className="flex items-center flex-wrap gap-2 text-slate-500 dark:text-slate-400">
            {/* Font Zoom Controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-2">
              <button 
                onClick={() => setFontSize(prev => Math.min(prev + 2, 24))} 
                className="p-1.5 hover:text-slate-800 dark:hover:text-slate-100" 
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setFontSize(prev => Math.max(prev - 2, 12))} 
                className="p-1.5 hover:text-slate-800 dark:hover:text-slate-100" 
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setFontSize(16)} 
                className="p-1.5 hover:text-slate-800 dark:hover:text-slate-100" 
                title="Reset Size"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Like */}
            <button 
              onClick={handleLike} 
              disabled={isLiked}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isLiked 
                  ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900/50' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
              <span>{likeCount}</span>
            </button>

            {/* Share */}
            <button 
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Copy link to share"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Print */}
            <button 
              onClick={triggerPrint}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Print article"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {displayArticle.featuredImage && (
        <div className="rounded-2xl overflow-hidden mb-8 border border-slate-200/50 dark:border-slate-800/50 shadow-xs">
          <img 
            src={displayArticle.featuredImage} 
            alt={displayArticle.title} 
            className="w-full h-auto max-h-[500px] object-cover" 
          />
        </div>
      )}

      {/* Article Body Content */}
      <div 
        className="prose dark:prose-invert max-w-none mb-10 leading-relaxed font-sans"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: displayArticle.content }}
      />

      {/* Article Tags */}
      {displayArticle.tags && displayArticle.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 no-print">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-2 flex items-center">
            <Tags className="h-4 w-4 mr-1 text-slate-400" />
            {language === 'bn' ? 'ট্যাগসমূহ:' : 'Tags:'}
          </span>
          {displayArticle.tags.map((tag, idx) => (
            <Link 
              key={idx} 
              to={`/search?q=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 rounded-full text-[11px] font-semibold transition-all"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Article Inline Advertisement */}
      <AdPlacement placement="article" />

      {/* Comments Section */}
      <section className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/40 no-print">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2 mb-6">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span>{t('comments')} ({comments.length})</span>
        </h3>

        {/* List of comments */}
        <div className="space-y-4 mb-8">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">{language === 'bn' ? 'এই সংবাদের প্রথম মন্তব্যকারী হোন।' : 'Be the first to comment on this article.'}</p>
          ) : (
            comments.map((comm) => (
              <div key={comm._id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-xl flex items-start space-x-3">
                <img 
                  src={comm.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comm.authorName}`} 
                  alt={comm.authorName} 
                  className="h-9 w-9 rounded-full bg-slate-100" 
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{comm.authorName}</span>
                    <span className="text-[10px] text-slate-450">{new Date(comm.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-350 mt-1">{comm.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">{language === 'bn' ? 'আপনার মন্তব্য প্রকাশ করুন' : 'Leave a Comment'}</h4>
          
          {commentSuccess && <p className="text-sm text-green-600 mb-4 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">{commentSuccess}</p>}
          {commentError && <p className="text-sm text-red-500 mb-4 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">{commentError}</p>}

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">{language === 'bn' ? 'নাম *' : 'Name *'}</label>
                <input 
                  type="text" 
                  value={commentName} 
                  onChange={(e) => setCommentName(e.target.value)} 
                  required
                  placeholder={language === 'bn' ? 'আপনার নাম...' : 'Your name...'}
                  className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">{language === 'bn' ? 'ইমেইল ঠিকানা *' : 'Email Address *'}</label>
                <input 
                  type="email" 
                  value={commentEmail} 
                  onChange={(e) => setCommentEmail(e.target.value)} 
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">{language === 'bn' ? 'মন্তব্য *' : 'Comment *'}</label>
              <textarea 
                rows="4" 
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
                placeholder={language === 'bn' ? 'এখানে আপনার মন্তব্য লিখুন...' : 'Write your comment here...'}
                className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-blue-655 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
            >
              {language === 'bn' ? 'মন্তব্য জমা দিন' : 'Submit Comment'}
            </button>
          </form>
        </div>
      </section>

      {/* Related News */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/40 no-print">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6">{language === 'bn' ? 'সম্পর্কিত সংবাদ' : 'Related News'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(art => (
              <div key={art._id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-3 hover:shadow-md transition-shadow">
                <Link to={`/article/${art.slug}`}>
                  <img src={art.featuredImage} alt={art.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 leading-snug transition-colors line-clamp-2">{art.title}</h4>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default ArticleDetails;

