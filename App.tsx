
import React, { useState } from 'react';
import { AppTab } from './types';
import VectorTool from './components/VectorTool';
import PromptTool from './components/PromptTool';
import TrendsTool from './components/TrendsTool';

const Logo = ({ className = "h-8" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {/* Stylized 'b' Icon */}
    <svg viewBox="0 0 100 100" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5C10 5 5 10 5 20V80C5 90 10 95 20 95H80C90 95 95 90 95 80V50C95 30 80 5 50 5H20Z" fill="#1E3A8A" />
      <path d="M35 25V75H55C65 75 75 65 75 55C75 45 65 35 55 35H45V25H35Z" fill="white" />
      <rect x="42" y="45" width="15" height="15" fill="black" />
    </svg>
    {/* Text Part */}
    <div className="flex flex-col leading-none">
      <span className="text-xl font-black tracking-tighter text-black font-sans">BOLDBRUSH</span>
      <span className="text-lg font-medium text-blue-600 italic -mt-1 ml-auto" style={{ fontFamily: 'cursive' }}>Creations</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.VECTOR_TOOL);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                BoldStock AI
              </h1>
            </div>
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab(AppTab.VECTOR_TOOL)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === AppTab.VECTOR_TOOL
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Vector Metadata
              </button>
              <button
                onClick={() => setActiveTab(AppTab.PROMPT_TOOL)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === AppTab.PROMPT_TOOL
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Prompt Extractor
              </button>
              <button
                onClick={() => setActiveTab(AppTab.TRENDS_TOOL)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === AppTab.TRENDS_TOOL
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Trends & Ideas
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === AppTab.VECTOR_TOOL ? (
            <VectorTool />
          ) : activeTab === AppTab.PROMPT_TOOL ? (
            <PromptTool />
          ) : (
            <TrendsTool />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <Logo className="h-10" />
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">
              &copy; {new Date().getFullYear()} BoldStock AI. All rights reserved.
            </p>
            <p className="text-slate-300 text-xs mt-1">
              Developed by <span className="text-slate-500 font-semibold">Wahab Muhammad</span> & the <span className="text-slate-500 font-semibold">BoldBrush Team</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="h-px w-8 bg-slate-200" />
            <div className="h-px w-8 bg-slate-200" />
            <div className="h-px w-8 bg-slate-200" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
