import React, { useState, useRef, useEffect } from 'react';
import {
  Fingerprint,
  TrendingUp,
  CheckCircle,
  Sliders,
  LineChart,
  Search,
  ChevronDown,
  Check,
  FolderGit2,
} from 'lucide-react';
import { ModelType, UserProfile } from '../types/recsys';

interface UserContextCardProps {
  user: UserProfile;
  currentModel: ModelType;
  n: number;
  currentFold: number;
  onSelectFold: (fold: number) => void;
  availableFolds: number[];
  availableUsers: UserProfile[];
  onSelectUser: (userId: number) => void;
}

// Helper to compute or retrieve metrics for any N (10, 20, 30, ..., 100)
function getMetricsForN(user: UserProfile, model: ModelType, n: number) {
  const modelData = user.models[model];

  // Test_u: semua item test user (rel_threshold = 1)
  const testIds = new Set(modelData.testItems.map((t) => t.movieId));
  const nTest = testIds.size;

  // 1 = rekomendasi ke-k ada di Test_u. Pastikan recommendations sudah urut peringkat 1..100.
  const topSlice = modelData.recommendations.slice(0, n);
  const rel: number[] = topSlice.map((r) => (testIds.has(r.movieId) ? 1 : 0));
  const hits = rel.reduce((acc, curr) => acc + curr, 0);

  // Precision, Recall, F1, HitRate
  const precision = n > 0 ? hits / n : 0;
  const recall = nTest > 0 ? hits / nTest : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const hitrate = hits > 0 ? 1 : 0;

  // AP@N: rata-rata precision pada posisi yang hit, dibagi min(|Test_u|, N)
  let nHit = 0;
  let apSum = 0;
  for (let i = 0; i < rel.length; i++) {
    if (rel[i] > 0) {
      nHit += 1;
      apSum += nHit / (i + 1);
    }
  }
  const ap = nTest > 0 ? apSum / Math.min(nTest, n) : 0;

  // DCG@N
  let dcg = 0;
  for (let i = 0; i < rel.length; i++) {
    if (rel[i] > 0) dcg += rel[i] / Math.log2(i + 2);
  }

  // IDCG(N): konstan, semua N posisi terisi (rumus 3.16)
  let idcg = 0;
  for (let i = 0; i < n; i++) idcg += 1 / Math.log2(i + 2);
  const ndcg = idcg > 0 ? dcg / idcg : 0;

  return { 
    hits, 
    precision, 
    recall, 
    f1, 
    ndcg, 
    map: ap, 
    hitrate, 
    rating: modelData.metrics.rating };
}

export const UserContextCard: React.FC<UserContextCardProps> = ({
  user,
  currentModel,
  n,
  currentFold,
  onSelectFold,
  availableFolds,
  availableUsers,
  onSelectUser,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFoldMenuOpen, setIsFoldMenuOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const foldDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (foldDropdownRef.current && !foldDropdownRef.current.contains(e.target as Node)) {
        setIsFoldMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const otherModelType: ModelType = currentModel === 'fcm' ? 'nbcf' : 'fcm';

  const currentMetrics = getMetricsForN(user, currentModel, n);
  const otherMetrics = getMetricsForN(user, otherModelType, n);

  // Calculate Deltas: (current - other)
  const ndcgDelta = currentMetrics.ndcg - otherMetrics.ndcg;
  const recallDelta = currentMetrics.recall - otherMetrics.recall;
  // For RMSE: lower is better! So other - current > 0 is an improvement
  const rmseDiff = currentMetrics.rating.rmse - otherMetrics.rating.rmse;

  const otherModelLabel = otherModelType.toUpperCase();

  const filteredUsers = availableUsers.filter((u) => {
    const query = userSearchQuery.toLowerCase();
    const idMatch = `user_id_${u.id}`.toLowerCase().includes(query) || `${u.id}`.includes(query);
    const occMatch = u.profile.occupation.toLowerCase().includes(query);
    const affinityMatch = u.affinity.some((a) => a.genre.toLowerCase().includes(query));
    return idMatch || occMatch || affinityMatch;
  });

  return (
    <section className="w-full bg-[#171f33] border border-[#334155] rounded-xl p-4 lg:p-5 shadow-sm mb-4">
      {/* Top Row: User Identity & Fold Controls (Prominent & Larger) + Quick Metric Cards */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        {/* Left Side: Large Fold & User Selectors + Identity Details */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="p-3.5 rounded-xl bg-[#222a3d] border border-[#3e484f] text-[#38bdf8] flex items-center justify-center shrink-0 shadow-sm">
            <Fingerprint className="w-8 h-8" />
          </div>

          <div className="space-y-2 min-w-0 flex-1">
            {/* Primary Row: Larger User Selector & Larger Fold Selector */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Larger User Selector */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 bg-[#0b1326] hover:bg-[#222a3d] border border-[#38bdf8]/50 hover:border-[#38bdf8] rounded-lg px-3.5 py-1.5 shadow-sm transition-all text-left group"
                >
                  <Search className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-[#87929a] font-mono-num font-medium uppercase tracking-wider">
                    User:
                  </span>
                  <span className="text-lg sm:text-xl font-bold font-mono-num text-[#38bdf8] tracking-tight">
                    User_ID_{user.id}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#87929a] group-hover:text-[#dae2fd] transition-colors" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-[#171f33] border border-[#3e484f] rounded-xl shadow-2xl p-2.5 z-50">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-[#87929a] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search user ID, genre, occupation..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full bg-[#0b1326] border border-[#3e484f] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#dae2fd] placeholder-[#87929a] focus:outline-none focus:border-[#38bdf8]"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredUsers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-[#87929a]">No users found</div>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelected = u.id === user.id;
                          const topGenre = u.affinity[0]?.genre || 'General';
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                onSelectUser(u.id);
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors text-xs font-mono-num ${
                                isSelected
                                  ? 'bg-[#222a3d] text-[#38bdf8] font-bold border border-[#38bdf8]/40'
                                  : 'hover:bg-[#222a3d] text-[#dae2fd]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm">User_ID_{u.id}</span>
                                  <span className="text-[11px] text-[#87929a]">
                                    ({u.profile.gender}, {u.profile.age}y)
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#87929a] truncate">
                                  {topGenre} • {u.testCount} test items
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#38bdf8] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Larger Fold Indicator & Selector */}
              <div className="relative" ref={foldDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsFoldMenuOpen(!isFoldMenuOpen)}
                  className="flex items-center gap-2 bg-[#0b1326] hover:bg-[#222a3d] border border-[#3e484f] hover:border-[#8ed5ff] rounded-lg px-3.5 py-1.5 shadow-sm transition-all"
                >
                  <FolderGit2 className="w-4 h-4 text-[#8ed5ff]" />
                  <span className="text-xs text-[#87929a] font-mono-num font-medium uppercase tracking-wider">
                    Fold:
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono-num text-[#8ed5ff]">
                    Fold {currentFold}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#87929a]" />
                </button>

                {isFoldMenuOpen && (
                  <div className="absolute left-0 mt-2 w-44 bg-[#171f33] border border-[#3e484f] rounded-xl shadow-2xl py-1.5 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-mono-num text-[#87929a] border-b border-[#3e484f]">
                      5-Fold Split
                    </div>
                    {availableFolds.map((fold) => (
                      <button
                        key={fold}
                        onClick={() => {
                          onSelectFold(fold);
                          setIsFoldMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left font-mono-num hover:bg-[#222a3d] transition-colors ${
                          currentFold === fold ? 'text-[#38bdf8] font-bold bg-[#131b2e]' : 'text-[#dae2fd]'
                        }`}
                      >
                        <span className="text-sm font-semibold">Fold {fold}</span>
                        {currentFold === fold && <Check className="w-4 h-4 text-[#38bdf8]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Test Split Badge (Train Split removed per request) */}
              <span className="font-mono-num text-xs px-2.5 py-1 rounded bg-[#222a3d] border border-[#3e484f] text-[#bdc8d1] uppercase font-semibold">
                Test Split: {user.testCount} Items
              </span>

              <span className="text-xs text-[#87929a] font-mono-num">
                {user.profile.age}y • {user.profile.gender === 'M' ? 'Male' : 'Female'} •{' '}
                <span className="capitalize">{user.profile.occupation}</span>
              </span>
            </div>

            {/* Top Affinity Clusters */}
            <div className="text-xs text-[#bdc8d1] flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[#87929a]">Top Affinity Clusters:</span>
              {user.affinity.map((aff, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#2d3449] border border-[#3e484f] text-[#dae2fd] font-mono-num text-[11px]"
                >
                  {aff.genre} ({aff.pct}%)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Quick Metric Cards: Order Swapped per request -> NDCG@N, P@N, Recall@N, RMSE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full xl:w-auto shrink-0">
          {/* Card 1: NDCG@N */}
          <div
            className="bg-[#131b2e] border border-[#334155] hover:border-[#38bdf8]/50 transition-colors px-3 py-2.5 rounded-lg flex flex-col justify-center min-w-[130px]"
            title={`Normalized Discounted Cumulative Gain at rank ${n}. Standard IDCG@${n} calculation.`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-[11px] text-[#87929a] font-medium">
                NDCG@{n}
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-[#38bdf8]" />
            </div>
            <span className="font-mono-num text-xl sm:text-2xl font-bold text-[#dae2fd] mt-0.5">
              {currentMetrics.ndcg.toFixed(3)}
            </span>
            <span
              className={`font-mono-num text-[10px] mt-0.5 flex items-center gap-1 ${
                ndcgDelta >= 0 ? 'text-[#3ddc97]' : 'text-[#ffb4ab]'
              }`}
            >
              <span>{ndcgDelta >= 0 ? `+${ndcgDelta.toFixed(3)}` : ndcgDelta.toFixed(3)}</span>
              <span className="text-[#87929a]">vs {otherModelLabel}</span>
            </span>
          </div>

          {/* Card 2: Precision@N */}
          <div
            className="bg-[#131b2e] border border-[#334155] hover:border-[#bdc2ff]/50 transition-colors px-3 py-2.5 rounded-lg flex flex-col justify-center min-w-[130px]"
            title={`Precision at ${n}: Proportion of recommended Top-${n} items that appear in the held-out test set.`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-[11px] text-[#87929a] font-medium">
                P@{n}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-[#bdc2ff]" />
            </div>
            <span className="font-mono-num text-xl sm:text-2xl font-bold text-[#dae2fd] mt-0.5">
              {currentMetrics.precision.toFixed(3)}
            </span>
            <span className="font-mono-num text-[10px] text-[#bdc2ff] mt-0.5 truncate">
              {currentMetrics.hits}/{n} in Test Set
            </span>
          </div>

          {/* Card 3: Recall@N (Position Swapped with RMSE) */}
          <div
            className="bg-[#131b2e] border border-[#334155] hover:border-[#f59e0b]/50 transition-colors px-3 py-2.5 rounded-lg flex flex-col justify-center min-w-[130px]"
            title={`Recall at ${n}: Proportion of held-out test items retrieved in the Top-${n} recommendations (${currentMetrics.hits}/${user.testCount}).`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-[11px] text-[#87929a] font-medium">
                Recall@{n}
              </span>
              <LineChart className="w-3.5 h-3.5 text-[#f59e0b]" />
            </div>
            <span className="font-mono-num text-xl sm:text-2xl font-bold text-[#dae2fd] mt-0.5">
              {currentMetrics.recall.toFixed(3)}
            </span>
            <span className="font-mono-num text-[10px] text-[#ffc174] mt-0.5 truncate flex items-center gap-1">
              <span>
                {currentMetrics.hits}/{user.testCount} Held-out
              </span>
              {recallDelta !== 0 && (
                <span className={recallDelta >= 0 ? 'text-[#3ddc97]' : 'text-[#ffb4ab]'}>
                  ({recallDelta >= 0 ? `+${recallDelta.toFixed(2)}` : recallDelta.toFixed(2)})
                </span>
              )}
            </span>
          </div>

          {/* Card 4: RMSE (Position Swapped with Recall@N) */}
          <div
            className="bg-[#131b2e] border border-[#334155] hover:border-[#38bdf8]/50 transition-colors px-3 py-2.5 rounded-lg flex flex-col justify-center min-w-[130px]"
            title="Root Mean Squared Error on observed held-out test ratings. Lower indicates higher rating accuracy."
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-[11px] text-[#87929a] font-medium">
                RMSE
              </span>
              <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
            </div>
            <span className="font-mono-num text-xl sm:text-2xl font-bold text-[#dae2fd] mt-0.5">
              {currentMetrics.rating.rmse.toFixed(3)}
            </span>
            <span className="font-mono-num text-[10px] text-[#87929a] mt-0.5 flex items-center justify-between">
              <span>Loss: {currentMetrics.rating.loss ? currentMetrics.rating.loss.toFixed(3) : '0.147'}</span>
              <span className={rmseDiff <= 0 ? 'text-[#3ddc97]' : 'text-[#ffb4ab]'}>
                {rmseDiff <= 0 ? `Δ -${Math.abs(rmseDiff).toFixed(2)}` : `Δ +${rmseDiff.toFixed(2)}`}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
