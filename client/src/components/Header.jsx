import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Menu, X, User, Search, Newspaper, Shield } from 'lucide-react';

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
    <header className="sticky top-0 z-50 glass shadow-sm transition-all duration-300 no-print">
      {/* Topmost bar for date and brand logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 dark:border-slate-800/50 py-3 flex items-center justify-between">
        <div className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        <Link to="/" className="flex items-center space-x-2 text-2xl font-black tracking-tight text-blue-600 dark:text-blue-500">
          <Newspaper className="h-8 w-8 stroke-[2.5]" />
          <span className="font-sans bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 bg-clip-text text-transparent">
            {language === 'bn' ? 'দৈনিক দর্পণ' : 'Daily Darpan'}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-1.5 py-0.5 rounded ml-2">
            Mirror News
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </button>

          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage} 
            className="px-2 py-1 text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-colors"
            title="Switch Language"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>

          {/* Search Button Toggle */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Auth buttons */}
          {user ? (
            <div className="flex items-center space-x-2">
              {hasPermission(['Reporter', 'Editor', 'Admin', 'Super Admin', 'SEO Manager', 'Moderator']) && (
                <Link 
                  to="/admin" 
                  className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>{t('dashboard')}</span>
                </Link>
              )}
              <Link to="/profile" className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-7 w-7 rounded-full border border-slate-300 dark:border-slate-700 bg-white" 
                />
                <span className="hidden lg:block text-xs font-semibold text-slate-700 dark:text-slate-300">{user.name}</span>
              </Link>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all font-semibold text-xs tracking-wide"
            >
              <User className="h-4 w-4" />
              <span>{t('signIn')}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Main Categories Navigation Bar (Desktop) */}
      <nav className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 dark:border-slate-800/50">
        <ul className="flex space-x-6 py-2 overflow-x-auto scrollbar-none">
          <li>
            <Link to="/" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
              {t('home')}
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link 
                to={cat.slug === 'media-center' ? '/media-center' : `/category/${cat.slug}`} 
                className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
              >
                {t(cat.slug.replace(/-([a-z])/g, g => g[1].toUpperCase()))}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/archive" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
              {t('archive')}
            </Link>
          </li>
        </ul>
      </nav>

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
        <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-slate-950/20 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)}>
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
              
              {user ? (
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="flex items-center space-x-2 text-red-600 font-bold p-2 text-sm"
                >
                  <User className="h-5 w-5" />
                  <span>{t('signOut')}</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 p-3 mt-4 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold text-sm"
                >
                  <User className="h-5 w-5" />
                  <span>{t('signIn')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
