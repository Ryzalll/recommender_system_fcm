import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { UserContextCard } from './components/UserContextCard';
import { Toolbar } from './components/Toolbar';
import { RecommendationPanel } from './components/RecommendationPanel';
import { TestBenchmarkPanel } from './components/TestBenchmarkPanel';
import { ModelOverviewView } from './components/ModelOverviewView';
import { CompareView } from './components/CompareView';
import { MovieDetailModal } from './components/MovieDetailModal';
import { ALL_FOLDS_DATA } from './data/usersData';
import { MOVIE_DATABASE } from './data/items';
import { ModelType, MovieItem } from './types/recsys';

export default function App() {
  // Global View States
  const [currentFold, setCurrentFold] = useState<number>(1);
  const [currentUserId, setCurrentUserId] = useState<number>(45); // Hero mockup user
  const [currentModel, setCurrentModel] = useState<ModelType>('fcm');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'compare'>('dashboard');

  // Toolbar & Filter States (n: 10, 20, 30, ..., 100)
  const [n, setN] = useState<number>(10);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isMatchHighlightActive, setIsMatchHighlightActive] = useState<boolean>(true);

  // Interaction States
  const [hoveredMovieId, setHoveredMovieId] = useState<number | null>(null);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<MovieItem | null>(null);

  // Available folds & users in current fold
  const availableFolds = [1, 2, 3, 4, 5];
  const currentFoldData = ALL_FOLDS_DATA[currentFold] || ALL_FOLDS_DATA[1];
  const availableUsers = currentFoldData.users;

  // Find currently active user, or fallback to first user in fold
  const currentUser = useMemo(() => {
    const found = availableUsers.find((u) => u.id === currentUserId);
    return found || availableUsers[0];
  }, [availableUsers, currentUserId]);

  const currentModelUserData = currentUser.models[currentModel];

  // Toggle genre in filter list
  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleClearGenres = () => {
    setSelectedGenres([]);
  };

  // Filter & Sort Left Panel: Recommendations (Fixed to "by Predicted Score" per user request)
  const processedRecommendations = useMemo(() => {
    let list = currentModelUserData.recommendations.slice(0, n);

    // Filter by genres if any selected
    if (selectedGenres.length > 0) {
      list = list.filter((item) => {
        const movie = MOVIE_DATABASE[item.movieId];
        if (!movie) return false;
        return selectedGenres.some((g) => movie.genres.includes(g));
      });
    }

    // Fixed sort: By Predicted Score (descending)
    return [...list].sort((a, b) => {
      const scoreA = a.score ?? a.predictedRating;
      const scoreB = b.score ?? b.predictedRating;
      return scoreB - scoreA || a.rank - b.rank || a.movieId - b.movieId;
    });
  }, [currentModelUserData.recommendations, n, selectedGenres]);

  // Filter & Sort Right Panel: Actual Test Items (Fixed by Model Predicted Rank / Score)
  const processedTestItems = useMemo(() => {
    let list = [...currentModelUserData.testItems];

    // Filter by genres if any selected
    if (selectedGenres.length > 0) {
      list = list.filter((item) => {
        const movie = MOVIE_DATABASE[item.movieId];
        if (!movie) return false;
        return selectedGenres.some((g) => movie.genres.includes(g));
      });
    }

    // Fixed sort: Items predicted in Top-N first, then by prediction rating descending
    return [...list].sort((a, b) => {
      const rankA = a.modelRank ?? 999;
      const rankB = b.modelRank ?? 999;
      if (rankA !== rankB) return rankA - rankB;
      return b.predictedRating - a.predictedRating || a.movieId - b.movieId;
    });
  }, [currentModelUserData.testItems, selectedGenres]);

  // Dynamic Hit Count for arbitrary N
  const currentHitCount = useMemo(() => {
    const testIds = new Set(currentModelUserData.testItems.map((t) => t.movieId));
    const topSlice = currentModelUserData.recommendations.slice(0, n);
    return topSlice.filter((item) => testIds.has(item.movieId)).length;
  }, [currentModelUserData, n]);

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans">
      {/* Sticky Header with Model Selector & Navigation Tabs */}
      <Header
        currentModel={currentModel}
        onSelectModel={(m) => setCurrentModel(m)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="w-full flex-1 max-w-[1600px] mx-auto px-4 lg:px-6 py-5">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col w-full">
            {/* User Metric & Context Header Banner (Features large User & Fold selectors) */}
            <UserContextCard
              user={currentUser}
              currentModel={currentModel}
              n={n}
              currentFold={currentFold}
              onSelectFold={(f) => setCurrentFold(f)}
              availableFolds={availableFolds}
              availableUsers={availableUsers}
              onSelectUser={(id) => setCurrentUserId(id)}
            />

            {/* Filter & Control Toolbar (Fixed Sort to Predicted Score, Top-N 10..100) */}
            <Toolbar
              selectedGenres={selectedGenres}
              onToggleGenre={handleToggleGenre}
              onClearGenres={handleClearGenres}
              n={n}
              onChangeN={(newN) => setN(newN)}
              isMatchHighlightActive={isMatchHighlightActive}
              onToggleMatchHighlight={() => setIsMatchHighlightActive(!isMatchHighlightActive)}
              hitCount={currentHitCount}
            />

            {/* 50/50 Main Split View: Recommendations vs Actual Test Data */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
              {/* Left Panel: Model Recommendations */}
              <RecommendationPanel
                recommendations={processedRecommendations}
                movieDatabase={MOVIE_DATABASE}
                currentModel={currentModel}
                n={n}
                highlightMatches={isMatchHighlightActive}
                hoveredMovieId={hoveredMovieId}
                onHoverMovie={setHoveredMovieId}
                onSelectMovie={setSelectedMovieForDetail}
              />

              {/* Right Panel: Actual Test Benchmark Data */}
              <TestBenchmarkPanel
                testItems={processedTestItems}
                movieDatabase={MOVIE_DATABASE}
                userId={currentUser.id}
                currentModel={currentModel}
                n={n}
                highlightMatches={isMatchHighlightActive}
                hoveredMovieId={hoveredMovieId}
                onHoverMovie={setHoveredMovieId}
                onSelectMovie={setSelectedMovieForDetail}
              />
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <ModelOverviewView currentModel={currentModel} />
        )}

        {activeTab === 'compare' && (
          <CompareView />
        )}
      </main>

      {/* Movie Details Modal */}
      <MovieDetailModal
        movie={selectedMovieForDetail}
        onClose={() => setSelectedMovieForDetail(null)}
        currentUser={currentUser}
        currentModel={currentModel}
      />

      {/* Academic Citation & GroupLens Dataset Footer */}
      <footer className="mt-auto border-t border-[#334155] bg-[#060e20] px-6 py-4 text-center text-xs font-mono-num text-[#87929a]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Dataset: <strong className="text-[#bdc8d1]">MovieLens 100K</strong> (GroupLens Research, Univ. of Minnesota)
          </span>
          <span>
            Model: <strong className="text-[#38bdf8]">FCM-Hybrid (cu=2, ci=11, pred_hybrid)</strong> vs{' '}
            <strong className="text-[#bdc2ff]">NBCF</strong>
          </span>
          <span className="text-[11px] text-[#87929a]">
            F. Maxwell Harper & Joseph A. Konstan (2015) ACM TiiS DOI: 10.1145/2827872
          </span>
        </div>
      </footer>
    </div>
  );
}
