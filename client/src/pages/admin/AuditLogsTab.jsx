import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';
import { ShieldCheck, UserCheck, Calendar, Filter, RefreshCw, AlertTriangle } from 'lucide-react';

const AuditLogsTab = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('');
  const [filterTarget, setFilterTarget] = useState('');

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      let query = '?limit=100';
      if (filterAction) query += `&action=${encodeURIComponent(filterAction)}`;
      if (filterTarget) query += `&targetType=${encodeURIComponent(filterTarget)}`;

      const res = await api.get(`/audit${query}`);
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('অডিট লগ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [filterAction, filterTarget]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              নিরাপত্তা ও অডিট লগ রেজিস্ট্রি (Enterprise Audit Logs)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              ISO/IEC 27001 Ready
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            ব্যবহারকারী লগইন, সংবাদ সম্পাদনা, রোল পরিবর্তন ও বিজ্ঞাপন কনফিগারেশনের অপরিবর্তনীয় ট্রেইল
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          className="flex items-center space-x-1.5 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-bold text-gray-700 dark:text-neutral-300 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>রিফ্রেশ লগ</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
          <Filter className="h-4 w-4" />
          <span>ফিল্টার:</span>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-1.5 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none font-semibold"
        >
          <option value="">সকল অ্যাকশন (All Actions)</option>
          <option value="login">Login (লগইন)</option>
          <option value="article_created">Article Created</option>
          <option value="article_updated">Article Updated</option>
          <option value="article_published">Article Published</option>
          <option value="article_deleted">Article Deleted</option>
          <option value="ad_created">Ad Created</option>
          <option value="role_changed">Role Changed</option>
          <option value="comment_moderated">Comment Moderated</option>
        </select>

        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          className="px-3 py-1.5 border rounded-xl text-xs bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none font-semibold"
        >
          <option value="">সকল টার্গেট টাইপ</option>
          <option value="article">Article</option>
          <option value="ad">Ad</option>
          <option value="user">User</option>
          <option value="comment">Comment</option>
          <option value="auth">Auth</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-gray-400">লগ লোড করা হচ্ছে...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShieldCheck className="h-10 w-10 mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
            <p className="text-sm font-bold">কোনো অডিট লগ পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-700 dark:text-neutral-300">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-700 dark:text-neutral-300 uppercase text-[9px] font-black border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="p-4">সময় ও তারিখ</th>
                  <th className="p-4">ব্যবহারকারী (User)</th>
                  <th className="p-4">অ্যাকশন (Action)</th>
                  <th className="p-4">টার্গেট ও আইটেম</th>
                  <th className="p-4">আইপি ও ডিভাইস</th>
                  <th className="p-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-gray-500 dark:text-neutral-400 whitespace-nowrap">
                      {new Date(log.timestamp || log.createdAt).toLocaleString('bn-BD', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">{log.userName || log.userEmail || 'System'}</div>
                      <div className="text-[10px] text-gray-400">{log.userRole || 'Automated Service'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        log.action?.includes('deleted') ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                        (log.action?.includes('published') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        (log.action?.includes('role') ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'))
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      <div className="font-bold text-gray-900 dark:text-white truncate">
                        {log.targetTitle || log.targetId || 'N/A'}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase font-mono">
                        Type: {log.targetType || 'system'}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-gray-500">
                      <div>{log.ip || '127.0.0.1'}</div>
                      <div className="text-[9px] text-gray-400 truncate max-w-xs">{log.userAgent || 'Desktop Browser'}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsTab;
