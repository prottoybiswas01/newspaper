import React, { useState } from 'react';
import { 
  ShieldCheck, AlertCircle, Clock, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, FileText, Info 
} from 'lucide-react';

const TrustBox = ({
  verificationStatus = 'unverified',
  verifiedBy = '',
  verificationNote = '',
  factBox = [],
  timeline = [],
  whatWeKnow = [],
  whatWeDontKnow = [],
  corrections = []
}) => {
  const [correctionsOpen, setCorrectionsOpen] = useState(false);

  const hasTrustContent = (
    verificationStatus !== 'unverified' ||
    (factBox && factBox.length > 0) ||
    (timeline && timeline.length > 0) ||
    (whatWeKnow && whatWeKnow.length > 0) ||
    (whatWeDontKnow && whatWeDontKnow.length > 0) ||
    (corrections && corrections.length > 0)
  );

  if (!hasTrustContent) return null;

  return (
    <div className="my-6 space-y-4 no-print">
      {/* 1. Verification State Bar */}
      {verificationStatus === 'verified' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 block">
                সম্পাদনা পর্ষদ কর্তৃক যাচাইকৃত সংবাদ
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                {verificationNote || 'এই সংবাদের তথ্যসমূহ একাধিক নির্ভরযোগ্য উৎস ও সরকারি তথ্যাদি থেকে নিশ্চিত করা হয়েছে।'}
              </p>
            </div>
          </div>
          {verifiedBy && (
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-md self-start sm:self-center">
              যাচাইকারী: {verifiedBy}
            </span>
          )}
        </div>
      )}

      {verificationStatus === 'developing' && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center space-x-2 shadow-xs">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-xs font-black text-amber-950 dark:text-amber-300 block">
              চলমান সংবাদ (Developing Story)
            </span>
            <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
              ঘটনার বিস্তারিত তথ্য এখনও সংগ্রহ করা হচ্ছে। নতুন তথ্য পাওয়া মাত্রই এই প্রতিবেদন আপডেট করা হবে।
            </p>
          </div>
        </div>
      )}

      {/* 2. What We Know vs What We Don't Know Split Card */}
      {((whatWeKnow && whatWeKnow.length > 0) || (whatWeDontKnow && whatWeDontKnow.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-neutral-800">
          {/* What We Know */}
          {whatWeKnow && whatWeKnow.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>আমরা যা নিশ্চিত হয়েছি:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-neutral-300">
                {whatWeKnow.map((item, i) => (
                  <li key={i} className="flex items-start space-x-1.5 leading-relaxed">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What We Don't Know */}
          {whatWeDontKnow && whatWeDontKnow.length > 0 && (
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-200 dark:border-neutral-800 pt-3 md:pt-0 md:pl-3">
              <div className="flex items-center space-x-1.5 text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <HelpCircle className="h-4 w-4" />
                <span>যা এখনও অনুসন্ধানে রয়েছে:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-neutral-300">
                {whatWeDontKnow.map((item, i) => (
                  <li key={i} className="flex items-start space-x-1.5 leading-relaxed">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Fact Box Table/Grid */}
      {factBox && factBox.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-3">
            <FileText className="h-4 w-4 text-red-600" />
            <span>এক নজরে মূল তথ্য (Fact Box)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {factBox.map((item, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase block">
                  {item.label || `তথ্য ${i+1}`}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-neutral-100 mt-0.5 block">
                  {item.value || item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Timeline Widget */}
      {timeline && timeline.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center space-x-1.5 text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-3">
            <Clock className="h-4 w-4 text-red-600" />
            <span>ঘটনাপঞ্জি (Timeline)</span>
          </div>
          <div className="space-y-3 border-l-2 border-red-500 ml-2 pl-3">
            {timeline.map((event, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white dark:border-neutral-900" />
                <span className="text-[10px] font-black text-red-600 dark:text-red-400 block">{event.time}</span>
                <h6 className="text-xs font-bold text-gray-900 dark:text-white">{event.title}</h6>
                {event.description && <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">{event.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Corrections & Clarifications Accordion */}
      {corrections && corrections.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#121212] overflow-hidden">
          <button
            onClick={() => setCorrectionsOpen(!correctionsOpen)}
            className="w-full p-3 flex items-center justify-between text-xs font-bold text-gray-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <div className="flex items-center space-x-1.5">
              <Info className="h-4 w-4 text-blue-600" />
              <span>সংশোধনী ও স্পষ্টীকরণ বিজ্ঞপ্তি ({corrections.length})</span>
            </div>
            {correctionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {correctionsOpen && (
            <div className="p-3 bg-gray-50/70 dark:bg-neutral-900/50 border-t border-gray-200 dark:border-neutral-800 space-y-2 text-xs">
              {corrections.map((cor, i) => (
                <div key={i} className="p-2 rounded-lg bg-white dark:bg-[#151515] border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-neutral-500 font-semibold mb-1">
                    <span>{new Date(cor.date).toLocaleString('bn-BD')}</span>
                    {cor.author && <span>সম্পাদনা: {cor.author}</span>}
                  </div>
                  <p className="text-gray-800 dark:text-neutral-200 leading-relaxed">
                    {cor.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrustBox;
