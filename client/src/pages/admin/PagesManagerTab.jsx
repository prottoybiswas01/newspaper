import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import RichTextEditor from '../../components/RichTextEditor';
import { 
  FileText, Edit3, ExternalLink, Plus, RefreshCw, CheckCircle2, 
  Clock, Search, Eye, Save, Trash2, ArrowLeft, ShieldCheck, 
  HelpCircle, AlertCircle 
} from 'lucide-react';
import DOMPurify from 'dompurify';

const PagesManagerTab = () => {
  const toast = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [editingPage, setEditingPage] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState('edit'); // 'edit' or 'preview'
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);

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

  useEffect(() => {
    loadPages();
  }, []);

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

  // Close Editor
  const handleCancel = () => {
    setEditingPage(null);
    setIsCreatingNew(false);
  };

  // Save changes
  const handleSave = async (e) => {
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
  const handleDelete = async (slug, title) => {
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
      
      {/* Top Banner & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/10 text-red-600 dark:text-red-500 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                ফুটার ও তথ্য পেজ ম্যানেজমেন্ট
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                শর্তাবলী, গোপনীয় নীতি, সংবিধান ও অভিযোগ, যোগাযোগ, আমাদের সম্পর্কে, বিজ্ঞাপন এবং নীতিমালা পেজগুলো সরাসরি পরিচালনা করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadPages}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {!editingPage && !isCreatingNew && (
            <button
              onClick={handleStartCreate}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন পেজ তৈরি করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── ACTIVE EDITOR OR DATA TABLE ─── */}
      {editingPage || isCreatingNew ? (
        /* ═══════════════════════════════════════════════
           PAGE EDITOR INTERFACE (Rich Text & Live Preview)
           ═══════════════════════════════════════════════ */
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

            {/* View Mode Switcher (Editor vs Live Preview) */}
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

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Meta Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Title */}
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

              {/* Subtitle */}
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

              {/* Slug (Editable only when creating new) */}
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
                <span className="text-[10px] text-slate-400 mt-1 block">
                  স্লাগ দিয়ে সরাসরি পেজ লিংক হবে: /{formSlug || 'slug'}
                </span>
              </div>

              {/* SEO Meta Title */}
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

              {/* Status Toggle */}
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
                    {formIsPublished ? 'ওয়েবসাইটে সক্রিয় ও প্রকাশিত' : 'খসড়া (Draft / লুকানো)'}
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
              /* Live Preview Card */
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
                    className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 py-4 leading-relaxed"
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

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/10 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════
           ADMIN DATA TABLE (User's specific requirement)
           ═══════════════════════════════════════════════ */
        <div className="space-y-4">
          
          {/* Filter / Search Bar */}
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

            <div className="text-xs text-slate-400 font-medium">
              মোট পেজ: <strong className="text-slate-700 dark:text-slate-200">{filteredPages.length}</strong> টি
            </div>
          </div>

          {/* Main Table */}
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
                <p className="text-xs text-slate-500">নতুন পেজ যোগ করতে উপরের 'নতুন পেজ তৈরি করুন' বাটনে ক্লিক করুন।</p>
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
                                : 'তথ্য নেই'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Live View Button */}
                            <a
                              href={`/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="ওয়েবসাইটে পেজটি দেখুন"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleStartEdit(page)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                              title="এডিট করুন"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>এডিট করুন</span>
                            </button>

                            {/* Delete custom page if not one of primary 7 */}
                            {!['terms', 'privacy', 'complaints', 'contact', 'about-us', 'advertisement', 'policy'].includes(page.slug) && (
                              <button
                                onClick={() => handleDelete(page.slug, page.title)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Notice info */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              এই পেজগুলোর সমস্ত তথ্য একমাত্র <strong>সুপার অ্যাডমিন ও অ্যাডমিন</strong> দ্বারা সংরক্ষিত ও নিয়ন্ত্রিত হয়। সাধারণ পাঠকরা ফুটারে ক্লিক করে যে পেজগুলো দেখেন, তার তথ্য এখান থেকেই আপডেট হয়।
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default PagesManagerTab;
