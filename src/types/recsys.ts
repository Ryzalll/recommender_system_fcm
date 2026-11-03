/**
 * RecEval Precision - Movie Recommendation System Types
 * Based on PRD v1.0 Final (MovieLens 100K evaluation)
 */

export type ModelType = 'fcm' | 'nbcf';

export interface MovieItem {
  id: number;
  title: string;
  year: number;
  genres: string[];
  imdbUrl?: string;
  director?: string;
  avgRating?: number;
}

export interface Recommendation {
  rank: number;
  movieId: number;
  predictedRating: number;
  score?: number; // Latent score (0.000 - 1.000)
  hit: boolean;
  actualRating: number | null;
}

export interface TestItem {
  movieId: number;
  actualRating: number; // 1 | 2 | 3 | 4 | 5
  predictedRating: number;
  modelRank: number | null; // Rank in Top-100 or null if outside
  timestamp: number;
}

export interface TopNMetrics {
  hits: number;
  precision: number;
  recall: number;
  f1: number;
  dcg: number;
  ndcg: number;
}

export interface RatingMetrics {
  rmse: number;
  mae: number;
  loss?: number;
  mse?: number;
}

export interface ModelUserData {
  recommendations: Recommendation[];
  testItems: TestItem[];
  metrics: {
    '10': TopNMetrics;
    '20': TopNMetrics;
    rating: RatingMetrics;
  };
}

export interface UserProfile {
  id: number;
  profile: {
    age: number;
    gender: 'M' | 'F' | string;
    occupation: string;
    zip?: string;
  };
  trainCount: number;
  testCount: number;
  affinity: { genre: string; pct: number }[];
  models: {
    fcm: ModelUserData;
    nbcf: ModelUserData;
  };
}

export interface FoldData {
  fold: number;
  users: UserProfile[];
}

export interface EvalFoldMetrics {
  rating: {
    mae: number;
    mse: number;
    rmse: number;
    nEval: number;
  };
  topn: {
    '10': {
      precision: number;
      recall: number;
      f1: number;
      dcg: number;
      ndcg: number;
      nEval: number;
    };
    '20': {
      precision: number;
      recall: number;
      f1: number;
      dcg: number;
      ndcg: number;
      nEval: number;
    };
  };
}

export interface EvalGlobalData {
  fcm: {
    [fold: string]: EvalFoldMetrics; // '1'..'5', 'avg'
  };
  nbcf: {
    [fold: string]: EvalFoldMetrics; // '1'..'5', 'avg'
  };
}

export const MOVIELENS_19_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  "Children's",
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Film-Noir',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Western',
  'Unknown',
] as const;

export type MovieGenre = typeof MOVIELENS_19_GENRES[number];
