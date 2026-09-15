import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import RichTextEditor from '../../components/RichTextEditor';
import { 
  FileText, Edit3, ExternalLink, Plus, RefreshCw, CheckCircle2, 
  Clock, Search, Eye, Save, Trash2, ArrowLeft, ShieldCheck, 
  Settings, Share2, MapPin, Phone, Mail, Globe, Facebook, Twitter, 
  Instagram, Youtube, Linkedin, MessageCircle, AlertCircle 
} from 'lucide-react';
import DOMPurify from 'dompurify';

const DEFAULT_FOOTER_SETTINGS = {
  aboutText: 'সর্বশেষ ও নিরপেক্ষ সংবাদ পরিবেশনে আমরা অঙ্গীকারবদ্ধ। দেশের প্রতিটি প্রান্তে ঘটে যাওয়া ঘটনার সত্যতা নিশ্চিত করে আমরা আপনাদের সামনে তুলে ধরি।',
  publisherEditor: 'আবিদ মনসুর',
  chiefEditor: 'সাব্বির আহমেদ',
  socialLinks: [
    { platform: 'Facebook', url: 'https://facebook.com', active: true },
    { platform: 'Twitter (X)', url: 'https://twitter.com', active: true },
    { platform: 'Instagram', url: 'https://instagram.com', active: true },
    { platform: 'YouTube', url: 'https://youtube.com', active: true },
    { platform: 'LinkedIn', url: 'https://linkedin.com', active: true }
  ],
  contact: {
    phone: '+৮৮০ ১৭৪৯৯৬৫২৪০',
    email: 'info@darpannews.com',
    address: 'বাড়ি ১১, রোড ৩/বি, নিকুঞ্জ, ঢাকা ১২২৯, বাংলাদেশ',
    mapUrl: 'https://maps.google.com/?q=Nikunja,Dhaka'
  },
  importantLinks: [
    { label: 'আমাদের সম্পর্কে', url: '/about-us' },
    { label: 'ব্যবহারের শর্তাবলী', url: '/terms' },
    { label: 'গোপনীয়তা নীতি', url: '/privacy' },
    { label: 'সংবিধান ও অভিযোগ', url: '/complaints' },
    { label: 'নীতিমালা', url: '/policy' },
    { label: 'বিজ্ঞাপন', url: '/advertisement' },
    { label: 'যোগাযোগ', url: '/contact' },
    { label: 'সংবাদ আর্কাইভ', url: '/archive' }
  ],
  bottomLinks: [
    { label: 'আমাদের সম্পর্কে', url: '/about-us' },
    { label: 'শর্তাবলী', url: '/terms' },
    { label: 'গোপনীয়তা নীতি', url: '/privacy' },
    { label: 'সংবিধান ও অভিযোগ', url: '/complaints' },
    { label: 'নীতিমালা', url: '/policy' },
    { label: 'বিজ্ঞাপন', url: '/advertisement' },
    { label: 'যোগাযোগ', url: '/contact' }
  ],
  copyrightText: '© স্বত্ব বেঙ্গল টাইমস ২০২৫-২০২৬ | সর্বস্বত্ব সংরক্ষিত।'
};

const PagesManagerTab = () => {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('pages'); // 'pages' or 'footerSettings'
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [editingPage, setEditingPage] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState('edit'); // 'edit' or 'preview'
  const [saving, setSaving] = useState(false);

  // Form Fields for Pages
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Footer Settings State
  const [footerSettings, setFooterSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [savingFooter, setSavingFooter] = useState(false);

  // Load all pages
  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pages');
      if (res.success) {
        setPages(res.pages || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('পেজ তালিকা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Load footer settings
  const loadFooterSettings = async () => {
    try {
      const res = await api.get('/settings/footer_settings');
      if (res.success && res.value) {
        setFooterSettings({
          ...DEFAULT_FOOTER_SETTINGS,
          ...res.value,
          contact: {
            ...DEFAULT_FOOTER_SETTINGS.contact,
            ...(res.value.contact || {})
          }
        });
      }
    } catch (err) {
      // Keep defaults
    }
  };

  useEffect(() => {
    loadPages();
    loadFooterSettings();
  }, []);

  // Save Footer Settings
  const handleSaveFooterSettings = async (e) => {
    e.preventDefault();
    setSavingFooter(true);
    try {
      const res = await api.post('/settings/footer_settings', { value: footerSettings });
      if (res.success) {
        toast.success('ফুটার সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      } else {
        toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setSavingFooter(false);
    }
  };

  // Social Links management helpers
  const handleAddSocialLink = () => {
    setFooterSettings(prev => ({
      ...prev,
      socialLinks: [
        ...(prev.socialLinks || []),
        { platform: 'Facebook', url: 'https://', active: true }
      ]
    }));
  };

  const handleUpdateSocialLink = (index, field, val) => {
    setFooterSettings(prev => {
      const updated = [...(prev.socialLinks || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, socialLinks: updated };
    });
  };

  const handleRemoveSocialLink = (index) => {
    setFooterSettings(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index)
    }));
  };

  // Open Edit Mode for a page
  const handleStartEdit = async (pageSummary) => {
    setLoading(true);
    try {
      const res = await api.get(`/pages/${pageSummary.slug}`);
      if (res.success && res.page) {
        const p = res.page;
        setEditingPage(p);
        setIsCreatingNew(false);
        setFormTitle(p.title || '');
        setFormSubtitle(p.subtitle || '');
        setFormSlug(p.slug || '');
        setFormContent(p.content || '<p><br></p>');
        setFormSeoTitle(p.seoTitle || p.title || '');
        setFormSeoDesc(p.seoDescription || p.subtitle || '');
        setFormIsPublished(p.isPublished !== false);
        setActiveViewMode('edit');
      } else {
        toast.error('পেজের বিস্তারিত পাওয়া যায়নি');
      }
    } catch (err) {
      console.error(err);
      toast.error('সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
    }
  };

  // Open Create Mode
  const handleStartCreate = () => {
    setEditingPage(null);
    setIsCreatingNew(true);
    setFormTitle('');
    setFormSubtitle('');
    setFormSlug('');
    setFormContent('<p>এখানে পেজের বিস্তারিত বিবরণ লিখুন...</p>');
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormIsPublished(true);
    setActiveViewMode('edit');
  };

  const handleCancel = () => {
    setEditingPage(null);
    setIsCreatingNew(false);
  };

  // Save Page
  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('দয়া করে পেজের শিরোনাম লিখুন');
      return;
    }

    if (isCreatingNew && !formSlug.trim()) {
      toast.error('দয়া করে পেজের একটি ইংরেজি স্লাগ (Slug) নির্ধারণ করুন');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formTitle,
        subtitle: formSubtitle,
        content: formContent,
        seoTitle: formSeoTitle || formTitle,
        seoDescription: formSeoDesc || formSubtitle,
        isPublished: formIsPublished
      };

      let res;
      if (isCreatingNew) {
        payload.slug = formSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
        res = await api.post('/pages', payload);
      } else {
        res = await api.put(`/pages/${editingPage.slug}`, payload);
      }

      if (res.success) {
        toast.success(isCreatingNew ? 'নতুন পেজ সফলভাবে তৈরি হয়েছে!' : 'পেজের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
        setEditingPage(null);
        setIsCreatingNew(false);
        loadPages();
      } else {
        toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('সার্ভারে সমস্যা দেখা দিয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // Delete page
  const handleDeletePage = async (slug, title) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${title}" পেজটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await api.delete(`/pages/${slug}`);
      if (res.success) {
        toast.success('পেজটি মুছে ফেলা হয়েছে');
        loadPages();
      } else {
        toast.error(res.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('অনুমতি নেই বা সার্ভারে সমস্যা হয়েছে');
    }
  };

  const filteredPages = pages.filter(p => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/10 text-red-600 dark:text-red-500 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                ফুটার ও তথ্য পেজ কন্ট্রোল সেন্টার
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                শর্তাবলী, গোপনীয় নীতি, সংবিধান ও অভিযোগ, যোগাযোগ, ঠিকানা ও সোশ্যাল মিডিয়া লিংক সম্পূর্ণ এডিট করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => {
                setActiveSubTab('pages');
                setEditingPage(null);
                setIsCreatingNew(false);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'pages'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>তথ্য পেজসমূহ ({pages.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('footerSettings');
                setEditingPage(null);
                setIsCreatingNew(false);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'footerSettings'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>ফুটার ও কন্টাক্ট সেটিংস</span>
            </button>
          </div>

          <button
            onClick={() => {
              loadPages();
              loadFooterSettings();
            }}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── TAB 1: PAGES LIST & EDITOR ─── */}
      {activeSubTab === 'pages' && (
        <>
          {editingPage || isCreatingNew ? (
            /* Page Editor Drawer */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    title="তালিকায় ফিরে যান"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {isCreatingNew ? 'নতুন তথ্য পেজ যোগ করুন' : `সম্পাদনা: ${editingPage.title}`}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-600 dark:text-slate-300">
                        /{isCreatingNew ? (formSlug || 'slug') : editingPage.slug}
                      </span>
                      {!isCreatingNew && (
                        <a
                          href={`/${editingPage.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>লাইভ পেজ দেখুন</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('edit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeViewMode === 'edit'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>এডিটর মোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeViewMode === 'preview'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>লাইভ প্রিভিউ</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSavePage} className="space-y-6">
                
                {/* Meta Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      পেজের শিরোনাম (Title) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="যেমন: ব্যবহারের শর্তাবলী"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      উপ-শিরোনাম বা সংক্ষিপ্ত বিবরণ (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="যেমন: আমাদের সার্বিক সম্পাদকীয় ও সাংবাদিকতার নীতি"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      ইউআরএল স্লাগ (Slug) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!isCreatingNew}
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                      placeholder="terms, privacy, complaints..."
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      এসইও টাইটেল (SEO Title)
                    </label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder="সার্চ ইঞ্জিনের জন্য টাইটেল"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-4 flex flex-col justify-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      প্রকাশনা স্ট্যাটাস
                    </label>
                    <label className="inline-flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsPublished}
                        onChange={(e) => setFormIsPublished(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {formIsPublished ? 'ওয়েবসাইটে সক্রিয় ও প্রকাশিত' : 'খসড়া (Draft)'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Editor or Preview View */}
                {activeViewMode === 'edit' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        মূল বিষয়বস্তু ও বিবরণ (Rich Content)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        উপরে টুলবার থেকে বোল্ড, রঙ, ফন্ট সাইজ এবং টেবিল যুক্ত করতে পারেন।
                      </span>
                    </div>
                    <RichTextEditor
                      value={formContent}
                      onChange={setFormContent}
                      minHeight="420px"
                    />
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-slate-50/50 dark:bg-slate-950/30">
                    <div className="max-w-3xl mx-auto space-y-4">
                      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                        <span className="text-xs font-bold uppercase text-red-600 tracking-wider">লাইভ প্রিভিউ</span>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                          {formTitle || 'শিরোনামহীন পেজ'}
                        </h1>
                        {formSubtitle && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                            {formSubtitle}
                          </p>
                        )}
                      </div>
                      <div 
                        className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 py-4 leading-relaxed page-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formContent || '<p>কোনো কন্টেন্ট দেওয়া হয়নি।</p>') }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    বাতিল করুন
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/10 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* Main Pages Data Table */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="পেজের শিরোনাম বা স্লাগ খুঁজুন..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartCreate}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>নতুন পেজ তৈরি করুন</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                {loading && pages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-red-500" />
                    <span className="text-xs">পেজের তথ্য লোড হচ্ছে...</span>
                  </div>
                ) : filteredPages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-sm font-semibold">কোনো পেজ পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500">নতুন পেজ যোগ করতে 'নতুন পেজ তৈরি করুন' বাটনে ক্লিক করুন।</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-4 w-12 text-center">#</th>
                          <th className="p-4">পেজের শিরোনাম</th>
                          <th className="p-4 w-36">স্লাগ / URL পাথ</th>
                          <th className="p-4 w-32">স্ট্যাটাস</th>
                          <th className="p-4 w-44">সর্বশেষ আপডেট</th>
                          <th className="p-4 w-44 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredPages.map((page, idx) => (
                          <tr 
                            key={page.slug} 
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="p-4 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="p-4 max-w-sm">
                              <div className="font-bold text-slate-900 dark:text-white text-sm">
                                {page.title}
                              </div>
                              {page.subtitle && (
                                <div className="text-[11px] text-slate-400 truncate mt-0.5 max-w-md">
                                  {page.subtitle}
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                /{page.slug}
                              </span>
                            </td>
                            <td className="p-4">
                              {page.isPublished !== false ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                  প্রকাশিত
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  খসড়া
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>
                                  {page.updatedAt 
                                    ? new Date(page.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : 'আজ'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`/${page.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="ওয়েবসাইটে দেখুন"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>

                                <button
                                  onClick={() => handleStartEdit(page)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                                  title="এডিট করুন"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  <span>এডিট করুন</span>
                                </button>

                                <button
                                  onClick={() => handleDeletePage(page.slug, page.title)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: FOOTER & CONTACT SETTINGS ─── */}
      {activeSubTab === 'footerSettings' && (
        <form onSubmit={handleSaveFooterSettings} className="space-y-6">
          
          {/* Card 1: Contact & Address Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="h-5 w-5 text-red-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ঠিকানা ও যোগাযোগের তথ্য
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  নিউজ রুম / বার্তা কক্ষ ফোন নম্বর
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={footerSettings.contact?.phone || ''}
                    onChange={(e) => setFooterSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="+৮৮০ ১৭৪৯৯৬৫২৪০"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={footerSettings.contact?.email || ''}
                    onChange={(e) => setFooterSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="info@darpannews.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  অফিসের পূর্ণ ঠিকানা (Text)
                </label>
                <input
                  type="text"
                  value={footerSettings.contact?.address || ''}
                  onChange={(e) => setFooterSettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value }
                  }))}
                  placeholder="বাড়ি ১১, রোড ৩/বি, নিকুঞ্জ, ঢাকা ১২২৯, বাংলাদেশ"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  গুগল ম্যাপ শেয়ার লিংক (Google Maps Share Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={footerSettings.contact?.mapUrl || ''}
                    onChange={(e) => setFooterSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, mapUrl: e.target.value }
                    }))}
                    placeholder="https://maps.app.goo.gl/... বা https://maps.google.com/..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-mono text-xs"
                  />
                  {footerSettings.contact?.mapUrl && (
                    <a
                      href={footerSettings.contact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                      <span>টেস্ট করুন</span>
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  পাঠকরা ফুটারে ঠিকানার উপর ক্লিক করলে সরাসরি এই গুগল ম্যাপ লিংকে চলে যাবে।
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Social Media Accounts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  সোশ্যাল মিডিয়া অ্যাকাউন্টস (Social Links)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddSocialLink}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>নতুন সোশ্যাল মিডিয়া যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-3">
              {(footerSettings.socialLinks || []).map((item, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="w-36">
                    <input
                      type="text"
                      value={item.platform || ''}
                      onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                      placeholder="প্ল্যাটফর্ম নাম"
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex-1 min-w-[220px]">
                    <input
                      type="url"
                      value={item.url || ''}
                      onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.active !== false}
                      onChange={(e) => handleUpdateSocialLink(index, 'active', e.target.checked)}
                      className="h-3.5 w-3.5 text-red-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">চালু</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Brand Text & Editor Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              ব্র্যান্ড পরিচিতি ও সম্পাদক পর্ষদ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  নিউজ পোর্টালের সংক্ষিপ্ত বিবরণ (About Text)
                </label>
                <textarea
                  rows="3"
                  value={footerSettings.aboutText || ''}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, aboutText: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  প্রতিষ্ঠাতা ও প্রধান সম্পাদক
                </label>
                <input
                  type="text"
                  value={footerSettings.founderChiefEditor || 'মোস্তফা মাহফুজ'}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, founderChiefEditor: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  প্রকাশক ও সম্পাদক
                </label>
                <input
                  type="text"
                  value={footerSettings.publisherEditor || 'মোস্তফা মাহফুজ'}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, publisherEditor: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  প্রধান বার্তা সম্পাদক
                </label>
                <input
                  type="text"
                  value={footerSettings.chiefEditor || 'সাব্বির আহমেদ'}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, chiefEditor: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  কপিরাইট লাইন (Bottom Copyright Text)
                </label>
                <input
                  type="text"
                  value={footerSettings.copyrightText || ''}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, copyrightText: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={savingFooter}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/10 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{savingFooter ? 'সংরক্ষণ করা হচ্ছে...' : 'ফুটার সেটিংস সংরক্ষণ করুন'}</span>
            </button>
          </div>

        </form>
      )}

      {/* Security info banner */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>
          এই পেজগুলোর সমস্ত তথ্য একমাত্র <strong>সুপার অ্যাডমিন ও অ্যাডমিন</strong> দ্বারা সংরক্ষিত ও নিয়ন্ত্রিত হয়। সাধারণ পাঠকরা ফুটারে ক্লিক করে যে পেজগুলো দেখেন, তার তথ্য এখান থেকেই রিয়েল-টাইমে আপডেট হয়।
        </span>
      </div>

    </div>
  );
};

export default PagesManagerTab;
