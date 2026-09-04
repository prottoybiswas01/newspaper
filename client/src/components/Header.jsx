import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Menu, X, User, Search, Newspaper, Shield, Globe, ChevronDown, Layers, Camera, Video, MoreHorizontal } from 'lucide-react';
import { api } from '../utils/api';
import CategoryMegaMenu from './CategoryMegaMenu';

// Top 9 main visible categories as specified in audit PDF Page 5
const MAIN_NAV_ITEMS = [
  { name: 'সর্বশেষ', slug: 'latest', path: '/' },
  { name: 'বাংলাদেশ', slug: 'bangladesh', path: '/category/bangladesh' },
  { name: 'রাজনীতি', slug: 'politics', path: '/category/politics' },
  { name: 'বিশ্ব', slug: 'international', path: '/category/international' },
  { name: 'বাণিজ্য', slug: 'economy', path: '/category/economy' },
  { name: 'চাকরি', slug: 'jobs', path: '/category/jobs' },
  { name: 'ছবি', slug: 'photo', path: '/category/photo' },
  { name: 'মতামত', slug: 'opinion', path: '/category/opinion' },
  { name: 'জীবনযাপন', slug: 'lifestyle', path: '/category/lifestyle' },
];

const Header = () => {
  const { user, logout, hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/taxonomy/categories');
        if (res.success && Array.isArray(res.categories) && res.categories.length > 0) {
          setAllCategories(res.categories.sort((a,b) => (a.order || 0) - (b.order || 0)));
        }
      } catch (err) {
        console.error('Failed to fetch navbar categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleCategoryClick = () => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-neutral-800 shadow-xs transition-all duration-300 no-print">
      
      {/* Row 1: Logo & Top controls (Search, divider, Login, Photo/Video embeds) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-black tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
            <Newspaper className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.5] text-red-600 shrink-0" />
            <span className="font-sans text-gray-950 dark:text-white tracking-tight">
              {language === 'bn' ? 'দৈনিক দর্পণ' : 'Daily Darpan'}
            </span>
          </Link>
          
          {/* Prothom-Alo Style Photo & Video Embed Badges */}
          <div className="hidden lg:flex items-center space-x-1.5 pl-3 border-l border-gray-200 dark:border-neutral-800 text-xs font-bold text-gray-600 dark:text-neutral-400">
            <Link 
              to="/category/photo" 
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-neutral-700 transition-colors"
              title="ফটো স্টোরি ও ছবি"
            >
              <Camera className="h-3.5 w-3.5 text-red-600" />
              <span>ছবি</span>
            </Link>
            <Link 
              to="/media-center" 
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-neutral-700 transition-colors"
              title="ভিডিও ও মিডিয়া"
            >
              <Video className="h-3.5 w-3.5 text-red-600" />
              <span>ভিডিও</span>
            </Link>
          </div>
        </div>

        {/* Right: Search, Divider, and Login Link */}
        <div className="flex items-center space-x-3 text-gray-600 dark:text-neutral-400">
          {/* Search Button Toggle */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-600 dark:text-neutral-400"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Vertical Divider */}
          <div className="h-4 w-px bg-gray-200 dark:bg-neutral-800"></div>

          {/* Profile / Auth Button (Only visible when logged in) */}
          {user && (
            <div className="flex items-center space-x-2">
              {hasPermission(['Reporter', 'Editor', 'Admin', 'Super Admin', 'SEO Manager', 'Moderator']) && (
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors shadow-sm"
                  title="এডমিন প্যানেল ড্যাশবোর্ডে যান"
                >
                  <Shield className="h-4 w-4 text-amber-300 shrink-0" />
                  <span>ড্যাশবোর্ড</span>
                </Link>
              )}
              <Link to="/profile" className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-6 w-6 rounded-full border border-gray-300 dark:border-neutral-700 bg-white" 
                />
                <span className="hidden sm:inline-block text-xs font-bold text-gray-700 dark:text-neutral-300">{user.name.split(' ')[0]}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Category Scroll Bar + Theme/Language Toggles (Visible on all screens) */}
      <div className="border-t border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-1 gap-3">
          
          {/* Main 9 Categories List (PDF Page 5) */}
          <nav className="flex-1 overflow-x-auto scrollbar-none py-1">
            <ul className="flex items-center space-x-1.5 text-sm font-bold text-gray-800 dark:text-neutral-200 whitespace-nowrap">
              {user && hasPermission(['Reporter', 'Editor', 'Admin', 'Super Admin', 'SEO Manager', 'Moderator']) && (
                <li>
                  <Link 
                    to="/admin" 
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-black hover:bg-red-700 transition-colors shadow-xs"
                  >
                    <Shield className="h-3.5 w-3.5 text-amber-300" />
                    <span>ড্যাশবোর্ড</span>
                  </Link>
                </li>
              )}

              {MAIN_NAV_ITEMS.map((item) => {
                const isItemActive = item.path === '/' 
                  ? currentPath === '/' 
                  : currentPath === item.path || currentPath.startsWith(`${item.path}/`);
                
                // Match subcategories for this item if available in allCategories
                const categoryObj = allCategories.find(c => c.slug?.toLowerCase() === item.slug.toLowerCase());
                const subs = categoryObj?.subcategories || [];

                return (
                  <li key={item.slug} className="relative group">
                    <div className="flex items-center">
                      <Link 
                        to={item.path} 
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-md transition-all duration-150 ${
                          isItemActive 
                            ? 'bg-red-600 text-white font-black shadow-xs' 
                            : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-neutral-200 font-bold'
                        }`}
                      >
                        <span>{item.name}</span>
                        {subs.length > 0 && (
                          <ChevronDown className={`h-3 w-3 transition-transform group-hover:rotate-180 ${isItemActive ? 'text-white' : 'text-gray-400 group-hover:text-red-600'}`} />
                        )}
                      </Link>
                    </div>

                    {/* Hover Dropdown for Subcategories */}
                    {subs.length > 0 && (
                      <div className="absolute left-0 top-full hidden group-hover:block z-50 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl py-2 px-1 min-w-[180px]">
                          {subs.map(sub => {
                            const isSubActive = currentPath === `/category/${item.slug}/${sub.slug}`;
                            return (
                              <Link
                                key={sub._id || sub.slug}
                                to={`/category/${item.slug}/${sub.slug}`}
                                className={`block px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                  isSubActive
                                    ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold'
                                    : 'text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-red-600'
                                }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}

              {/* 3-Dot All Beat / Mega Menu button at the end (PDF Page 1, Page 5) */}
              <li>
                <button 
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${megaMenuOpen ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 hover:bg-red-600 hover:text-white text-gray-800 dark:text-neutral-200 font-extrabold'}`}
                  title="সকল ২০টি বিভাগ (All Beats - ৩ ডট)"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>সব বিভাগ</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </li>
            </ul>
          </nav>

          {/* Right: Theme Toggle, Language button, Hamburger toggle */}
          <div className="flex items-center space-x-2 shrink-0 border-l border-gray-200 dark:border-neutral-800 pl-3 py-1">
            {/* Theme Toggle (Light Default, Optional Dark Mode) */}
            <button 
              onClick={toggleTheme} 
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-gray-700" />}
            </button>

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors"
              title="Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] uppercase font-bold">{language === 'bn' ? 'Eng' : 'বাং'}</span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mega Menu Overlay */}
      {megaMenuOpen && (
        <div className="border-b border-gray-200 dark:border-neutral-800 shadow-md animate-in slide-in-from-top duration-200">
          <CategoryMegaMenu />
        </div>
      )}

      {/* Search Input Bar (Dropdown) */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-neutral-800 p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-top">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center space-x-2">
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-[#161616] text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              autoFocus
            />
            <button 
              type="submit" 
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-bold"
            >
              {t('search')}
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[100px] z-40 bg-black/50 backdrop-blur-xs animate-in fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-4/5 max-w-sm h-full bg-white dark:bg-[#0f0f0f] shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              {user && hasPermission(['Reporter', 'Editor', 'Admin', 'Super Admin', 'SEO Manager', 'Moderator']) && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-sm"
                >
                  <Shield className="h-5 w-5" />
                  <span>{t('dashboard')}</span>
                </Link>
              )}
              
              <Link 
                to="/" 
                onClick={handleCategoryClick} 
                className={`text-base font-bold p-2 px-3 rounded-xl block transition-colors ${
                  currentPath === '/' 
                    ? 'bg-red-600 text-white font-black' 
                    : 'text-gray-800 dark:text-neutral-100 hover:text-red-600 border-b border-gray-100 dark:border-neutral-800'
                }`}
              >
                {t('home')}
              </Link>
              {categories.map((cat) => {
                const catName = cat.name || (cat.slug ? (cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)) : 'বিভাগ');
                const isCatActive = currentPath === `/category/${cat.slug}` || currentPath.startsWith(`/category/${cat.slug}/`) || (cat.slug === 'media-center' && currentPath === '/media-center');
                const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                return (
                  <div key={cat._id || cat.slug} className="border-b border-gray-100 dark:border-neutral-800 pb-2">
                    <Link 
                      to={cat.slug === 'media-center' ? '/media-center' : `/category/${cat.slug}`}
                      onClick={handleCategoryClick}
                      className={`text-base font-bold p-2 px-3 rounded-xl block transition-colors ${
                        isCatActive 
                          ? 'bg-red-600 text-white font-black' 
                          : 'text-gray-800 dark:text-neutral-100 hover:text-red-600'
                      }`}
                    >
                      {catName}
                    </Link>
                    {hasSubs && (
                      <div className="flex flex-wrap gap-1.5 pl-4 pt-1">
                        {cat.subcategories.map(sub => {
                          const isSubActive = currentPath === `/category/${cat.slug}/${sub.slug}`;
                          return (
                            <Link
                              key={sub._id || sub.slug}
                              to={`/category/${cat.slug}/${sub.slug}`}
                              onClick={handleCategoryClick}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                                isSubActive
                                  ? 'bg-red-600 text-white font-bold'
                                  : 'text-gray-600 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 hover:text-red-600'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link 
                to="/archive" 
                onClick={handleCategoryClick} 
                className={`text-base font-bold p-2 px-3 rounded-xl block transition-colors ${
                  currentPath === '/archive' 
                    ? 'bg-red-600 text-white font-black' 
                    : 'text-gray-700 dark:text-neutral-300 hover:text-red-600 border-b border-gray-100 dark:border-neutral-800'
                }`}
              >
                {t('archive')}
              </Link>
              
              {user && (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="flex items-center space-x-2 text-red-600 font-bold p-2 text-sm"
                >
                  <User className="h-5 w-5" />
                  <span>{t('signOut')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
