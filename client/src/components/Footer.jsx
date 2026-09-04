import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Send, Check, Facebook, Twitter, Instagram, Youtube, Linkedin, Share2, Mail, Phone, MapPin } from 'lucide-react';
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
        setError(res.message || 'সাবস্ক্রিপশন সফল হয়নি। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setError('সার্ভার সংযোগ বিচ্ছিন্ন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#111111] text-neutral-300 dark:bg-[#050505] mt-14 border-t border-neutral-800 pt-10 pb-8 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Social Media Bar (PDF Page 4: যুক্ত হবে -> Social Media Icons) */}
        <div className="flex flex-wrap items-center justify-between pb-8 mb-10 border-b border-neutral-800 gap-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Share2 className="h-4 w-4 text-red-600" />
            <span>আমাদের সাথে যুক্ত থাকুন :</span>
          </div>
          <div className="flex items-center space-x-3">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-black text-white flex items-center justify-center transition-all duration-200 hover:scale-105 border border-neutral-700"
              title="X (Twitter)"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-red-500 hover:to-purple-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-[#FF0000] text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="YouTube"
            >
              <Youtube className="h-4 w-4" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-[#0A66C2] text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Info & Newsletter (Left 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-black text-white">
              <Newspaper className="h-7 w-7 text-red-600" />
              <span>দৈনিক দর্পণ</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
              সর্বশেষ ও নিরপেক্ষ সংবাদ পরিবেশনে আমরা অঙ্গীকারবদ্ধ। দেশের প্রতিটি প্রান্তে ঘটে যাওয়া ঘটনার সত্যতা নিশ্চিত করে আমরা আপনাদের সামনে তুলে ধরি।
            </p>
            <div className="text-xs text-neutral-500 space-y-1 pt-1 border-t border-neutral-800/80">
              <p>প্রকাশক ও সম্পাদক: <span className="text-neutral-300 font-semibold">আবিদ মনসুর</span></p>
              <p>প্রধান বার্তা সম্পাদক: <span className="text-neutral-300 font-semibold">সাব্বির আহমেদ</span></p>
            </div>
            
            {/* Newsletter Subscription Box */}
            <div className="bg-[#181818] p-5 rounded-xl border border-neutral-800 max-w-md mt-4">
              <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-red-500" />
                <span>নিউজলেটার সাবস্ক্রাইব করুন</span>
              </h4>
              <p className="text-[11px] text-neutral-400 mb-3">প্রতিদিনের বাছাইকৃত সংবাদ সকালে আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।</p>
              
              {success ? (
                <div className="flex items-center space-x-2 text-green-400 text-xs font-semibold py-2">
                  <Check className="h-4 w-4" />
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
                    className="flex-1 px-3 py-2 text-xs bg-[#0f0f0f] border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-red-500"
                  />
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    {submitting ? '...' : <Send className="h-3.5 w-3.5" />}
                  </button>
                </form>
              )}
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>
          </div>

          {/* Quick Category Links (2/12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-red-600/60 pb-1.5 inline-block">
              বিভাগসমূহ
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/bangladesh" className="hover:text-white hover:underline transition-colors">বাংলাদেশ</Link></li>
              <li><Link to="/category/politics" className="hover:text-white hover:underline transition-colors">রাজনীতি</Link></li>
              <li><Link to="/category/international" className="hover:text-white hover:underline transition-colors">আন্তর্জাতিক</Link></li>
              <li><Link to="/category/economy" className="hover:text-white hover:underline transition-colors">বাণিজ্য ও অর্থনীতি</Link></li>
              <li><Link to="/category/sports" className="hover:text-white hover:underline transition-colors">খেলাধুলা</Link></li>
              <li><Link to="/category/entertainment" className="hover:text-white hover:underline transition-colors">বিনোদন</Link></li>
              <li><Link to="/category/lifestyle" className="hover:text-white hover:underline transition-colors">জীবনযাপন</Link></li>
              <li><Link to="/category/technology" className="hover:text-white hover:underline transition-colors">তথ্যপ্রযুক্তি</Link></li>
              <li><Link to="/category/jobs" className="hover:text-white hover:underline transition-colors">চাকরি</Link></li>
            </ul>
          </div>

          {/* Important Links (2/12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-red-600/60 pb-1.5 inline-block">
              গুরুত্বপূর্ণ লিংক
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about-us" className="hover:text-white hover:underline transition-colors">আমাদের কথা (About Us)</Link></li>
              <li><Link to="/terms" className="hover:text-white hover:underline transition-colors">ব্যবহারের শর্তাবলী</Link></li>
              <li><Link to="/privacy" className="hover:text-white hover:underline transition-colors">গোপনীয়তা নীতি</Link></li>
              <li><Link to="/advertisement" className="hover:text-white hover:underline transition-colors">বিজ্ঞাপন</Link></li>
              <li><Link to="/archive" className="hover:text-white hover:underline transition-colors">আর্কাইভ</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:underline transition-colors">যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Contact Details (3/12) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-red-600/60 pb-1.5 inline-block">
              যোগাযোগ
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-200">নিউজ রুম / বার্তা কক্ষ:</p>
                  <p>+৮৮০ ১৭৪৯৯৬৫২৪০</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-200">ইমেইল:</p>
                  <p>info@darpannews.com</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-200">ঠিকানা:</p>
                  <p>বাড়ি ১১, রোড ৩/বি, নিকুঞ্জ, ঢাকা ১২২৯, বাংলাদেশ</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 gap-3">
          <p>© স্বত্ব দৈনিক দর্পণ ২০২৫-২০২৬ | সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="hover:text-neutral-300">গোপনীয়তা নীতি</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-neutral-300">শর্তাবলী</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-neutral-300">যোগাযোগ</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
