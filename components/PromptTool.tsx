
import React, { useState, useCallback } from 'react';
import { FileItem } from '../types';
import { fileToDataPart, generateImagePrompt } from '../services/gemini';
import { downloadFile } from '../utils/fileHelpers';

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

const PromptTool: React.FC = () => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending' as const
    }));
    setItems(prev => [...prev, ...newFiles]);
  };

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      const newFiles = files.map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const
      }));
      setItems(prev => [...prev, ...newFiles]);
    }
  }, []);

  const processFile = async (item: FileItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing', error: undefined } : i));
    
    try {
      const dataPart = await fileToDataPart(item.file);
      const prompt = await generateImagePrompt(dataPart);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'completed', prompt } : i));
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

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8" onPaste={onPaste}>
      <div className="bg-violet-600 rounded-2xl p-8 text-white shadow-xl shadow-violet-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold mb-2">Image to Prompt Extractor</h2>
          <p className="text-violet-100">Upload or paste images to reverse-engineer prompts using Gemini 3.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="bg-white text-violet-600 px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-violet-50 transition-colors shadow-sm inline-flex items-center gap-2 text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Add Images
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          {items.length > 0 && (
            <button 
              onClick={processAll}
              disabled={isProcessing}
              className="bg-violet-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-800 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              {isProcessing ? 'Analyzing...' : 'Extract Prompts'}
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
          Paste or upload images to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[480px]">
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative group p-2">
                <img src={item.previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 bg-black/40 text-white p-1.5 rounded-full hover:bg-black/60 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="flex-1 p-5 flex flex-col relative overflow-hidden">
                {item.status === 'pending' && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <button onClick={() => processFile(item)} className="bg-violet-50 text-violet-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-100 transition-colors">Generate Prompt</button>
                  </div>
                )}

                {item.status === 'processing' && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-600 border-b-transparent mb-4"></div>
                    <p className="text-slate-500 text-xs">Analyzing...</p>
                  </div>
                )}

                {item.status === 'completed' && item.prompt && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Extracted Prompt</label>
                      <button 
                        onClick={() => copyToClipboard(item.prompt || '')}
                        className="text-slate-300 hover:text-violet-600 transition-colors p-1"
                        title="Copy Prompt"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                    <textarea 
                      className="flex-1 w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-700 leading-relaxed focus:outline-none focus:ring-1 focus:ring-violet-200 resize-none font-mono"
                      value={item.prompt}
                      readOnly
                    />
                    <button 
                      onClick={() => copyToClipboard(item.prompt || '')}
                      className="mt-4 w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptTool;