
export interface Currency {
  code: string;
  name: string;
}

export interface ExchangeRates {
  amount: number;
  base: string;
  date: string;
  rates: { [key: string]: number };
}

export interface FavoritePair {
  id: string;
  from: string;
  to: string;
}

export interface CacheData {
  rates: ExchangeRates;
  timestamp: number;
}
