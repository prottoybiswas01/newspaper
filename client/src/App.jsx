import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BreakingTicker from './components/BreakingTicker';

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
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
          <div className="flex flex-col min-h-screen transition-colors duration-300">
            <Header />
            <BreakingTicker />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:categorySlug" element={<CategoryNews />} />
                <Route path="/article/:slug" element={<ArticleDetails />} />
                <Route path="/search" element={<Search />} />
                <Route path="/reporter/:id" element={<ReporterProfile />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/media-center" element={<MediaCenter />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Dashboard />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
