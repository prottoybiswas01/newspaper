import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import { Layers, Plus, Trash2, Edit3, Link as LinkIcon, Calendar, CheckCircle2, Clock } from 'lucide-react';

const StoryHubTab = () => {
  const toast = useToast();
  const [storyHubs, setStoryHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHub, setEditingHub] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    bannerImage: '',
    status: 'developing',
    keyFacts: '',
    timelineEvents: [
      { time: '১০:০০ AM', title: 'ঘটনার সূত্রপাত', description: 'ঘটনাস্থল থেকে প্রথম বার্তা পাওয়া যায়।' }
    ]
  });

  const loadStoryHubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/story-hubs');
      if (res.success) {
        setStoryHubs(res.storyHubs || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('স্টোরি হাব তালিকা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoryHubs();
  }, []);

  const handleOpenCreate = () => {
    setEditingHub(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      bannerImage: '',
      status: 'developing',
      keyFacts: '',
      timelineEvents: [
        { time: '১০:০০ AM', title: 'ঘটনার সূত্রপাত', description: 'ঘটনাস্থল থেকে প্রথম বার্তা পাওয়া যায়।' }
      ]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (hub) => {
    setEditingHub(hub);
    setFormData({
      title: hub.title || '',
      subtitle: hub.subtitle || '',
      description: hub.description || '',
      bannerImage: hub.bannerImage || '',
      status: hub.status || 'developing',
      keyFacts: Array.isArray(hub.keyFacts) ? hub.keyFacts.join('\n') : '',
      timelineEvents: hub.timelineEvents && hub.timelineEvents.length > 0 ? hub.timelineEvents : [
        { time: '১০:০০ AM', title: 'ঘটনার সূত্রপাত', description: 'ঘটনাস্থল থেকে প্রথম বার্তা পাওয়া যায়।' }
      ]
    });
    setShowModal(true);
  };

  const handleAddTimelineEvent = () => {
    setFormData(prev => ({
      ...prev,
      timelineEvents: [...prev.timelineEvents, { time: '', title: '', description: '' }]
    }));
  };

  const handleUpdateTimelineEvent = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.timelineEvents];
      updated[index][field] = value;
      return { ...prev, timelineEvents: updated };
    });
  };

  const handleRemoveTimelineEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      timelineEvents: prev.timelineEvents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.warning('স্টোরি হাবের শিরোনাম আবশ্যক');
      return;
    }

    try {
      const payload = {
        ...formData,
        keyFacts: formData.keyFacts.split('\n').map(s => s.trim()).filter(Boolean)
      };

      let res;
      if (editingHub) {
        res = await api.put(`/story-hubs/${editingHub._id}`, payload);
      } else {
        res = await api.post('/story-hubs', payload);
      }

      if (res.success) {
        toast.success(editingHub ? 'স্টোরি হাব আপডেট হয়েছে' : 'নতুন স্টোরি হাব তৈরি হয়েছে');
        setShowModal(false);
        loadStoryHubs();
      } else {
        toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভার ত্রুটি');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি এই স্টোরি হাবটি মুছে ফেলতে চান?')) return;
    try {
      const res = await api.delete(`/story-hubs/${id}`);
      if (res.success) {
        setStoryHubs(prev => prev.filter(h => h._id !== id));
        toast.success('স্টোরি হাব মুছে ফেলা হয়েছে');
      }
    } catch (err) {
      toast.error('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            স্টোরি হাব ও মেগা-ইভেন্ট ট্র্যাকার (Story Hub)
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            বড় চলমান জাতীয় ও আন্তর্জাতিক ঘটনাসমূহের জন্য কেন্দ্রীয় আপডেট পেজ ও টাইমলাইন
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন স্টোরি হাব</span>
        </button>
      </div>

      {/* Hubs Grid */}
      {storyHubs.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800">
          <Layers className="h-10 w-10 mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
          <p className="text-sm font-bold">কোনো চলমান স্টোরি হাব সক্রিয় নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storyHubs.map(hub => (
            <div key={hub._id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs flex flex-col">
              {hub.bannerImage && (
                <img src={hub.bannerImage} alt="" className="h-40 w-full object-cover" />
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      hub.status === 'live' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 animate-pulse'
                        : (hub.status === 'developing' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-green-100 text-green-700')
                    }`}>
                      {hub.status === 'live' ? '🔴 LIVE' : (hub.status === 'developing' ? '⚡ DEVELOPING' : '✓ CONCLUDED')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {hub.timelineEvents?.length || 0} টি টাইমলাইন আপডেট
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-1">
                    {hub.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-2 mb-3">
                    {hub.subtitle || hub.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                  <a
                    href={`/story-hub/${hub.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1"
                  >
                    <span>লাইভ পেজ দেখুন</span>
                    <LinkIcon className="h-3 w-3" />
                  </a>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(hub)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hub._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-3xl w-full border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {editingHub ? 'স্টোরি হাব সম্পাদনা করুন' : 'নতুন স্টোরি হাব তৈরি করুন'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                  ইভেন্ট শিরোনাম (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. জাতীয় সংসদ নির্বাচন ২০২৬"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    সাব-টাইটেল (Subtitle)
                  </label>
                  <input
                    type="text"
                    placeholder="সর্বশেষ ভোট গণনা ও মাঠপর্যায়ের খবর"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    ইভেন্ট স্ট্যাটাস (Status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                  >
                    <option value="developing">Developing (চলমান)</option>
                    <option value="live">Live (সরাসরি সম্প্রচার)</option>
                    <option value="concluded">Concluded (সমাপ্ত)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                  ব্যানার ছবি (Banner Image URL)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                  প্রধান তথ্যসমূহ (Key Facts - প্রতি লাইনে একটি করে)
                </label>
                <textarea
                  rows="3"
                  placeholder="ভোটগ্রহণ সকাল ৮টা থেকে বিকেল ৪টা পর্যন্ত চলবে&#10;মোট আসন সংখ্যা ৩০০&#10;আইনশৃঙ্খলা বাহিনীর বিশেষ নিরাপত্তা জোরদার"
                  value={formData.keyFacts}
                  onChange={(e) => setFormData({ ...formData, keyFacts: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none"
                />
              </div>

              {/* Timeline Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                    টাইমলাইন আপডেটসমূহ (Live Timeline)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTimelineEvent}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    + নতুন টাইমলাইন ইভেন্ট
                  </button>
                </div>

                {formData.timelineEvents.map((evt, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-neutral-800/60 rounded-xl space-y-2 border border-gray-200 dark:border-neutral-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="সময় (e.g. ১১:৩০ AM)"
                        value={evt.time}
                        onChange={(e) => handleUpdateTimelineEvent(idx, 'time', e.target.value)}
                        className="w-32 px-2 py-1 border rounded-lg text-xs bg-white dark:bg-neutral-900"
                      />
                      <input
                        type="text"
                        placeholder="ইভেন্ট শিরোনাম"
                        value={evt.title}
                        onChange={(e) => handleUpdateTimelineEvent(idx, 'title', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded-lg text-xs bg-white dark:bg-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTimelineEvent(idx)}
                        className="text-red-500 p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="বিস্তারিত তথ্য..."
                      value={evt.description}
                      onChange={(e) => handleUpdateTimelineEvent(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1 border rounded-lg text-xs bg-white dark:bg-neutral-900"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryHubTab;
