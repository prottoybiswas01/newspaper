import React from 'react';
import { RefreshCw, Wrench, Home, ArrowLeft } from 'lucide-react';

/**
 * Enterprise Resilient Error Boundary
 * Supports:
 * 1. Global / Full-page mode (fallback for catastrophic root failure)
 * 2. Section / Route mode (isSection={true}): Keeps header, footer and other site partitions 100% active,
 *    rendering a clean Bengali maintenance/updating notice only for the affected partition.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn(`[Partition Guard] Isolated error in ${this.props.sectionName || 'Section'}:`, error?.message, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { isSection = false, sectionName = 'এই বিভাগটি' } = this.props;

      // Section / Route Isolated Mode (Keeps rest of website fully running)
      if (isSection) {
        return (
          <div className="w-full my-6 p-6 sm:p-8 bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xs text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-amber-200 dark:border-amber-800/40">
              <Wrench className="h-6 w-6" />
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {sectionName} নিয়ে কাজ চলমান রয়েছে
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                এই অংশটির হালনাগাদ বা সাময়িক রক্ষণাবেক্ষণের কাজ চলছে। ওয়েবসাইটের অন্যান্য বিভাগ ও সংবাদগুলো স্বাভাবিকভাবে চালু রয়েছে।
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>পুনরায় চেষ্টা করুন</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                <span>হোমপেজে ফিরে যান</span>
              </button>
            </div>
          </div>
        );
      }

      // Full Application Fallback Mode
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-amber-200 dark:border-amber-800/40">
              <Wrench className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                ওয়েবসাইট রক্ষণাবেক্ষণ চলছে
              </h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                ওয়েবসাইটটির উন্নয়ন কাজ চলছে। অনুগ্রহ করে কিছু সময় পর পুনরায় চেষ্টা করুন।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>রিফ্রেশ করুন</span>
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
