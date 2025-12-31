
import React, { useState, useEffect } from 'react';
import { TrendingCategory } from '../types';
import { getTrendingKeywords } from '../services/gemini';
import { downloadFile } from '../utils/fileHelpers';

const TrendsTool: React.FC = () => {
  const [trends, setTrends] = useState<TrendingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrendingKeywords();
      setTrends(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trends');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleExport = () => {
    if (trends.length === 0) return;
    
    let content = "BOLDSTOCK AI - TRENDING KEYWORDS & INSPIRATION\n";
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += "=".repeat(40) + "\n\n";
    
    trends.forEach(item => {
      content += `CATEGORY: ${item.category.toUpperCase()}\n`;
      content += `WHY IT'S TRENDING: ${item.description}\n`;
      content += `TARGET KEYWORDS: ${item.keywords.join(', ')}\n`;
      content += "-".repeat(40) + "\n\n";
    });

    downloadFile(content, `stock_trends_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-xl shadow-emerald-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold mb-2">Trends & Inspiration</h2>
          <p className="text-emerald-100">AI-curated niches and high-performing keywords for your next stock vector project.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchTrends}
            disabled={isLoading}
            className="bg-emerald-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Analyzing Market...' : 'Refresh Trends'}
          </button>
          <button 
            onClick={handleExport}
            disabled={trends.length === 0 || isLoading}
            className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
          >
            Export as TXT
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-6 w-2/3 bg-slate-100 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
              <div className="flex flex-wrap gap-2 mt-4">
                {[1, 2, 3, 4].map(j => <div key={j} className="h-6 w-16 bg-slate-100 rounded-full" />)}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button onClick={fetchTrends} className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-100">Try Again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="mb-4">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 inline-block">Trending Niche</span>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{item.category}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed flex-1 italic">
                {item.description}
              </p>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-3">Hot Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw, kidx) => (
                    <span 
                      key={kidx} 
                      className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-medium rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors cursor-default"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendsTool;
