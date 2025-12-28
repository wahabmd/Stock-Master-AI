import React, { useState } from 'react';
import { FileItem } from '../types';
import { fileToDataPart, generateVectorMetadata } from '../services/gemini';
import { downloadFile, generateAdobeStockCSV, generateStockZip } from '../utils/fileHelpers';

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

const VectorTool: React.FC = () => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: file.type.includes('svg') ? URL.createObjectURL(file) : '',
      status: 'pending' as const
    }));
    setItems(prev => [...prev, ...newFiles]);
  };

  const processFile = async (item: FileItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing', error: undefined } : i));
    
    try {
      const dataPart = await fileToDataPart(item.file);
      const metadata = await generateVectorMetadata(dataPart);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'completed', metadata } : i));
    } catch (err: any) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: err.message } : i));
    }
  };

  const processAll = async () => {
    setIsProcessing(true);
    const pending = items.filter(i => i.status === 'pending' || i.status === 'error');
    for (const item of pending) {
      await processFile(item);
    }
    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFullExport = async () => {
    const completed = items.filter(i => i.status === 'completed');
    if (completed.length === 0) {
      alert("No completed items to export!");
      return;
    }
    setIsZipping(true);
    setZipProgress(0);
    try {
      await generateStockZip(items, (p) => setZipProgress(Math.round(p)));
    } catch (err) {
      console.error(err);
      alert("Failed to create zip package.");
    } finally {
      setIsZipping(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = generateAdobeStockCSV(items);
    downloadFile(csvContent, 'adobe_stock_metadata.csv', 'text/csv');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold mb-2">Vector Metadata Generator</h2>
          <p className="text-indigo-100">AI-powered generation of Adobe Stock titles and tags. Now exports valid .eps structures.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-indigo-50 transition-colors shadow-sm inline-flex items-center gap-2 text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Files
            <input type="file" multiple accept=".svg,.eps" className="hidden" onChange={handleFileChange} />
          </label>
          {items.length > 0 && (
            <button 
              onClick={processAll}
              disabled={isProcessing || isZipping}
              className="bg-indigo-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-800 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              {isProcessing ? 'Analyzing...' : 'Analyze All'}
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-inner">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <p className="text-slate-500 font-medium">Ready to process your vectors.</p>
          <p className="text-slate-400 text-sm mt-1">Upload SVG or EPS files to begin.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <h3 className="text-lg font-bold text-slate-700">Queue ({items.length})</h3>
             <div className="flex flex-wrap gap-2">
               <button 
                 onClick={handleFullExport} 
                 disabled={isZipping || isProcessing || !items.some(i => i.status === 'completed')}
                 className="text-sm font-bold text-white px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 flex items-center gap-2"
               >
                 {isZipping ? `Zipping (${zipProgress}%)` : 'Export Full ZIP'}
               </button>
               <button onClick={handleExportCSV} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-4 py-2 bg-indigo-50 rounded-xl">
                 CSV Only
               </button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md h-[580px]">
                {/* Preview Header */}
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center p-4 relative group shrink-0">
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-slate-400 text-xs font-bold text-center">
                      {item.file.name.split('.').pop()?.toUpperCase()}
                    </div>
                  )}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 left-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm border border-slate-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-md text-[10px] font-bold text-slate-500 border border-slate-200 shadow-sm">
                    {item.file.name.split('.').pop()?.toUpperCase()}
                  </div>
                </div>
                
                {/* Metadata Body */}
                <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                  {item.status === 'pending' && (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                      <p className="text-sm font-medium text-slate-600 truncate w-full">{item.file.name}</p>
                      <button onClick={() => processFile(item)} className="w-full text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">Analyze Now</button>
                    </div>
                  )}

                  {item.status === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-b-transparent mb-4"></div>
                      <p className="text-sm text-slate-500 font-medium">Gemini is analyzing your vector...</p>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-red-500 p-4">
                      <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-sm font-bold mb-4">Analysis failed</p>
                      <button onClick={() => processFile(item)} className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors">Try Again</button>
                    </div>
                  )}

                  {item.status === 'completed' && item.metadata && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Title */}
                      <div className="group relative">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Stock Title</label>
                            <button 
                              onClick={() => copyToClipboard(item.metadata?.title || '')}
                              className="text-slate-300 hover:text-indigo-600 transition-colors p-1"
                              title="Copy Title"
                            >
                              <CopyIcon />
                            </button>
                          </div>
                          <span className={`text-[10px] font-bold ${item.metadata.title.length > 70 ? 'text-red-500' : 'text-slate-400'}`}>
                            {item.metadata.title.length}/70
                          </span>
                        </div>
                        <input 
                          type="text" 
                          className="w-full text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-100 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 transition-all"
                          value={item.metadata.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, metadata: { ...i.metadata!, title: newTitle } } : i));
                          }}
                        />
                      </div>

                      {/* Description */}
                      <div className="group relative">
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Description</label>
                          <button 
                            onClick={() => copyToClipboard(item.metadata?.description || '')}
                            className="text-slate-300 hover:text-indigo-600 transition-colors p-1"
                            title="Copy Description"
                          >
                            <CopyIcon />
                          </button>
                        </div>
                        <textarea 
                          rows={3}
                          className="w-full text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-100 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 transition-all resize-none leading-relaxed"
                          value={item.metadata.description}
                          onChange={(e) => {
                            const newDesc = e.target.value;
                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, metadata: { ...i.metadata!, description: newDesc } } : i));
                          }}
                        />
                      </div>
                      
                      {/* Keywords */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Keywords ({item.metadata.tags.length})</label>
                            <button 
                              onClick={() => copyToClipboard(item.metadata?.tags.join(', ') || '')}
                              className="text-slate-300 hover:text-indigo-600 transition-colors p-1"
                              title="Copy Keywords"
                            >
                              <CopyIcon />
                            </button>
                          </div>
                          <button 
                            className="text-[10px] text-indigo-600 font-bold hover:underline"
                            onClick={() => {
                               const tagStr = prompt("Add tags (comma separated):");
                               if (tagStr) {
                                 const newTags = tagStr.split(',').map(t => t.trim()).filter(t => t);
                                 setItems(prev => prev.map(i => i.id === item.id ? { ...i, metadata: { ...i.metadata!, tags: [...i.metadata!.tags, ...newTags] } } : i));
                               }
                            }}
                          >+ Add Tags</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                          {item.metadata.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded border border-indigo-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default VectorTool;