import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import { 
  Camera, Plus, Trash2, Edit3, ExternalLink, Image as ImageIcon, 
  Upload, Save, ArrowLeft, Eye, Clock, User, CheckCircle, 
  AlertCircle, RefreshCw, X, ChevronUp, ChevronDown 
} from 'lucide-react';

const PhotoStoryTab = () => {
  const toast = useToast();
  const [photoStories, setPhotoStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [photographer, setPhotographer] = useState('বেঙ্গল টাইমস ফটো ডেস্ক');
  const [featuredImage, setFeaturedImage] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('published');
  const [galleryImages, setGalleryImages] = useState([
    { url: '', caption: '', credit: '' }
  ]);

  // Load all photo stories from API
  const loadPhotoStories = async () => {
    setLoading(true);
    try {
      // Query articles with category 'ছবি' or subcategory 'photo-story'
      const res = await api.get('/articles?limit=50');
      if (res.success && Array.isArray(res.articles)) {
        const filtered = res.articles.filter(art => 
          art.category === 'ছবি' || 
          art.category === 'photo' || 
          art.subcategory === 'photo-story' || 
          art.subcategory === 'ফটোস্টোরি' ||
          art.multimediaType === 'gallery'
        );
        setPhotoStories(filtered);
      }
    } catch (err) {
      console.error(err);
      toast.error('ফটো স্টোরি তালিকা লোড করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotoStories();
  }, []);

  // Upload cover image
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    setUploadingCover(true);
    try {
      const res = await api.uploadMedia(formData);
      if (res.success && res.file) {
        setFeaturedImage(res.file.url);
        toast.success('কভার ছবি আপলোড সফল হয়েছে!');
      } else {
        toast.error(res.message || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('ছবি আপলোডে ত্রুটি দেখা দিয়েছে');
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload photo into gallery
  const handleGalleryPhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    setUploadingIndex(index);
    try {
      const res = await api.uploadMedia(formData);
      if (res.success && res.file) {
        const updated = [...galleryImages];
        updated[index].url = res.file.url;
        setGalleryImages(updated);
        toast.success('ছবি আপলোড সফল হয়েছে!');
      } else {
        toast.error(res.message || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('ছবি আপলোডে ত্রুটি দেখা দিয়েছে');
    } finally {
      setUploadingIndex(null);
    }
  };

  // Add new photo item to gallery
  const handleAddGalleryItem = () => {
    setGalleryImages(prev => [...prev, { url: '', caption: '', credit: '' }]);
  };

  // Remove photo item from gallery
  const handleRemoveGalleryItem = (index) => {
    if (galleryImages.length === 1) {
      setGalleryImages([{ url: '', caption: '', credit: '' }]);
      return;
    }
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Move gallery photo up/down
  const handleMoveGalleryItem = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= galleryImages.length) return;
    const updated = [...galleryImages];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setGalleryImages(updated);
  };

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingStoryId(null);
    setTitle('');
    setSubtitle('');
    setPhotographer('বেঙ্গল টাইমস ফটো ডেস্ক');
    setFeaturedImage('');
    setDescription('');
    setStatus('published');
    setGalleryImages([
      { url: '', caption: '', credit: '' }
    ]);
    setShowEditor(true);
  };

  // Open Edit Mode
  const handleOpenEdit = (story) => {
    setEditingStoryId(story._id);
    setTitle(story.title || '');
    setSubtitle(story.subtitle || story.summary || '');
    setPhotographer(story.source || story.author || 'বেঙ্গল টাইমস ফটো ডেস্ক');
    setFeaturedImage(story.featuredImage || '');
    setDescription(story.content || story.summary || '');
    setStatus(story.status || 'published');
    
    if (Array.isArray(story.galleryImages) && story.galleryImages.length > 0) {
      setGalleryImages(story.galleryImages);
    } else {
      setGalleryImages([
        { url: story.featuredImage || '', caption: story.subtitle || '', credit: story.source || '' }
      ]);
    }
    setShowEditor(true);
  };

  // Save Photo Story
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('দয়া করে ফটো স্টোরির শিরোনাম লিখুন');
      return;
    }

    const validPhotos = galleryImages.filter(g => g.url && g.url.trim());
    if (!featuredImage && validPhotos.length === 0) {
      toast.error('দয়া করে অন্তত একটি ছবি যুক্ত বা আপলোড করুন');
      return;
    }

    setSaving(true);
    try {
      const cover = featuredImage || (validPhotos[0] ? validPhotos[0].url : '');
      const payload = {
        title,
        subtitle,
        summary: subtitle || description.substring(0, 160),
        content: description || `<p>${subtitle}</p>`,
        category: 'ছবি',
        subcategory: 'ফটোস্টোরি',
        multimediaType: 'gallery',
        featuredImage: cover,
        galleryImages: validPhotos.length > 0 ? validPhotos : [{ url: cover, caption: subtitle, credit: photographer }],
        source: photographer,
        status: status || 'published',
        author: photographer,
        authorDesignation: 'ফটোগ্রাফার'
      };

      let res;
      if (editingStoryId) {
        res = await api.put(`/articles/${editingStoryId}`, payload);
      } else {
        res = await api.post('/articles', payload);
      }

      if (res.success) {
        toast.success(editingStoryId ? 'ফটো স্টোরি সফলভাবে আপডেট হয়েছে!' : 'নতুন ফটো স্টোরি সফলভাবে প্রকাশিত হয়েছে!');
        setShowEditor(false);
        loadPhotoStories();
      } else {
        toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // Delete Story
  const handleDelete = async (id, storyTitle) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${storyTitle}" ফটো স্টোরিটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await api.delete(`/articles/${id}`);
      if (res.success) {
        toast.success('ফটো স্টোরি মুছে ফেলা হয়েছে');
        loadPhotoStories();
      } else {
        toast.error(res.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('অনুমতি নেই বা সার্ভার সমস্যা');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/10 text-red-600 dark:text-red-500 rounded-xl">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                ফটো স্টোরি ও ছবির গল্প (Photo Story)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ক্যামেরার লেন্সে তোলা বিশেষ ছবির গল্প, ফটো ফিচার ও চিত্রসংবাদ সরাসরি আপলোড ও ম্যানেজ করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadPhotoStories}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {!showEditor && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন ফটো স্টোরি আপলোড করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor or List View */}
      {showEditor ? (
        /* ═══════════════════════════════════════════════
           PHOTO STORY CREATION & EDIT DRAWER
           ═══════════════════════════════════════════════ */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                title="ফিরে যান"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingStoryId ? 'ফটো স্টোরি সম্পাদনা' : 'নতুন ফটো স্টোরি তৈরি করুন'}
                </h2>
                <span className="text-xs text-slate-400">
                  বিভাগ: <strong>ছবি</strong> | সাব-ক্যাটাগরি: <strong>ফটোস্টোরি</strong>
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Title & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ফটো স্টোরির শিরোনাম (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: পদ্মার চরে কাশফুলের সমারোহ, ছবিতে দেখুন শারদীয় রূপ..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ফটোগ্রাফার / ছবির ক্রেডিট (Photo Credit)
                </label>
                <input
                  type="text"
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  placeholder="যেমন: রফিক উদ্দিন / বেঙ্গল টাইমস"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  সংক্ষিপ্ত ভূমিকা বা উপ-শিরোনাম (Subtitle / Intro)
                </label>
                <textarea
                  rows="2"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="এই ছবির গল্পের পটভূমি ও সংক্ষিপ্ত ভূমিকা..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Cover Photo */}
              <div className="md:col-span-12">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  মূল কভার ছবি (Hero Featured Image)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="ছবির সরাসরি লিংক (URL) লিখুন অথবা ডানপাশের বাটনে ক্লিক করে আপলোড করুন..."
                    className="flex-1 w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-slate-100"
                  />
                  <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    <span>{uploadingCover ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>

                {featuredImage && (
                  <div className="mt-3 relative w-48 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={featuredImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/90 text-white rounded-md text-xs"
                      title="ছবি মুছুন"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Multiple Gallery Photos Manager */}
            <div className="bg-slate-50 dark:bg-slate-850/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      ফটো স্টোরির ধারাবাহিক ছবিসমূহ ({galleryImages.length}টি)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      প্রতিটি ছবির সাথে আকর্ষণীয় ক্যাপশন যুক্ত করুন। পাঠকরা স্লাইড আকারে এগুলো দেখতে পাবেন।
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddGalleryItem}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ আরও ছবি যোগ করুন</span>
                </button>
              </div>

              <div className="space-y-4">
                {galleryImages.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 text-red-600">
                        <Camera className="h-3.5 w-3.5" />
                        <span>ছবি #{idx + 1}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveGalleryItem(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                          title="উপরে নিন"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveGalleryItem(idx, 1)}
                          disabled={idx === galleryImages.length - 1}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                          title="নিচে নিন"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded ml-2"
                          title="এই ছবিটি মুছুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Image Preview & URL */}
                      <div className="md:col-span-5 flex items-center gap-3">
                        <div className="w-20 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.url ? (
                            <img src={item.url} alt={`Photo ${idx+1}`} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => {
                              const updated = [...galleryImages];
                              updated[idx].url = e.target.value;
                              setGalleryImages(updated);
                            }}
                            placeholder="ছবির লিঙ্ক (URL)..."
                            className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <label className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">
                            <Upload className="h-3 w-3" />
                            <span>{uploadingIndex === idx ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ছবি আপলোড'}</span>
                            <input type="file" accept="image/*" onChange={(e) => handleGalleryPhotoUpload(e, idx)} className="hidden" />
                          </label>
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="md:col-span-5">
                        <textarea
                          rows="2"
                          value={item.caption}
                          onChange={(e) => {
                            const updated = [...galleryImages];
                            updated[idx].caption = e.target.value;
                            setGalleryImages(updated);
                          }}
                          placeholder="এই ছবির বিস্তারিত ক্যাপশন লিখুন (যেমন: বিকেলে নদীর পাড়ে জেলেদের মাছ ধরার দৃশ্য)..."
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      {/* Credit */}
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={item.credit}
                          onChange={(e) => {
                            const updated = [...galleryImages];
                            updated[idx].credit = e.target.value;
                            setGalleryImages(updated);
                          }}
                          placeholder="ছবির স্থান / ক্রেডিট..."
                          className="w-full px-2.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publishing Status & Action */}
            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">স্ট্যাটাস:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="published">পাবলিশ করুন (Live)</option>
                  <option value="draft">খসড়া রাখুন (Draft)</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-500/10 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'সংরক্ষণ করা হচ্ছে...' : 'ফটো স্টোরি প্রকাশ করুন'}</span>
                </button>
              </div>
            </div>

          </form>

        </div>
      ) : (
        /* ═══════════════════════════════════════════════
           PHOTO STORIES LIST & CARDS GRID
           ═══════════════════════════════════════════════ */
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              মোট প্রকাশিত ফটো স্টোরি: <strong className="text-slate-800 dark:text-white font-bold">{photoStories.length}</strong> টি
            </span>
          </div>

          {loading && photoStories.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-red-500" />
              <span className="text-xs">ফটো স্টোরি লোড হচ্ছে...</span>
            </div>
          ) : photoStories.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
              <Camera className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">এখনো কোনো ফটো স্টোরি আপলোড করা হয়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                উপরের '+ নতুন ফটো স্টোরি আপলোড করুন' বাটনে ক্লিক করে আকর্ষণীয় ছবি ও ক্যাপশনসহ প্রথম ফটো স্টোরিটি প্রকাশ করুন।
              </p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>প্রথম ফটো স্টোরি তৈরি করুন</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photoStories.map((story) => {
                const photoCount = (story.galleryImages && story.galleryImages.length > 0) 
                  ? story.galleryImages.length 
                  : (story.featuredImage ? 1 : 0);

                return (
                  <div 
                    key={story._id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail & Badge */}
                      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {story.featuredImage ? (
                          <img 
                            src={story.featuredImage} 
                            alt={story.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Camera className="h-10 w-10" />
                          </div>
                        )}

                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                          <Camera className="h-3 w-3 text-red-400" />
                          <span>{photoCount}টি ছবি</span>
                        </div>

                        <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          story.status === 'published' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {story.status === 'published' ? 'লাইভ' : 'খসড়া'}
                        </span>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                          {story.title}
                        </h3>
                        {story.summary && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {story.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{story.source || story.author || 'ফটো ডেস্ক'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{story.views || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                      <a
                        href={`/article/${story.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="ওয়েবসাইটে দেখুন"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>প্রিভিউ</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(story)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={() => handleDelete(story._id, story.title)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default PhotoStoryTab;
