import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { useToast } from '../components/Toast';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AdPlacement from '../components/AdPlacement';
import BlockArticleRenderer from '../components/BlockArticleRenderer';
import AISummaryBox from '../components/AISummaryBox';
import TrustBox from '../components/TrustBox';
import { 
  Calendar, Eye, Heart, Share2, Printer, 
  RotateCcw, Clock, User, MessageSquare, Tags, Facebook, Twitter, 
  Bookmark, BookmarkCheck, ChevronRight, ArrowLeft, Radio, Flag 
} from 'lucide-react';

const API_HOST = import.meta.env.VITE_API_HOST || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

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
  const { user } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [translatedArticle, setTranslatedArticle] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [mostRead, setMostRead] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(17);
  const [isSaved, setIsSaved] = useState(false);

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

          // Check if article is bookmarked
          const savedLocal = JSON.parse(localStorage.getItem('saved_articles_list') || '[]');
          if (savedLocal.includes(res.article._id)) {
            setIsSaved(true);
          }
          
          // Parallel fetch of comments, related, most read and analytics
          const [commentsRes, relatedRes, mostReadRes] = await Promise.all([
            api.get(`/comments/article/${res.article._id}`),
            api.get(`/articles?category=${encodeURIComponent(res.article.category)}&limit=4`),
            api.get(`/articles?sort=popular&limit=5`),
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
            const filtered = relatedRes.articles.filter(a => a._id !== res.article._id);
            setRelated(filtered.slice(0, 3));
          }

          if (mostReadRes && mostReadRes.success) {
            const filteredMR = mostReadRes.articles.filter(a => a._id !== res.article._id);
            setMostRead(filteredMR.slice(0, 5));
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

  // Translation hook
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

  const handleToggleSave = async () => {
    if (!article) return;
    try {
      let savedLocal = JSON.parse(localStorage.getItem('saved_articles_list') || '[]');
      if (isSaved) {
        savedLocal = savedLocal.filter(id => id !== article._id);
        setIsSaved(false);
        toast.info('সংবাদটি সংরক্ষণ তালিকা থেকে সরানো হয়েছে।');
      } else {
        savedLocal.push(article._id);
        setIsSaved(true);
        toast.success('সংবাদটি সফলভাবে বুকমার্ক করা হয়েছে।');
      }
      localStorage.setItem('saved_articles_list', JSON.stringify(savedLocal));

      // If user logged in, persist to backend profile
      if (user) {
        await api.post('/auth/save-article', { articleId: article._id });
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
        toast.success('সংবাদের লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে!');
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
        setCommentSuccess('আপনার মন্তব্য সফলভাবে জমা হয়েছে। সম্পাদনা পর্ষদের অনুমোদনের পর এটি প্রকাশিত হবে।');
        setCommentContent('');
      } else {
        setCommentError(res.message || 'মন্তব্য প্রকাশে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setCommentError('নেটওয়ার্ক সংযোগ ত্রুটি।');
    }
  };

  const handleReportComment = async (commentId) => {
    try {
      const res = await api.post(`/comments/${commentId}/report`);
      if (res.success) {
        toast.info('মন্তব্যটি মডারেশনের জন্য রিপোর্ট করা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  if (loading || translating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-neutral-800 rounded-md w-3/4 mx-auto mb-6" />
        <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded-md w-1/2 mx-auto mb-10" />
        <div className="h-96 bg-slate-200 dark:bg-neutral-800 rounded-2xl w-full mb-6" />
        <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded-md w-full mb-3" />
        <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded-md w-5/6 mb-3" />
      </div>
    );
  }

  if (!displayArticle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-700 dark:text-neutral-300">{t('noArticles')}</h2>
        <Link to="/" className="mt-4 inline-flex items-center text-red-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t('back')}
        </Link>
      </div>
    );
  }

  const seoTitle = displayArticle.seo?.metaTitle || displayArticle.title;
  const seoDesc = displayArticle.seo?.metaDescription || displayArticle.summary || displayArticle.subtitle || displayArticle.title;
  const seoKeywords = displayArticle.seo?.keywords || displayArticle.tags?.join(', ') || '';
  const canonicalUrl = displayArticle.seo?.canonicalUrl || window.location.href;

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
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "author": [{
      "@type": "Person",
      "name": displayArticle.author,
      "jobTitle": displayArticle.authorDesignation || 'প্রতিবেদক',
      "url": `${window.location.origin}/reporter/${displayArticle.authorId}`
    }],
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "দৈনিক দর্পণ",
      "url": window.location.origin
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "হোম", "item": window.location.origin },
      { "@type": "ListItem", "position": 2, "name": displayArticle.category, "item": `${window.location.origin}/category/${encodeURIComponent(displayArticle.category)}` },
      { "@type": "ListItem", "position": 3, "name": displayArticle.title, "item": window.location.href }
    ]
  };

  const ytId = getYouTubeId(displayArticle.videoUrl);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print-container">
      <Helmet>
        <title>{seoTitle} | দৈনিক দর্পণ</title>
        <meta name="description" content={seoDesc} />
        {seoKeywords && <meta name="keywords" content={seoKeywords} />}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* OpenGraph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={displayArticle.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={displayArticle.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'} />
        
        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Top Header Banner Ad */}
      <AdPlacement placement="header" category={displayArticle.category} articleId={displayArticle._id} />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-neutral-400 mb-4 no-print">
        <Link to="/" className="hover:text-red-600 transition-colors">হোম</Link>
        <span>/</span>
        <Link to={`/category/${encodeURIComponent(displayArticle.category || 'bangladesh')}`} className="hover:text-red-600 font-bold transition-colors">
          {displayArticle.category}
        </Link>
        {displayArticle.subcategory && (
          <>
            <span>/</span>
            <span className="text-gray-700 dark:text-neutral-300">{displayArticle.subcategory}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Article Content (Left 2 Columns) */}
        <article className="lg:col-span-2">
          {/* Headline & Subheadline */}
          <header className="mb-6">
            <h1 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white leading-tight mb-4 tracking-tight">
              {displayArticle.title}
            </h1>

            {displayArticle.subtitle && (
              <h2 className="text-base sm:text-lg text-gray-600 dark:text-neutral-300 font-medium mb-5 leading-relaxed">
                {displayArticle.subtitle}
              </h2>
            )}

            {/* Reporter Meta & Interactive Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-y border-gray-200 dark:border-neutral-800 py-3.5 gap-3 no-print">
              {/* Author info */}
              <div className="flex items-center space-x-3">
                <div className="bg-red-50 dark:bg-neutral-800 rounded-full p-2 text-red-600 dark:text-red-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <Link to={`/reporter/${displayArticle.authorId}`} className="text-sm font-bold text-gray-900 dark:text-neutral-100 hover:text-red-600 transition-colors">
                    {displayArticle.author}
                  </Link>
                  <div className="flex items-center text-xs text-gray-500 dark:text-neutral-400 space-x-3 mt-0.5">
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {new Date(displayArticle.publishDate || displayArticle.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {displayArticle.readingTime || 2} {language === 'bn' ? 'মিনিট পাঠ' : 'min read'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reader Action Controls */}
              <div className="flex items-center flex-wrap gap-2 text-gray-600 dark:text-neutral-400">
                {/* Font Size Zoom */}
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 text-xs font-bold">
                  <button 
                    onClick={() => setFontSize(prev => Math.min(prev + 2, 24))} 
                    className="px-2 py-1 bg-white dark:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded hover:text-red-600 shadow-xs" 
                    title="Zoom In"
                  >
                    A+
                  </button>
                  <button 
                    onClick={() => setFontSize(prev => Math.max(prev - 2, 13))} 
                    className="px-2 py-1 bg-white dark:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded hover:text-red-600 shadow-xs" 
                    title="Zoom Out"
                  >
                    A-
                  </button>
                  <button 
                    onClick={() => setFontSize(17)} 
                    className="p-1 hover:text-gray-900 dark:hover:text-white" 
                    title="Reset"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Save / Bookmark Button */}
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    isSaved
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900/50'
                      : 'hover:bg-gray-100 dark:hover:bg-neutral-800 border-gray-200 dark:border-neutral-800'
                  }`}
                  title="Save for Later"
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4 fill-current text-red-600" /> : <Bookmark className="h-4 w-4" />}
                  <span>{isSaved ? 'সংরক্ষিত' : 'সংরক্ষণ'}</span>
                </button>

                {/* Like Button */}
                <button 
                  onClick={handleLike} 
                  disabled={isLiked}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900/50' 
                      : 'hover:bg-gray-100 dark:hover:bg-neutral-800 border-gray-200 dark:border-neutral-800'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                  <span>{likeCount}</span>
                </button>

                {/* Social Share Group */}
                <div className="flex items-center gap-1">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-blue-600 hover:bg-blue-50"
                    title="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(displayArticle.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 hover:bg-gray-100"
                    title="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 text-gray-500"
                    title="Copy Link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={triggerPrint}
                    className="p-2 rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-100"
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Featured Image */}
          {displayArticle.featuredImage && (
            <div className="relative rounded-2xl overflow-hidden mb-6 border border-gray-200/80 dark:border-neutral-800 shadow-xs group">
              <img 
                src={displayArticle.featuredImage} 
                alt={displayArticle.title} 
                decoding="async"
                className="w-full h-auto max-h-[520px] object-cover" 
              />
              {displayArticle.source && (
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg border border-white/20 flex items-center space-x-1.5">
                  <span className="text-gray-300">ছবি:</span>
                  <span className="text-red-400 font-black">{displayArticle.source}</span>
                </div>
              )}
            </div>
          )}

          {/* Video Player if provided */}
          {ytId && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 border border-gray-200 dark:border-neutral-800 shadow-md">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title="ভিডিও প্লেয়ার"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}


          {/* AI Summary Box ("সংক্ষেপে পড়ুন") */}
          <AISummaryBox 
            summary={displayArticle.aiSummary || displayArticle.summary}
            keyPoints={displayArticle.keyPoints || []}
            articleTitle={displayArticle.title}
            articleContent={displayArticle.content}
          />

          {/* Editorial Trust Box (Verification badge, Fact Box, Timeline, What We Know) */}
          <TrustBox 
            verificationStatus={displayArticle.verificationStatus}
            verifiedBy={displayArticle.verifiedBy}
            verificationNote={displayArticle.verificationNote}
            factBox={displayArticle.factBox}
            timeline={displayArticle.timeline}
            whatWeKnow={displayArticle.whatWeKnow}
            whatWeDontKnow={displayArticle.whatWeDontKnow}
            corrections={displayArticle.corrections}
          />

          {/* Block-Based Article Content Body */}
          <BlockArticleRenderer 
            blocks={displayArticle.blocks || []}
            legacyContent={displayArticle.content || ''}
            fontSize={fontSize}
            category={displayArticle.category}
            articleId={displayArticle._id}
            adSettings={displayArticle.adSettings}
          />

          {/* Article Tags */}
          {displayArticle.tags && displayArticle.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 my-8 pt-4 border-t border-gray-200 dark:border-neutral-800 no-print">
              <span className="text-xs font-bold text-gray-500 dark:text-neutral-400 mr-2 flex items-center">
                <Tags className="h-4 w-4 mr-1 text-gray-400" />
                {language === 'bn' ? 'বিষয়সমূহ:' : 'Tags:'}
              </span>
              {displayArticle.tags.map((tag, idx) => (
                <Link 
                  key={idx} 
                  to={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-neutral-300 rounded-full text-xs font-bold transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Author Bio Box */}
          <div className="my-8 p-5 rounded-2xl bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 flex items-center space-x-4 no-print shadow-xs">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-red-100 dark:bg-neutral-800 flex-shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayArticle.author)}`} 
                alt={displayArticle.author} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-grow">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">প্রতিবেদক পরিচিতি</span>
              <Link to={`/reporter/${displayArticle.authorId}`} className="text-base font-black text-gray-950 dark:text-white hover:text-red-600 transition-colors">
                {displayArticle.author}
              </Link>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                {displayArticle.authorDesignation || 'দৈনিক দর্পণ ডিজিটাল নিউজ টিম'}
              </p>
            </div>
          </div>

          {/* Moderated Comments Section */}
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-neutral-800 no-print">
            <h3 className="text-lg font-black text-gray-950 dark:text-white flex items-center space-x-2 mb-6">
              <MessageSquare className="h-5 w-5 text-red-600" />
              <span>{t('comments')} ({comments.length})</span>
            </h3>

            {/* List of comments */}
            <div className="space-y-4 mb-8">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-neutral-500 italic">
                  এই সংবাদের প্রথম মন্তব্যকারী হোন।
                </p>
              ) : (
                comments.map((comm) => (
                  <div key={comm._id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 p-4 rounded-xl flex items-start space-x-3">
                    <img 
                      src={comm.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comm.authorName)}`} 
                      alt={comm.authorName} 
                      className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-neutral-200">{comm.authorName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{new Date(comm.createdAt).toLocaleDateString('bn-BD')}</span>
                          <button
                            onClick={() => handleReportComment(comm._id)}
                            className="text-gray-400 hover:text-red-500 text-[10px]"
                            title="রিপোর্ট করুন"
                          >
                            <Flag className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-neutral-300 leading-relaxed font-sans">{comm.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Submission Form */}
            <div className="bg-gray-50 dark:bg-[#151515] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800">
              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3">মন্তব্য প্রকাশ করুন</h4>
              
              {commentSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs rounded-xl font-bold">
                  {commentSuccess}
                </div>
              )}

              {commentError && (
                <div className="mb-4 p-3 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-xs rounded-xl font-bold">
                  {commentError}
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="আপনার পুরো নাম *"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                  <input
                    type="email"
                    required
                    placeholder="ইমেইল অ্যাড্রেস (প্রকাশিত হবে না) *"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="আপনার গঠনমূলক মতামত লিখুন..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-colors"
                >
                  মন্তব্য জমা দিন
                </button>
              </form>
            </div>
          </section>
        </article>

        {/* Right Sidebar (Related stories, Most read, Sidebar ad) */}
        <aside className="space-y-6 no-print">
          {/* Sidebar Advertisement */}
          <AdPlacement placement="sidebar" category={displayArticle.category} />

          {/* Most Read (সর্বাধিক পঠিত) */}
          {mostRead && mostRead.length > 0 && (
            <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-xs">
              <h3 className="text-base font-black text-gray-950 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <span>সর্বাধিক পঠিত</span>
                <span className="text-red-600 text-xs font-extrabold uppercase tracking-wider">Top 5</span>
              </h3>
              <div className="space-y-3">
                {mostRead.map((art, idx) => (
                  <Link 
                    key={art._id}
                    to={`/article/${art.slug}`}
                    className="group flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-neutral-800/60 last:border-0 last:pb-0"
                  >
                    <span className="text-2xl font-black text-red-600/60 dark:text-red-500/50 leading-none">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-1">
                        <span>{new Date(art.publishDate || art.createdAt).toLocaleDateString('bn-BD')}</span>
                        <span>•</span>
                        <span className="flex items-center"><Eye className="h-3 w-3 mr-0.5" />{art.views || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related News in Category */}
          {related && related.length > 0 && (
            <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-xs">
              <h3 className="text-base font-black text-gray-950 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
                সম্পর্কিত সংবাদ
              </h3>
              <div className="space-y-4">
                {related.map((art) => (
                  <Link
                    key={art._id}
                    to={`/article/${art.slug}`}
                    className="group block space-y-2"
                  >
                    {art.featuredImage && (
                      <div className="h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800">
                        <img 
                          src={art.featuredImage} 
                          alt={art.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}
                    <h4 className="text-xs font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sticky Lower Sidebar Ad */}
          <div className="sticky top-24">
            <AdPlacement placement="sidebar" category={displayArticle.category} />
          </div>
        </aside>
      </div>

      {/* Floating Sticky Bottom Bar Ad */}
      <AdPlacement placement="sticky" />
    </div>
  );
};

export default ArticleDetails;
