
import { Currency } from './types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro' },
  { code: 'CAD', name: 'Dollar canadien' },
  { code: 'XPF', name: 'Franc pacifique' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'TRY', name: 'Turkish Lira' }
];

export const STORAGE_KEYS = {
  FAVORITES: 'swiftrate_favorites',
  LAST_RATES: 'swiftrate_last_rates',
  THEME: 'swiftrate_theme'
};
