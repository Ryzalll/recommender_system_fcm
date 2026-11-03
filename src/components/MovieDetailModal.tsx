import React, { useEffect } from 'react';
import { X, ExternalLink, Star, Film, Calendar, User, Tag, CheckCircle2 } from 'lucide-react';
import { MovieItem, UserProfile, ModelType } from '../types/recsys';

interface MovieDetailModalProps {
  movie: MovieItem | null;
  onClose: () => void;
  currentUser: UserProfile;
  currentModel: ModelType;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  currentUser,
  currentModel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const modelData = currentUser.models[currentModel];
  const recItem = modelData.recommendations.find((r) => r.movieId === movie.id);
  const testItem = modelData.testItems.find((t) => t.movieId === movie.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#171f33] border border-[#3e484f] rounded-xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#131b2e] border-b border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#38bdf8]" />
            <span className="font-mono-num text-xs text-[#87929a]">ITEM ID #{movie.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#87929a] hover:text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Title & Year */}
          <div>
            <h2 className="text-xl font-bold text-[#dae2fd]">{movie.title}</h2>
            <div className="flex items-center gap-3 text-xs text-[#87929a] font-mono-num mt-1">
              <span>{movie.year}</span>
              {movie.director && (
                <>
                  <span>•</span>
                  <span>Dir: {movie.director}</span>
                </>
              )}
              <span>•</span>
              <span className="text-[#ffc174] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                {movie.avgRating ? `${movie.avgRating} / 5.0 (Global Avg)` : '4.5 / 5.0'}
              </span>
            </div>
          </div>

          {/* Genres Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded bg-[#222a3d] border border-[#3e484f] text-[#dae2fd] font-mono-num text-xs flex items-center gap-1"
              >
                <Tag className="w-3 h-3 text-[#38bdf8]" />
                <span>{g}</span>
              </span>
            ))}
          </div>

          {/* Evaluation Context for Current User */}
          <div className="bg-[#131b2e] border border-[#334155] rounded-lg p-3.5 space-y-2.5 font-mono-num text-xs">
            <div className="text-[11px] font-semibold text-[#87929a] uppercase border-b border-[#334155] pb-1.5 flex items-center justify-between">
              <span>User_ID_{currentUser.id} Split Status</span>
              <span className="text-[#38bdf8] font-bold">{currentModel.toUpperCase()} Model</span>
            </div>

            {/* In Recommendation list? */}
            <div className="flex items-center justify-between text-[#bdc8d1]">
              <span className="text-[#87929a]">Model Prediction:</span>
              {recItem ? (
                <span className="text-[#38bdf8] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>
                    Rank #{recItem.rank} (Pred: {recItem.predictedRating.toFixed(1)} ★, Score:{' '}
                    {recItem.score ? recItem.score.toFixed(3) : '0.950'})
                  </span>
                </span>
              ) : testItem && testItem.modelRank ? (
                <span className="text-[#8ed5ff]">
                  Rank #{testItem.modelRank} (Pred: {testItem.predictedRating.toFixed(1)} ★)
                </span>
              ) : (
                <span className="text-[#87929a]">Outside Top-20</span>
              )}
            </div>

            {/* In Held-out Test split? */}
            <div className="flex items-center justify-between text-[#bdc8d1]">
              <span className="text-[#87929a]">Held-out Ground Truth:</span>
              {testItem ? (
                <span className="text-[#ffc174] font-semibold flex items-center gap-1">
                  <span>Actual Rating: {testItem.actualRating.toFixed(1)} ★</span>
                </span>
              ) : (
                <span className="text-[#87929a]">Not in Test Split (Train or Unrated)</span>
              )}
            </div>

            {/* Delta evaluation */}
            {testItem && (
              <div className="flex items-center justify-between text-[#bdc8d1] pt-1 border-t border-[#334155]/60">
                <span className="text-[#87929a]">Prediction Error (Δ):</span>
                <span
                  className={
                    Math.abs(testItem.actualRating - testItem.predictedRating) < 0.05
                      ? 'text-[#ffc174] font-bold'
                      : 'text-[#38bdf8]'
                  }
                >
                  {Math.abs(testItem.actualRating - testItem.predictedRating) < 0.05
                    ? 'Exact Match (0.0 error)'
                    : `Δ ${(testItem.actualRating - testItem.predictedRating > 0 ? '+' : '')}${(
                        testItem.actualRating - testItem.predictedRating
                      ).toFixed(1)} vs Pred`}
                </span>
              </div>
            )}
          </div>

          {/* External Links */}
          {movie.imdbUrl && (
            <div className="pt-2">
              <a
                href={movie.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#222a3d] hover:bg-[#2d3449] border border-[#3e484f] text-xs font-mono-num text-[#38bdf8] hover:text-[#8ed5ff] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View on IMDb</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#131b2e] border-t border-[#334155] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#222a3d] hover:bg-[#2d3449] border border-[#3e484f] text-xs font-mono-num text-[#dae2fd] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
