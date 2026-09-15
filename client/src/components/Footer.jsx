import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, Check, Facebook, Twitter, Instagram, Youtube, Linkedin, 
  Share2, Mail, Phone, MapPin, ExternalLink, Globe, MessageCircle
} from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_FOOTER_SETTINGS = {
  aboutText: 'সর্বশেষ ও নিরপেক্ষ সংবাদ পরিবেশনে আমরা অঙ্গীকারবদ্ধ। দেশের প্রতিটি প্রান্তে ঘটে যাওয়া ঘটনার সত্যতা নিশ্চিত করে আমরা আপনাদের সামনে তুলে ধরি।',
  founderChiefEditor: 'মোস্তফা মাহফুজ',
  publisherEditor: 'মোস্তফা মাহফুজ',
  chiefEditor: 'সাব্বির আহমেদ',
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com', active: true },
    { platform: 'twitter', url: 'https://twitter.com', active: true },
    { platform: 'instagram', url: 'https://instagram.com', active: true },
    { platform: 'youtube', url: 'https://youtube.com', active: true },
    { platform: 'linkedin', url: 'https://linkedin.com', active: true }
  ],
  contact: {
    phone: '+৮৮০ ১৭৪৯৯৬৫২৪০',
    email: 'info@bengaltimes.com',
    address: 'বাড়ি ১১, রোড ৩/বি, নিকুঞ্জ, ঢাকা ১২২৯, বাংলাদেশ',
    mapUrl: 'https://maps.google.com/?q=Nikunja,Dhaka'
  },
  importantLinks: [
    { label: 'আমাদের সম্পর্কে', url: '/about-us' },
    { label: 'শর্তাবলী (Terms)', url: '/terms' },
    { label: 'গোপনীয়তা নীতি', url: '/privacy' },
    { label: 'সংবিধান ও অভিযোগ', url: '/complaints' },
    { label: 'নীতিমালা', url: '/policy' },
    { label: 'বিজ্ঞাপন', url: '/advertisement' },
    { label: 'যোগাযোগ', url: '/contact' },
    { label: 'সংবাদ আর্কাইভ', url: '/archive' }
  ],
  bottomLinks: [
    { label: 'আমাদের সম্পর্কে', url: '/about-us' },
    { label: 'শর্তাবলী', url: '/terms' },
    { label: 'গোপনীয়তা নীতি', url: '/privacy' },
    { label: 'সংবিধান ও অভিযোগ', url: '/complaints' },
    { label: 'নীতিমালা', url: '/policy' },
    { label: 'বিজ্ঞাপন', url: '/advertisement' },
    { label: 'যোগাযোগ', url: '/contact' }
  ],
  copyrightText: '© স্বত্ব বেঙ্গল টাইমস ২০২৫-২০২৬ | সর্বস্বত্ব সংরক্ষিত।'
};

const getSocialIcon = (platform) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('face')) return <Facebook className="h-4 w-4" />;
  if (p.includes('twit') || p.includes('x')) return <Twitter className="h-4 w-4" />;
  if (p.includes('insta')) return <Instagram className="h-4 w-4" />;
  if (p.includes('you')) return <Youtube className="h-4 w-4" />;
  if (p.includes('link')) return <Linkedin className="h-4 w-4" />;
  if (p.includes('whats') || p.includes('chat')) return <MessageCircle className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

const Footer = () => {
  const [footerData, setFooterData] = useState(DEFAULT_FOOTER_SETTINGS);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch dynamic footer settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/footer_settings');
        if (res.success && res.value) {
          setFooterData({
            ...DEFAULT_FOOTER_SETTINGS,
            ...res.value,
            contact: {
              ...DEFAULT_FOOTER_SETTINGS.contact,
              ...(res.value.contact || {})
            }
          });
        }
      } catch (err) {
        // Fallback gracefully to default
      }
    };
    fetchSettings();
  }, []);

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

  const socialLinks = footerData.socialLinks || DEFAULT_FOOTER_SETTINGS.socialLinks;
  const contact = footerData.contact || DEFAULT_FOOTER_SETTINGS.contact;
  const importantLinks = footerData.importantLinks || DEFAULT_FOOTER_SETTINGS.importantLinks;
  const bottomLinks = footerData.bottomLinks || DEFAULT_FOOTER_SETTINGS.bottomLinks;

  return (
    <footer className="bg-[#111111] text-neutral-300 dark:bg-[#050505] mt-14 border-t border-neutral-800 pt-10 pb-8 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Social Media Bar */}
        <div className="flex flex-wrap items-center justify-between pb-8 mb-10 border-b border-neutral-800 gap-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Share2 className="h-4 w-4 text-red-600" />
            <span>আমাদের সাথে যুক্ত থাকুন :</span>
          </div>
          <div className="flex items-center space-x-3">
            {socialLinks.filter(s => s.active !== false).map((item, idx) => (
              <a 
                key={idx}
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 border border-neutral-700/60"
                title={item.platform}
              >
                {getSocialIcon(item.platform)}
              </a>
            ))}
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Info & Newsletter (Left 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3 text-2xl font-black text-white">
              <img 
                src="/footer-logo.png" 
                alt="Bengal Times" 
                className="h-10 sm:h-11 w-auto object-contain shrink-0" 
              />
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
              {footerData.aboutText || DEFAULT_FOOTER_SETTINGS.aboutText}
            </p>
            <div className="text-xs text-neutral-500 space-y-1.5 pt-1 border-t border-neutral-800/80">
              <p>প্রতিষ্ঠাতা ও প্রধান সম্পাদক: <span className="text-neutral-200 font-bold">{footerData.founderChiefEditor || 'মোস্তফা মাহফুজ'}</span></p>
              <p>প্রধান বার্তা সম্পাদক: <span className="text-neutral-300 font-semibold">{footerData.chiefEditor || 'সাব্বির আহমেদ'}</span></p>
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
              {importantLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.url} className="hover:text-white hover:underline transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
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
                  <p>{contact.phone || '+৮৮০ ১৭৪৯৯৬৫২৪০'}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-200">ইমেইল:</p>
                  <p>{contact.email || 'info@bengaltimes.com'}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-200">ঠিকানা:</p>
                  {contact.mapUrl ? (
                    <a
                      href={contact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-400 hover:underline transition-colors group flex items-start gap-1"
                      title="গুগল ম্যাপে লোকেশন দেখুন"
                    >
                      <span>{contact.address || 'বাড়ি ১১, রোড ৩/বি, নিকুঞ্জ, ঢাকা ১২২৯, বাংলাদেশ'}</span>
                      <ExternalLink className="h-3 w-3 inline text-red-500 shrink-0 mt-0.5 group-hover:scale-110" />
                    </a>
                  ) : (
                    <p>{contact.address || 'বাড়ি ১১, রোড ৩/বি, নিকুঞ্জ, ঢাকা ১২২৯, বাংলাদেশ'}</p>
                  )}
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 gap-3">
          <p>{footerData.copyrightText || '© স্বত্ব বেঙ্গল টাইমস ২০২৫-২০২৬ | সর্বস্বত্ব সংরক্ষিত।'}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1">
            {bottomLinks.map((link, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>•</span>}
                <Link to={link.url} className="hover:text-neutral-300">
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
