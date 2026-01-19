export interface StockInput {
  ticker: string;
  price: number;
  eps: number;
  bvps: number;
  meanPer?: number;
}

export interface CalculationResult {
  grahamNumber: number;
  grahamStatus: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED';
  grahamMos: number;
  histValuation: number | null;
  histStatus: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED' | null;
  histMos: number | null;
}

export interface AnalysisState {
  isLoading: boolean;
  result: CalculationResult | null;
  insight: string | null;
  error: string | null;
}

export interface WatchlistItem extends StockInput {
  lastUpdated: number;
}