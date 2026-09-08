import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import BlockArticleEditor from '../../components/BlockArticleEditor';
import { 
  Save, Sparkles, ShieldCheck, History, Clock, MapPin, 
  Megaphone, AlertCircle, Eye, RefreshCw, CheckCircle, ArrowLeft
} from 'lucide-react';

const DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 
  'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'
];

const DISTRICTS_BY_DIV = {
  'ঢাকা': ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ', 'নরসিংদী', 'টাঙ্গাইল', 'ফরিদপুর'],
  'চট্টগ্রাম': ['চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ফেনী', 'ব্রাহ্মণবাড়িয়া', 'নোয়াখালী', 'চাঁদপুর', 'রাঙ্গামাটি'],
  'রাজশাহী': ['রাজশাহী', 'বগুড়া', 'পাবনা', 'সিরাজগঞ্জ', 'নওগাঁ', 'নাটোর', 'চাঁপাইনবাবগঞ্জ', 'জয়পুরহাট'],
  'খুলনা': ['খুলনা', 'যশোর', 'কুষ্টিয়া', 'সাতক্ষীরা', 'বাগেরহাট', 'ঝিনাইদহ', 'মাগুরা', 'মেহেরপুর'],
  'বরিশাল': ['বরিশাল', 'পটুয়াখালী', 'ভোলা', 'পিরোজপুর', 'বরগুনা', 'ঝালকাঠি'],
  'সিলেট': ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'],
  'রংপুর': ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'গাইবান্ধা', 'নীলফামারী', 'পঞ্চগড়', 'ঠাকুরগাঁও', 'লালমনিরহাট'],
  'ময়মনসিংহ': ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা', 'শেরপুর']
};

const BlockEditorTab = ({ 
  editingArticleId, 
  onSaveSuccess, 
  onCancel,
  categories = [] 
}) => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState('meta'); // meta, trust, local, ads, revisions
  const [revisions, setRevisions] = useState([]);
  
  // Article Core Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('bangladesh');
  const [subcategory, setSubcategory] = useState('');
  const [status, setStatus] = useState('draft'); // draft, review, scheduled, published, updated, archived, trash
  const [scheduledDate, setScheduledDate] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [multimediaType, setMultimediaType] = useState('standard');
  const [duration, setDuration] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

  // Content Blocks
  const [blocks, setBlocks] = useState([]);

  // Trust & Verification
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [verificationNote, setVerificationNote] = useState('');
  const [factBox, setFactBox] = useState([]);
  const [factBoxInput, setFactBoxInput] = useState('');
  const [whatWeKnowInput, setWhatWeKnowInput] = useState('');
  const [whatWeDontKnowInput, setWhatWeDontKnowInput] = useState('');
  const [newCorrectionText, setNewCorrectionText] = useState('');
  const [corrections, setCorrections] = useState([]);

  // AI Summary
  const [aiSummary, setAiSummary] = useState('');
  const [keyPointsInput, setKeyPointsInput] = useState('');

  // Location
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');

  // In-article ad placement settings
  const [adSettings, setAdSettings] = useState({
    autoInsert: true,
    positions: [3, 7, 12],
    maxAds: 3
  });

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Autosave status indicator
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Load article if editing
  useEffect(() => {
    if (editingArticleId) {
      loadArticleData(editingArticleId);
    } else {
      resetForm();
    }
  }, [editingArticleId]);

  const loadArticleData = async (id) => {
    try {
      const res = await api.get(`/articles/${id}`);
      if (res.success && res.article) {
        const art = res.article;
        setTitle(art.title || '');
        setSubtitle(art.subtitle || '');
        setCategory(art.category || 'bangladesh');
        setSubcategory(art.subcategory || '');
        setStatus(art.status || 'draft');
        setScheduledDate(art.scheduledDate ? art.scheduledDate.substring(0, 16) : '');
        setTags(Array.isArray(art.tags) ? art.tags.join(', ') : (art.tags || ''));
        setFeaturedImage(art.featuredImage || '');
        setVideoUrl(art.videoUrl || '');
        setMultimediaType(art.multimediaType || 'standard');
        setDuration(art.duration || '');
        setIsLead(!!art.isLead);
        setIsBreaking(!!art.isBreaking);

        // Blocks or raw content fallback
        if (Array.isArray(art.blocks) && art.blocks.length > 0) {
          setBlocks(art.blocks);
        } else if (art.content) {
          // Parse HTML content into basic paragraph block
          setBlocks([
            { id: 'b_1', type: 'paragraph', content: art.content }
          ]);
        }

        // Trust features
        setVerificationStatus(art.verificationStatus || 'unverified');
        setVerificationNote(art.verificationNote || '');
        setFactBox(art.factBox || []);
        setFactBoxInput(Array.isArray(art.factBox) ? art.factBox.join('\n') : '');
        setWhatWeKnowInput(Array.isArray(art.whatWeKnow) ? art.whatWeKnow.join('\n') : '');
        setWhatWeDontKnowInput(Array.isArray(art.whatWeDontKnow) ? art.whatWeDontKnow.join('\n') : '');
        setCorrections(art.corrections || []);

        // AI Summary
        setAiSummary(art.aiSummary || art.summary || '');
        setKeyPointsInput(Array.isArray(art.keyPoints) ? art.keyPoints.join('\n') : '');

        // Location
        setDivision(art.division || '');
        setDistrict(art.district || '');
        setUpazila(art.upazila || '');

        // Ad settings
        if (art.adSettings) setAdSettings(art.adSettings);

        // SEO
        setSeoTitle(art.seo?.metaTitle || art.title || '');
        setSeoDesc(art.seo?.metaDescription || art.summary || '');
        setSeoKeywords(art.seo?.keywords || '');

        // Revisions
        setRevisions(art.revisions || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('আর্টিকেল লোড করতে ত্রুটি ঘটেছে');
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setCategory('bangladesh');
    setSubcategory('');
    setStatus('draft');
    setScheduledDate('');
    setTags('');
    setFeaturedImage('');
    setVideoUrl('');
    setMultimediaType('standard');
    setDuration('');
    setIsLead(false);
    setIsBreaking(false);
    setBlocks([
      { id: 'b_1', type: 'paragraph', content: '' }
    ]);
    setVerificationStatus('unverified');
    setVerificationNote('');
    setFactBoxInput('');
    setWhatWeKnowInput('');
    setWhatWeDontKnowInput('');
    setCorrections([]);
    setAiSummary('');
    setKeyPointsInput('');
    setDivision('');
    setDistrict('');
    setUpazila('');
    setSeoTitle('');
    setSeoDesc('');
    setSeoKeywords('');
    setRevisions([]);
  };

  // Generate AI Summary directly from content blocks
  const handleGenerateAISummary = async () => {
    if (!title && blocks.length === 0) {
      toast.warning('এআই সারসংক্ষেপ তৈরির জন্য শিরোনাম বা কন্টেন্ট লিখুন');
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await api.post('/articles/generate-summary', {
        title,
        blocks,
        content: blocks.map(b => b.content || '').join('\n')
      });
      if (res.success) {
        setAiSummary(res.aiSummary || '');
        if (res.keyPoints) {
          setKeyPointsInput(res.keyPoints.join('\n'));
        }
        toast.success('এআই সারসংক্ষেপ সফলভাবে তৈরি হয়েছে');
      } else {
        toast.error('সারসংক্ষেপ তৈরি করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('এআই সার্ভার রেসপন্স করেনি');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Add a correction entry
  const handleAddCorrection = () => {
    if (!newCorrectionText.trim()) return;
    const item = {
      date: new Date().toISOString(),
      text: newCorrectionText.trim()
    };
    setCorrections(prev => [item, ...prev]);
    setNewCorrectionText('');
    toast.info('সংশোধনী নোট যুক্ত করা হয়েছে');
  };

  // Restore previous revision
  const handleRestoreRevision = async (revId) => {
    if (!window.confirm('আপনি কি পূর্ববর্তী এই সংস্করণে ফিরে যেতে চান?')) return;
    try {
      const res = await api.post(`/articles/${editingArticleId}/restore-revision`, { revisionId: revId });
      if (res.success) {
        toast.success('পূর্ববর্তী সংস্করণ সফলভাবে রিস্টোর হয়েছে');
        loadArticleData(editingArticleId);
      } else {
        toast.error(res.message || 'রিস্টোর ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    }
  };

  // Save Article
  const handleSave = async (e, saveStatusOverride = null) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.warning('সংবাদের শিরোনাম আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const finalStatus = saveStatusOverride || status;
      const payload = {
        title,
        subtitle,
        category,
        subcategory,
        status: finalStatus,
        scheduledDate: finalStatus === 'scheduled' ? scheduledDate : undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        featuredImage,
        videoUrl,
        multimediaType,
        duration,
        isLead,
        isBreaking,
        blocks,
        // Plain text fallback
        content: blocks.filter(b => b.type === 'paragraph').map(b => `<p>${b.content}</p>`).join(''),
        summary: aiSummary,
        aiSummary,
        keyPoints: keyPointsInput.split('\n').map(s => s.trim()).filter(Boolean),
        // Trust
        verificationStatus,
        verificationNote,
        factBox: factBoxInput.split('\n').map(s => s.trim()).filter(Boolean),
        whatWeKnow: whatWeKnowInput.split('\n').map(s => s.trim()).filter(Boolean),
        whatWeDontKnow: whatWeDontKnowInput.split('\n').map(s => s.trim()).filter(Boolean),
        corrections,
        // Location
        division,
        district,
        upazila,
        // Ads
        adSettings,
        // SEO
        seo: {
          metaTitle: seoTitle || title,
          metaDescription: seoDesc || aiSummary,
          keywords: seoKeywords || tags
        }
      };

      let res;
      if (editingArticleId) {
        res = await api.put(`/articles/${editingArticleId}`, payload);
      } else {
        res = await api.post('/articles', payload);
      }

      if (res.success) {
        setLastSavedTime(new Date());
        toast.success(editingArticleId ? 'সংবাদটি আপডেট হয়েছে' : 'নতুন সংবাদ সফলভাবে সংরক্ষণ করা হয়েছে');
        if (onSaveSuccess) onSaveSuccess(res.article);
      } else {
        toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('সার্ভার এরর');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 cursor-pointer"
              title="তালিকায় ফিরে যান"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center space-x-2">
              <span>{editingArticleId ? 'সংবাদ সম্পাদনা (Block CMS)' : 'নতুন ব্লক-ভিত্তিক সংবাদ রচনা'}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                (status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600')
              }`}>
                {status}
              </span>
            </h2>
            {lastSavedTime && (
              <span className="text-[10px] text-gray-400">
                সর্বশেষ সেভ: {lastSavedTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={(e) => handleSave(e, 'draft')}
            disabled={submitting}
            className="px-3.5 py-2 border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
          >
            খসড়া সেভ (Draft)
          </button>
          
          <button
            type="button"
            onClick={(e) => handleSave(e, 'published')}
            disabled={submitting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{submitting ? 'প্রকাশ হচ্ছে...' : 'প্রকাশ করুন (Publish)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Title & Subtitle */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-3xl shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                সংবাদের মূল শিরোনাম (Headline) *
              </label>
              <input
                type="text"
                required
                placeholder="সংবাদের আকর্ষণীয় ও স্পষ্ট শিরোনাম লিখুন..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-neutral-700 rounded-2xl text-base font-extrabold bg-gray-50/50 dark:bg-neutral-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-neutral-400 mb-1">
                উপ-শিরোনাম / শোল্ডার (Subheadline)
              </label>
              <input
                type="text"
                placeholder="উপ-শিরোনাম লিখুন..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Block-based Content System */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  ব্লক কন্টেন্ট বিল্ডার (Block-Based Story Architecture)
                </h3>
                <p className="text-[11px] text-gray-400">
                  প্যারাগ্রাফ, হেডিং, ইমেজ গ্যালারি, কোট, ভিডিও, অডিও, ফ্যাক্ট বক্স ও ইন-আর্টিকেল বিজ্ঞাপন ব্লক
                </p>
              </div>
            </div>

            <BlockArticleEditor
              initialBlocks={blocks}
              onChange={(newBlocks) => setBlocks(newBlocks)}
            />
          </div>

          {/* AI Summary Box */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  সংক্ষেপে পড়ুন — এআই সারসংক্ষেপ ও বুলেট পয়েন্ট
                </h3>
              </div>
              <button
                type="button"
                onClick={handleGenerateAISummary}
                disabled={generatingAI}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{generatingAI ? 'জেনারেট হচ্ছে...' : 'এআই দিয়ে তৈরি করুন'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-neutral-400 mb-1">
                এআই সামারি টেক্সট (AI Generated Summary)
              </label>
              <textarea
                rows="3"
                placeholder="এআই দিয়ে স্বয়ংক্রিয়ভাবে তৈরি অথবা নিজে লিখুন..."
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-neutral-400 mb-1">
                প্রধান বুলেট পয়েন্টসমূহ (Key Takeaways - প্রতি লাইনে একটি)
              </label>
              <textarea
                rows="2"
                placeholder="পয়েন্ট ১&#10;পয়েন্ট ২&#10;পয়েন্ট ৩"
                value={keyPointsInput}
                onChange={(e) => setKeyPointsInput(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings Accordions (1 Col) */}
        <div className="space-y-6">
          {/* Publishing Controls */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
              পাবলিশিং সেটিংস
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                স্ট্যাটাস (Workflow State)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white font-bold"
              >
                <option value="draft">খসড়া (Draft)</option>
                <option value="review">পর্যালোচনায় (In Review)</option>
                <option value="scheduled">নির্ধারিত সময়ে প্রকাশ (Scheduled)</option>
                <option value="published">লাইভ প্রকাশিত (Published)</option>
                <option value="archived">আর্কাইভড (Archived)</option>
                <option value="trash">ট্র্যাশ (Trash)</option>
              </select>
            </div>

            {status === 'scheduled' && (
              <div>
                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                  স্বয়ংক্রিয় প্রকাশের তারিখ ও সময়
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-800 text-gray-900 dark:text-white font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                ক্যাটাগরি (Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white font-bold"
              >
                {categories.map(c => (
                  <option key={c._id || c.slug} value={c.slug || c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Lead & Breaking Toggles */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span>হোমপেজ প্রধান খবর (Lead Story)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span>ব্রেকিং নিউজ টিকার (Breaking News)</span>
              </label>
            </div>
          </div>

          {/* Media & Featured Image */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
              মিডিয়া ও ফিচার ছবি
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                ফিচার ইমেজ URL
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
              />
              {featuredImage && (
                <img src={featuredImage} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl border" />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                ভিডিও লিংক (YouTube URL)
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
              />
            </div>
          </div>

          {/* Local News Targeting (District / Division) */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 dark:text-white">
              <MapPin className="h-4 w-4 text-red-600" />
              <span>আমার এলাকার খবর (লোকাল নিউজ)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">বিভাগ</label>
                <select
                  value={division}
                  onChange={(e) => { setDivision(e.target.value); setDistrict(''); }}
                  className="w-full px-2 py-1.5 border rounded-lg text-xs bg-gray-50 dark:bg-neutral-800"
                >
                  <option value="">নির্বাচন করুন</option>
                  {DIVISIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">জেলা</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!division}
                  className="w-full px-2 py-1.5 border rounded-lg text-xs bg-gray-50 dark:bg-neutral-800 disabled:opacity-50"
                >
                  <option value="">নির্বাচন করুন</option>
                  {(DISTRICTS_BY_DIV[division] || []).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Trust & Verification Center */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>সম্পাদকীয় সত্যতা ও ভেরিফিকেশন</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">ভেরিফিকেশন স্ট্যাটাস</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-gray-50 dark:bg-neutral-800 font-bold"
              >
                <option value="unverified">Unverified (যাচাই প্রক্রিয়াধীন)</option>
                <option value="verified">Verified (সম্পূর্ণ যাচাইকৃত সত্য)</option>
                <option value="developing">Developing (চলমান ও বিকাশমান তথ্য)</option>
              </select>
            </div>

            {/* Corrections Notice */}
            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800">
              <label className="block text-[10px] font-bold text-gray-500 mb-1">সংশোধনী নোট যোগ করুন</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. তথ্যের ভুল সংশোধন করা হয়েছে..."
                  value={newCorrectionText}
                  onChange={(e) => setNewCorrectionText(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded-lg text-xs bg-gray-50 dark:bg-neutral-800"
                />
                <button
                  type="button"
                  onClick={handleAddCorrection}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold"
                >
                  যুক্ত
                </button>
              </div>
            </div>
          </div>

          {/* In-Article Ad Placement Overrides */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 dark:text-white">
              <Megaphone className="h-4 w-4 text-blue-600" />
              <span>ইন-আর্টিকেল বিজ্ঞাপন রুলস</span>
            </div>

            <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={adSettings.autoInsert}
                onChange={(e) => setAdSettings({ ...adSettings, autoInsert: e.target.checked })}
                className="rounded text-red-600"
              />
              <span>স্বয়ংক্রিয় বিজ্ঞাপন প্লেসমেন্ট চালু</span>
            </label>

            <div className="text-[10px] text-gray-400">
              প্যারাগ্রাফ দৈর্ঘ্য অনুযায়ী ৩, ৭ ও ১২ নং ব্লকের পর ইন-আর্টিকেল বিজ্ঞাপন পরিবেশিত হবে।
            </div>
          </div>

          {/* Revisions History Drawer */}
          {revisions.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-3xl shadow-xs space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 dark:text-white">
                <History className="h-4 w-4 text-purple-600" />
                <span>পূর্ববর্তী সংস্করণ হিস্ট্রি ({revisions.length})</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {revisions.slice(0, 6).map((rev) => (
                  <div key={rev._id || rev.savedAt} className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-800 dark:text-neutral-200">
                        {new Date(rev.savedAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-gray-400">{rev.savedByName || 'Author'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestoreRevision(rev._id)}
                      className="px-2 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black hover:bg-purple-700 cursor-pointer"
                    >
                      রিস্টোর
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockEditorTab;
