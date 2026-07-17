import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Upload, Trash2, Search, FileText, Image, Video, CheckCircle } from 'lucide-react';

const MediaLibrary = ({ onSelect, selectedUrl }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, image, video, pdf
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/media');
      if (res.success) {
        setFiles(res.files);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.upload('/media/upload', formData);
      if (res.success) {
        // Refresh list
        await fetchFiles();
      } else {
        setError(res.message || 'Upload failed');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (e, filename) => {
    e.stopPropagation(); // Avoid selecting file when clicking delete
    if (!confirm('Are you sure you want to delete this file from the library?')) return;

    try {
      const res = await api.delete(`/media/${filename}`);
      if (res.success) {
        setFiles(prev => prev.filter(f => f.name !== filename));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filter and search
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (file.originalName && file.originalName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (file) => {
    if (file.type === 'image') return <Image className="h-10 w-10 text-blue-500" />;
    if (file.type === 'video') return <Video className="h-10 w-10 text-emerald-500" />;
    return <FileText className="h-10 w-10 text-purple-500" />;
  };

  const API_HOST = import.meta.env.VITE_API_HOST || '';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 p-6 shadow-sm">
      {/* Upload and Filters Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Upload Button */}
        <div>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900/50">
            <Upload className="h-6 w-6 text-slate-400 mb-1" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {uploading ? 'Uploading...' : 'Upload File'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Images, Videos, PDFs</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={uploading} 
            />
          </label>
          {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
        </div>

        {/* Filter controls */}
        <div className="lg:col-span-2 flex flex-col md:flex-row gap-2 justify-end items-center">
          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Type filters */}
          <div className="flex space-x-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-800">
            {['all', 'image', 'video', 'pdf'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  filterType === type 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 h-28 rounded-xl" />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-slate-350 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No media assets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {filteredFiles.map((file) => {
            const fileFullUrl = `${API_HOST}${file.url}`;
            const isSelected = selectedUrl === file.url || selectedUrl === fileFullUrl;
            
            return (
              <div 
                key={file.name}
                onClick={() => onSelect && onSelect(file.url)}
                className={`relative border rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center bg-slate-50 dark:bg-slate-900/40 hover:border-blue-500 transition-all ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Media Preview */}
                <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                  {file.type === 'image' ? (
                    <img 
                      src={`${API_HOST}${file.url}`} 
                      alt={file.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                  
                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-white rounded-full p-0.5 shadow">
                      <CheckCircle className="h-4.5 w-4.5" />
                    </div>
                  )}

                  {/* Delete button hover overlay */}
                  <button
                    onClick={(e) => handleFileDelete(e, file.name)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Media File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Label */}
                <div className="p-2 w-full text-center border-t border-slate-200/50 dark:border-slate-800/50">
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-350 truncate">
                    {file.originalName || file.name}
                  </p>
                  <span className="text-[8px] text-slate-400 mt-0.5 block">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
