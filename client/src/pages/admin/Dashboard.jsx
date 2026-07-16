import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import RichTextEditor from '../../components/RichTextEditor';
import MediaLibrary from '../../components/MediaLibrary';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar 
} from 'recharts';
import { 
  BarChart3, FileText, Image as ImageIcon, Tags, 
  MessageSquare, Megaphone, Users, ShieldAlert, 
  ChevronRight, LogOut, Globe, Plus, Trash2, Check, X,
  Calendar, Eye, HelpCircle, Save, Settings, Cpu
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Define tab properties dynamically with role validation arrays
  const tabs = [
    { id: 'overview', name: 'Overview Analytics', icon: BarChart3, roles: ['Super Admin', 'Admin', 'Editor', 'SEO Manager'] },
    { id: 'articlesList', name: 'Manage Articles', icon: FileText, roles: ['Super Admin', 'Admin', 'Editor', 'Reporter'] },
    { id: 'editor', name: 'Write Article', icon: Plus, roles: ['Super Admin', 'Admin', 'Editor', 'Reporter'] },
    { id: 'media', name: 'Media Library', icon: ImageIcon, roles: ['Super Admin', 'Admin', 'Editor', 'Reporter'] },
    { id: 'taxonomy', name: 'Categories & Tags', icon: Tags, roles: ['Super Admin', 'Admin', 'Editor', 'SEO Manager'] },
    { id: 'comments', name: 'Moderate Comments', icon: MessageSquare, roles: ['Super Admin', 'Admin', 'Editor', 'Moderator'] },
    { id: 'ads', name: 'Manage Ads', icon: Megaphone, roles: ['Super Admin', 'Admin'] },
    { id: 'roles', name: 'Role Management', icon: Users, roles: ['Super Admin', 'Admin'] },
    { id: 'layout', name: 'Homepage Layout', icon: Settings, roles: ['Super Admin', 'Admin', 'Editor'] },
    { id: 'aiDrafts', name: 'AI Drafts Review', icon: ShieldAlert, roles: ['Super Admin', 'Admin', 'Editor'] }
  ];

  const allowedTabs = tabs.filter(tab => hasPermission(tab.roles));

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Adjust active tab if user lacks permission for default 'overview'
  useEffect(() => {
    if (user && allowedTabs.length > 0 && !allowedTabs.some(t => t.id === activeTab)) {
      setActiveTab(allowedTabs[0].id);
    }
  }, [user, allowedTabs]);

  // Analytics Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Editor Form States
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSubtitle, setArticleSubtitle] = useState('');
  const [articleContent, setArticleContent] = useState('<p><br></p>');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleCategory, setArticleCategory] = useState('Bangladesh');
  const [articleTags, setArticleTags] = useState('');
  const [articleStatus, setArticleStatus] = useState('draft');
  const [articleFeaturedImage, setArticleFeaturedImage] = useState('');
  const [articleVideoUrl, setArticleVideoUrl] = useState('');
  const [articleScheduledDate, setArticleScheduledDate] = useState('');
  const [articleSeoTitle, setArticleSeoTitle] = useState('');
  const [articleSeoDesc, setArticleSeoDesc] = useState('');
  const [articleSeoKeywords, setArticleSeoKeywords] = useState('');
  
  // Media selector modal helper
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [articlesList, setArticlesList] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');

  const filteredArticles = articlesList.filter(art => 
    (art.title || '').toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
    (art.author || '').toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
    (art.category || '').toLowerCase().includes(articleSearchQuery.toLowerCase())
  );

  // Category Manager States
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatOrder, setNewCatOrder] = useState(0);

  // Tag Manager States
  const [tags, setTags] = useState([]);
  const [sourceTagSlug, setSourceTagSlug] = useState('');
  const [targetTagSlug, setTargetTagSlug] = useState('');
  const [mergeMessage, setMergeMessage] = useState('');

  // Comment Moderation States
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Ad Manager States
  const [ads, setAds] = useState([]);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdPlacement, setNewAdPlacement] = useState('header');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdLinkUrl, setNewAdLinkUrl] = useState('');
  const [newAdScriptCode, setNewAdScriptCode] = useState('');
  const [newAdType, setNewAdType] = useState('image');

  // Homepage Layout States
  const [homepageSections, setHomepageSections] = useState([]);
  const [newSectionCategory, setNewSectionCategory] = useState('');
  const [newSectionLayout, setNewSectionLayout] = useState('grid');

  // AI News States
  const [aiArticles, setAiArticles] = useState([]);
  const [triggeringAi, setTriggeringAi] = useState(false);
  const [geminiKeysText, setGeminiKeysText] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);
  const [testingKeys, setTestingKeys] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState([]);
  const [showKeyManager, setShowKeyManager] = useState(false);

  // User Manager States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Redirect non-staff
  useEffect(() => {
    if (loading) return;
    if (!hasPermission(['Reporter', 'Editor', 'Admin', 'Super Admin', 'SEO Manager', 'Moderator'])) {
      navigate('/login-admin');
    }
  }, [user, loading]);

  // Load Dashboard Analytics
  const loadAnalytics = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadAnalytics();
    } else if (activeTab === 'taxonomy') {
      loadTaxonomies();
    } else if (activeTab === 'comments') {
      loadComments();
    } else if (activeTab === 'ads') {
      loadAds();
    } else if (activeTab === 'roles') {
      loadUsers();
    } else if (activeTab === 'layout') {
      loadHomepageLayout();
      loadTaxonomies();
    } else if (activeTab === 'aiDrafts') {
      loadAiArticles();
      loadGeminiKeys();
    } else if (activeTab === 'articlesList') {
      fetchArticlesList();
    }
  }, [activeTab]);

  // Load categories and tags for CMS
  const loadTaxonomies = async () => {
    try {
      const catRes = await api.get('/taxonomy/categories');
      if (catRes.success) setCategories(catRes.categories);
      const tagRes = await api.get('/taxonomy/tags');
      if (tagRes.success) setTags(tagRes.tags);
    } catch (err) {
      console.error(err);
    }
  };

  // Load comments
  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await api.get('/comments');
      if (res.success) setComments(res.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Load ads
  const loadAds = async () => {
    try {
      const res = await api.get('/ads/all');
      if (res.success) setAds(res.ads);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Users list
  const loadUsers = async () => {
    if (!hasPermission(['Admin', 'Super Admin'])) return;
    setUsersLoading(true);
    try {
      const res = await api.get('/auth/users');
      if (res.success) setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load all articles for list views
  const fetchArticlesList = async () => {
    setArticlesLoading(true);
    try {
      const isStaff = ['Super Admin', 'Admin', 'Editor'].includes(user?.role);
      const authorQuery = isStaff ? '' : `&authorId=${user?.id}`;

      // Query articles with all statuses
      const res = await api.get(`/articles?status=draft&limit=100${authorQuery}`);
      const resPub = await api.get(`/articles?status=published&limit=100${authorQuery}`);
      const resSched = await api.get(`/articles?status=scheduled&limit=100${authorQuery}`);
      
      let all = [];
      if (res.success) all = [...all, ...res.articles];
      if (resPub.success) all = [...all, ...resPub.articles];
      if (resSched.success) all = [...all, ...resSched.articles];

      setArticlesList(all);
    } catch (err) {
      console.error(err);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Handle article creation or updating
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!articleTitle || !articleContent || !articleCategory) {
      toast.success('Title, category, and content are required');
      return;
    }

    const payload = {
      title: articleTitle,
      subtitle: articleSubtitle,
      content: articleContent,
      summary: articleSummary,
      category: articleCategory,
      tags: articleTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      status: articleStatus,
      featuredImage: articleFeaturedImage,
      videoUrl: articleVideoUrl,
      scheduledDate: articleScheduledDate,
      seo: {
        metaTitle: articleSeoTitle || articleTitle,
        metaDescription: articleSeoDesc || articleSummary,
        keywords: articleSeoKeywords || articleTags
      }
    };

    try {
      let res;
      if (editingArticleId) {
        res = await api.put(`/articles/${editingArticleId}`, payload);
      } else {
        res = await api.post('/articles', payload);
      }

      if (res.success) {
        toast.success(editingArticleId ? 'Article updated!' : 'Article created!');
        resetEditorForm();
        setActiveTab('overview');
      } else {
        toast.error(res.message || 'সংবাদটি সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditArticle = (art) => {
    setEditingArticleId(art._id);
    setArticleTitle(art.title);
    setArticleSubtitle(art.subtitle || '');
    setArticleContent(art.content);
    setArticleSummary(art.summary || '');
    setArticleCategory(art.category);
    setArticleTags((art.tags || []).join(', '));
    setArticleStatus(art.status);
    setArticleFeaturedImage(art.featuredImage || '');
    setArticleVideoUrl(art.videoUrl || '');
    setArticleScheduledDate(art.scheduledDate ? art.scheduledDate.substring(0, 16) : '');
    setArticleSeoTitle(art.seo?.metaTitle || '');
    setArticleSeoDesc(art.seo?.metaDescription || '');
    setArticleSeoKeywords(art.seo?.keywords || '');
    
    setActiveTab('editor');
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await api.delete(`/articles/${id}`);
      if (res.success) {
        setArticlesList(prev => prev.filter(a => a._id !== id));
        toast.success('আর্টিকেল সফলভাবে মুছে ফেলা হয়েছে।');
        fetchArticlesList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetEditorForm = () => {
    setEditingArticleId(null);
    setArticleTitle('');
    setArticleSubtitle('');
    setArticleContent('<p><br></p>');
    setArticleSummary('');
    setArticleCategory('Bangladesh');
    setArticleTags('');
    setArticleStatus('draft');
    setArticleFeaturedImage('');
    setArticleVideoUrl('');
    setArticleScheduledDate('');
    setArticleSeoTitle('');
    setArticleSeoDesc('');
    setArticleSeoKeywords('');
  };

  // Category Manager Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await api.post('/taxonomy/categories', { name: newCatName, order: newCatOrder });
      if (res.success) {
        setCategories(prev => [...prev, res.category].sort((a,b) => a.order - b.order));
        setNewCatName('');
        setNewCatOrder(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      const res = await api.delete(`/taxonomy/categories/${id}`);
      if (res.success) {
        setCategories(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tag Merging Action
  const handleMergeTags = async (e) => {
    e.preventDefault();
    setMergeMessage('');
    if (!sourceTagSlug || !targetTagSlug) return;
    try {
      const res = await api.post('/taxonomy/merge', { sourceTagSlug, targetTagSlug });
      if (res.success) {
        setMergeMessage(res.message);
        setSourceTagSlug('');
        setTargetTagSlug('');
        loadTaxonomies();
      } else {
        setMergeMessage(res.message);
      }
    } catch (err) {
      setMergeMessage('Merge failed.');
    }
  };

  // Comment Moderation Actions
  const handleModerateComment = async (id, status) => {
    try {
      const res = await api.put(`/comments/${id}`, { status });
      if (res.success) {
        setComments(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Delete comment?')) return;
    try {
      const res = await api.delete(`/comments/${id}`);
      if (res.success) {
        setComments(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ad Placement Manager Actions
  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!newAdTitle || !newAdPlacement) return;
    try {
      const res = await api.post('/ads', {
        title: newAdTitle,
        placement: newAdPlacement,
        type: newAdType,
        imageUrl: newAdImageUrl,
        linkUrl: newAdLinkUrl,
        scriptCode: newAdScriptCode
      });
      if (res.success) {
        setAds(prev => [res.ad, ...prev]);
        setNewAdTitle('');
        setNewAdImageUrl('');
        setNewAdLinkUrl('');
        setNewAdScriptCode('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAd = async (id, active) => {
    try {
      const res = await api.put(`/ads/${id}`, { active });
      if (res.success) {
        setAds(prev => prev.map(a => a._id === id ? { ...a, active } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!window.confirm('Delete Ad?')) return;
    try {
      const res = await api.delete(`/ads/${id}`);
      if (res.success) {
        setAds(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Roles Manager Actions
  const handleRoleChange = async (userId, role) => {
    try {
      const res = await api.put(`/auth/users/${userId}/role`, { role });
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
        toast.success('User role updated successfully.');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all articles written by them.')) return;
    try {
      const res = await api.delete(`/auth/users/${userId}`);
      if (res.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        toast.success('User and their articles deleted successfully.');
      } else {
        toast.error(res.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred.');
    }
  };

  const [translating, setTranslating] = useState(false);

  const handleTranslate = async (targetLang) => {
    if (!articleTitle && !articleContent) {
      toast.success('অনুবাদ করার জন্য অনুগ্রহ করে আগে শিরোনাম বা বিষয়বস্তু লিখুন।');
      return;
    }
    setTranslating(true);
    try {
      const res = await api.post('/articles/translate', {
        title: articleTitle,
        subtitle: articleSubtitle,
        summary: articleSummary,
        content: articleContent,
        targetLang
      });
      if (res.success) {
        setArticleTitle(res.translated.title || '');
        setArticleSubtitle(res.translated.subtitle || '');
        setArticleSummary(res.translated.summary || '');
        setArticleContent(res.translated.content || '');
      } else {
        toast.error(res.message || 'Translation failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Translation request failed.');
    } finally {
      setTranslating(false);
    }
  };

  const loadHomepageLayout = async () => {
    try {
      const res = await api.get('/settings/homepage_layout');
      if (res.success && Array.isArray(res.value)) {
        setHomepageSections(res.value);
      } else {
        setHomepageSections([
          { category: 'Politics', layout: 'grid' },
          { category: 'Technology', layout: 'grid' },
          { category: 'Sports', layout: 'grid' },
          { category: 'Opinion', layout: 'list' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load layout settings:', err);
    }
  };

  const handleAddLayoutSection = (e) => {
    e.preventDefault();
    if (!newSectionCategory) {
      toast.warning('Please select a category first.');
      return;
    }
    if (homepageSections.some(s => s.category.toLowerCase() === newSectionCategory.toLowerCase())) {
      toast.success('This category is already added to the homepage layout.');
      return;
    }
    setHomepageSections(prev => [...prev, { category: newSectionCategory, layout: newSectionLayout }]);
    setNewSectionCategory('');
  };

  const handleRemoveLayoutSection = (idx) => {
    setHomepageSections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMoveLayoutSection = (idx, direction) => {
    const nextSections = [...homepageSections];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= nextSections.length) return;
    const temp = nextSections[idx];
    nextSections[idx] = nextSections[targetIdx];
    nextSections[targetIdx] = temp;
    setHomepageSections(nextSections);
  };

  const handleSaveLayoutSettings = async () => {
    try {
      const res = await api.post('/settings/homepage_layout', { value: homepageSections });
      if (res.success) {
        toast.success('হোমপেজ লেআউট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
      } else {
        toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings.');
    }
  };

  const loadAiArticles = async () => {
    try {
      const res = await api.get('/articles/ai/pending');
      if (res.success) {
        setAiArticles(res.articles);
      }
    } catch (err) {
      console.error('Failed to load pending AI drafts:', err);
    }
  };

  const loadGeminiKeys = async () => {
    try {
      const res = await api.get('/settings/gemini_api_keys');
      if (res.success) {
        setGeminiKeysText(res.value || '');
      }
    } catch (err) {
      console.log('Gemini API keys setting not initialized in DB yet.');
    }
  };

  const handleSaveGeminiKeys = async (e) => {
    e.preventDefault();
    setSavingKeys(true);
    try {
      const res = await api.post('/settings/gemini_api_keys', { value: geminiKeysText });
      if (res.success) {
        toast.success('জেমিনি এপিআই কী সফলভাবে সংরক্ষণ করা হয়েছে!');
      } else {
        toast.error(res.message || 'কী সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save API keys.');
    } finally {
      setSavingKeys(false);
    }
  };

  const handleTestKeys = async () => {
    setTestingKeys(true);
    setKeyStatuses([]);
    
    const parsed = geminiKeysText
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);
      
    if (parsed.length === 0) {
      toast.warning('কোনো API কী পাওয়া যায়নি। প্রথমে কী যোগ করুন।');
      setTestingKeys(false);
      return;
    }
    
    const results = [];
    for (let i = 0; i < parsed.length; i++) {
      const key = parsed[i];
      const masked = key.length > 10 ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : 'Key';
      
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'a' }] }] })
        });
        
        const data = await res.json();
        if (res.status === 200) {
          results.push({ key: masked, status: 'Active', message: 'কাজ করছে (Active)' });
        } else {
          const errMsg = data?.error?.message || 'Error';
          const shortMsg = errMsg.includes('Quota exceeded') ? 'কোটা শেষ (Quota Exceeded)' : 'অবৈধ কী (Invalid Key)';
          results.push({ key: masked, status: 'Error', message: shortMsg });
        }
      } catch (err) {
        results.push({ key: masked, status: 'Error', message: 'নেটওয়ার্ক সমস্যা (Network Error)' });
      }
    }
    
    setKeyStatuses(results);
    setTestingKeys(false);
  };

  const handleTriggerAiResearch = async () => {
    setTriggeringAi(true);
    try {
      const res = await api.post('/articles/ai/trigger');
      if (res.success) {
        toast.success('এআই রিপোর্টার সফলভাবে নতুন সংবাদ রিসার্চ ও ড্রাফট তৈরি করেছে!');
        loadAiArticles();
      } else {
        toast.error(res.message || 'AI news research failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Research request failed.');
    } finally {
      setTriggeringAi(false);
    }
  };

  const handleReviewAiArticle = (art) => {
    // Load into editor states
    setEditingArticleId(art._id);
    setArticleTitle(art.title);
    setArticleSubtitle(art.subtitle || '');
    setArticleContent(art.content);
    setArticleSummary(art.summary || '');
    setArticleCategory(art.category);
    setArticleTags((art.tags || []).join(', '));
    setArticleStatus(art.status);
    setArticleFeaturedImage(art.featuredImage || '');
    setArticleVideoUrl(art.videoUrl || '');
    setArticleScheduledDate(art.scheduledDate ? art.scheduledDate.substring(0, 16) : '');
    setArticleSeoTitle(art.seo?.metaTitle || '');
    setArticleSeoDesc(art.seo?.metaDescription || '');
    setArticleSeoKeywords(art.seo?.keywords || '');
    
    // Switch to editor
    setActiveTab('editor');
  };

  const handleApproveAiArticle = async (id) => {
    try {
      const res = await api.put(`/articles/ai/${id}/approve`);
      if (res.success) {
        toast.success('সংবাদটি অনুমোদন ও প্রকাশ করা হয়েছে!');
        loadAiArticles();
      } else {
        toast.error(res.message || 'Approval failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectAiArticle = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this AI draft?')) return;
    try {
      const res = await api.delete(`/articles/ai/${id}/reject`);
      if (res.success) {
        toast.success('এআই ড্রাফটটি বাতিল ও মুছে ফেলা হয়েছে।');
        loadAiArticles();
      } else {
        toast.error(res.message || 'Rejection failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0b0f19] flex flex-col lg:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-400 dark:bg-slate-950 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-white font-black text-lg">
            <Globe className="h-5 w-5 text-blue-500" />
            <span>দৈনিক দর্পণ</span>
          </Link>
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-900 text-blue-300">
            CMS
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-850 flex items-center space-x-3 bg-slate-950/40">
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name}`} 
            alt={user?.name} 
            className="h-9 w-9 rounded-full bg-slate-850" 
          />
          <div className="truncate">
            <h4 className="text-xs font-bold text-white leading-normal truncate">{user?.name}</h4>
            <span className="text-[9px] font-semibold text-slate-450 uppercase">{user?.role}</span>
          </div>
        </div>

        {/* Nav Tabs (Filtered by Role Permissions) */}
        <nav className="flex-1 p-4 space-y-1.5 font-sans">
          {allowedTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'editor') resetEditorForm();
                  setActiveTab(tab.id);
                }} 
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-650/10' : 'hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/" className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200">
            <Globe className="h-4 w-4" />
            <span>Go to Live Site</span>
          </Link>
          <button 
            onClick={logout} 
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-950/20 text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Workspace */}
      <section className="flex-grow p-6 lg:p-10 overflow-y-auto overflow-x-hidden w-full">
        
        {/* TAB 0: OVERVIEW ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Analytics Overview Dashboard</h1>
              <button 
                onClick={() => { fetchArticlesList(); setActiveTab('articlesList'); }}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Manage Published Articles ➔
              </button>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 h-28 rounded-2xl border" />
                ))}
              </div>
            ) : stats && (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-205 dark:border-slate-800/40 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Total Articles</span>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.articles?.total || 0}</h3>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500 bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-xl shrink-0" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-205 dark:border-slate-800/40 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Total Page Views</span>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.traffic?.pageViews || 0}</h3>
                    </div>
                    <Eye className="h-8 w-8 text-teal-500 bg-teal-50 dark:bg-teal-900/30 p-1.5 rounded-xl shrink-0" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-205 dark:border-slate-800/40 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Active Reporters</span>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.users?.activeReporters || 0}</h3>
                    </div>
                    <Users className="h-8 w-8 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 p-1.5 rounded-xl shrink-0" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-205 dark:border-slate-800/40 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Active Subscribers</span>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.subscribers || 0}</h3>
                    </div>
                    <Globe className="h-8 w-8 text-amber-500 bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-xl shrink-0" />
                  </div>
                </div>

                {/* Line chart for pageviews trend */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Visitor traffic (Last 7 Days)</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Breakdown metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Browser distribution */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-850 dark:text-white mb-4 uppercase">Device distribution</h3>
                    <div className="space-y-4">
                      {Object.keys(stats.devices || {}).map(dev => (
                        <div key={dev} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-655 dark:text-slate-350">
                            <span>{dev}</span>
                            <span>{stats.devices[dev]} views</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-650 h-full" style={{ width: `${Math.round((stats.devices[dev]/stats.traffic.pageViews)*100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Country distribution */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-850 dark:text-white mb-4 uppercase">Visitor Countries</h3>
                    <div className="space-y-4">
                      {Object.keys(stats.countries || {}).map(coun => (
                        <div key={coun} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-655 dark:text-slate-350">
                            <span>{coun}</span>
                            <span>{stats.countries[coun]} views</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full" style={{ width: `${Math.round((stats.countries[coun]/stats.traffic.pageViews)*100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular articles table */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Top Published news by Views</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-500">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] uppercase font-black">
                        <tr>
                          <th className="p-3">Headline Title</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Reads (Views)</th>
                          <th className="p-3">Likes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {stats.topArticles?.map(art => (
                          <tr key={art._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                            <td className="p-3 font-bold truncate max-w-sm">{art.title}</td>
                            <td className="p-3">{art.category}</td>
                            <td className="p-3 font-black text-slate-900 dark:text-white">{art.views}</td>
                            <td className="p-3">{art.likes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: ARTICLES LIST */}
        {activeTab === 'articlesList' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {language === 'bn' ? 'সংবাদ তালিকা ও সম্পাদনা' : 'Articles Management Console'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'bn' 
                    ? 'আপনার প্রকাশিত ও খসড়া সংবাদসমূহ ট্র্যাক, এডিট এবং ডিলিট করুন।' 
                    : 'Track, edit and manage your published, draft and scheduled news reports.'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'সংবাদ অনুসন্ধান করুন...' : 'Search articles...'}
                  value={articleSearchQuery}
                  onChange={(e) => setArticleSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold focus:outline-none w-64 shadow-sm"
                />
                
                <button
                  onClick={() => { resetEditorForm(); setActiveTab('editor'); }}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'bn' ? 'নতুন সংবাদ' : 'Write News'}</span>
                </button>
              </div>
            </div>
            
            {articlesLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 h-16 rounded-xl border border-slate-200/50 dark:border-slate-800/50" />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-850 overflow-hidden shadow-xs">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">কোনো সংবাদ পাওয়া যায়নি।</h3>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-650">
                      <thead className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 uppercase text-[9px] font-black border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="p-4">{language === 'bn' ? 'শিরোনাম' : 'Title'}</th>
                          <th className="p-4">{language === 'bn' ? 'বিভাগ' : 'Category'}</th>
                          <th className="p-4">{language === 'bn' ? 'লেখক' : 'Author'}</th>
                          <th className="p-4">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                          <th className="p-4">{language === 'bn' ? 'ভিউস' : 'Views'}</th>
                          <th className="p-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredArticles.map(art => (
                          <tr key={art._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350 transition-colors">
                            <td className="p-4 font-bold text-slate-800 dark:text-white max-w-sm truncate">
                              {art.title}
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {art.category}
                              </span>
                            </td>
                            <td className="p-4 font-medium">{art.author}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                art.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 
                                (art.status === 'scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')
                              }`}>
                                {art.status}
                              </span>
                            </td>
                            <td className="p-4 font-black">{art.views}</td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end items-center space-x-2">
                                <button 
                                  onClick={() => handleEditArticle(art)}
                                  className="px-3 py-1.5 text-[10px] font-black bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-lg hover:opacity-80 transition-opacity"
                                >
                                  {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteArticle(art._id)}
                                  className="p-1.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-lg hover:opacity-80 transition-opacity"
                                >
                                  <Trash2 className="h-4 w-4" />
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
            )}
          </div>
        )}

        {/* TAB 1: NEWS EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {editingArticleId ? 'সংবাদ সম্পাদনা (Edit Article)' : 'নতুন সংবাদ লিখুন (Write Article)'}
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleTranslate('bn')}
                  disabled={translating}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <span>{translating ? 'অনুবাদ হচ্ছে...' : 'বাংলায় অনুবাদ (Translate to BN)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTranslate('en')}
                  disabled={translating}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <span>{translating ? 'Translating...' : 'Translate to EN (ইংরেজি)'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Editor Content Area (Left 2 columns) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">সংবাদের শিরোনাম (Title) *</label>
                    <input 
                      type="text" 
                      value={articleTitle} 
                      onChange={(e) => setArticleTitle(e.target.value)} 
                      required
                      placeholder="শিরোনাম লিখুন..."
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">উপ-শিরোনাম (Subtitle)</label>
                    <input 
                      type="text" 
                      value={articleSubtitle} 
                      onChange={(e) => setArticleSubtitle(e.target.value)}
                      placeholder="উপ-শিরোনাম লিখুন..."
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* HTML Body Editor Custom Component */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">মূল সংবাদ (Content Body) *</label>
                    <RichTextEditor value={articleContent} onChange={setArticleContent} />
                  </div>

                  {/* Short Summary */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">সংক্ষিপ্ত সারসংক্ষেপ (Short Summary)</label>
                    <textarea 
                      rows="3" 
                      value={articleSummary} 
                      onChange={(e) => setArticleSummary(e.target.value)}
                      placeholder="খবরের একটি ২-৩ লাইনের সারসংক্ষেপ লিখুন..."
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Configurations Panel (Right column) */}
                <div className="space-y-4">
                  
                  {/* Status, Category & Actions Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Publish Desk</h3>
                    
                    {/* Category Selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-605 block mb-1">বিভাগ (Category) *</label>
                      <select 
                        value={articleCategory}
                        onChange={(e) => setArticleCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-250 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                      >
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="International">International</option>
                        <option value="Politics">Politics</option>
                        <option value="Economy">Economy</option>
                        <option value="Sports">Sports</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Technology">Technology</option>
                        <option value="Opinion">Opinion</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-xs font-bold text-slate-605 block mb-1">অবস্থা (Status)</label>
                      <select 
                        value={articleStatus}
                        onChange={(e) => setArticleStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-250 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                      >
                        <option value="draft">Draft (খসড়া)</option>
                        <option value="published">Publish Immediately (প্রকাশিত)</option>
                        <option value="scheduled">Schedule Publish (সময়সূচী)</option>
                      </select>
                    </div>

                    {/* Date Scheduling */}
                    {articleStatus === 'scheduled' && (
                      <div>
                        <label className="text-xs font-bold text-slate-605 block mb-1">তারিখ ও সময় (Publish Date)</label>
                        <input 
                          type="datetime-local" 
                          value={articleScheduledDate}
                          onChange={(e) => setArticleScheduledDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-250 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Tags input */}
                    <div>
                      <label className="text-xs font-bold text-slate-605 block mb-1">ট্যাগসমূহ (Tags - comma separated)</label>
                      <input 
                        type="text" 
                        value={articleTags} 
                        onChange={(e) => setArticleTags(e.target.value)}
                        placeholder="রাজনীতি, নির্বাচন, ঢাকা"
                        className="w-full px-3 py-2 border border-slate-250 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    {/* Featured Image Picker */}
                    <div>
                      <label className="text-xs font-bold text-slate-605 block mb-1">ফিচার ইমেজ লিংক (Featured Image URL)</label>
                      <div className="flex space-x-1">
                        <input 
                          type="text" 
                          value={articleFeaturedImage}
                          onChange={(e) => setArticleFeaturedImage(e.target.value)}
                          placeholder="/uploads/file.png or external link"
                          className="flex-1 px-3 py-2 border border-slate-250 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowMediaPicker(true)}
                          className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-lg"
                        >
                          Pick
                        </button>
                      </div>
                      {articleFeaturedImage && (
                        <img 
                          src={articleFeaturedImage.startsWith('/') ? `${import.meta.env.VITE_API_HOST || ''}${articleFeaturedImage}` : articleFeaturedImage} 
                          alt="preview" 
                          className="h-20 w-full object-cover mt-2 rounded-lg border border-slate-200" 
                        />
                      )}
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-2 flex gap-2">
                      <button 
                        type="submit" 
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Article</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={resetEditorForm}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg font-bold text-xs"
                      >
                        Reset
                      </button>
                    </div>

                  </div>

                  {/* SEO Settings Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">SEO Details</h3>
                    <div>
                      <label className="text-xs font-bold text-slate-605 block mb-1">Meta Title</label>
                      <input 
                        type="text" 
                        value={articleSeoTitle}
                        onChange={(e) => setArticleSeoTitle(e.target.value)}
                        placeholder="SEO Title..."
                        className="w-full px-3 py-2 border border-slate-250 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-605 block mb-1">Meta Description</label>
                      <textarea 
                        rows="3" 
                        value={articleSeoDesc}
                        onChange={(e) => setArticleSeoDesc(e.target.value)}
                        placeholder="SEO Summary..."
                        className="w-full px-3 py-2 border border-slate-250 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

              </div>

            </form>
            
            {/* Modal Media picker */}
            {showMediaPicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl max-w-4xl w-11/12 border shadow-2xl relative">
                  <button 
                    onClick={() => setShowMediaPicker(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                  >
                    ✕
                  </button>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Select Featured Image</h3>
                  <MediaLibrary 
                    selectedUrl={articleFeaturedImage}
                    onSelect={(url) => { setArticleFeaturedImage(url); setShowMediaPicker(false); }} 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEDIA LIBRARY PAGE */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Media Manager Library</h1>
            <MediaLibrary />
          </div>
        )}

        {/* TAB 3: CATEGORIES & TAG DESK */}
        {activeTab === 'taxonomy' && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Taxonomy Manager</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Category ordering desk */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white mb-4">Manage Categories</h3>
                
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="New Category name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Order"
                    value={newCatOrder}
                    onChange={(e) => setNewCatOrder(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">
                    Add
                  </button>
                </form>

                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat._id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Order: {cat.order}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat._id)} 
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tag merging desk */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white mb-4">Merge Tags</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Merge duplicate tags in all published articles. This replaces the source tag with the target tag and cleans up the library database.
                </p>

                <form onSubmit={handleMergeTags} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-655 block mb-1">Source Tag Slug (To Delete)</label>
                    <input
                      type="text"
                      placeholder="e.g. cricket-news"
                      value={sourceTagSlug}
                      onChange={(e) => setSourceTagSlug(e.target.value)}
                      required
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-655 block mb-1">Target Tag Slug (To Retain)</label>
                    <input
                      type="text"
                      placeholder="e.g. cricket"
                      value={targetTagSlug}
                      onChange={(e) => setTargetTagSlug(e.target.value)}
                      required
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                    />
                  </div>
                  
                  {mergeMessage && <p className="text-xs font-semibold text-blue-650 bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg">{mergeMessage}</p>}

                  <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 font-bold rounded-lg text-xs transition-colors">
                    Merge Taxonomies
                  </button>
                </form>

                {/* Available tags cloud */}
                <div className="mt-8 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <h4 className="text-xs font-bold text-slate-500 mb-3">Active Tag Database Slugs:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => (
                      <span key={t._id} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                        {t.name} ({t.slug})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: COMMENT MODERATOR */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Reader Comments Moderation desk</h1>
            
            {commentsLoading ? (
              <div className="animate-pulse bg-white p-6 h-60 rounded-xl" />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl overflow-hidden shadow-xs">
                {comments.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 italic">No comments found to moderate.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-650">
                      <thead className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 uppercase text-[9px] font-black">
                        <tr>
                          <th className="p-3">Author</th>
                          <th className="p-3">Comment Content</th>
                          <th className="p-3">Article Thread</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {comments.map(comm => (
                          <tr key={comm._id} className="hover:bg-slate-55 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350">
                            <td className="p-3">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{comm.authorName}</div>
                              <div className="text-[10px] text-slate-400">{comm.authorEmail}</div>
                            </td>
                            <td className="p-3 max-w-sm whitespace-normal leading-relaxed">{comm.content}</td>
                            <td className="p-3 truncate max-w-xs font-semibold text-[10px]">{comm.articleTitle}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                comm.status === 'approved' ? 'bg-green-105 bg-green-100 text-green-700' :
                                (comm.status === 'spam' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                              }`}>
                                {comm.status}
                              </span>
                            </td>
                            <td className="p-3 text-right flex justify-end space-x-1.5">
                              {comm.status !== 'approved' && (
                                <button 
                                  onClick={() => handleModerateComment(comm._id, 'approved')}
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                                  title="Approve Comment"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              {comm.status !== 'spam' && (
                                <button 
                                  onClick={() => handleModerateComment(comm._id, 'spam')}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-650 hover:bg-red-100"
                                  title="Mark as Spam"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteComment(comm._id)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                                title="Delete comment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AD PLACEMENTS DESK */}
        {activeTab === 'ads' && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Advertisement Module Placements</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Configure new ad form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs h-fit space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white mb-2">Create New Campaign</h3>
                
                <form onSubmit={handleCreateAd} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">Ad Title *</label>
                    <input
                      type="text"
                      placeholder="Title of Campaign..."
                      value={newAdTitle}
                      onChange={(e) => setNewAdTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Slot Placement *</label>
                    <select
                      value={newAdPlacement}
                      onChange={(e) => setNewAdPlacement(e.target.value)}
                      className="w-full px-3 py-2 border bg-slate-50 rounded-lg text-xs focus:outline-none"
                    >
                      <option value="header">Header Banner (970x90 or 728x90)</option>
                      <option value="sidebar">Sidebar Column (300x600 or 300x250)</option>
                      <option value="article">Article Content Inline (600x150)</option>
                      <option value="popup">Lightbox Popup Modal</option>
                      <option value="sticky">Sticky Footer Banner</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Ad Type</label>
                    <select
                      value={newAdType}
                      onChange={(e) => setNewAdType(e.target.value)}
                      className="w-full px-3 py-2 border bg-slate-50 rounded-lg text-xs focus:outline-none"
                    >
                      <option value="image">Standard Image Banner</option>
                      <option value="script">Custom Script / AdSense HTML Code</option>
                    </select>
                  </div>

                  {newAdType === 'image' ? (
                    <>
                      <div>
                        <label className="text-xs font-bold block mb-1">Banner Image URL *</label>
                        <input
                          type="text"
                          placeholder="https://example.com/banner.jpg"
                          value={newAdImageUrl}
                          onChange={(e) => setNewAdImageUrl(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Target Redirection URL</label>
                        <input
                          type="text"
                          placeholder="https://targeturl.com"
                          value={newAdLinkUrl}
                          onChange={(e) => setNewAdLinkUrl(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-xs font-bold block mb-1">HTML Embed Code (Google AdSense Script) *</label>
                      <textarea
                        rows="5"
                        placeholder="<ins class='adsbygoogle' ...></ins>"
                        value={newAdScriptCode}
                        onChange={(e) => setNewAdScriptCode(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none"
                      />
                    </div>
                  )}

                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow">
                    Create Advertisement
                  </button>
                </form>
              </div>

              {/* Ad list and performance grid */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white mb-4">Active Campaigns and CTR Performance</h3>
                
                <div className="space-y-4">
                  {ads.map(ad => {
                    const ctr = ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0;
                    return (
                      <div key={ad._id} className="p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550">{ad.placement}</span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{ad.title}</h4>
                          </div>
                          
                          {/* CTR Metrics */}
                          <div className="flex items-center space-x-6 text-[10px] font-semibold text-slate-400">
                            <span>Views: {ad.impressions || 0}</span>
                            <span>Clicks: {ad.clicks || 0}</span>
                            <span className="text-blue-500 font-extrabold">CTR: {ctr}%</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {/* Toggle Active Switch */}
                          <button
                            onClick={() => handleToggleAd(ad._id, !ad.active)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${
                              ad.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {ad.active ? 'Active' : 'Disabled'}
                          </button>
                          
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteAd(ad._id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-650 hover:bg-red-100"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: ROLE MANAGEMENT (ADMIN ONLY) */}
        {activeTab === 'roles' && hasPermission(['Admin', 'Super Admin']) && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Team Staff Role Management</h1>
            
            {usersLoading ? (
              <div className="animate-pulse bg-white p-6 h-60 rounded-xl" />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs font-semibold text-slate-650">
                  <thead className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 uppercase text-[9px] font-black">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Active Role</th>
                      <th className="p-3 text-right">Assign Role & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-slate-55 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-350">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            u.role === 'Super Admin' || u.role === 'Admin' ? 'bg-red-100 text-red-700' :
                            (u.role === 'Editor' ? 'bg-blue-105 bg-blue-100 text-blue-750' : 'bg-slate-100 text-slate-700')
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-right flex justify-end items-center space-x-2">
                          <select
                            value={u.role}
                            disabled={user.id === u._id} // Prevent self role-demoting
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="px-2.5 py-1.5 border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                          >
                            <option value="Reader">Reader (সাধারণ রিডার)</option>
                            <option value="Reporter">Reporter (সংবাদদাতা)</option>
                            <option value="Editor">Editor (সম্পাদক)</option>
                            <option value="Moderator">Moderator (মডারেটর)</option>
                            <option value="SEO Manager">SEO Manager (এসইও ম্যানেজার)</option>
                            <option value="Admin">Admin (প্রশাসক)</option>
                            <option value="Super Admin">Super Admin (মাস্টার)</option>
                          </select>
                          {user.id !== u._id && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: HOMEPAGE LAYOUT SETTINGS */}
        {activeTab === 'layout' && hasPermission(['Super Admin', 'Admin', 'Editor']) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Homepage Category Layout Configurator</h1>
                <p className="text-xs text-slate-505 mt-1">Configure which news categories are displayed on the home page, their layout style, and ordering.</p>
              </div>
              <button
                onClick={handleSaveLayoutSettings}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Save Homepage Layout</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form to add new section (1/3 columns) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs space-y-4 h-fit">
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white">Add Section</h3>
                
                <form onSubmit={handleAddLayoutSection} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Select Category</label>
                    <select
                      value={newSectionCategory}
                      onChange={(e) => setNewSectionCategory(e.target.value)}
                      className="w-full px-3 py-2 border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Select Layout Style</label>
                    <select
                      value={newSectionLayout}
                      onChange={(e) => setNewSectionLayout(e.target.value)}
                      className="w-full px-3 py-2 border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                    >
                      <option value="grid">Grid (৪টি সংবাদ কার্ড)</option>
                      <option value="list">List (৫টি সংবাদ তালিকা)</option>
                      <option value="hero">Hero (১টি বড় সংবাদ + ৩টি ছোট লিংক)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-905 text-white dark:bg-slate-100 dark:text-slate-950 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Add to Homepage Layout
                  </button>
                </form>
              </div>

              {/* Layout Order Manager list (2/3 columns) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white mb-4">Homepage Row Order</h3>
                
                {homepageSections.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No homepage categories configured. Default presets will be rendered.</p>
                ) : (
                  <div className="space-y-3">
                    {homepageSections.map((sec, index) => (
                      <div key={`${sec.category}-${index}`} className="p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                        <div className="flex-grow space-y-1">
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                            Row #{index + 1}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                            {sec.category}
                          </h4>
                          <span className="text-[10px] text-slate-400 block capitalize">
                            Style: {sec.layout === 'grid' ? 'Grid (৪টি কার্ড)' : (sec.layout === 'list' ? 'List (তালিকা)' : 'Hero (하이লাইটেড)')}
                          </span>
                        </div>

                        {/* Reordering Controls */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleMoveLayoutSection(index, -1)}
                            disabled={index === 0}
                            className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveLayoutSection(index, 1)}
                            disabled={index === homepageSections.length - 1}
                            className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Move Down"
                          >
                            ▼
                          </button>
                          
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveLayoutSection(index)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Remove Section"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AI DRAFTS REVIEW PANEL */}
        {activeTab === 'aiDrafts' && hasPermission(['Super Admin', 'Admin', 'Editor']) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <ShieldAlert className="h-7 w-7 text-indigo-655 animate-pulse" />
                  <span>AI-Generated News Review Dashboard</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">Review, edit, add images/videos, and approve or reject news researched by the AI Reporter.</p>
              </div>
              
              <button
                onClick={handleTriggerAiResearch}
                disabled={triggeringAi}
                className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black tracking-wide transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-indigo-600/10"
                id="ai-trigger-btn"
              >
                <Cpu className={`h-4.5 w-4.5 ${triggeringAi ? 'animate-spin' : ''}`} />
                <span>{triggeringAi ? 'রিসার্চ ও রাইটিং হচ্ছে...' : 'এআই নতুন সংবাদ রিসার্চ করুন'}</span>
              </button>
            </div>

            {/* 🔑 Gemini API Keys Manager (Premium Collapsible Card) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => setShowKeyManager(!showKeyManager)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-indigo-655" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">জেমিনি এপিআই কী ম্যানেজার (Gemini API Keys Manager)</span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {showKeyManager ? 'লুকান ▲' : 'কী তালিকা ও পরীক্ষা করুন ▼'}
                </span>
              </button>

              {showKeyManager && (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                  <form onSubmit={handleSaveGeminiKeys} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Gemini API কী সমূহ (প্রতি লাইনে একটি করে কী লিখুন বা পেস্ট করুন):
                      </label>
                      <textarea
                        rows="5"
                        placeholder="AIzaSy...\nAIzaSy..."
                        value={geminiKeysText}
                        onChange={(e) => setGeminiKeysText(e.target.value)}
                        className="w-full px-3 py-2 border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold font-mono focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={savingKeys}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-lg text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50"
                      >
                        {savingKeys ? 'সংরক্ষণ হচ্ছে...' : 'কী সংরক্ষণ করুন (Save)'}
                      </button>
                      <button
                        type="button"
                        onClick={handleTestKeys}
                        disabled={testingKeys}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {testingKeys ? 'টেস্টিং হচ্ছে...' : 'সব কী পরীক্ষা করুন (Test Keys)'}
                      </button>
                    </div>
                  </form>

                  {keyStatuses.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Live কী স্ট্যাটাস:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {keyStatuses.map((k, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-xl flex items-center justify-between text-xs font-semibold ${
                              k.status === 'Active'
                                ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/50 text-red-700 dark:text-red-400'
                            }`}
                          >
                            <span className="font-mono">{k.key}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-900 shadow-xs">
                              {k.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {aiArticles.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
                  <ShieldAlert className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">কোনো মুলতুবি এআই ড্রাফট পাওয়া যায়নি।</h3>
                  <p className="text-xs text-slate-400 mt-1">নতুন ব্রেকিং নিউজ এনালাইসিস করতে উপরের বাটনে ক্লিক করুন।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiArticles.map(art => (
                    <div key={art._id} className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/40 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
                            {art.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(art.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">
                          {art.title}
                        </h3>
                        {art.subtitle && (
                          <h4 className="text-xs text-slate-450 font-medium line-clamp-1">
                            {art.subtitle}
                          </h4>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-3 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 gap-2">
                        <button
                          onClick={() => handleReviewAiArticle(art)}
                          className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 rounded-xl text-xs font-bold transition-all text-center"
                        >
                          পড়ুন ও সম্পাদনা
                        </button>
                        <button
                          onClick={() => handleApproveAiArticle(art._id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => handleRejectAiArticle(art._id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-655 dark:bg-red-950/20 dark:text-red-400 rounded-xl transition-all"
                          title="Reject and Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </section>
    </div>
  );
};

export default Dashboard;
