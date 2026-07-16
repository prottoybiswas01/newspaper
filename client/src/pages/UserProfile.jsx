import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, Mail, Save, Clock, Bookmark, BookOpen, Facebook, Twitter, Linkedin } from 'lucide-react';

const UserProfile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state on load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setFacebook(user.socialLinks?.facebook || '');
      setTwitter(user.socialLinks?.twitter || '');
      setLinkedin(user.socialLinks?.linkedin || '');
    }
  }, [user]);

  // Load bookmarks and history from local storage mock
  useEffect(() => {
    // Reading bookmarks from localStorage
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    // Let's query them from articles db to show titles
    const loadMockList = async () => {
      try {
        const res = await api.get('/articles?limit=100');
        if (res.success) {
          const bookmarkedList = res.articles.filter(art => savedBookmarks.includes(art._id));
          setBookmarks(bookmarkedList);
          
          // Mimic history by taking some latest articles
          setHistory(res.articles.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadMockList();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');

    try {
      const res = await api.put('/auth/profile', {
        name,
        bio,
        socialLinks: { facebook, twitter, linkedin }
      });

      if (res.success) {
        setSuccessMsg('আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
      } else {
        alert(res.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-700">প্রোফাইল দেখতে লগইন করুন।</h2>
        <Link to="/login-admin" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">লগইন করুন</Link>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-8 border-b pb-2 flex items-center space-x-2">
        <User className="h-7 w-7 text-blue-650" />
        <span>প্রোফাইল সেটিংস (Profile Settings)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs space-y-6">
          <h2 className="text-sm font-black uppercase text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">ব্যক্তিগত তথ্য</h2>
          
          {successMsg && <p className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">{successMsg}</p>}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-655 block mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-655 block mb-1">ইমেইল ঠিকানা (Email - readonly)</label>
              <input
                type="email"
                readOnly
                value={user.email}
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-100 dark:bg-slate-850 text-slate-450 focus:outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-655 block mb-1">লেখক পরিচিতি (Bio)</label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                className="w-full px-4 py-2 border rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Social settings */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 block">সামাজিক যোগাযোগ মাধ্যম লিংক (Social Links)</label>
              
              <div className="flex items-center space-x-2">
                <Facebook className="h-5 w-5 text-blue-600 shrink-0" />
                <input
                  type="url"
                  placeholder="https://facebook.com/username"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Twitter className="h-5 w-5 text-sky-500 shrink-0" />
                <input
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Linkedin className="h-5 w-5 text-blue-700 shrink-0" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {updating ? 'আপডেট হচ্ছে...' : 'প্রোফাইল সংরক্ষণ করুন'}
            </button>
          </form>
        </div>

        {/* Right Column: Bookmarks & History */}
        <div className="space-y-6">
          
          {/* Bookmarks Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 mb-4">
              <Bookmark className="h-4.5 w-4.5 text-blue-600" />
              <span>বুকমার্ক করা সংবাদ ({bookmarks.length})</span>
            </h3>
            
            {bookmarks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">কোনো বুকমার্ক করা খবর নেই।</p>
            ) : (
              <div className="space-y-3">
                {bookmarks.map(art => (
                  <Link 
                    key={art._id} 
                    to={`/article/${art.slug}`}
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 border-b border-slate-100 dark:border-slate-850/50 pb-2 last:border-b-0"
                  >
                    {art.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reading history Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-6 rounded-2xl shadow-xs">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 mb-4">
              <BookOpen className="h-4.5 w-4.5 text-teal-650" />
              <span>পঠিত সংবাদ ইতিহাস (History)</span>
            </h3>
            <div className="space-y-3">
              {history.map(art => (
                <Link 
                  key={art._id} 
                  to={`/article/${art.slug}`}
                  className="block text-xs font-bold text-slate-650 dark:text-slate-400 hover:text-blue-600 border-b border-slate-100 dark:border-slate-850/50 pb-2 last:border-b-0"
                >
                  {art.title}
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
};

export default UserProfile;
