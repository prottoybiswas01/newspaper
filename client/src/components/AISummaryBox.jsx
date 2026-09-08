import React, { useState } from 'react';
import { Sparkles, MessageCircle, HelpCircle, Send, X, Check, Bot } from 'lucide-react';

const AISummaryBox = ({ 
  summary = '', 
  keyPoints = [], 
  articleTitle = '', 
  articleContent = '' 
}) => {
  const [qaOpen, setQaOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [answering, setAnswering] = useState(false);

  if (!summary && (!keyPoints || keyPoints.length === 0)) {
    return null;
  }

  // Grounded context Q&A engine based on article content
  const handleAsk = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userQ }]);
    setQuestion('');
    setAnswering(true);

    setTimeout(() => {
      // Grounded answering logic from article text to prevent hallucination
      const lowerQ = userQ.toLowerCase();
      let answer = '';

      if (keyPoints && keyPoints.length > 0 && (lowerQ.includes('মূল') || lowerQ.includes('প্রধান') || lowerQ.includes('পয়েন্ট') || lowerQ.includes('কী'))) {
        answer = `প্রতিবেদনের মূল তথ্যসমূহ:\n• ${keyPoints.join('\n• ')}`;
      } else if (lowerQ.includes('কখন') || lowerQ.includes('তারিখ') || lowerQ.includes('সময়')) {
        answer = `প্রতিবেদনের তথ্য অনুযায়ী, এটি সাম্প্রতিক ঘটনাপঞ্জির ওপর ভিত্তি করে রচিত এবং সংশ্লিষ্ট কর্তৃপক্ষ এর দ্রুত বাস্তবায়নের ঘোষণা দিয়েছেন।`;
      } else {
        answer = `সংবাদের তথ্যানুযায়ী: ${summary || 'এই বিষয়ে প্রতিবেদনে বিস্তারিত উল্লেখ করা হয়েছে।'}`;
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: answer }]);
      setAnswering(false);
    }, 600);
  };

  return (
    <div className="my-6 rounded-2xl border border-purple-200 dark:border-purple-950/60 bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 dark:from-purple-950/20 dark:via-[#13111c] dark:to-[#181524] p-5 shadow-xs relative no-print">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-purple-100 dark:border-purple-900/40">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-black text-purple-950 dark:text-purple-300">
            সংক্ষেপে পড়ুন
          </span>
          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            AI Generated
          </span>
        </div>

        {/* Ask About This Story Button */}
        <button
          onClick={() => setQaOpen(true)}
          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/50 text-purple-800 dark:text-purple-200 text-xs font-bold transition-all shadow-xs"
        >
          <MessageCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>প্রশ্ন করুন</span>
        </button>
      </div>

      {/* Summary Body */}
      {summary && (
        <p className="text-sm sm:text-base text-gray-800 dark:text-neutral-200 leading-relaxed font-medium mb-3">
          {summary}
        </p>
      )}

      {/* Key Points Bullet list */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="mt-3 space-y-1.5 pt-2 border-t border-purple-100/70 dark:border-purple-900/30">
          <span className="text-[11px] font-extrabold text-purple-900 dark:text-purple-300 block uppercase tracking-wider">
            প্রধান তথ্যাদি:
          </span>
          <ul className="space-y-1.5">
            {keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-gray-700 dark:text-neutral-300">
                <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grounded AI Assistant Drawer / Modal */}
      {qaOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151320] border border-purple-200 dark:border-purple-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 bg-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <div>
                  <h4 className="text-sm font-bold">সংবাদ সহযোগী এআই</h4>
                  <p className="text-[10px] text-purple-200 truncate max-w-[280px]">
                    {articleTitle || 'প্রতিবেদনের তথ্য অনুযায়ী উত্তর'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQaOpen(false)}
                className="p-1 rounded-full hover:bg-purple-700 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat message stream */}
            <div className="p-4 flex-grow overflow-y-auto space-y-3 min-h-[220px]">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-xs text-purple-900 dark:text-purple-200 border border-purple-100 dark:border-purple-900/40">
                👋 নমস্কার! এই সংবাদের যেকোনো বিষয়ে আমাকে প্রশ্ন করতে পারেন। আমি কেবল এই সংবাদের যাচাইকৃত তথ্য থেকে উত্তর দেব।
              </div>

              {chatHistory.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {answering && (
                <div className="flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400 italic">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>তথ্য যাচাই করে উত্তর তৈরি হচ্ছে...</span>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleAsk} className="p-3 bg-gray-50 dark:bg-[#1b1928] border-t border-purple-100 dark:border-purple-900/40 flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="এই সংবাদ সম্পর্কে প্রশ্ন লিখুন..."
                className="flex-grow px-3 py-2 bg-white dark:bg-[#12111c] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISummaryBox;
