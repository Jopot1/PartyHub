import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Star, 
  History, 
  RefreshCw, 
  AlertCircle,
  ChevronRight,
  Trash2,
  Moon,
  Sun
} from 'lucide-react';
import { SUPPORTED_CURRENCIES, STORAGE_KEYS } from './constants';
import { fetchLatestRates } from './services/exchangeRateService';
import { FavoritePair, ExchangeRates } from './types';

const App: React.FC = () => {
  // State
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('CAD'); 
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoritePair[]>([]);
  const [activeTab, setActiveTab] = useState<'converter' | 'favorites'>('converter');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isEditingFavorites, setIsEditingFavorites] = useState<boolean>(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const hasManualPreference = localStorage.getItem(STORAGE_KEYS.THEME) !== null;
      if (!hasManualPreference) setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  const loadRates = useCallback(async (base: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestRates(base);
      setRates(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Connexion impossible. Utilisation des données hors-ligne.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates(fromCurrency);
  }, [fromCurrency, loadRates]);

  const convertedAmount = useMemo(() => {
    if (!rates || !rates.rates[toCurrency]) return '0,00';
    const numAmount = parseFloat(amount.replace(',', '.')) || 0;
    const rate = rates.rates[toCurrency];
    return (numAmount * rate).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [amount, toCurrency, rates]);

  // Calcul de la taille de police dynamique pour le résultat
  const dynamicResultFontSize = useMemo(() => {
    const length = convertedAmount.length + toCurrency.length + 1; // +1 pour l'espace
    if (length <= 10) return '2.6rem';
    if (length <= 13) return '2.2rem';
    if (length <= 16) return '1.8rem';
    if (length <= 20) return '1.5rem';
    return '1.2rem';
  }, [convertedAmount, toCurrency]);

  const swapCurrencies = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
  };

  const toggleFavorite = () => {
    const existing = favorites.find(f => f.from === fromCurrency && f.to === toCurrency);
    let newFavs: FavoritePair[];
    if (existing) {
      newFavs = favorites.filter(f => f.id !== existing.id);
    } else {
      newFavs = [...favorites, { id: Date.now().toString(), from: fromCurrency, to: toCurrency }];
    }
    setFavorites(newFavs);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavs));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  const handleSelectFavorite = useCallback((from: string, to: string) => {
    if (isEditingFavorites) return;
    setFromCurrency(from);
    setToCurrency(to);
    setActiveTab('converter');
  }, [isEditingFavorites]);

  const removeFavorite = (id: string) => {
    const newFavs = favorites.filter(f => f.id !== id);
    setFavorites(newFavs);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavs));
    if (newFavs.length === 0) setIsEditingFavorites(false);
  };

  const isFavorite = favorites.some(f => f.from === fromCurrency && f.to === toCurrency);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remplacer virgule par point pour la logique interne
    let val = e.target.value.replace(',', '.');
    
    // Autoriser uniquement les chiffres et un seul point
    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === '') {
      setAmount(val);
    }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: 'converter' | 'favorites', icon: any, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => {
          setActiveTab(id);
          if (id === 'converter') setIsEditingFavorites(false);
        }}
        className={`flex flex-col items-center justify-center space-y-1 w-full py-2 transition-all duration-300 ${
          isActive ? '' : 'text-slate-400 opacity-60'
        }`}
      >
        <div className={isActive ? 'gradient-text' : ''}>
          <Icon size={24} strokeWidth={isActive ? 3 : 2} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'gradient-text' : ''}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col h-full w-full max-md overflow-hidden bg-iosBg dark:bg-iosDarkBg font-sans text-appText dark:text-slate-100">
      
      {/* Header */}
      <header className="flex-none w-full gradient-primary shadow-xl shadow-primary/30">
        <div className="safe-area-pt" />
        <div className="flex justify-between items-center h-24 px-6">
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
            {activeTab === 'converter' ? 'Convertisseur' : 'Mes Favoris'}
          </h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-white/20 rounded-full text-white backdrop-blur-md active:opacity-50 transition-all flex items-center justify-center"
              aria-label="Changer de thème"
            >
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>

            {activeTab === 'favorites' && favorites.length > 0 && (
              <button 
                onClick={() => setIsEditingFavorites(!isEditingFavorites)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-full px-5 py-2.5 backdrop-blur-md transition-all active:scale-95"
              >
                {isEditingFavorites ? 'Terminé' : 'Modifier'}
              </button>
            )}
            {activeTab === 'converter' && (
              <button 
                onClick={() => loadRates(fromCurrency)}
                className="p-3 bg-white/20 rounded-full text-white backdrop-blur-md active:opacity-50 transition-opacity flex items-center justify-center"
                aria-label="Rafraîchir"
              >
                <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-6 scroll-smooth">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {activeTab === 'converter' ? (
          <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-top-4">
            {/* Input Card */}
            <div className="bg-white dark:bg-iosDarkCard rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-black uppercase tracking-widest ml-1 text-primary/80 dark:text-indigo-200">
                    Montant à convertir
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount.replace('.', ',')}
                    onChange={handleAmountChange}
                    className="w-full text-4xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 text-appText dark:text-white"
                    placeholder="0,00"
                  />
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-700" />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1 min-w-0">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">De</label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg py-2.5 px-2 text-base font-bold border-none outline-none appearance-none text-appText dark:text-white truncate"
                    >
                      {SUPPORTED_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code} className="dark:bg-iosDarkCard">{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={swapCurrencies}
                    className="p-3.5 gradient-primary rounded-full text-white shadow-lg shadow-primary/30 active:scale-90 transition-transform mt-5 flex-shrink-0"
                  >
                    <ArrowLeftRight size={20} />
                  </button>

                  <div className="flex-1 space-y-1 text-right min-w-0">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-1">À</label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg py-2.5 px-2 text-base font-bold border-none outline-none appearance-none text-right text-appText dark:text-white truncate"
                    >
                      {SUPPORTED_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code} className="dark:bg-iosDarkCard">{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="gradient-primary text-white rounded-2xl p-7 shadow-2xl shadow-primary/30 relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Résultat Conversion</p>
                  <h2 
                    style={{ fontSize: dynamicResultFontSize }}
                    className="font-black drop-shadow-md leading-tight transition-all duration-300 whitespace-nowrap overflow-visible"
                  >
                    {convertedAmount} <span className="text-xl font-bold opacity-70 tracking-tight">{toCurrency}</span>
                  </h2>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase">
                    1 {fromCurrency} = {rates?.rates[toCurrency]?.toFixed(4) || '...'} {toCurrency}
                  </div>
                </div>
                <button 
                  onClick={toggleFavorite}
                  className={`p-2.5 rounded-full backdrop-blur-lg transition-all ml-2 flex-shrink-0 active:scale-90 ${
                    isFavorite ? 'bg-white text-primary shadow-xl scale-110' : 'bg-white/20 text-white'
                  }`}
                >
                  <Star size={22} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
                </button>
              </div>
              <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
              <History size={14} />
              <span>Mis à jour : {lastUpdated || 'Initialisation...'}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {favorites.length === 0 ? (
              <div className="text-center py-20 space-y-6">
                <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-primary/30 opacity-30">
                  <Star size={48} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 font-black uppercase tracking-widest">Aucun favori enregistré</p>
                  <p className="text-slate-400/60 text-xs px-12 text-center">Ajoutez des paires de devises pour les suivre rapidement ici.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('converter')}
                  className="px-8 py-3 gradient-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                  Ajouter maintenant
                </button>
              </div>
            ) : (
              favorites.map(fav => (
                <FavoriteItem 
                  key={fav.id} 
                  fav={fav} 
                  isEditing={isEditingFavorites}
                  onRemove={removeFavorite}
                  onSelect={handleSelectFavorite}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <nav className="flex-none w-full bg-white/90 dark:bg-iosDarkCard/90 backdrop-blur-2xl border-t dark:border-slate-800 px-8 pt-3 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.08)] safe-area-pb">
        <div className="flex justify-around h-16 items-center">
          <TabButton id="converter" icon={RefreshCw} label="Convertir" />
          <TabButton id="favorites" icon={Star} label="Favoris" />
        </div>
      </nav>
    </div>
  );
};

interface FavoriteItemProps {
  fav: FavoritePair;
  isEditing: boolean;
  onRemove: (id: string) => void;
  onSelect: (from: string, to: string) => void;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({ fav, isEditing, onRemove, onSelect }) => {
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadFavRate = async () => {
      try {
        const data = await fetchLatestRates(fav.from);
        if (isMounted) setRate(data.rates[fav.to]);
      } catch (e) {
        console.error("Couldn't fetch favorite rate");
      }
    };
    loadFavRate();
    return () => { isMounted = false; };
  }, [fav.from, fav.to]);

  return (
    <div 
      onClick={() => onSelect(fav.from, fav.to)}
      className={`bg-white dark:bg-iosDarkCard rounded-xl flex items-center shadow-sm transition-all duration-300 border border-slate-100 dark:border-slate-800/50 ${
        isEditing ? 'pl-2' : 'pl-4'
      } pr-4 py-4 active:scale-[0.98] ${
        !isEditing ? 'cursor-pointer hover:border-primary/30 active:bg-slate-50 dark:active:bg-slate-900/50' : 'cursor-default'
      }`}
    >
      <div className={`transition-all duration-300 flex items-center justify-center overflow-hidden ${isEditing ? 'w-14 opacity-100' : 'w-0 opacity-0'}`}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(fav.id);
          }}
          className="text-red-500 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg active:scale-90 transition-transform mr-2"
          aria-label="Supprimer"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 gradient-primary text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-primary/10 uppercase tracking-tighter">
            {fav.from.substring(0, 3)}
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight tracking-tight text-appText dark:text-white uppercase">{fav.from} → {fav.to}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {rate ? `1 ${fav.from} = ${rate.toFixed(4)} ${fav.to}` : 'Chargement...'}
            </p>
          </div>
        </div>
        {!isEditing && <ChevronRight size={20} className="text-primary dark:text-white" strokeWidth={3} />}
      </div>
    </div>
  );
};

export default App;