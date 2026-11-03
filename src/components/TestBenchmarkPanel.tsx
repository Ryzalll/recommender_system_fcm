import React from 'react';
import { Star, Check, Calendar, Info } from 'lucide-react';
import { TestItem, MovieItem, ModelType } from '../types/recsys';

interface TestBenchmarkPanelProps {
  testItems: TestItem[];
  movieDatabase: Record<number, MovieItem>;
  userId: number;
  currentModel: ModelType;
  n: number;
  highlightMatches: boolean;
  hoveredMovieId: number | null;
  onHoverMovie: (movieId: number | null) => void;
  onSelectMovie: (movie: MovieItem) => void;
}

export const TestBenchmarkPanel: React.FC<TestBenchmarkPanelProps> = ({
  testItems,
  movieDatabase,
  userId,
  currentModel,
  n,
  highlightMatches,
  hoveredMovieId,
  onHoverMovie,
  onSelectMovie,
}) => {
  // Compute observed average actual rating
  const avgActual =
    testItems.length > 0
      ? (testItems.reduce((acc, curr) => acc + curr.actualRating, 0) / testItems.length).toFixed(2)
      : '0.00';

  return (
    <section className="flex flex-col bg-[#131b2e] border border-[#334155] rounded-xl overflow-hidden shadow-sm">
      {/* Section Header */}
      <div className="bg-[#171f33] px-4 py-3 border-b border-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base sm:text-lg text-[#dae2fd]">
              Actual Test Data (Held-out)
            </span>
            <span className="px-2 py-0.5 rounded bg-[#222a3d] border border-[#f59e0b]/40 text-[#ffc174] font-mono-num text-[11px] font-semibold">
              {testItems.length} Items
            </span>
          </div>
          <p className="text-xs text-[#87929a] font-normal">
            User_ID_{userId} Verified Ground-Truth Ratings (Unseen during Training)
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#060e20] border border-[#3e484f] px-2.5 py-1 rounded">
          <span className="font-mono-num text-[11px] text-[#87929a]">Observed Avg:</span>
          <span className="font-mono-num text-xs font-bold text-[#ffc174]">{avgActual} / 5.0</span>
        </div>
      </div>

      {/* Item Rows List */}
      <div className="flex flex-col p-2 space-y-1 overflow-y-auto max-h-[640px]">
        {testItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#87929a] space-y-2">
            <Info className="w-6 h-6 mx-auto text-[#87929a]" />
            <p>No held-out test items match the current genre filter.</p>
          </div>
        ) : (
          testItems.map((item, index) => {
            const movie = movieDatabase[item.movieId] || {
              id: item.movieId,
              title: `Movie ID #${item.movieId}`,
              year: 1997,
              genres: ['Unknown'],
            };

            const isHovered = hoveredMovieId === item.movieId;
            const isInTopN = item.modelRank !== null && item.modelRank <= n;
            const delta = item.actualRating - item.predictedRating;
            const isExactMatch = Math.abs(delta) < 0.05;

            return (
              <article
                key={item.movieId}
                onMouseEnter={() => onHoverMovie(item.movieId)}
                onMouseLeave={() => onHoverMovie(null)}
                onClick={() => onSelectMovie(movie)}
                className={`p-2.5 rounded transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                  isHovered
                    ? 'bg-[#222a3d] border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : highlightMatches && isInTopN
                    ? 'bg-[#171f33] border-[#38bdf8]/40 hover:bg-[#222a3d]'
                    : 'bg-[#171f33] border-transparent hover:bg-[#222a3d] hover:border-[#334155]'
                }`}
              >
                {/* Left: #T-nn + Movie Details */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="font-mono-num text-xs px-2 py-1 rounded bg-[#222a3d] text-[#ffc174] font-bold border border-[#f59e0b]/20 shrink-0">
                    #T-{String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-[#dae2fd] hover:text-[#38bdf8] transition-colors truncate">
                        {movie.title}
                      </span>

                      {/* Model Predicted Rank Badge */}
                      {item.modelRank !== null && (
                        <span
                          className={`font-mono-num text-[11px] px-2 py-0.5 rounded ${
                            item.modelRank <= 10
                              ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 font-semibold'
                              : item.modelRank <= 20
                              ? 'bg-[#bdc2ff]/15 text-[#bdc2ff] border border-[#bdc2ff]/30'
                              : 'bg-[#222a3d] text-[#87929a]'
                          }`}
                        >
                          Model Pred: Rank #{item.modelRank}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono-num text-[11px] text-[#87929a] flex-wrap">
                      <span>{movie.genres.join(' • ')}</span>
                      {movie.director && (
                        <>
                          <span>•</span>
                          <span>{movie.director}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actual Rating & Delta vs Predicted */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <div className="flex items-center gap-1 text-[#dae2fd] font-mono-num text-sm font-semibold">
                    <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                    <span>{item.actualRating.toFixed(1)}</span>
                    <span className="text-[11px] text-[#87929a] font-normal">/ 5.0</span>
                  </div>

                  {isExactMatch ? (
                    <span className="font-mono-num text-[11px] text-[#ffc174] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#f59e0b]" />
                      <span>Exact Match ({item.actualRating.toFixed(1)})</span>
                    </span>
                  ) : (
                    <span
                      className={`font-mono-num text-[11px] ${
                        delta > 0 ? 'text-[#38bdf8]' : 'text-[#87929a]'
                      }`}
                    >
                      {delta > 0 ? `Δ +${delta.toFixed(1)}` : `Δ ${delta.toFixed(1)}`} vs Pred (
                      {item.predictedRating.toFixed(1)})
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
