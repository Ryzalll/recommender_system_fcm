import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Filter, Check, ChevronDown, ListFilter } from 'lucide-react';
import { MOVIELENS_19_GENRES } from '../types/recsys';

interface ToolbarProps {
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  onClearGenres: () => void;
  n: number;
  onChangeN: (n: number) => void;
  isMatchHighlightActive: boolean;
  onToggleMatchHighlight: () => void;
  hitCount: number;
}

export const TOP_N_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedGenres,
  onToggleGenre,
  onClearGenres,
  n,
  onChangeN,
  isMatchHighlightActive,
  onToggleMatchHighlight,
  hitCount,
}) => {
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isTopNDropdownOpen, setIsTopNDropdownOpen] = useState(false);

  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const topNDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
      if (topNDropdownRef.current && !topNDropdownRef.current.contains(e.target as Node)) {
        setIsTopNDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickGenres = ['Sci-Fi', 'Drama', 'Thriller'];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131b2e] border border-[#334155] rounded-xl p-3 mb-4 select-none">
      {/* Left side: Quick genre pills + Multi-select 19 Genres Dropdown */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* All Genres button */}
        <button
          type="button"
          onClick={onClearGenres}
          className={`px-3 py-1 rounded text-xs font-mono-num font-semibold transition-all ${
            selectedGenres.length === 0
              ? 'bg-[#38bdf8] text-[#00354a]'
              : 'bg-[#222a3d] hover:bg-[#2d3449] text-[#bdc8d1] hover:text-[#dae2fd]'
          }`}
        >
          All Genres
        </button>

        {/* Quick standard pills */}
        {quickGenres.map((g) => {
          const isSelected = selectedGenres.includes(g);
          return (
            <button
              key={g}
              type="button"
              onClick={() => onToggleGenre(g)}
              className={`px-3 py-1 rounded text-xs font-mono-num transition-all ${
                isSelected
                  ? 'bg-[#38bdf8] text-[#00354a] font-semibold'
                  : 'bg-[#222a3d] hover:bg-[#2d3449] text-[#bdc8d1] hover:text-[#dae2fd]'
              }`}
            >
              {g}
            </button>
          );
        })}

        {/* Multi-select Dropdown for all 19 standard MovieLens genres */}
        <div className="relative" ref={genreDropdownRef}>
          <button
            type="button"
            onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono-num border transition-colors ${
              selectedGenres.some((g) => !quickGenres.includes(g)) || selectedGenres.length > 0
                ? 'bg-[#222a3d] text-[#38bdf8] border-[#38bdf8]/40 font-semibold'
                : 'bg-[#171f33] text-[#87929a] hover:text-[#dae2fd] border-[#3e484f]'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>
              {selectedGenres.length > 0
                ? `${selectedGenres.length} Genre${selectedGenres.length > 1 ? 's' : ''}`
                : '19 Genres Filter'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isGenreDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-[#171f33] border border-[#3e484f] rounded-lg shadow-2xl p-2.5 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3e484f]">
                <span className="text-[11px] font-mono-num font-semibold text-[#87929a]">
                  19 MOVIELENS GENRES
                </span>
                {selectedGenres.length > 0 && (
                  <button
                    onClick={onClearGenres}
                    className="text-[10px] font-mono-num text-[#ffb4ab] hover:underline"
                  >
                    Reset all
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {MOVIELENS_19_GENRES.map((genre) => {
                  const checked = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => onToggleGenre(genre)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left font-mono-num transition-colors ${
                        checked
                          ? 'bg-[#222a3d] text-[#38bdf8] font-medium'
                          : 'hover:bg-[#222a3d] text-[#dae2fd]'
                      }`}
                    >
                      <span>{genre}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          checked
                            ? 'bg-[#38bdf8] border-[#38bdf8] text-[#00354a]'
                            : 'border-[#3e484f]'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Top N Selection (10, 20, 30, ..., 100) + Match Highlight */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Top N selection option (10, 20, 30, ..., 100) */}
        <div className="relative" ref={topNDropdownRef}>
          <button
            type="button"
            onClick={() => setIsTopNDropdownOpen(!isTopNDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1 rounded bg-[#060e20] border border-[#3e484f] hover:border-[#38bdf8] font-mono-num text-xs text-[#dae2fd] transition-colors"
          >
            <ListFilter className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-[#87929a]">Cutoff:</span>
            <span className="font-bold text-[#38bdf8]">Top-{n}</span>
            <ChevronDown className="w-3 h-3 text-[#87929a]" />
          </button>

          {isTopNDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-[#171f33] border border-[#3e484f] rounded-lg shadow-2xl p-1 z-50">
              <div className="px-2.5 py-1 text-[11px] font-mono-num text-[#87929a] border-b border-[#3e484f] mb-1">
                SELECT TOP N
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {TOP_N_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      onChangeN(val);
                      setIsTopNDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left font-mono-num transition-colors ${
                      n === val
                        ? 'bg-[#222a3d] text-[#38bdf8] font-bold'
                        : 'text-[#dae2fd] hover:bg-[#222a3d]'
                    }`}
                  >
                    <span>Top-{val}</span>
                    {n === val && <Check className="w-3.5 h-3.5 text-[#38bdf8]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Match Highlight button */}
        <button
          type="button"
          onClick={onToggleMatchHighlight}
          className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono-num text-xs transition-colors border ${
            isMatchHighlightActive
              ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40 hover:bg-[#38bdf8]/25'
              : 'bg-[#222a3d] text-[#87929a] border-[#3e484f] hover:text-[#dae2fd]'
          }`}
          title="Toggle highlight for ground-truth test set matches"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>
            {isMatchHighlightActive ? `Match Highlight: Active (${hitCount} Hits)` : 'Match Highlight: Disabled'}
          </span>
        </button>
      </div>
    </div>
  );
};
