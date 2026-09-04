import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import BreakingTicker from './components/BreakingTicker';
import { SpeedInsights } from "@vercel/speed-insights/react";

/* ════════════════════════════════════════════════════════════════
   APPLICATION ROUTE PAGES (MODULAR PARTITIONS)
   ════════════════════════════════════════════════════════════════ */
import Home from './pages/Home';
import CategoryNews from './pages/CategoryNews';
import ArticleDetails from './pages/ArticleDetails';
import Search from './pages/Search';
import ReporterProfile from './pages/ReporterProfile';
import Archive from './pages/Archive';
import MediaCenter from './pages/MediaCenter';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    // Global Catastrophic Safety Boundary
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Router>
                <div className="flex flex-col min-h-screen transition-colors duration-300">
                  
                  {/* ─── PARTITION 1: Global Header & Navigation ─── */}
                  <ErrorBoundary isSection={true} sectionName="হেডার ও নেভিগেশন বার">
                    <Header />
                  </ErrorBoundary>

                  {/* ─── PARTITION 2: Breaking News Ticker ─── */}
                  <ErrorBoundary isSection={true} sectionName="ব্রেকিং নিউজ বার">
                    <BreakingTicker />
                  </ErrorBoundary>

                  {/* ─── PARTITION 3: Main Dynamic Page View (Fault Isolated Routes) ─── */}
                  <div className="flex-grow">
                    <Routes>
                      {/* Homepage Partition */}
                      <Route 
                        path="/" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="হোমপেজ">
                            <Home />
                          </ErrorBoundary>
                        } 
                      />

                      {/* Category & Subcategory Partition */}
                      <Route 
                        path="/category/:categorySlug" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="ক্যাটাগরি পেজ">
                            <CategoryNews />
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/category/:categorySlug/:subSlug" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="সাব-ক্যাটাগরি পেজ">
                            <CategoryNews />
                          </ErrorBoundary>
                        } 
                      />

                      {/* Single Article Reader Partition */}
                      <Route 
                        path="/article/:slug" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="সংবাদ বিস্তারিত পেজ">
                            <ArticleDetails />
                          </ErrorBoundary>
                        } 
                      />

                      {/* Search Partition */}
                      <Route 
                        path="/search" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="অনুসন্ধান পেজ">
                            <Search />
                          </ErrorBoundary>
                        } 
                      />

                      {/* Reporter Profile Partition */}
                      <Route 
                        path="/reporter/:id" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="প্রতিবেদক প্রোফাইল">
                            <ReporterProfile />
                          </ErrorBoundary>
                        } 
                      />

                      {/* News Archive Partition */}
                      <Route 
                        path="/archive" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="সংবাদ আর্কাইভ">
                            <Archive />
                          </ErrorBoundary>
                        } 
                      />

                      {/* Media & Video Center Partition */}
                      <Route 
                        path="/media-center" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="মিডিয়া সেন্টার">
                            <MediaCenter />
                          </ErrorBoundary>
                        } 
                      />

                      {/* User Profile Partition */}
                      <Route 
                        path="/profile" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="ইউজার প্রোফাইল">
                            <UserProfile />
                          </ErrorBoundary>
                        } 
                      />

                      {/* Admin Portal Authentication Partition */}
                      <Route 
                        path="/login-admin" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="লগইন পোর্টাল">
                            <Login />
                          </ErrorBoundary>
                        } 
                      />

                      {/* Administrative Control Dashboard Partition */}
                      <Route 
                        path="/admin/*" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="অ্যাডমিন ড্যাশবোর্ড">
                            <Dashboard />
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/admin" 
                        element={
                          <ErrorBoundary isSection={true} sectionName="অ্যাডমিন ড্যাশবোর্ড">
                            <Dashboard />
                          </ErrorBoundary>
                        } 
                      />
                    </Routes>
                  </div>

                  {/* ─── PARTITION 4: Global Footer ─── */}
                  <ErrorBoundary isSection={true} sectionName="ফুটার বিভাগ">
                    <Footer />
                  </ErrorBoundary>

                  <SpeedInsights />
                </div>
              </Router>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
