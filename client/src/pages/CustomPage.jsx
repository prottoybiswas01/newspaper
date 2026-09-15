import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../utils/api';
import DOMPurify from 'dompurify';
import { 
  Home, ChevronRight, Clock, Printer, Share2, 
  FileText, Shield, Scale, Mail, Info, Megaphone, 
  CheckCircle, ArrowLeft 
} from 'lucide-react';

const STATIC_LINKS = [
  { slug: 'about-us', title: 'আমাদের সম্পর্কে', icon: Info },
  { slug: 'terms', title: 'ব্যবহারের শর্তাবলী', icon: Scale },
  { slug: 'privacy', title: 'গোপনীয়তা নীতি', icon: Shield },
  { slug: 'complaints', title: 'সংবিধান ও অভিযোগ', icon: FileText },
  { slug: 'policy', title: 'নীতিমালা', icon: CheckCircle },
  { slug: 'advertisement', title: 'বিজ্ঞাপন', icon: Megaphone },
  { slug: 'contact', title: 'যোগাযোগ', icon: Mail }
];

const CustomPage = ({ forcedSlug }) => {
  const params = useParams();
  const location = useLocation();

  // Determine current active slug
  let currentSlug = forcedSlug;
  if (!currentSlug) {
    if (params.slug) {
      currentSlug = params.slug;
    } else {
      // derive from pathname (e.g. /terms -> terms)
      currentSlug = location.pathname.replace(/^\//, '').split('/')[0];
    }
  }

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/pages/${currentSlug}`);
        if (res.success && res.page) {
          setPage(res.page);
        } else {
          setError(res.message || 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি');
        }
      } catch (err) {
        console.error(err);
        setError('সার্ভার থেকে পৃষ্ঠা লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    if (currentSlug) {
      fetchPage();
      window.scrollTo(0, 0);
    }
  }, [currentSlug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-neutral-800 dark:text-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
      {page && (
        <Helmet>
          <title>{page.seoTitle || `${page.title} - দৈনিক দর্পণ`}</title>
          <meta name="description" content={page.seoDescription || page.subtitle || page.title} />
        </Helmet>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mb-6 no-print">
          <Link to="/" className="hover:text-red-600 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>প্রচ্ছদ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-400">তথ্য ও নীতিমালা</span>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-900 dark:text-white font-bold">
            {page ? page.title : currentSlug}
          </span>
        </nav>

        {loading ? (
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center shadow-xs">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-red-600 border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-semibold text-neutral-500">পৃষ্ঠার তথ্য লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{error}</h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              অনুরোধকৃত পাতাটি বিদ্যমান নেই অথবা সাময়িকভাবে অপ্রাপ্য।
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>হোমপেজে ফিরে যান</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar Menu (Policy Directory) */}
            <aside className="lg:col-span-3 space-y-4 no-print">
              <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
                <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider px-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  তথ্য ও নীতিমালা সেল
                </h3>
                <ul className="mt-3 space-y-1">
                  {STATIC_LINKS.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSlug === item.slug;
                    return (
                      <li key={item.slug}>
                        <Link
                          to={`/${item.slug}`}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Quick Contact Badge */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-5 rounded-2xl shadow-sm space-y-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">সহায়তা কেন্দ্র</span>
                <h4 className="text-sm font-black leading-snug">আপনার কোনো প্রশ্ন বা অভিযোগ আছে?</h4>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  আমাদের সম্পাদকীয় বা অভিযোগ টিমের সাথে সরাসরি ইমেইলে যোগাযোগ করতে পারেন।
                </p>
                <div className="pt-2">
                  <Link
                    to="/contact"
                    className="inline-block px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                  >
                    যোগাযোগ করুন →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-9 space-y-6">
              <article className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-xs">
                
                {/* Header Section */}
                <header className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 mb-2">
                        দৈনিক দর্পণ অফিশিয়াল
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
                        {page.title}
                      </h1>
                      {page.subtitle && (
                        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                          {page.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Print & Share Controls */}
                    <div className="flex items-center gap-2 no-print">
                      <button
                        onClick={handlePrint}
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="প্রিন্ট করুন"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleShare}
                        className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                        title="লিংক কপি করুন"
                      >
                        <Share2 className="h-4 w-4 text-red-600" />
                        <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                    <Clock className="h-3.5 w-3.5 text-red-500" />
                    <span>
                      সর্বশেষ পরিমার্জন:{' '}
                      <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">
                        {page.updatedAt 
                          ? new Date(page.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'আজ'}
                      </strong>
                    </span>
                  </div>
                </header>

                {/* Rich HTML Content */}
                <div 
                  className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed text-sm sm:text-base page-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content || '<p>কোনো কন্টেন্ট পাওয়া যায়নি।</p>') }}
                />

                {/* Footer disclaimer */}
                <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400 leading-relaxed flex items-center justify-between flex-wrap gap-4">
                  <p>© {new Date().getFullYear()} দৈনিক দর্পণ। সর্বস্বত্ব সংরক্ষিত।</p>
                  <p className="italic">কর্তৃপক্ষের লিখিত অনুমতি ব্যতীত কোনো অংশ পুনরুৎপাদন নিষিদ্ধ।</p>
                </div>

              </article>
            </main>

          </div>
        )}

      </div>
    </div>
  );
};

export default CustomPage;
