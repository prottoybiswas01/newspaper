import React from 'react';
import { PlayCircle, Image as ImageIcon, Film } from 'lucide-react';

const MediaCenter = () => {
  const videos = [
    {
      title: 'বাংলাদেশ বিমান ঢাকা-রোম নতুন ফ্লাইট ঘোষণা',
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
      duration: '০৩:১৫'
    },
    {
      title: 'পদ্মা সেতু দিয়ে যোগাযোগ ও অর্থনীতিতে বৈপ্লবিক পরিবর্তন',
      url: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800',
      duration: '০৫:৪০'
    },
    {
      title: 'আইটি সেক্টরে ক্যারিয়ার গড়তে তরুণদের মাঝে নতুন আগ্রহ',
      url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
      duration: '০৪:১০'
    }
  ];

  const photos = [
    {
      title: 'ঐতিহাসিক লালবাগ কেল্লার নান্দনিক দৃশ্য',
      url: 'https://images.unsplash.com/photo-1596422846543-75c6fc1f7f67?w=800'
    },
    {
      title: 'শ্রীমঙ্গলের মনোরম চা বাগানের আলোকচিত্র',
      url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800'
    },
    {
      title: 'সুন্দরবনের চিরসবুজ প্রকৃতির অপরূপ দৃশ্য',
      url: 'https://images.unsplash.com/photo-1616428751509-f65561a384cd?w=800'
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-8 border-b pb-2 flex items-center space-x-2">
        <Film className="h-7 w-7 text-blue-650" />
        <span>মিডিয়া সেন্টার (Media Center)</span>
      </h1>

      {/* Video Gallery Section */}
      <section className="mb-12">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center space-x-2">
          <PlayCircle className="h-5 w-5 text-red-500" />
          <span>ভিডিও গ্যালারি (Video Gallery)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((vid, idx) => (
            <div key={idx} className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="relative aspect-video">
                <img src={vid.url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-white fill-red-650 stroke-none drop-shadow" />
                </div>
                <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">{vid.duration}</span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug">{vid.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section>
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center space-x-2">
          <ImageIcon className="h-5 w-5 text-blue-500" />
          <span>আলোকচিত্র গ্যালারি (Photo Gallery)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photos.map((ph, idx) => (
            <div key={idx} className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="relative aspect-video overflow-hidden">
                <img src={ph.url} alt={ph.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug">{ph.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default MediaCenter;
