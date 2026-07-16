import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Menu, X, User, Search, Newspaper, Shield, Globe } from 'lucide-react';

const Header = () => {
  const { user, logout, hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = [
    { name: 'Bangladesh', slug: 'bangladesh' },
    { name: 'International', slug: 'international' },
    { name: 'Politics', slug: 'politics' },
    { name: 'Economy', slug: 'economy' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Opinion', slug: 'opinion' },
    { name: 'Media Center', slug: 'media-center' },
  ];

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
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0b0f19] border-b border-slate-100 dark:border-slate-800 shadow-xs transition-all duration-300 no-print">
      
      {/* Row 1: Logo & Top controls (Search, divider, Login) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <Link to="/" className="flex items-center space-x-1.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
          <Newspaper className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.5] text-blue-600 dark:text-blue-500 shrink-0" />
          <span className="font-sans bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 bg-clip-text text-transparent">
            {language === 'bn' ? 'দৈনিক দর্পণ' : 'Daily Darpan'}
          </span>
        </Link>

        {/* Right: Search, Divider, and Login Link */}
        <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
          {/* Search Button Toggle */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Vertical Divider */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-850"></div>

          {/* Profile / Auth Button */}
          {user && (
            <div className="flex items-center space-x-2">
              {hasPermission(['Reporter', 'Editor', 'Admin', 'Super Admin', 'SEO Manager', 'Moderator']) && (
                <Link 
                  to="/admin" 
                  className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-55 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors animate-pulse"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>{t('dashboard')}</span>
                </Link>
              )}
              <Link to="/profile" className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-6 w-6 rounded-full border border-slate-300 dark:border-slate-700 bg-white" 
                />
                <span className="hidden sm:inline-block text-xs font-bold text-slate-700 dark:text-slate-300">{user.name.split(' ')[0]}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Category Scroll Bar + Theme/Language Toggles (Visible on all screens) */}
      <div className="border-t border-b border-slate-100 dark:border-slate-850/80 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-1 gap-4">
          
          {/* Scrollable Categories List */}
          <nav className="flex-1 overflow-x-auto scrollbar-none py-1.5">
            <ul className="flex space-x-5 text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('home')}
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    to={cat.slug === 'media-center' ? '/media-center' : `/category/${cat.slug}`} 
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t(cat.slug.replace(/-([a-z])/g, g => g[1].toUpperCase()))}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/archive" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('archive')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right: Theme Toggle, Language button, Hamburger toggle */}
          <div className="flex items-center space-x-2 shrink-0 border-l border-slate-200 dark:border-slate-800 pl-3 py-1">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-1.5 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-555 dark:text-slate-400 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-650" />}
            </button>

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] uppercase font-bold">{language === 'bn' ? 'Eng' : 'বাং'}</span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Search Input Bar (Dropdown) */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-top">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center space-x-2">
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
            <button 
              type="submit" 
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold"
            >
              {t('search')}
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[100px] z-40 bg-slate-950/20 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-4/5 max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              {user && hasPermission(['Reporter', 'Editor', 'Admin', 'Super Admin', 'SEO Manager', 'Moderator']) && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm"
                >
                  <Shield className="h-5 w-5" />
                  <span>{t('dashboard')}</span>
                </Link>
              )}
              
              <Link to="/" onClick={handleCategoryClick} className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 p-2 border-b border-slate-100 dark:border-slate-800">
                {t('home')}
              </Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.slug} 
                  to={cat.slug === 'media-center' ? '/media-center' : `/category/${cat.slug}`}
                  onClick={handleCategoryClick}
                  className="text-base font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 p-2 border-b border-slate-100 dark:border-slate-800"
                >
                  {t(cat.slug.replace(/-([a-z])/g, g => g[1].toUpperCase()))}
                </Link>
              ))}
              <Link to="/archive" onClick={handleCategoryClick} className="text-base font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 p-2 border-b border-slate-100 dark:border-slate-800">
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
