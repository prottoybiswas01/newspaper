import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { useToast } from '../components/Toast';
import { api } from '../utils/api';
import AdPlacement from '../components/AdPlacement';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calendar, Eye, Heart, Share2, Printer, 
  RotateCcw, Clock, User, MessageSquare, Tags, Facebook, Twitter
} from 'lucide-react';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

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

  const seoTitle = displayArticle.seo?.metaTitle || displayArticle.title;
  const seoDesc = displayArticle.seo?.metaDescription || displayArticle.summary || displayArticle.subtitle || displayArticle.title;
  const seoKeywords = displayArticle.seo?.keywords || displayArticle.tags?.join(', ') || '';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": displayArticle.title,
    "description": seoDesc,
    "image": [
      displayArticle.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'
    ],
    "datePublished": displayArticle.publishDate || displayArticle.createdAt,
    "dateModified": displayArticle.updatedAt || displayArticle.publishDate || displayArticle.createdAt,
    "author": [{
      "@type": "Person",
      "name": displayArticle.author,
      "url": `${window.location.origin}/reporter/${displayArticle.authorId}`
    }]
  };

  const ytId = getYouTubeId(displayArticle.videoUrl);

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print-container">
      <Helmet>
        <title>{seoTitle} | দৈনিক দর্পণ</title>
        <meta name="description" content={seoDesc} />
        {seoKeywords && <meta name="keywords" content={seoKeywords} />}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={displayArticle.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="twitter:title" content={seoTitle} />
        <meta property="twitter:description" content={seoDesc} />
        <meta property="twitter:image" content={displayArticle.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'} />
        <meta property="twitter:url" content={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
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
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2 text-xs font-bold">
              <span className="text-slate-400 px-1">{language === 'bn' ? 'ফন্ট:' : 'Font:'}</span>
              <button 
                onClick={() => setFontSize(prev => Math.min(prev + 2, 24))} 
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded hover:text-blue-600 dark:hover:text-blue-400 shadow-xs" 
                title="Zoom In"
              >
                A+
              </button>
              <button 
                onClick={() => setFontSize(prev => Math.max(prev - 2, 12))} 
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded hover:text-blue-600 dark:hover:text-blue-400 shadow-xs" 
                title="Zoom Out"
              >
                A-
              </button>
              <button 
                onClick={() => setFontSize(16)} 
                className="p-1 hover:text-slate-800 dark:hover:text-slate-100" 
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

            {/* Social Share Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Facebook Share */}
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                title="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>

              {/* WhatsApp Share */}
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(displayArticle.title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 flex items-center justify-center"
                title="Share on WhatsApp"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 1.981 14.119.953 11.49.953c-5.447 0-9.875 4.379-9.879 9.807-.002 1.89.518 3.73 1.502 5.367L1.9 21.533l5.845-1.597zM17.41 15.65c-.327-.162-1.928-.938-2.228-1.047-.3-.109-.519-.163-.737.163-.219.327-.847 1.047-1.039 1.266-.191.219-.383.245-.71.082-1.127-.563-1.954-.925-2.735-1.591-.628-.535-1.17-1.11-1.439-1.573-.27-.463-.029-.714.234-.975.237-.234.52-.607.78-.91.26-.303.346-.519.519-.867.173-.348.086-.653-.043-.915-.13-.261-1.039-2.474-1.424-3.385-.375-.896-.757-.775-1.039-.789-.269-.014-.576-.017-.884-.017s-.807.114-1.229.566c-.423.453-1.614 1.558-1.614 3.8 0 2.241 1.654 4.407 1.884 4.71.23.303 3.256 4.908 7.889 6.877 1.101.469 1.961.75 2.632.96.112.356 2.055 1.538 2.827 1.424.862-.127 2.656-1.074 3.031-2.062.375-.988.375-1.833.262-2.011-.113-.178-.328-.277-.655-.44z"/>
                </svg>
              </a>

              {/* Twitter/X Share */}
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(displayArticle.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Share on Twitter/X"
              >
                <Twitter className="h-4 w-4" />
              </a>

              {/* Copy Link */}
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                title="Copy link to share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

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
            decoding="async"
            className="w-full h-auto max-h-[500px] object-cover" 
          />
        </div>
      )}

      {/* Video Embed Player */}
      {ytId && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      )}

      {/* Article Body Content */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none mb-10 leading-loose font-sans"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayArticle.content) }}
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
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
                  <img src={art.featuredImage} alt={art.title} loading="lazy" decoding="async" className="w-full h-36 object-cover rounded-lg mb-3" />
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

