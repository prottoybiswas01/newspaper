import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Send, Check } from 'lucide-react';
import { api } from '../utils/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/newsletter/subscribe', { email });
      if (res.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(res.message || 'Subscription failed. Try again.');
      }
    } catch (err) {
      setError('Network connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 dark:bg-slate-950 mt-12 border-t border-slate-800 pt-16 pb-8 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-black text-white mb-4">
              <Newspaper className="h-7 w-7 text-blue-500" />
              <span>দৈনিক দর্পণ</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              সর্বশেষ ও নিরপেক্ষ সংবাদ পরিবেশনে আমরা অঙ্গিকারবদ্ধ। দেশের প্রতিটি প্রান্তে ঘটে যাওয়া ঘটনার সত্যতা নিশ্চিত করে আমরা আপনাদের সামনে তুলে ধরি।
            </p>
            
            {/* Subscription Form */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 max-w-md">
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">নিউজলেটার সাবস্ক্রাইব করুন</h4>
              <p className="text-xs text-slate-400 mb-4">প্রতিদিনের বাছাইকৃত সংবাদ সকালে আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।</p>
              
              {success ? (
                <div className="flex items-center space-x-2 text-green-400 text-sm font-semibold">
                  <Check className="h-5 w-5" />
                  <span>ধন্যবাদ! সাবস্ক্রিপশন সফল হয়েছে।</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="আপনার ইমেইল ঠিকানা..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
                  >
                    {submitting ? '...' : <Send className="h-4 w-4" />}
                  </button>
                </form>
              )}
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/bangladesh" className="hover:text-white transition-colors">Bangladesh</Link></li>
              <li><Link to="/category/international" className="hover:text-white transition-colors">International</Link></li>
              <li><Link to="/category/politics" className="hover:text-white transition-colors">Politics</Link></li>
              <li><Link to="/category/economy" className="hover:text-white transition-colors">Economy</Link></li>
              <li><Link to="/category/sports" className="hover:text-white transition-colors">Sports</Link></li>
              <li><Link to="/category/technology" className="hover:text-white transition-colors">Technology</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>ইমেইল: info@darpannews.com</li>
              <li>ফোন: +৮৮০ ২-১২৩৪৫৬৭</li>
              <li>মিরপুর রোড, ঢাকা ১২১৬, বাংলাদেশ</li>
              <li className="pt-4">
                <Link to="/contact" className="hover:text-white transition-colors block font-semibold text-blue-400">যোগাযোগ করুন</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} দৈনিক দর্পণ. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
