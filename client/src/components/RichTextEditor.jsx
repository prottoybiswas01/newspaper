import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, 
  Heading1, Heading2, Heading3, Quote, Link, Image, Code, 
  Table, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Undo, Redo, Minus, Highlighter, Type, Palette 
} from 'lucide-react';

const COLOR_PRESETS = [
  { label: 'ডিফল্ট (Dark)', value: '#1e293b' },
  { label: 'লাল (Red)', value: '#dc2626' },
  { label: 'নীল (Blue)', value: '#2563eb' },
  { label: 'সবুজ (Green)', value: '#16a34a' },
  { label: 'কমলা (Orange)', value: '#ea580c' },
  { label: 'বেগুনী (Purple)', value: '#9333ea' },
  { label: 'ধূসর (Gray)', value: '#64748b' },
  { label: 'সোনালী (Amber)', value: '#d97706' }
];

const HIGHLIGHT_PRESETS = [
  { label: 'হলুদ', value: '#fef08a' },
  { label: 'হালকা সবুজ', value: '#bbf7d0' },
  { label: 'হালকা নীল', value: '#bae6fd' },
  { label: 'হালকা লাল', value: '#fecaca' },
  { label: 'মুছুন', value: 'transparent' }
];

const FONT_SIZES = [
  { label: 'ছোট (13px)', size: '1' },
  { label: 'স্বাভাবিক (15px)', size: '3' },
  { label: 'মাঝারি (18px)', size: '4' },
  { label: 'বড় (24px)', size: '5' },
  { label: 'বিশাল (32px)', size: '6' }
];

const RichTextEditor = ({ value, onChange, minHeight = '300px' }) => {
  const editorRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#1e293b');
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Sync value from parent if it changed from outside
  useEffect(() => {
    if (editorRef.current) {
      const isFocused = document.activeElement === editorRef.current;
      if (!isFocused && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '<p><br></p>';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const execCmd = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  };

  const applyTextColor = (color) => {
    setSelectedColor(color);
    execCmd('foreColor', color);
    setShowColorPicker(false);
  };

  const applyHighlightColor = (color) => {
    execCmd('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  const applyFontSize = (size) => {
    execCmd('fontSize', size);
  };

  const addLink = () => {
    const url = prompt('লিংক ইউআরএল লিখুন (https://...):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const addImage = () => {
    const url = prompt('ছবির সরাসরি লিংক (Image URL) দিন:');
    if (url) {
      execCmd('insertImage', url);
    }
  };

  const addQuote = () => {
    execCmd('formatBlock', '<blockquote>');
  };

  const addHeading = (tag) => {
    execCmd('formatBlock', `<${tag}>`);
  };

  const addCodeBlock = () => {
    execCmd('formatBlock', '<pre>');
  };

  const addHorizontalRule = () => {
    execCmd('insertHorizontalRule');
  };

  const handleInsertTable = () => {
    const rows = Math.max(1, parseInt(tableRows) || 3);
    const cols = Math.max(1, parseInt(tableCols) || 3);

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #cbd5e1;">`;
    tableHtml += `<thead><tr style="background-color: #f8fafc;">`;
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-weight: bold; color: #1e293b;">শিরোনাম ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;

    for (let r = 1; r <= rows; r++) {
      const bg = r % 2 === 0 ? '#f8fafc' : '#ffffff';
      tableHtml += `<tr style="background-color: ${bg};">`;
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 10px 14px; color: #334155;">ডাটা ${r},${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Try insertHTML
    const success = document.execCommand('insertHTML', false, tableHtml);
    if (!success) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = tableHtml;
        const frag = document.createDocumentFragment();
        let node;
        while ((node = el.firstChild)) {
          frag.appendChild(node);
        }
        range.insertNode(frag);
      }
    }
    handleInput();
    setShowTableModal(false);
  };

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 select-none">
        
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => execCmd('undo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="Undo (পূর্বের অবস্থা)"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('redo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="Redo (সামনের অবস্থা)"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Font Size Selector */}
        <div className="relative inline-flex items-center">
          <Type className="h-3.5 w-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          <select
            onChange={(e) => {
              applyFontSize(e.target.value);
              e.target.value = '3';
            }}
            defaultValue="3"
            className="pl-7 pr-2 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:border-slate-300 focus:outline-none cursor-pointer"
            title="ফন্ট সাইজ পরিবর্তন করুন"
          >
            <option value="3" disabled>ফন্ট সাইজ</option>
            {FONT_SIZES.map(fs => (
              <option key={fs.size} value={fs.size}>{fs.label}</option>
            ))}
          </select>
        </div>

        {/* Heading Buttons */}
        <button
          type="button"
          onClick={() => addHeading('h1')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs"
          title="Heading 1 (বড় শিরোনাম)"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => addHeading('h2')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
          title="Heading 2 (মাঝারি শিরোনাম)"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => addHeading('h3')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs"
          title="Heading 3 (উপ-শিরোনাম)"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<p>')}
          className="px-1.5 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs"
          title="সাধারণ প্যারাগ্রাফ (Paragraph)"
        >
          ¶
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Basic Text Formatting */}
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black"
          title="Bold (বোল্ড / মোটা)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 italic"
          title="Italic (ইটালিক / বাঁকা)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 underline"
          title="Underline (নিচে দাগ)"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('strikeThrough')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="Strikethrough (মাঝখানে দাগ)"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Text Color Picker Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 text-slate-700 dark:text-slate-300"
            title="টেক্সটের রঙ (Text Color)"
          >
            <Palette className="h-4 w-4" />
            <span 
              className="w-3 h-3 rounded-full border border-slate-300 shadow-xs" 
              style={{ backgroundColor: selectedColor }}
            />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1.5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 w-52 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">টেক্সটের রঙ নির্বাচন করুন:</div>
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => applyTextColor(c.value)}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">কাস্টম কালার:</span>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="w-8 h-7 cursor-pointer border-0 rounded bg-transparent p-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Background Highlight Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="হাইলাইট কালার (Background Highlight)"
          >
            <Highlighter className="h-4 w-4" />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1.5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 w-48 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">হাইলাইট নির্বাচন করুন:</div>
              <div className="flex flex-wrap gap-2">
                {HIGHLIGHT_PRESETS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => applyHighlightColor(h.value)}
                    className="px-2 py-1 text-xs rounded border border-slate-300 hover:opacity-80 transition-opacity font-medium text-slate-800"
                    style={{ backgroundColor: h.value }}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => execCmd('justifyLeft')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="বামে অ্যালাইন (Align Left)"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyCenter')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="মাঝখানে অ্যালাইন (Align Center)"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyRight')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="ডানে অ্যালাইন (Align Right)"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('justifyFull')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="জাস্টিফাই (Justify)"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="বুলেট লিস্ট (Bullet List)"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="সংখ্যাযুক্ত লিস্ট (Numbered List)"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Insert Table Button */}
        <button
          type="button"
          onClick={() => setShowTableModal(true)}
          className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 border border-blue-200 dark:border-blue-800"
          title="টেবিল যুক্ত করুন (Insert Table)"
        >
          <Table className="h-3.5 w-3.5" />
          <span>টেবিল</span>
        </button>

        {/* Quotes, Dividers, Links, Images */}
        <button
          type="button"
          onClick={addQuote}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="উদ্ধৃতি (Quote)"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addHorizontalRule}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="বিভাজক রেখা (Divider Line)"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addLink}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="লিংক (Link)"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="ছবি (Image URL)"
        >
          <Image className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addCodeBlock}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="কোড ব্লক (Code Block)"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Body */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{ minHeight }}
        className="p-5 max-h-[650px] overflow-y-auto focus:outline-none prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed page-editor-content"
      />

      {/* Table Insertion Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Table className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">টেবিল তৈরি করুন</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  রো (Rows) সংখ্যা:
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  কলাম (Cols) সংখ্যা:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              টেবিলটি সুন্দর বর্ডার ও হেডারসহ ইনসার্ট হবে। ইনসার্টের পর সেলের টেক্সট সরাসরি এডিট করতে পারবেন।
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                ইনসার্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
