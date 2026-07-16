import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const bnTranslations = {
  home: 'হোম',
  bangladesh: 'বাংলাদেশ',
  international: 'আন্তর্জাতিক',
  politics: 'রাজনীতি',
  economy: 'অর্থনীতি',
  sports: 'খেলাধুলা',
  entertainment: 'বিনোদন',
  technology: 'তথ্যপ্রযুক্তি',
  opinion: 'মতামত',
  mediaCenter: 'মিডিয়া সেন্টার',
  archive: 'আর্কাইভ',
  search: 'অনুসন্ধান',
  login: 'লগইন',
  dashboard: 'ড্যাশবোর্ড',
  signOut: 'লগআউট',
  signIn: 'লগইন করুন',
  readMore: 'আরও পড়ুন',
  latestNews: 'সর্বশেষ সংবাদ',
  views: 'বার পঠিত',
  likes: 'লাইক',
  shares: 'শেয়ার',
  comments: 'মন্তব্য',
  writeComment: 'একটি মন্তব্য লিখুন...',
  postComment: 'মন্তব্য পোস্ট করুন',
  searchResults: 'অনুসন্ধানের ফলাফল',
  noArticles: 'কোনো সংবাদ পাওয়া যায়নি',
  featured: 'বিশেষ সংবাদ',
  trending: 'জনপ্রিয় সংবাদ',
  searchPlaceholder: 'সংবাদ অনুসন্ধান করুন...',
  category: 'বিভাগ',
  author: 'লেখক',
  publishDate: 'প্রকাশের তারিখ',
  profile: 'প্রোফাইল',
  saveArticle: 'সংরক্ষণ করুন',
  settings: 'সেটিংস',
  back: 'ফিরে যান'
};

const enTranslations = {
  home: 'Home',
  bangladesh: 'Bangladesh',
  international: 'International',
  politics: 'Politics',
  economy: 'Economy',
  sports: 'Sports',
  entertainment: 'Entertainment',
  technology: 'Technology',
  opinion: 'Opinion',
  mediaCenter: 'Media Center',
  archive: 'Archive',
  search: 'Search',
  login: 'Login',
  dashboard: 'Dashboard',
  signOut: 'Sign Out',
  signIn: 'Sign In',
  readMore: 'Read More',
  latestNews: 'Latest News',
  views: 'Views',
  likes: 'Likes',
  shares: 'Shares',
  comments: 'Comments',
  writeComment: 'Write a comment...',
  postComment: 'Post Comment',
  searchResults: 'Search Results',
  noArticles: 'No articles found',
  featured: 'Featured News',
  trending: 'Trending News',
  searchPlaceholder: 'Search news...',
  category: 'Category',
  author: 'Author',
  publishDate: 'Publish Date',
  profile: 'Profile',
  saveArticle: 'Save Article',
  settings: 'Settings',
  back: 'Back'
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = (key) => {
    const translations = language === 'bn' ? bnTranslations : enTranslations;
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
