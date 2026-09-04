import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                সাময়িক ত্রুটি ঘটেছে
              </h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                পেজটি লোড করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা হোমপেজে ফিরে যান।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>পুনরায় লোড করুন</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>হোমপেজে যান</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
