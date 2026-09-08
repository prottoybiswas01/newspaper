import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, 
  Heading, AlignLeft, Quote, Video, Music, HelpCircle, 
  Clock, Megaphone, Eye, Save, History, RotateCcw, Check, Sparkles 
} from 'lucide-react';
import BlockArticleRenderer from './BlockArticleRenderer';

const BlockArticleEditor = ({
  blocks = [],
  onChange,
  onAiSummaryGenerate,
  revisions = [],
  onRestoreRevision
}) => {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview' | 'history'
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [autosaveTime, setAutosaveTime] = useState(null);

  // Local state for block stream
  const [localBlocks, setLocalBlocks] = useState(blocks || []);

  useEffect(() => {
    if (JSON.stringify(blocks) !== JSON.stringify(localBlocks)) {
      setLocalBlocks(blocks || []);
    }
  }, [blocks]);

  // Sync back to parent
  const updateBlocks = (newBlocks) => {
    setLocalBlocks(newBlocks);
    if (onChange) onChange(newBlocks);
    setAutosaveTime(new Date().toLocaleTimeString('bn-BD'));
  };

  const addBlock = (type) => {
    const id = 'blk_' + Math.random().toString(36).substr(2, 9);
    const order = localBlocks.length + 1;
    let newBlock = { id, type, content: '', metadata: {}, order };

    switch (type) {
      case 'heading':
        newBlock.content = 'নতুন শিরোনাম';
        newBlock.metadata = { level: 2 };
        break;
      case 'paragraph':
        newBlock.content = '';
        break;
      case 'image':
        newBlock.content = '';
        newBlock.metadata = { url: '', caption: '', credit: '' };
        break;
      case 'quote':
        newBlock.content = '';
        newBlock.metadata = { author: '', designation: '' };
        break;
      case 'video':
        newBlock.content = '';
        newBlock.metadata = { caption: '' };
        break;
      case 'audio':
        newBlock.content = '';
        newBlock.metadata = { title: '' };
        break;
      case 'factbox':
        newBlock.content = '';
        newBlock.metadata = { title: 'গুরুত্বপূর্ণ তথ্য' };
        break;
      case 'timeline':
        newBlock.content = '';
        newBlock.metadata = { 
          title: 'ঘটনাপঞ্জি',
          events: [{ time: 'সকাল ১০:০০', title: 'ঘটনা বিবরণ', description: '' }] 
        };
        break;
      case 'ad':
        newBlock.content = '';
        newBlock.metadata = { placement: 'article-inline-1' };
        break;
      default:
        break;
    }

    updateBlocks([...localBlocks, newBlock]);
  };

  const removeBlock = (index) => {
    const updated = localBlocks.filter((_, i) => i !== index);
    updateBlocks(updated);
  };

  const moveBlock = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localBlocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...localBlocks];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Recalculate order
    const reordered = copy.map((b, idx) => ({ ...b, order: idx + 1 }));
    updateBlocks(reordered);
  };

  const updateBlockField = (index, field, value) => {
    const copy = [...localBlocks];
    copy[index] = { ...copy[index], [field]: value };
    updateBlocks(copy);
  };

  const updateBlockMetadata = (index, key, value) => {
    const copy = [...localBlocks];
    copy[index] = {
      ...copy[index],
      metadata: { ...(copy[index].metadata || {}), [key]: value }
    };
    updateBlocks(copy);
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* Editor Header Toolbar */}
      <div className="p-3 bg-gray-50 dark:bg-[#181818] border-b border-gray-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'edit'
                ? 'bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900'
            }`}
          >
            ব্লক এডিটর ({localBlocks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>লাইভ প্রিভিউ</span>
          </button>
          {revisions && revisions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>সংস্করণ ইতিহাস ({revisions.length})</span>
            </button>
          )}
        </div>

        {/* AI Generator & Autosave Badge */}
        <div className="flex items-center gap-2">
          {onAiSummaryGenerate && (
            <button
              type="button"
              onClick={onAiSummaryGenerate}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-800 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>AI সামারি জেনারেট</span>
            </button>
          )}
          {autosaveTime && (
            <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" /> ড্রাফট সেভ: {autosaveTime}
            </span>
          )}
        </div>
      </div>

      {/* Mode 1: Edit Mode */}
      {activeTab === 'edit' && (
        <div className="p-4 space-y-4">
          {/* Blocks List */}
          {localBlocks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
              <p className="text-sm font-semibold text-gray-500 dark:text-neutral-400 mb-3">
                কোনো কন্টেন্ট ব্লক নেই। নিচে থেকে ব্লক যুক্ত করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {localBlocks.map((block, index) => (
                <div 
                  key={block.id || index}
                  className="relative p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-[#151515] group transition-all hover:border-red-400 dark:hover:border-red-600/50"
                >
                  {/* Block Header Toolbar */}
                  <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 dark:border-neutral-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        #{index + 1} {block.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === localBlocks.length - 1}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600"
                        title="Delete Block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Specific Form Inputs */}
                  {block.type === 'heading' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={block.metadata?.level || 2}
                          onChange={(e) => updateBlockMetadata(index, 'level', Number(e.target.value))}
                          className="px-2 py-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded text-xs font-bold"
                        >
                          <option value={2}>Heading 2 (H2)</option>
                          <option value={3}>Heading 3 (H3)</option>
                          <option value={4}>Heading 4 (H4)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={block.content || ''}
                        onChange={(e) => updateBlockField(index, 'content', e.target.value)}
                        placeholder="সাব-হেডিং লিখুন..."
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-sm font-bold text-gray-950 dark:text-white"
                      />
                    </div>
                  )}

                  {block.type === 'paragraph' && (
                    <textarea
                      value={block.content || ''}
                      onChange={(e) => updateBlockField(index, 'content', e.target.value)}
                      placeholder="প্যারাগ্রাফের বিস্তারিত বিবরণ লিখুন..."
                      rows={4}
                      className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-neutral-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  )}

                  {block.type === 'image' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={block.content || block.metadata?.url || ''}
                        onChange={(e) => {
                          updateBlockField(index, 'content', e.target.value);
                          updateBlockMetadata(index, 'url', e.target.value);
                        }}
                        placeholder="ছবির URL পেস্ট করুন..."
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={block.metadata?.caption || ''}
                          onChange={(e) => updateBlockMetadata(index, 'caption', e.target.value)}
                          placeholder="ছবির ক্যাপশন..."
                          className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={block.metadata?.credit || ''}
                          onChange={(e) => updateBlockMetadata(index, 'credit', e.target.value)}
                          placeholder="ফটোগ্রাফার বা ছবির উৎস..."
                          className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'quote' && (
                    <div className="space-y-2">
                      <textarea
                        value={block.content || ''}
                        onChange={(e) => updateBlockField(index, 'content', e.target.value)}
                        placeholder="উক্তিটি লিখুন..."
                        rows={2}
                        className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-sm font-semibold italic"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={block.metadata?.author || ''}
                          onChange={(e) => updateBlockMetadata(index, 'author', e.target.value)}
                          placeholder="বক্তার নাম..."
                          className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={block.metadata?.designation || ''}
                          onChange={(e) => updateBlockMetadata(index, 'designation', e.target.value)}
                          placeholder="বক্তার পদবি বা পরিচয়..."
                          className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.content || ''}
                        onChange={(e) => updateBlockField(index, 'content', e.target.value)}
                        placeholder="ইউটিউব ভিডিও লিঙ্ক (https://www.youtube.com/watch?v=...)"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={block.metadata?.caption || ''}
                        onChange={(e) => updateBlockMetadata(index, 'caption', e.target.value)}
                        placeholder="ভিডিও ক্যাপশন..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                      />
                    </div>
                  )}

                  {block.type === 'factbox' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.metadata?.title || ''}
                        onChange={(e) => updateBlockMetadata(index, 'title', e.target.value)}
                        placeholder="ফ্যাক্ট বক্সের শিরোনাম (যেমন: প্রধান শর্তসমূহ)"
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold"
                      />
                      <textarea
                        value={block.content || ''}
                        onChange={(e) => updateBlockField(index, 'content', e.target.value)}
                        placeholder="ফ্যাক্ট বক্সের তথ্য লিখুন..."
                        rows={2}
                        className="w-full p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs leading-relaxed"
                      />
                    </div>
                  )}

                  {block.type === 'ad' && (
                    <div className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg">
                      <Megaphone className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">ইন-আর্টিকেল বিজ্ঞাপন স্লট</p>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">এই পজিশনে ফার্স্ট-পার্টি বিজ্ঞাপন প্রদর্শিত হবে।</p>
                      </div>
                      <select
                        value={block.metadata?.placement || 'article-inline-1'}
                        onChange={(e) => updateBlockMetadata(index, 'placement', e.target.value)}
                        className="ml-auto px-2 py-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-700 rounded text-xs font-bold"
                      >
                        <option value="article-inline-1">স্লট ১ (Inline 1)</option>
                        <option value="article-inline-2">স্লট ২ (Inline 2)</option>
                        <option value="article-inline-3">স্লট ৩ (Inline 3)</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Block Palette Buttons */}
          <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
            <p className="text-xs font-bold text-gray-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
              + নতুন কন্টেন্ট ব্লক যুক্ত করুন:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addBlock('paragraph')}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-colors"
              >
                <AlignLeft className="h-3.5 w-3.5 text-blue-500" />
                <span>প্যারাগ্রাফ</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock('heading')}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Heading className="h-3.5 w-3.5 text-emerald-500" />
                <span>সাব-হেডিং</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock('image')}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
                <span>ছবি</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock('quote')}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Quote className="h-3.5 w-3.5 text-amber-500" />
                <span>উক্তি / কোট</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock('video')}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Video className="h-3.5 w-3.5 text-red-500" />
                <span>ভিডিও</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock('factbox')}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5 text-teal-500" />
                <span>ফ্যাক্ট বক্স</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock('ad')}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/50 transition-colors"
              >
                <Megaphone className="h-3.5 w-3.5 text-red-600" />
                <span>বিজ্ঞাপন স্লট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Live Preview Mode */}
      {activeTab === 'preview' && (
        <div className="p-6 bg-white dark:bg-[#0c0c0c]">
          <div className="p-4 bg-gray-50 dark:bg-[#181818] rounded-xl border border-gray-200 dark:border-neutral-800 mb-6 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 dark:text-neutral-300">প্রিভিউ মোড: পাঠকরা যেভাবে সংবাদটি দেখতে পাবেন</span>
            <span className="text-red-600 font-extrabold uppercase">Dainik Darpan Reader Preview</span>
          </div>
          <BlockArticleRenderer blocks={localBlocks} />
        </div>
      )}

      {/* Mode 3: Version History Mode */}
      {activeTab === 'history' && (
        <div className="p-6 space-y-4">
          <h4 className="text-sm font-black text-gray-950 dark:text-white">সংরক্ষিত সংস্করণ ও পরিবর্তন তালিকা</h4>
          <div className="space-y-2">
            {revisions.map((rev) => (
              <div 
                key={rev.version}
                className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#151515] flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-black text-red-600 dark:text-red-400 block">সংস্করণ #{rev.version}</span>
                  <p className="text-xs text-gray-700 dark:text-neutral-300 font-bold mt-0.5">{rev.title}</p>
                  <span className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1 block">
                    সংরক্ষণ করেছেন: {rev.savedBy || 'সম্পাদক'} | {new Date(rev.savedAt).toLocaleString('bn-BD')}
                  </span>
                </div>
                {onRestoreRevision && (
                  <button
                    type="button"
                    onClick={() => onRestoreRevision(rev.version)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>পুনরুদ্ধার করুন</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockArticleEditor;
