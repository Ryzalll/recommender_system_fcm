import React, { useState } from 'react';
import { Database, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { MOVIE_DATABASE } from '../data/items';
import { GLOBAL_EVAL_DATA } from '../data/evalSummary';
import { USER_45, USER_1, USER_12, USER_25 } from '../data/usersData';

export const DataExportView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'fold1' | 'items' | 'eval'>('fold1');
  const [copied, setCopied] = useState(false);

  const fold1Data = {
    fold: 1,
    users: [USER_45, USER_1, USER_12, USER_25],
  };

  const fileContents: Record<'fold1' | 'items' | 'eval', { name: string; path: string; data: any }> = {
    fold1: {
      name: 'F1.json',
      path: '/public/data/folds/F1.json',
      data: fold1Data,
    },
    items: {
      name: 'items.json',
      path: '/public/data/items.json',
      data: MOVIE_DATABASE,
    },
    eval: {
      name: 'eval.json',
      path: '/public/data/eval.json',
      data: GLOBAL_EVAL_DATA,
    },
  };

  const currentFile = fileContents[activeFile];
  const formattedJson = JSON.stringify(currentFile.data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#171f33] border border-[#334155] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#dae2fd]">
              RecSys Example Datasets & Schema Inspector
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono-num font-semibold bg-[#222a3d] text-[#38bdf8] border border-[#38bdf8]/30">
              PRD v1.0 Contract
            </span>
          </div>
          <p className="text-xs text-[#87929a] mt-1">
            Standardized offline JSON files extracted from MovieLens 100K and parquet outputs (FCM cu2_ci11 pred_hybrid & NBCF).
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#131b2e] hover:bg-[#222a3d] border border-[#3e484f] text-xs font-mono-num text-[#dae2fd] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#3ddc97]" />
                <span className="text-[#3ddc97]">Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#87929a]" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#00354a] text-xs font-mono-num font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {currentFile.name}</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] pb-2">
        <button
          onClick={() => setActiveFile('fold1')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono-num transition-all ${
            activeFile === 'fold1'
              ? 'bg-[#38bdf8] text-[#00354a] font-bold shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dae2fd] hover:bg-[#171f33]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>F1.json (Users, Recs & Test Splits)</span>
        </button>

        <button
          onClick={() => setActiveFile('items')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono-num transition-all ${
            activeFile === 'items'
              ? 'bg-[#38bdf8] text-[#00354a] font-bold shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dae2fd] hover:bg-[#171f33]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>items.json (MovieLens 100K 19-Genres)</span>
        </button>

        <button
          onClick={() => setActiveFile('eval')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono-num transition-all ${
            activeFile === 'eval'
              ? 'bg-[#38bdf8] text-[#00354a] font-bold shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dae2fd] hover:bg-[#171f33]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>eval.json (Global 5-Fold Benchmarks)</span>
        </button>
      </div>

      {/* Schema Description Card */}
      <div className="bg-[#131b2e] border border-[#334155] rounded-lg p-3 text-xs font-mono-num text-[#bdc8d1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>
            Current File: <code className="text-[#38bdf8] font-bold">{currentFile.path}</code>
          </span>
        </div>
        <span className="text-[#87929a]">
          {activeFile === 'fold1'
            ? 'Contains user profiles, recommendations, test splits, and model comparisons'
            : activeFile === 'items'
            ? 'Contains 30+ canonical items mapped to official MovieLens 19 genres'
            : 'Contains pooled ratings and topn ranking metrics across all 5 folds'}
        </span>
      </div>

      {/* Code / JSON Viewer */}
      <div className="bg-[#060e20] border border-[#334155] rounded-xl p-4 overflow-hidden">
        <pre className="font-mono-num text-xs text-[#8ed5ff] overflow-x-auto max-h-[600px] leading-relaxed">
          <code>{formattedJson}</code>
        </pre>
      </div>
    </div>
  );
};
