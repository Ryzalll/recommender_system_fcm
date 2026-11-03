import React from 'react';
import { Layers, CheckCircle, Award, Database, FileSpreadsheet } from 'lucide-react';
import { GLOBAL_EVAL_DATA } from '../data/evalSummary';
import { ModelType } from '../types/recsys';

interface ModelOverviewViewProps {
  currentModel: ModelType;
}

export const ModelOverviewView: React.FC<ModelOverviewViewProps> = () => {
  const evalData = GLOBAL_EVAL_DATA.fcm;

  const folds = ['1', '2', '3', '4', '5', 'avg'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#171f33] border border-[#334155] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#dae2fd]">
              Global Model Evaluation Summary
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono-num font-semibold bg-[#222a3d] text-[#38bdf8] border border-[#38bdf8]/30">
              5-Fold Cross Validation
            </span>
          </div>
          <p className="text-xs text-[#87929a] mt-1">
            Aggregated metrics computed across 100,000 ratings (20,000 held-out ratings per fold).
            IDCG baseline: IDCG@10 = 4.5434, IDCG@20 = 7.0386.
          </p>
        </div>

        {/* Model Badge */}
        <div className="flex items-center">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#060e20] border border-[#38bdf8]/40 text-xs font-mono-num font-bold text-[#38bdf8]">
            FCM (Hybrid cu2 ci11)
          </div>
        </div>
      </div>

      {/* 5-Fold Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131b2e] border border-[#334155] p-4 rounded-xl">
          <span className="text-xs font-mono-num text-[#87929a] block mb-1">
            5-FOLD MEAN RMSE (RATING ACCURACY)
          </span>
          <span className="text-2xl font-bold font-mono-num text-[#38bdf8]">
            {evalData.avg.rating.rmse.toFixed(4)}
          </span>
          <p className="text-[11px] text-[#87929a] mt-1">
            MAE: {evalData.avg.rating.mae.toFixed(4)} • Pooled across 100,000 pairs
          </p>
        </div>

        <div className="bg-[#131b2e] border border-[#334155] p-4 rounded-xl">
          <span className="text-xs font-mono-num text-[#87929a] block mb-1">
            5-FOLD MEAN NDCG@10 (RANKING QUALITY)
          </span>
          <span className="text-2xl font-bold font-mono-num text-[#dae2fd]">
            {evalData.avg.topn['10'].ndcg.toFixed(4)}
          </span>
          <p className="text-[11px] text-[#87929a] mt-1">
            DCG@10: {evalData.avg.topn['10'].dcg.toFixed(4)} • IDCG: 4.5434
          </p>
        </div>

        <div className="bg-[#131b2e] border border-[#334155] p-4 rounded-xl">
          <span className="text-xs font-mono-num text-[#87929a] block mb-1">
            5-FOLD MEAN PRECISION@10 (TOP HIT RATE)
          </span>
          <span className="text-2xl font-bold font-mono-num text-[#ffc174]">
            {(evalData.avg.topn['10'].precision * 100).toFixed(2)}%
          </span>
          <p className="text-[11px] text-[#87929a] mt-1">
            Recall@10: {(evalData.avg.topn['10'].recall * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Table 1: Top-N Ranking Evaluation Metrics */}
      <div className="bg-[#131b2e] border border-[#334155] rounded-xl overflow-hidden">
        <div className="bg-[#171f33] px-4 py-3 border-b border-[#334155] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#dae2fd] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#38bdf8]" />
            Top-N Ranking Evaluation (N = 10 & N = 20)
          </h3>
          <span className="font-mono-num text-xs text-[#87929a]">
            FCM (Hybrid) Model
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead className="bg-[#0b1326] text-[#87929a] border-b border-[#334155]">
              <tr>
                <th className="py-2.5 px-4">Fold Split</th>
                <th className="py-2.5 px-3 text-right">P@10</th>
                <th className="py-2.5 px-3 text-right">Recall@10</th>
                <th className="py-2.5 px-3 text-right">F1@10</th>
                <th className="py-2.5 px-3 text-right">NDCG@10</th>
                <th className="py-2.5 px-3 text-right">P@20</th>
                <th className="py-2.5 px-3 text-right">Recall@20</th>
                <th className="py-2.5 px-3 text-right">NDCG@20</th>
                <th className="py-2.5 px-4 text-right">n_eval (Users)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a40]">
              {folds.map((f) => {
                const isAvg = f === 'avg';
                const row = evalData[f].topn;
                return (
                  <tr
                    key={f}
                    className={`hover:bg-[#171f33] transition-colors ${
                      isAvg ? 'bg-[#171f33]/80 font-bold text-[#38bdf8]' : 'text-[#dae2fd]'
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      {isAvg ? (
                        <span className="px-2 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] font-bold">
                          5-Fold Mean
                        </span>
                      ) : (
                        `Fold ${f}`
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">{row['10'].precision.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right">{row['10'].recall.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right">{row['10'].f1.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#8ed5ff]">
                      {row['10'].ndcg.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-right">{row['20'].precision.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right">{row['20'].recall.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#8ed5ff]">
                      {row['20'].ndcg.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#87929a]">
                      {isAvg ? '458.8' : row['10'].nEval}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Rating Error Metrics (MAE, MSE, RMSE) */}
      <div className="bg-[#131b2e] border border-[#334155] rounded-xl overflow-hidden">
        <div className="bg-[#171f33] px-4 py-3 border-b border-[#334155] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#dae2fd] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#ffc174]" />
            Rating Error Metrics (Held-out Test Prediction)
          </h3>
          <span className="font-mono-num text-xs text-[#87929a]">20,000 Test Pairs / Fold</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead className="bg-[#0b1326] text-[#87929a] border-b border-[#334155]">
              <tr>
                <th className="py-2.5 px-4">Fold Split</th>
                <th className="py-2.5 px-3 text-right">MAE</th>
                <th className="py-2.5 px-3 text-right">MSE</th>
                <th className="py-2.5 px-3 text-right">RMSE (Primary)</th>
                <th className="py-2.5 px-4 text-right">Pairs Evaluated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a40]">
              {folds.map((f) => {
                const isAvg = f === 'avg';
                const row = evalData[f].rating;
                return (
                  <tr
                    key={f}
                    className={`hover:bg-[#171f33] transition-colors ${
                      isAvg ? 'bg-[#171f33]/80 font-bold text-[#ffc174]' : 'text-[#dae2fd]'
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      {isAvg ? (
                        <span className="px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#ffc174] font-bold">
                          5-Fold Mean
                        </span>
                      ) : (
                        `Fold ${f}`
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">{row.mae.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right">{row.mse.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#38bdf8]">
                      {row.rmse.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#87929a]">
                      {row.nEval.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
