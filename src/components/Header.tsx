import React from 'react';
import { Network, Layers, BarChart3, GitCompare } from 'lucide-react';
import { ModelType } from '../types/recsys';

interface HeaderProps {
  currentModel: ModelType;
  onSelectModel: (model: ModelType) => void;
  activeTab: 'dashboard' | 'overview' | 'compare';
  onSelectTab: (tab: 'dashboard' | 'overview' | 'compare') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  onSelectModel,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 left-0 right-0 h-16 bg-[#060e20]/95 backdrop-blur-md z-50 px-4 lg:px-6 flex items-center justify-between border-b border-[#3e484f] select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded bg-[#171f33] border border-[#3e484f] text-[#8ed5ff] flex items-center justify-center">
          <Network className="w-5 h-5 text-[#38bdf8]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base sm:text-lg text-[#dae2fd] tracking-tight">
              Movie Recommendation System
            </span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[11px] font-mono-num font-semibold bg-[#222a3d] text-[#8ed5ff] border border-[#3e484f]">
              MovieLens 100K
            </span>
          </div>
          <p className="text-[11px] text-[#87929a] hidden md:block">
            Algorithmic RecSys Benchmark • FCM Hybrid vs NBCF
          </p>
        </div>
      </div>

      {/* Nav Tabs (Data (JSON) removed per request) */}
      <nav className="flex items-center gap-1 bg-[#0b1326] p-1 rounded border border-[#334155]">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-[#38bdf8] text-[#00354a] font-semibold shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dae2fd] hover:bg-[#171f33]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-[#38bdf8] text-[#00354a] font-semibold shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dae2fd] hover:bg-[#171f33]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Model Overview</span>
        </button>

        <button
          onClick={() => onSelectTab('compare')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            activeTab === 'compare'
              ? 'bg-[#38bdf8] text-[#00354a] font-semibold shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dae2fd] hover:bg-[#171f33]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>FCM vs NBCF</span>
        </button>
      </nav>

      {/* Model Toggle: FCM (Hybrid) vs NBCF (Only displayed in Dashboard view) */}
      {activeTab === 'dashboard' && (
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#131b2e] border border-[#3e484f] rounded p-0.5">
            <button
              type="button"
              onClick={() => onSelectModel('fcm')}
              className={`px-3 py-1.5 text-xs font-mono-num rounded transition-colors ${
                currentModel === 'fcm'
                  ? 'bg-[#38bdf8] text-[#00354a] font-bold'
                  : 'text-[#87929a] hover:text-[#dae2fd]'
              }`}
              title="Fuzzy C-Means Hybrid (cu=2, ci=11, mode=argmax, pred_hybrid)"
            >
              FCM (Hybrid)
            </button>
            <button
              type="button"
              onClick={() => onSelectModel('nbcf')}
              className={`px-3 py-1.5 text-xs font-mono-num rounded transition-colors ${
                currentModel === 'nbcf'
                  ? 'bg-[#bdc2ff] text-[#131e8c] font-bold'
                  : 'text-[#87929a] hover:text-[#dae2fd]'
              }`}
              title="Naive Bayes Collaborative Filtering baseline"
            >
              NBCF
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
