import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Quote, Link, Image, Code } from 'lucide-react';

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  // Sync value from parent if it changed from outside (e.g., translation)
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
    document.execCommand(command, false, val);
    handleInput();
  };

  const addLink = () => {
    const url = prompt('Enter the link URL:');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const addImage = () => {
    const url = prompt('Enter the image URL:');
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

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => addHeading('h2')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Heading 2"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => addHeading('h3')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Heading 3"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
        
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-400"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 italic text-slate-600 dark:text-slate-400"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 underline text-slate-600 dark:text-slate-400"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
        
        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
        
        <button
          type="button"
          onClick={addQuote}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addLink}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Image"
        >
          <Image className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addCodeBlock}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Body */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[300px] max-h-[600px] overflow-y-auto focus:outline-none prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
      />
    </div>
  );
};

export default RichTextEditor;
