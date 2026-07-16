import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Vote, BarChart3, CheckCircle } from 'lucide-react';

const PollWidget = () => {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchActivePoll = async () => {
      try {
        const res = await api.get('/polls/active');
        if (res.success && res.poll) {
          setPoll(res.poll);
          
          // Check localStorage to see if user voted in this specific poll
          const votedList = JSON.parse(localStorage.getItem('votedPolls') || '[]');
          if (votedList.includes(res.poll._id)) {
            setVoted(true);
          }
        }
      } catch (err) {
        console.error('Failed to load active poll:', err);
      }
    };
    fetchActivePoll();
  }, []);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (selectedOption === null || !poll) return;

    setSubmitting(true);
    setMessage('');
    try {
      const res = await api.post(`/polls/${poll._id}/vote`, { optionIndex: selectedOption });
      if (res.success) {
        setPoll(res.poll);
        setVoted(true);
        
        // Save to localStorage
        const votedList = JSON.parse(localStorage.getItem('votedPolls') || '[]');
        votedList.push(poll._id);
        localStorage.setItem('votedPolls', JSON.stringify(votedList));
        
        setMessage('আপনার মতামত প্রদানের জন্য ধন্যবাদ!');
      } else {
        setMessage(res.message || 'ভোট প্রদান ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setMessage('নেটওয়ার্ক ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (!poll) return null;

  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm no-print">
      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-4">
        <BarChart3 className="h-5 w-5" />
        <span className="text-xs uppercase font-extrabold tracking-widest">আজকের জনমত জরিপ</span>
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 leading-relaxed">
        {poll.question}
      </h3>

      {voted ? (
        /* Results View */
        <div className="space-y-4">
          {poll.options.map((opt, idx) => {
            const votesCount = opt.votes || 0;
            const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{opt.option}</span>
                  <span>{percentage}% ({votesCount} ভোট)</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>সর্বমোট ভোট: {totalVotes}</span>
            <div className="flex items-center text-green-600 font-semibold space-x-1">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>আপনার ভোট গৃহিত হয়েছে</span>
            </div>
          </div>
        </div>
      ) : (
        /* Voting Form */
        <form onSubmit={handleVoteSubmit} className="space-y-4">
          <div className="space-y-2">
            {poll.options.map((opt, idx) => (
              <label 
                key={idx} 
                className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                  selectedOption === idx 
                    ? 'border-blue-500 bg-blue-50/20 dark:border-blue-500/50' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input 
                  type="radio" 
                  name="poll-option" 
                  value={idx} 
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                  className="h-4 w-4 text-blue-600 border-slate-300 dark:border-slate-700" 
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt.option}</span>
              </label>
            ))}
          </div>

          {message && (
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">
              {message}
            </p>
          )}

          <button 
            type="submit" 
            disabled={selectedOption === null || submitting}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-sm transition-colors shadow-sm"
          >
            <Vote className="h-4.5 w-4.5" />
            <span>ভোট দিন</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default PollWidget;
