import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';
import { 
  User, Mail, Save, Clock, Bookmark, BookOpen, 
  Facebook, Twitter, Linkedin, MapPin, Bell, Trash2, ChevronRight, ExternalLink 
} from 'lucide-react';

const BD_DIVISIONS = {
  'ঢাকা': ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'মুন্সীগঞ্জ', 'মানিকগঞ্জ', 'নরসিংদী', 'টাঙ্গাইল'],
  'চট্টগ্রাম': ['চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'ফেনী'],
  'রাজশাহী': ['রাজশাহী', 'বগুড়া', 'পাবনা', 'সিরাজগঞ্জ', 'নাটোর'],
  'খুলনা': ['খুলনা', 'যশোর', 'বাগেরহাট', 'সাতক্ষীরা', 'কুষ্টিয়া'],
  'সিলেট': ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'],
  'বরিশাল': ['বরিশাল', 'পটুয়াখালী', 'ভোলা'],
  'রংপুর': ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম'],
  'ময়মনসিংহ': ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা']
};

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [designation, setDesignation] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  
  // Location preferences
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('');

  // Notification preferences
  const [notifBreaking, setNotifBreaking] = useState(true);
  const [notifImportant, setNotifImportant] = useState(true);
  const [notifLocal, setNotifLocal] = useState(true);
  const [notifSports, setNotifSports] = useState(false);
  const [notifTech, setNotifTech] = useState(false);

  const [savedArticles, setSavedArticles] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setDesignation(user.designation || '');
      setFacebook(user.socialLinks?.facebook || '');
      setTwitter(user.socialLinks?.twitter || '');
      setLinkedin(user.socialLinks?.linkedin || '');

      if (user.preferredLocation) {
        setDivision(user.preferredLocation.division || 'ঢাকা');
        setDistrict(user.preferredLocation.district || 'ঢাকা');
        setUpazila(user.preferredLocation.upazila || '');
      }

      if (user.notificationPreferences) {
        setNotifBreaking(user.notificationPreferences.breakingNews !== false);
        setNotifImportant(user.notificationPreferences.importantNews !== false);
        setNotifLocal(user.notificationPreferences.localNews !== false);
        setNotifSports(Boolean(user.notificationPreferences.sports));
        setNotifTech(Boolean(user.notificationPreferences.technology));
      }
    }
  }, [user]);

  // Load saved articles from backend and localStorage
  const fetchSavedArticles = async () => {
    setLoadingSaved(true);
    try {
      if (user) {
        const res = await api.get('/auth/saved-articles');
        if (res.success) {
          setSavedArticles(res.articles);
          return;
        }
      }

      // Fallback from localStorage list
      const localIds = JSON.parse(localStorage.getItem('saved_articles_list') || '[]');
      if (localIds.length > 0) {
        const res = await api.get('/articles?limit=50');
        if (res.success) {
          setSavedArticles(res.articles.filter(a => localIds.includes(a._id)));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchSavedArticles();
  }, [user]);

  const handleRemoveSaved = async (articleId) => {
    try {
      let localIds = JSON.parse(localStorage.getItem('saved_articles_list') || '[]');
      localIds = localIds.filter(id => id !== articleId);
      localStorage.setItem('saved_articles_list', JSON.stringify(localIds));
      setSavedArticles(prev => prev.filter(a => a._id !== articleId));

      if (user) {
        await api.post('/auth/save-article', { articleId });
      }
      toast.info('সংবাদটি সংরক্ষণ তালিকা থেকে সরানো হয়েছে।');
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {
        name,
        bio,
        designation,
        socialLinks: { facebook, twitter, linkedin },
        preferredLocation: { division, district, upazila },
        notificationPreferences: {
          breakingNews: notifBreaking,
          importantNews: notifImportant,
          localNews: notifLocal,
          sports: notifSports,
          technology: notifTech
        }
      };

      localStorage.setItem('user_local_division', division);
      localStorage.setItem('user_local_district', district);

      const res = await api.put('/auth/profile', payload);

      if (res.success) {
        toast.success('প্রোফাইল সেটিংস সফলভাবে আপডেট করা হয়েছে!');
      } else {
        toast.error(res.message || 'আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      toast.error('নেটওয়ার্ক ত্রুটি ঘটেছে।');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">প্রোফাইল দেখতে লগইন করুন।</h2>
        <Link to="/login-admin" className="mt-4 inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs shadow-md">
          লগইন পোর্টাল
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-neutral-800 flex items-center justify-center text-red-600 overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`} 
              alt={user.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
              {user.name}
            </h1>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              রোল: <span className="text-red-600 font-bold">{user.role}</span> | {user.email}
            </p>
          </div>
        </div>

        {['Super Admin', 'Admin', 'Editor', 'Reporter', 'Ad Manager', 'Analyst', 'Moderator'].includes(user.role) && (
          <Link
            to="/admin"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>অ্যাডমিন কন্ট্রোল প্যানেল</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Profile & Preferences Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs space-y-6">
            <h2 className="text-sm font-black uppercase text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-2">
              <User className="h-4 w-4 text-red-600" />
              <span>ব্যক্তিগত তথ্য ও পরিচিতি</span>
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs bg-white dark:bg-[#18181b] text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block mb-1">পদবি / ডেজিগনেশন</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="যেমন: সিনিয়র রিপোর্টার / কলামিস্ট"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs bg-white dark:bg-[#18181b] text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block mb-1">লেখক পরিচিতি (Bio)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="নিজের সাংবাদিকতা বা কাজের অভিজ্ঞতা সম্পর্কে লিখুন..."
                  className="w-full p-3 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs bg-white dark:bg-[#18181b] text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* ─── Location Preferences ─── */}
              <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-gray-950 dark:text-white uppercase">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>পছন্দের এলাকার সংবাদ সেটিংস (আমার এলাকা)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-neutral-400 block mb-1">বিভাগ</label>
                    <select
                      value={division}
                      onChange={(e) => {
                        setDivision(e.target.value);
                        const dists = BD_DIVISIONS[e.target.value] || [];
                        setDistrict(dists[0] || '');
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-bold"
                    >
                      {Object.keys(BD_DIVISIONS).map((div) => (
                        <option key={div} value={div}>{div} বিভাগ</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-neutral-400 block mb-1">জেলা</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-bold"
                    >
                      {(BD_DIVISIONS[division] || []).map((dis) => (
                        <option key={dis} value={dis}>{dis}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ─── Notification Preferences ─── */}
              <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-gray-950 dark:text-white uppercase">
                  <Bell className="h-4 w-4 text-red-600" />
                  <span>নোটিফিকেশন পছন্দসমূহ</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-neutral-300">
                    <input 
                      type="checkbox" 
                      checked={notifBreaking} 
                      onChange={(e) => setNotifBreaking(e.target.checked)} 
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>ব্রেকিং নিউজ নোটিফিকেশন</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-neutral-300">
                    <input 
                      type="checkbox" 
                      checked={notifImportant} 
                      onChange={(e) => setNotifImportant(e.target.checked)} 
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>গুরুত্বপূর্ণ জাতীয় সংবাদ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-neutral-300">
                    <input 
                      type="checkbox" 
                      checked={notifLocal} 
                      onChange={(e) => setNotifLocal(e.target.checked)} 
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>আমার এলাকার স্থানীয় সংবাদ</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-xl text-xs font-black shadow-md transition-colors"
              >
                {updating ? 'আপডেট হচ্ছে...' : 'প্রোফাইল ও সেটিংস সংরক্ষণ করুন'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Saved Articles / Bookmarks */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs">
            <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between mb-4">
              <span className="flex items-center gap-2">
                <Bookmark className="h-4.5 w-4.5 text-red-600" />
                <span>সংরক্ষিত সংবাদ ({savedArticles.length})</span>
              </span>
            </h3>

            {loadingSaved ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-neutral-800 rounded-xl" />
                ))}
              </div>
            ) : savedArticles.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-xl">
                <Bookmark className="h-8 w-8 text-gray-300 dark:text-neutral-700 mx-auto mb-2" />
                <p className="text-xs text-gray-400 dark:text-neutral-500">
                  এখনও কোনো সংবাদ বুকমার্ক করেননি।
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {savedArticles.map((art) => (
                  <div
                    key={art._id}
                    className="group p-3 rounded-xl bg-gray-50/80 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 flex items-start justify-between gap-3 hover:border-red-200 dark:hover:border-red-950 transition-colors"
                  >
                    <Link to={`/article/${art.slug}`} className="flex-grow">
                      <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 block mb-0.5">
                        {art.category}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-neutral-100 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(art.publishDate || art.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </Link>
                    <button
                      onClick={() => handleRemoveSaved(art._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserProfile;
