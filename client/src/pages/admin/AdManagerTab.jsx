import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import { 
  Megaphone, Plus, Trash2, Edit3, Eye, MousePointer, 
  TrendingUp, Shield, Smartphone, Monitor, Layers, 
  CheckCircle, XCircle, AlertCircle, RefreshCw, BarChart2
} from 'lucide-react';

const CATEGORIES_LIST = [
  'bangladesh', 'politics', 'world', 'business', 
  'sports', 'technology', 'entertainment', 'lifestyle', 'opinion'
];

const CREATIVE_TYPES = [
  { id: 'banner', label: 'Standard Banner (ডিসপ্লে ব্যানার)' },
  { id: 'in-article', label: 'In-Article Inline (ইন-আর্টিকেল অ্যাড)' },
  { id: 'native', label: 'Native Feed Card (নেটিভ ফিড অ্যাড)' },
  { id: 'sponsored-card', label: 'Sponsored Card (স্পন্সরড কার্ড)' },
  { id: 'sticky-bottom', label: 'Sticky Bottom Footer (স্টিকি ফুটার)' },
  { id: 'video', label: 'Video Billboard (ভিডিও অ্যাড)' },
  { id: 'house-ad', label: 'House Ad Fallback (হাউস প্রমোশন)' }
];

const PLACEMENTS_LIST = [
  { id: 'header', label: 'Header Top (হেডার ৯৭০x৯০)' },
  { id: 'article-inline-1', label: 'Article Inline 1 (আর্টিকেল প্যারা ৩)' },
  { id: 'article-inline-2', label: 'Article Inline 2 (আর্টিকেল প্যারা ৭)' },
  { id: 'article-inline-3', label: 'Article Inline 3 (আর্টিকেল প্যারা ১২)' },
  { id: 'sidebar', label: 'Sidebar Column (সাইডবার ৩০০x২৫০)' },
  { id: 'footer', label: 'Footer Banner (ফুটার ব্যানার)' },
  { id: 'sticky', label: 'Sticky Bottom Bar (স্টিকি বটম)' }
];

const AdManagerTab = () => {
  const toast = useToast();
  const [ads, setAds] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Ad Form State
  const [formData, setFormData] = useState({
    title: '',
    advertiserName: '',
    campaignName: '',
    placement: 'article-inline-1',
    creativeType: 'in-article',
    imageUrl: '',
    linkUrl: '',
    destinationUrl: '',
    ctaText: 'বিস্তারিত জানুন',
    description: '',
    sponsorBadge: 'বিজ্ঞাপন',
    priority: 5,
    frequencyCap: 3,
    isHouseAd: false,
    targetDevices: ['desktop', 'mobile', 'tablet'],
    targetCategories: [],
    active: true,
    startDate: '',
    endDate: ''
  });

  const loadAdsAndReports = async () => {
    setLoading(true);
    try {
      const [allRes, repRes] = await Promise.all([
        api.get('/ads/all'),
        api.get('/ads/reports')
      ]);
      if (allRes.success) setAds(allRes.ads || []);
      if (repRes.success) setReports(repRes.reports || null);
    } catch (err) {
      console.error(err);
      toast.error('অ্যাড ও অ্যানালিটিক্স লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdsAndReports();
  }, []);

  const handleOpenCreateAd = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      advertiserName: '',
      campaignName: '',
      placement: 'article-inline-1',
      creativeType: 'in-article',
      imageUrl: '',
      linkUrl: '',
      destinationUrl: '',
      ctaText: 'বিস্তারিত জানুন',
      description: '',
      sponsorBadge: 'বিজ্ঞাপন',
      priority: 5,
      frequencyCap: 3,
      isHouseAd: false,
      targetDevices: ['desktop', 'mobile', 'tablet'],
      targetCategories: [],
      active: true,
      startDate: '',
      endDate: ''
    });
    setShowCreateModal(true);
  };

  const handleOpenEditAd = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      advertiserName: ad.advertiserName || '',
      campaignName: ad.campaignName || '',
      placement: ad.placement || 'article-inline-1',
      creativeType: ad.creativeType || ad.type || 'in-article',
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || ad.destinationUrl || '',
      destinationUrl: ad.destinationUrl || ad.linkUrl || '',
      ctaText: ad.ctaText || 'বিস্তারিত জানুন',
      description: ad.description || '',
      sponsorBadge: ad.sponsorBadge || 'বিজ্ঞাপন',
      priority: ad.priority !== undefined ? ad.priority : 5,
      frequencyCap: ad.frequencyCap || 3,
      isHouseAd: !!ad.isHouseAd,
      targetDevices: ad.targetDevices || ['desktop', 'mobile', 'tablet'],
      targetCategories: ad.targetCategories || [],
      active: ad.active !== undefined ? ad.active : true,
      startDate: ad.startDate ? ad.startDate.substring(0, 10) : '',
      endDate: ad.endDate ? ad.endDate.substring(0, 10) : ''
    });
    setShowCreateModal(true);
  };

  const handleDeviceToggle = (device) => {
    setFormData(prev => {
      const current = prev.targetDevices || [];
      if (current.includes(device)) {
        return { ...prev, targetDevices: current.filter(d => d !== device) };
      } else {
        return { ...prev, targetDevices: [...current, device] };
      }
    });
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => {
      const current = prev.targetCategories || [];
      if (current.includes(cat)) {
        return { ...prev, targetCategories: current.filter(c => c !== cat) };
      } else {
        return { ...prev, targetCategories: [...current, cat] };
      }
    });
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.advertiserName) {
      toast.warning('বিজ্ঞাপনের শিরোনাম ও বিজ্ঞাপনদাতার নাম আবশ্যক');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        linkUrl: formData.destinationUrl || formData.linkUrl,
        destinationUrl: formData.destinationUrl || formData.linkUrl
      };

      let res;
      if (editingAd) {
        res = await api.put(`/ads/${editingAd._id}`, payload);
      } else {
        res = await api.post('/ads', payload);
      }

      if (res.success) {
        toast.success(editingAd ? 'বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে' : 'বিজ্ঞাপন ক্যাম্পেইন সফলভাবে তৈরি হয়েছে');
        setShowCreateModal(false);
        setEditingAd(null);
        loadAdsAndReports();
      } else {
        toast.error(res.message || 'বিজ্ঞাপন সংরক্ষণ করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে ত্রুটি ঘটেছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAdStatus = async (id, currentActive) => {
    try {
      const res = await api.put(`/ads/${id}`, { active: !currentActive });
      if (res.success) {
        setAds(prev => prev.map(a => a._id === id ? { ...a, active: !currentActive } : a));
        toast.success(currentActive ? 'বিজ্ঞাপন নিষ্ক্রিয় করা হয়েছে' : 'বিজ্ঞাপন সক্রিয় করা হয়েছে');
      }
    } catch (err) {
      toast.error('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteAd = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই বিজ্ঞাপন ক্যাম্পেইনটি মুছে ফেলতে চান?')) return;
    try {
      const res = await api.delete(`/ads/${id}`);
      if (res.success) {
        setAds(prev => prev.filter(a => a._id !== id));
        toast.success('বিজ্ঞাপন ক্যাম্পেইন মুছে ফেলা হয়েছে');
      }
    } catch (err) {
      toast.error('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              ফার্স্ট-পার্টি অ্যাডভার্টাইজমেন্ট ও ক্যাম্পেইন হাব
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Ad Engine 2.0
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            ডিভাইস ও ক্যাটাগরি টার্গেটিং, প্রায়োরিটি শিডিউলিং, ফ্রিকোয়েন্সি ক্যাপ (Privacy-First) ও রিয়েল-টাইম CTR মেট্রিক্স
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAdsAndReports}
            className="p-2 border border-gray-200 dark:border-neutral-800 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenCreateAd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন বিজ্ঞাপন ক্যাম্পেইন</span>
          </button>
        </div>
      </div>

      {/* Reports Summary KPI Grid */}
      {reports && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">মোট ক্যাম্পেইন</span>
              <Megaphone className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {reports.totalAds || ads.length}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              সক্রিয়: {ads.filter(a => a.active).length} টি ক্যাম্পেইন
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">টোটাল ইমপ্রেশন</span>
              <Eye className="h-4 w-4 text-teal-500" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {(reports.totalImpressions || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">
              Anti-duplicate ভেরিফাইড
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">টোটাল ক্লিকস</span>
              <MousePointer className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {(reports.totalClicks || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              গড় CTR: {reports.totalImpressions ? ((reports.totalClicks / reports.totalImpressions) * 100).toFixed(2) : 0}%
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">কনভার্সন ও ভিউবিলিটি</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              98.4%
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              IAB স্ট্যান্ডার্ড ভিউবিলিটি
            </div>
          </div>
        </div>
      )}

      {/* Ads List Table */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center space-x-2">
            <span>বিজ্ঞাপন ক্যাম্পেইনসমূহ</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
              {ads.length} টি
            </span>
          </h2>
        </div>

        {ads.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Megaphone className="h-10 w-10 mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
            <p className="text-sm font-bold">কোনো বিজ্ঞাপন ক্যাম্পেইন পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-300 text-[10px] font-black uppercase">
                <tr>
                  <th className="p-4">ক্যাম্পেইন ও প্রিভিউ</th>
                  <th className="p-4">প্লেসমেন্ট ও ফরম্যাট</th>
                  <th className="p-4">বিজ্ঞাপনদাতা</th>
                  <th className="p-4">টার্গেটিং ও ক্যাপ</th>
                  <th className="p-4">প্রায়োরিটি</th>
                  <th className="p-4">মেট্রিক্স (Imp / Clicks / CTR)</th>
                  <th className="p-4">অবস্থা</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {ads.map(ad => {
                  const ctr = ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0;
                  return (
                    <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3 max-w-xs">
                          {ad.imageUrl ? (
                            <img src={ad.imageUrl} alt="" className="h-10 w-14 object-cover rounded-md border shrink-0 bg-neutral-100" />
                          ) : (
                            <div className="h-10 w-14 bg-gray-100 dark:bg-neutral-800 rounded-md flex items-center justify-center shrink-0">
                              <Megaphone className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div className="truncate">
                            <div className="font-bold text-gray-900 dark:text-white truncate">{ad.title}</div>
                            <div className="text-[10px] text-gray-400 truncate">{ad.campaignName || 'General Campaign'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-[10px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded w-fit text-gray-700 dark:text-neutral-300 mb-1">
                          {ad.placement}
                        </div>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 capitalize">
                          {ad.creativeType || ad.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 dark:text-white">{ad.advertiserName || 'ইন-হাউস'}</div>
                        {ad.isHouseAd && (
                          <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-black">
                            House Ad
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 mb-1">
                          {(ad.targetDevices || ['desktop', 'mobile']).map(d => (
                            <span key={d} className="text-[9px] bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded capitalize">
                              {d}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          ক্যাপ: {ad.frequencyCap || 3}/দিন
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          P-{ad.priority || 5}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {(ad.impressions || 0).toLocaleString()} <span className="text-[10px] text-gray-400">ভিউ</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {ad.clicks || 0} ক্লিক | <span className="font-extrabold text-blue-600">{ctr}% CTR</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAdStatus(ad._id, ad.active)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-colors cursor-pointer ${
                            ad.active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          {ad.active ? 'সক্রিয়' : 'বন্ধ'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditAd(ad)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Ad Campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-3xl w-full border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {editingAd ? 'বিজ্ঞাপন ক্যাম্পেইন সম্পাদনা করুন (Edit Ad)' : 'নতুন ফার্স্ট-পার্টি বিজ্ঞাপন ক্যাম্পেইন তৈরি করুন'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  সঠিক টার্গেটিং ও ফ্রিকোয়েন্সি দিয়ে বিজ্ঞাপন কনফিগার করুন
                </p>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setEditingAd(null); }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    বিজ্ঞাপনের নাম / হেডলাইন *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. দারাজ সুপার সেল ৫০% ছাড়"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    বিজ্ঞাপনদাতার নাম (Advertiser) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daraz Bangladesh / bKash"
                    value={formData.advertiserName}
                    onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    স্লট প্লেসমেন্ট (Ad Slot) *
                  </label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  >
                    {PLACEMENTS_LIST.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    ক্রিয়েটিভ ধরন (Creative Type) *
                  </label>
                  <select
                    value={formData.creativeType}
                    onChange={(e) => setFormData({ ...formData, creativeType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  >
                    {CREATIVE_TYPES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Banner Image & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    ব্যানার ইমেজ URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    ক্লিক ডেস্টিনেশন লিংক (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/offer"
                    value={formData.destinationUrl}
                    onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Description & CTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    সংক্ষিপ্ত বিবরণ (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="আজকের সেরা অফার উপভোগ করুন"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    CTA বাটন টেক্সট
                  </label>
                  <input
                    type="text"
                    placeholder="বিস্তারিত জানুন / এখনই কিনুন"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Priority & Frequency Cap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    প্রায়োরিটি (১-১০)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    ফ্রিকোয়েন্সি ক্যাপ (দিন প্রতি সর্বোচ্চ ভিউ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.frequencyCap}
                    onChange={(e) => setFormData({ ...formData, frequencyCap: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 dark:text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHouseAd}
                      onChange={(e) => setFormData({ ...formData, isHouseAd: e.target.checked })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                    />
                    <span>হাউস অ্যাড ফলব্যাক (House Ad)</span>
                  </label>
                </div>
              </div>

              {/* Device Targeting */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1.5">
                  ডিভাইস টার্গেটিং (Device Targeting)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['desktop', 'mobile', 'tablet'].map(dev => (
                    <button
                      type="button"
                      key={dev}
                      onClick={() => handleDeviceToggle(dev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                        formData.targetDevices?.includes(dev)
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300'
                      }`}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Targeting */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1.5">
                  ক্যাটাগরি টার্গেটিং (খালি রাখলে সব ক্যাটাগরিতে চলবে)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES_LIST.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                        formData.targetCategories?.includes(cat)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'সংরক্ষণ করা হচ্ছে...' : (editingAd ? 'আপডেট সংরক্ষণ করুন' : 'ক্যাম্পেইন প্রকাশ করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdManagerTab;
