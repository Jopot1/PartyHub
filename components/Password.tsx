import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Timer, Trophy, Play, Settings, RefreshCw, KeyRound, EyeOff, CheckCircle2, StopCircle, Loader2 } from 'lucide-react';
import { PASSWORD_WORDS, PASSWORD_CATEGORIES } from '../data/passwordWords';
import { generatePasswordWords } from '../services/geminiService';

// Sound effect simulation (visual only for now, but good to have logic ready)
const playFeedback = (type: 'success' | 'pass' | 'tick') => {
  // Placeholder for audio implementation
};

type GamePhase = 'SETUP' | 'LOADING' | 'INTERSTITIAL' | 'PLAYING' | 'FINISHED';

export const Password: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [selectedCategory, setSelectedCategory] = useState<string>(PASSWORD_CATEGORIES.MIX);
  const [gameDuration, setGameDuration] = useState(120);
  
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [wordsQueue, setWordsQueue] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Shuffle logic
  const shuffle = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const initGame = async () => {
    setPhase('LOADING');

    // 1. Calculate how many words we likely need
    // A fast team might do 1 word every 3 seconds.
    // Buffer added to be safe.
    const estimatedWordsNeeded = Math.ceil(gameDuration / 2) + 15;
    
    let words: string[] = [];

    // 2. Decide Source: Static vs AI
    // For ADULT category, we force STATIC list to avoid AI safety refusals or weirdness.
    // For others, we try AI first, then fallback.
    if (selectedCategory === PASSWORD_CATEGORIES.ADULT) {
        const baseList = PASSWORD_WORDS[PASSWORD_CATEGORIES.ADULT];
        words = shuffle([...baseList]);
    } else {
        try {
            // Try generating words
            const aiWords = await generatePasswordWords(selectedCategory, estimatedWordsNeeded);
            if (aiWords && aiWords.length >= 10) {
                words = shuffle(aiWords);
            } else {
                throw new Error("Not enough words generated");
            }
        } catch (e) {
            console.log("Fallback to static list");
            const baseList = PASSWORD_WORDS[selectedCategory] || PASSWORD_WORDS[PASSWORD_CATEGORIES.MIX];
            words = shuffle([...baseList]);
        }
    }

    // Ensure we have enough words even if AI returned few, by padding with fallback
    if (words.length < estimatedWordsNeeded) {
         const fallback = PASSWORD_WORDS[PASSWORD_CATEGORIES.MIX];
         const extraNeeded = estimatedWordsNeeded - words.length;
         const extras = shuffle([...fallback]).slice(0, extraNeeded);
         words = [...words, ...extras];
    }

    setWordsQueue(words);
    setCurrentWordIndex(0);
    setScore(0);
    setTimer(gameDuration);
    setPhase('INTERSTITIAL');
  };

  const startRound = () => {
    setPhase('PLAYING');
  };

  const handleScore = (points: number) => {
    setScore(prev => prev + points);
    
    // Trigger animation
    setScoreAnimation(true);
    setTimeout(() => setScoreAnimation(false), 300);

    playFeedback(points > 0 ? 'success' : 'pass');
    
    // Move to next word immediately
    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < wordsQueue.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
    } else {
        // Ran out of words (unlikely with dynamic generation but possible)
        setPhase('FINISHED');
    }
  };

  // Timer Effect
  useEffect(() => {
    if (phase === 'PLAYING' && timer > 0) {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0 && phase === 'PLAYING') {
      setPhase('FINISHED');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- VIEWS ---

  if (phase === 'SETUP') {
    return (
      <div className="flex flex-col h-full px-6 pt-6 animate-fade-in pb-20">
        <div className="text-center mb-8">
            <h2 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">Mot de Passe</h2>
        </div>

        <div className="space-y-6">
            <Card className="p-4">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Catégorie
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {Object.values(PASSWORD_CATEGORIES).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-3 rounded-xl text-left font-medium transition-all ${
                                selectedCategory === cat 
                                ? 'bg-ios-blue text-white shadow-lg shadow-blue-500/30' 
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </Card>

            <Card className="p-4">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Durée
                </label>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Minutes</label>
                        <select 
                            value={Math.floor(gameDuration / 60)}
                            onChange={(e) => {
                                const m = parseInt(e.target.value);
                                const s = gameDuration % 60;
                                setGameDuration(m * 60 + s);
                            }}
                            className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-ios-blue"
                        >
                            {[0, 1, 2, 3, 4, 5].map(m => (
                                <option key={m} value={m}>{m} min</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Secondes</label>
                        <select 
                            value={gameDuration % 60}
                            onChange={(e) => {
                                const s = parseInt(e.target.value);
                                const m = Math.floor(gameDuration / 60);
                                setGameDuration(m * 60 + s);
                            }}
                            className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-ios-blue"
                        >
                            {[0, 15, 30, 45].map(s => (
                                <option key={s} value={s}>{s} s</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            <Button size="lg" fullWidth onClick={initGame} disabled={gameDuration < 15}>
                <Play className="mr-2" size={20} />
                Lancer ({formatTime(gameDuration)})
            </Button>
        </div>
      </div>
    );
  }

  if (phase === 'LOADING') {
      return (
        <div className="flex flex-col h-full items-center justify-center px-6 animate-fade-in">
            <Loader2 className="animate-spin text-ios-blue mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Génération des mots...</h3>
            <p className="text-slate-500 text-center">
                L'IA prépare une liste unique pour "{selectedCategory}"...
            </p>
        </div>
      );
  }

  if (phase === 'INTERSTITIAL') {
    return (
        <div 
            className="flex flex-col h-full items-center justify-center px-6 animate-fade-in cursor-pointer bg-slate-900 absolute inset-0 z-50"
            onClick={startRound}
        >
            <div className="text-center text-white">
                <EyeOff size={64} className="mx-auto mb-6 text-slate-500" />
                <h2 className="text-3xl font-bold mb-4">Écran de Sécurité</h2>
                <p className="text-slate-400 text-lg mb-8">
                    Passez le téléphone au donneur d'indices.
                </p>
                <div className="animate-bounce">
                    <span className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/20 font-bold backdrop-blur-md">
                        Appuyez pour commencer
                    </span>
                </div>
            </div>
            
            <div className="absolute top-6 right-6">
                <div className="flex items-center gap-2 text-slate-500">
                    <Timer size={18} />
                    <span className="font-mono text-xl">{formatTime(timer)}</span>
                </div>
            </div>
        </div>
    );
  }

  if (phase === 'PLAYING') {
    return (
        <div className="flex flex-col h-full px-4 pt-4 pb-4 animate-fade-in relative max-h-screen overflow-hidden">
            {/* Header: Score & Timer */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full transition-transform ${scoreAnimation ? 'scale-110 text-green-500' : ''}`}>
                    <Trophy size={20} className="text-amber-500" />
                    <span className="font-black text-2xl">{score}</span>
                </div>

                <button 
                    onClick={() => setPhase('FINISHED')}
                    className="p-3 rounded-full bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors shadow-sm"
                    aria-label="Arrêter la partie"
                >
                    <StopCircle size={24} />
                </button>

                <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full ${timer <= 10 ? 'text-red-500 animate-pulse border border-red-500' : ''}`}>
                    <Timer size={20} />
                    <span className="font-mono font-bold text-2xl">{formatTime(timer)}</span>
                </div>
            </div>

            {/* The Word */}
            <Card className="flex-1 flex flex-col items-center justify-center mb-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-2xl">
                <span className="text-xs uppercase tracking-widest text-slate-400 mb-4">Faire deviner</span>
                <h1 className="text-4xl md:text-6xl font-black text-center text-slate-900 dark:text-white leading-tight break-words px-4">
                    {wordsQueue[currentWordIndex]}
                </h1>
                <div className="flex gap-1 mt-6">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                </div>
            </Card>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3 h-1/3 min-h-[180px]">
                <button 
                    onClick={() => handleScore(3)}
                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 transition-all"
                >
                    <span className="text-3xl font-black">+3</span>
                    <span className="text-xs font-bold uppercase opacity-80">1er Indice</span>
                </button>

                <button 
                    onClick={() => handleScore(2)}
                    className="bg-lime-500 hover:bg-lime-600 active:scale-95 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-lime-500/20 transition-all"
                >
                    <span className="text-3xl font-black">+2</span>
                    <span className="text-xs font-bold uppercase opacity-80">2ème Indice</span>
                </button>

                <button 
                    onClick={() => handleScore(1)}
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-amber-500/20 transition-all"
                >
                    <span className="text-3xl font-black">+1</span>
                    <span className="text-xs font-bold uppercase opacity-80">3ème Indice</span>
                </button>

                <button 
                    onClick={() => handleScore(0)}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-600 dark:text-slate-300 rounded-2xl flex flex-col items-center justify-center shadow-sm transition-all"
                >
                    <span className="text-3xl font-black">0</span>
                    <span className="text-xs font-bold uppercase opacity-80">Passer</span>
                </button>
            </div>
        </div>
    );
  }

  // FINISHED PHASE
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 animate-fade-in text-center">
        <div className="mb-8 relative">
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full"></div>
            <Trophy size={80} className="text-yellow-500 relative z-10 mx-auto" />
        </div>

        <h2 className="text-5xl font-black mb-2">{score} <span className="text-2xl font-bold text-slate-400">pts</span></h2>
        <p className="text-lg text-slate-500 font-medium mb-12">Score Final</p>

        <div className="w-full max-w-sm space-y-4">
            <Button size="lg" fullWidth onClick={initGame}>
                <RefreshCw className="mr-2" size={20} />
                Rejouer
            </Button>
            
            <Button variant="secondary" fullWidth onClick={() => setPhase('SETUP')}>
                <Settings className="mr-2" size={20} />
                Changer les réglages
            </Button>
        </div>
    </div>
  );
};