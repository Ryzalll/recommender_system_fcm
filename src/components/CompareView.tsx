import React, { useState } from 'react';
import { GitCompare, Copy, Check, TrendingUp, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GLOBAL_EVAL_DATA } from '../data/evalSummary';

export const CompareView: React.FC = () => {
  const [copiedFormat, setCopiedFormat] = useState<'markdown' | 'csv' | null>(null);

  const fcmAvg = GLOBAL_EVAL_DATA.fcm.avg;
  const nbcfAvg = GLOBAL_EVAL_DATA.nbcf.avg;

  // Comparison metrics rows
  const comparisonMetrics = [
    {
      metric: 'NDCG@10',
      description: 'Normalized Discounted Cumulative Gain (Ranking Quality)',
      fcm: fcmAvg.topn['10'].ndcg,
      nbcf: nbcfAvg.topn['10'].ndcg,
      higherIsBetter: true,
      format: (val: number) => val.toFixed(4),
    },
    {
      metric: 'Precision@10 (P@10)',
      description: 'Ratio of relevant hits in Top-10 recommendations',
      fcm: fcmAvg.topn['10'].precision,
      nbcf: nbcfAvg.topn['10'].precision,
      higherIsBetter: true,
      format: (val: number) => `${(val * 100).toFixed(2)}%`,
    },
    {
      metric: 'Recall@10',
      description: 'Proportion of held-out test items retrieved in Top-10',
      fcm: fcmAvg.topn['10'].recall,
      nbcf: nbcfAvg.topn['10'].recall,
      higherIsBetter: true,
      format: (val: number) => `${(val * 100).toFixed(2)}%`,
    },
    {
      metric: 'F1-Score@10',
      description: 'Harmonic mean of Precision@10 and Recall@10',
      fcm: fcmAvg.topn['10'].f1,
      nbcf: nbcfAvg.topn['10'].f1,
      higherIsBetter: true,
      format: (val: number) => val.toFixed(4),
    },
    {
      metric: 'NDCG@20',
      description: 'Normalized Discounted Cumulative Gain at Top-20',
      fcm: fcmAvg.topn['20'].ndcg,
      nbcf: nbcfAvg.topn['20'].ndcg,
      higherIsBetter: true,
      format: (val: number) => val.toFixed(4),
    },
    {
      metric: 'Precision@20 (P@20)',
      description: 'Ratio of relevant hits in Top-20 recommendations',
      fcm: fcmAvg.topn['20'].precision,
      nbcf: nbcfAvg.topn['20'].precision,
      higherIsBetter: true,
      format: (val: number) => `${(val * 100).toFixed(2)}%`,
    },
    {
      metric: 'Recall@20',
      description: 'Proportion of held-out test items retrieved in Top-20',
      fcm: fcmAvg.topn['20'].recall,
      nbcf: nbcfAvg.topn['20'].recall,
      higherIsBetter: true,
      format: (val: number) => `${(val * 100).toFixed(2)}%`,
    },
    {
      metric: 'RMSE (Root Mean Square Error)',
      description: 'Rating prediction error on held-out test items (Lower is better)',
      fcm: fcmAvg.rating.rmse,
      nbcf: nbcfAvg.rating.rmse,
      higherIsBetter: false,
      format: (val: number) => val.toFixed(4),
    },
    {
      metric: 'MAE (Mean Absolute Error)',
      description: 'Mean absolute difference between predicted and actual ratings',
      fcm: fcmAvg.rating.mae,
      nbcf: nbcfAvg.rating.mae,
      higherIsBetter: false,
      format: (val: number) => val.toFixed(4),
    },
  ];

  const handleCopyMarkdown = () => {
    let md = '| Metric | FCM (Hybrid cu2 ci11) | NBCF (Baseline) | Relative Δ | Winner |\n';
    md += '|---|---|---|---|---|\n';
    comparisonMetrics.forEach((m) => {
      const isFcmWinner = m.higherIsBetter ? m.fcm > m.nbcf : m.fcm < m.nbcf;
      const relDiff = ((m.fcm - m.nbcf) / m.nbcf) * 100;
      const diffStr = relDiff > 0 ? `+${relDiff.toFixed(2)}%` : `${relDiff.toFixed(2)}%`;
      const winner = isFcmWinner ? 'FCM' : 'NBCF';
      md += `| ${m.metric} | ${m.format(m.fcm)} | ${m.format(m.nbcf)} | ${diffStr} | ${winner} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedFormat('markdown');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleCopyCSV = () => {
    let csv = 'Metric,FCM Hybrid,NBCF Baseline,Relative Delta,Winner\n';
    comparisonMetrics.forEach((m) => {
      const isFcmWinner = m.higherIsBetter ? m.fcm > m.nbcf : m.fcm < m.nbcf;
      const relDiff = ((m.fcm - m.nbcf) / m.nbcf) * 100;
      const diffStr = relDiff > 0 ? `+${relDiff.toFixed(2)}%` : `${relDiff.toFixed(2)}%`;
      const winner = isFcmWinner ? 'FCM' : 'NBCF';
      csv += `"${m.metric}","${m.format(m.fcm)}","${m.format(m.nbcf)}","${diffStr}","${winner}"\n`;
    });

    navigator.clipboard.writeText(csv);
    setCopiedFormat('csv');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#171f33] border border-[#334155] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#dae2fd]">
              FCM Hybrid vs NBCF Benchmark Comparison
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono-num font-semibold bg-[#222a3d] text-[#3ddc97] border border-[#3ddc97]/30 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> FCM Outperforms
            </span>
          </div>
          <p className="text-xs text-[#87929a] mt-1">
            Comparative analysis of Fuzzy C-Means (argmax, cu=2, ci=11, pred_hybrid) vs Naive Bayes Collaborative Filtering across 5 folds.
          </p>
        </div>

        {/* Copy Actions for Report/Paper */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#131b2e] hover:bg-[#222a3d] border border-[#3e484f] text-xs font-mono-num text-[#dae2fd] transition-colors"
          >
            {copiedFormat === 'markdown' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#3ddc97]" />
                <span className="text-[#3ddc97]">Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#87929a]" />
                <span>Copy as Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#00354a] text-xs font-mono-num font-semibold transition-colors"
          >
            {copiedFormat === 'csv' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied CSV!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy as CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Head-to-Head Table */}
      <div className="bg-[#131b2e] border border-[#334155] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead className="bg-[#0b1326] text-[#87929a] border-b border-[#334155]">
              <tr>
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-3 text-right">FCM (Hybrid)</th>
                <th className="py-3 px-3 text-right">NBCF (Baseline)</th>
                <th className="py-3 px-3 text-right">Absolute Δ</th>
                <th className="py-3 px-3 text-right">Relative Δ</th>
                <th className="py-3 px-4 text-center">Benchmark Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a40]">
              {comparisonMetrics.map((m, idx) => {
                const isFcmWinner = m.higherIsBetter ? m.fcm > m.nbcf : m.fcm < m.nbcf;
                const absDelta = m.fcm - m.nbcf;
                const relDelta = ((m.fcm - m.nbcf) / m.nbcf) * 100;

                return (
                  <tr key={idx} className="hover:bg-[#171f33] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-sm text-[#dae2fd]">{m.metric}</div>
                      <div className="text-[11px] text-[#87929a] font-normal">{m.description}</div>
                    </td>

                    {/* FCM Value */}
                    <td
                      className={`py-3 px-3 text-right font-bold text-sm ${
                        isFcmWinner ? 'text-[#38bdf8]' : 'text-[#dae2fd]'
                      }`}
                    >
                      {m.format(m.fcm)}
                    </td>

                    {/* NBCF Value */}
                    <td
                      className={`py-3 px-3 text-right font-bold text-sm ${
                        !isFcmWinner ? 'text-[#bdc2ff]' : 'text-[#87929a]'
                      }`}
                    >
                      {m.format(m.nbcf)}
                    </td>

                    {/* Absolute Delta */}
                    <td className="py-3 px-3 text-right text-xs">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          (m.higherIsBetter && absDelta > 0) || (!m.higherIsBetter && absDelta < 0)
                            ? 'text-[#3ddc97]'
                            : 'text-[#ffb4ab]'
                        }`}
                      >
                        {absDelta > 0 ? `+${absDelta.toFixed(4)}` : absDelta.toFixed(4)}
                      </span>
                    </td>

                    {/* Relative Delta */}
                    <td className="py-3 px-3 text-right text-xs">
                      <span
                        className={`inline-flex items-center gap-0.5 font-bold ${
                          (m.higherIsBetter && relDelta > 0) || (!m.higherIsBetter && relDelta < 0)
                            ? 'text-[#3ddc97]'
                            : 'text-[#ffb4ab]'
                        }`}
                      >
                        {relDelta > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {relDelta > 0 ? `+${relDelta.toFixed(2)}%` : `${relDelta.toFixed(2)}%`}
                      </span>
                    </td>

                    {/* Winner Badge */}
                    <td className="py-3 px-4 text-center">
                      {isFcmWinner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] font-bold text-[11px]">
                          FCM Hybrid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#bdc2ff]/15 border border-[#bdc2ff]/30 text-[#bdc2ff] font-bold text-[11px]">
                          NBCF
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Bar Comparison Component */}
      <div className="bg-[#131b2e] border border-[#334155] rounded-xl p-5">
        <h3 className="font-semibold text-sm text-[#dae2fd] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
          Visual Frontier Comparison (Normalized Relative Performance)
        </h3>

        <div className="space-y-4">
          {[
            { label: 'NDCG@10', fcm: fcmAvg.topn['10'].ndcg, nbcf: nbcfAvg.topn['10'].ndcg, max: 0.15 },
            { label: 'Precision@10', fcm: fcmAvg.topn['10'].precision, nbcf: nbcfAvg.topn['10'].precision, max: 0.15 },
            { label: 'Recall@10', fcm: fcmAvg.topn['10'].recall, nbcf: nbcfAvg.topn['10'].recall, max: 0.04 },
            { label: 'RMSE Accuracy (Inverted: Higher is Better)', fcm: 2.0 - fcmAvg.rating.rmse, nbcf: 2.0 - nbcfAvg.rating.rmse, max: 1.0 },
          ].map((bar, i) => {
            const fcmPct = Math.min(100, (bar.fcm / bar.max) * 100);
            const nbcfPct = Math.min(100, (bar.nbcf / bar.max) * 100);

            return (
              <div key={i} className="space-y-1.5 font-mono-num text-xs">
                <div className="flex justify-between text-[#bdc8d1]">
                  <span>{bar.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#38bdf8] font-bold">FCM: {bar.fcm.toFixed(4)}</span>
                    <span className="text-[#87929a]">|</span>
                    <span className="text-[#bdc2ff]">NBCF: {bar.nbcf.toFixed(4)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* FCM Bar */}
                  <div className="h-3 w-full bg-[#060e20] rounded overflow-hidden flex items-center">
                    <div
                      className="h-full bg-[#38bdf8] rounded transition-all duration-500"
                      style={{ width: `${fcmPct}%` }}
                    />
                  </div>
                  {/* NBCF Bar */}
                  <div className="h-2 w-full bg-[#060e20] rounded overflow-hidden flex items-center">
                    <div
                      className="h-full bg-[#bdc2ff] rounded transition-all duration-500"
                      style={{ width: `${nbcfPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
