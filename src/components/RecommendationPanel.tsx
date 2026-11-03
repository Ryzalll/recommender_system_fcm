import React from 'react';
import { CheckCircle2, Star, Info } from 'lucide-react';
import { Recommendation, MovieItem, ModelType } from '../types/recsys';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  movieDatabase: Record<number, MovieItem>;
  currentModel: ModelType;
  n: number;
  highlightMatches: boolean;
  hoveredMovieId: number | null;
  onHoverMovie: (movieId: number | null) => void;
  onSelectMovie: (movie: MovieItem) => void;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  movieDatabase,
  currentModel,
  n,
  highlightMatches,
  hoveredMovieId,
  onHoverMovie,
  onSelectMovie,
}) => {
  // Compute mean predicted score
  const validScores = recommendations.map((r) => r.predictedRating);
  const meanScore =
    validScores.length > 0
      ? (validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length).toFixed(2)
      : '0.00';

  const modelSubtitle =
    currentModel === 'fcm'
      ? 'FCM Latent Collaborative Filtering (cu=2, ci=11, pred_hybrid)'
      : 'NBCF Naive Bayes Probabilistic Collaborative Filtering (Baseline)';

  return (
    <section className="flex flex-col bg-[#131b2e] border border-[#334155] rounded-xl overflow-hidden shadow-sm">
      {/* Section Header */}
      <div className="bg-[#171f33] px-4 py-3 border-b border-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base sm:text-lg text-[#dae2fd]">
              System Recommendations
            </span>
            <span className="px-2 py-0.5 rounded bg-[#222a3d] border border-[#38bdf8]/40 text-[#38bdf8] font-mono-num text-[11px] font-semibold">
              Top-{n}
            </span>
          </div>
          <p className="text-xs text-[#87929a] font-normal">{modelSubtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#060e20] border border-[#3e484f] px-2.5 py-1 rounded">
          <span className="font-mono-num text-[11px] text-[#87929a]">Mean Score:</span>
          <span className="font-mono-num text-xs font-bold text-[#ffc174]">{meanScore} / 5.0</span>
        </div>
      </div>

      {/* Item Rows List */}
      <div className="flex flex-col p-2 space-y-1 overflow-y-auto max-h-[640px]">
        {recommendations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#87929a] space-y-2">
            <Info className="w-6 h-6 mx-auto text-[#87929a]" />
            <p>No recommendations match the current genre filter.</p>
            <p className="text-[11px] text-[#87929a]">Try selecting "All Genres" in the toolbar.</p>
          </div>
        ) : (
          recommendations.map((item) => {
            const movie = movieDatabase[item.movieId] || {
              id: item.movieId,
              title: `Movie ID #${item.movieId}`,
              year: 1997,
              genres: ['Unknown'],
            };

            const isHovered = hoveredMovieId === item.movieId;
            const isHit = item.hit;
            const showHitHighlight = highlightMatches && isHit;

            return (
              <article
                key={item.movieId}
                onMouseEnter={() => onHoverMovie(item.movieId)}
                onMouseLeave={() => onHoverMovie(null)}
                onClick={() => onSelectMovie(movie)}
                className={`p-2.5 rounded transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                  isHovered
                    ? 'bg-[#222a3d] border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : showHitHighlight
                    ? 'bg-[#171f33] border-[#38bdf8]/40 hover:bg-[#222a3d]'
                    : 'bg-[#171f33] border-transparent hover:bg-[#222a3d] hover:border-[#334155]'
                }`}
              >
                {/* Left: Rank + Movie Info */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`font-mono-num text-xs px-2 py-1 rounded font-bold shrink-0 ${
                      showHitHighlight
                        ? 'bg-[#222a3d] text-[#38bdf8] border border-[#38bdf8]/30'
                        : 'bg-[#222a3d] text-[#87929a]'
                    }`}
                  >
                    #{String(item.rank).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-[#dae2fd] hover:text-[#38bdf8] transition-colors truncate">
                        {movie.title}
                      </span>
                      {movie.year && (
                        <span className="text-[11px] text-[#87929a] font-mono-num">
                          ({movie.year})
                        </span>
                      )}

                      {/* Ground Truth Match Badge (Only displayed for hits, per PRD) */}
                      {isHit && (
                        <span
                          className={`inline-flex items-center gap-1 font-mono-num text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                            showHitHighlight
                              ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 font-medium'
                              : 'bg-[#222a3d] text-[#87929a]'
                          }`}
                          title="Item appears in user's held-out test split"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#38bdf8]" />
                          <span>Ground Truth Match</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono-num text-[11px] text-[#87929a] flex-wrap">
                      <span>{movie.genres.join(' • ')}</span>
                      {movie.director && (
                        <>
                          <span>•</span>
                          <span className="text-[#87929a]">{movie.director}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Predicted Rating (Score removed per user request) */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <div className="flex items-center gap-1 text-[#ffc174] font-mono-num text-sm font-semibold">
                    <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                    <span>{item.predictedRating.toFixed(1)}</span>
                    <span className="text-[11px] text-[#87929a] font-normal">/ 5.0</span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
