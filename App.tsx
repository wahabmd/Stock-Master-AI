
import React, { useState } from 'react';
import { AppTab } from './types';
import VectorTool from './components/VectorTool';
import PromptTool from './components/PromptTool';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.VECTOR_TOOL);

  return (
    <div className="min-h-screen flex flex-col">
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
                StockMaster AI
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
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === AppTab.VECTOR_TOOL ? (
            <VectorTool />
          ) : (
            <PromptTool />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} StockMaster AI. Built for Stock Contributors.</p>
      </footer>
    </div>
  );
};

export default App;
