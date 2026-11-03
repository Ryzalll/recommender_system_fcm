import { EvalGlobalData } from '../types/recsys';

export const GLOBAL_EVAL_DATA: EvalGlobalData = {
  fcm: {
    '1': {
      rating: {
        mae: 0.863,
        nEval: 20000,
        mse: 1.58,
        rmse: 1.257
      },
      topn: {
        '10': {
          precision: 0.1015,
          nEval: 459,
          recall: 0.0226,
          f1: 0.0323,
          dcg: 0.4855,
          ndcg: 0.1069
        },
        '20': {
          precision: 0.0976,
          nEval: 459,
          recall: 0.0424,
          f1: 0.0507,
          dcg: 0.7203,
          ndcg: 0.1023
        }
      }
    },
    '2': {
      rating: {
        mae: 0.839,
        nEval: 20000,
        mse: 1.503,
        rmse: 1.226
      },
      topn: {
        '10': {
          precision: 0.0721,
          nEval: 653,
          recall: 0.025,
          f1: 0.0301,
          dcg: 0.355,
          ndcg: 0.0781
        },
        '20': {
          precision: 0.0689,
          nEval: 653,
          recall: 0.0462,
          f1: 0.0448,
          dcg: 0.5185,
          ndcg: 0.0736
        }
      }
    },
    '3': {
      rating: {
        mae: 0.843,
        nEval: 20000,
        mse: 1.511,
        rmse: 1.229
      },
      topn: {
        '10': {
          precision: 0.0571,
          nEval: 869,
          recall: 0.0235,
          f1: 0.028,
          dcg: 0.2713,
          ndcg: 0.0597
        },
        '20': {
          precision: 0.054,
          nEval: 869,
          recall: 0.0478,
          f1: 0.041,
          dcg: 0.399,
          ndcg: 0.0567
        }
      }
    },
    '4': {
      rating: {
        mae: 0.853,
        nEval: 20000,
        mse: 1.513,
        rmse: 1.23
      },
      topn: {
        '10': {
          precision: 0.0532,
          nEval: 923,
          recall: 0.0258,
          f1: 0.0275,
          dcg: 0.2617,
          ndcg: 0.0576
        },
        '20': {
          precision: 0.0514,
          nEval: 923,
          recall: 0.0475,
          f1: 0.0389,
          dcg: 0.3851,
          ndcg: 0.0547
        }
      }
    },
    '5': {
      rating: {
        mae: 0.875,
        nEval: 20000,
        mse: 1.572,
        rmse: 1.254
      },
      topn: {
        '10': {
          precision: 0.0515,
          nEval: 927,
          recall: 0.0243,
          f1: 0.0255,
          dcg: 0.2474,
          ndcg: 0.0545
        },
        '20': {
          precision: 0.0486,
          nEval: 927,
          recall: 0.0444,
          f1: 0.0359,
          dcg: 0.3617,
          ndcg: 0.0514
        }
      }
    },
    'avg': {
      rating: {
        mae: 0.8546,
        mse: 1.5358,
        rmse: 1.2392,
        nEval: 20000
      },
      topn: {
        '10': {
          precision: 0.0671,
          recall: 0.0242,
          f1: 0.0287,
          dcg: 0.3242,
          ndcg: 0.0714,
          nEval: 458.8
        },
        '20': {
          precision: 0.0641,
          recall: 0.0457,
          f1: 0.0423,
          dcg: 0.4769,
          ndcg: 0.0677,
          nEval: 458.8
        }
      }
    }
  },
  'nbcf': {
    '1': {
      rating: {
        mae: 0.929,
        nEval: 20000,
        mse: 1.835,
        rmse: 1.354
      },
      topn: {
        '10': {
          precision: 0.1039,
          nEval: 459,
          recall: 0.0243,
          f1: 0.0335,
          dcg: 0.5122,
          ndcg: 0.1127
        },
        '20': {
          precision: 0.0985,
          nEval: 459,
          recall: 0.0484,
          f1: 0.0528,
          dcg: 0.7443,
          ndcg: 0.1057
        }
      }
    },
    '2': {
      rating: {
        mae: 0.905,
        nEval: 20000,
        mse: 1.744,
        rmse: 1.321
      },
      topn: {
        '10': {
          precision: 0.0698,
          nEval: 653,
          recall: 0.0257,
          f1: 0.0307,
          dcg: 0.3527,
          ndcg: 0.0776
        },
        '20': {
          precision: 0.068,
          nEval: 653,
          recall: 0.0473,
          f1: 0.0456,
          dcg: 0.5173,
          ndcg: 0.0735
        }
      }
    },
    '3': {
      rating: {
        mae: 0.9,
        nEval: 20000,
        mse: 1.728,
        rmse: 1.315
      },
      topn: {
        '10': {
          precision: 0.0587,
          nEval: 869,
          recall: 0.0258,
          f1: 0.0296,
          dcg: 0.2828,
          ndcg: 0.0622
        },
        '20': {
          precision: 0.0529,
          nEval: 869,
          recall: 0.0506,
          f1: 0.0417,
          dcg: 0.401,
          ndcg: 0.057
        }
      }
    },
    '4': {
      rating: {
        mae: 0.897,
        nEval: 20000,
        mse: 1.696,
        rmse: 1.302
      },
      topn: {
        '10': {
          precision: 0.0567,
          nEval: 923,
          recall: 0.0274,
          f1: 0.0295,
          dcg: 0.2778,
          ndcg: 0.0611
        },
        '20': {
          precision: 0.0498,
          nEval: 923,
          recall: 0.0476,
          f1: 0.0386,
          dcg: 0.385,
          ndcg: 0.0547
        }
      }
    },
    '5': {
      rating: {
        mae: 0.926,
        nEval: 20000,
        mse: 1.786,
        rmse: 1.336
      },
      topn: {
        '10': {
          precision: 0.0506,
          nEval: 927,
          recall: 0.0258,
          f1: 0.026,
          dcg: 0.2498,
          ndcg: 0.055
        },
        '20': {
          precision: 0.0466,
          nEval: 927,
          recall: 0.047,
          f1: 0.0354,
          dcg: 0.3564,
          ndcg: 0.0506
        }
      }
    },
    'avg': {
      rating: {
        mae: 0.9114,
        mse: 1.7578,
        rmse: 1.3256,
        nEval: 20000
      },
      topn: {
        '10': {
          precision: 0.0679,
          recall: 0.0258,
          f1: 0.0299,
          dcg: 0.3351,
          ndcg: 0.0737,
          nEval: 458.8
        },
        '20': {
          precision: 0.0632,
          recall: 0.0482,
          f1: 0.0428,
          dcg: 0.4808,
          ndcg: 0.0683,
          nEval: 458.8
        }
      }
    }
  }
};
