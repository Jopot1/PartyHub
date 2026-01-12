
import { ExchangeRates, CacheData } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * We switch to ExchangeRate-API's open endpoint because Frankfurter API
 * does not support XPF (Franc Pacifique) which was requested.
 */
const API_BASE = 'https://open.er-api.com/v6/latest';

export const fetchLatestRates = async (base: string): Promise<ExchangeRates> => {
  try {
    const response = await fetch(`${API_BASE}/${base}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des taux');
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'API Error');
    }

    // Map to our internal ExchangeRates interface
    const mappedData: ExchangeRates = {
      amount: 1,
      base: data.base_code,
      date: new Date(data.time_last_update_unix * 1000).toISOString().split('T')[0],
      rates: data.rates
    };
    
    // Cache the data locally for offline use
    const cache: Record<string, CacheData> = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_RATES) || '{}');
    cache[base] = {
      rates: mappedData,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.LAST_RATES, JSON.stringify(cache));
    
    return mappedData;
  } catch (error) {
    console.error('Fetch error, trying cache...', error);
    // Try to recover from cache if the network fails or currency is unsupported
    const cache: Record<string, CacheData> = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_RATES) || '{}');
    if (cache[base]) {
      return cache[base].rates;
    }
    throw error;
  }
};

export const getCachedRates = (base: string): ExchangeRates | null => {
  const cache: Record<string, CacheData> = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_RATES) || '{}');
  return cache[base]?.rates || null;
};
