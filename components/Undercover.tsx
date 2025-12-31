import React, { useState, useEffect } from 'react';
import { Player, UndercoverWordPair } from '../types';
import { PlayerManager } from './PlayerManager';
import { generateUndercoverWords } from '../services/geminiService';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loader2, Eye, EyeOff, RefreshCw, VenetianMask } from 'lucide-react';

interface UndercoverProps {
  players: Player[];
  setPlayers: (p: Player[]) => void;
}

type GamePhase = 'SETUP' | 'LOADING' | 'REVEAL' | 'PLAYING';

interface GameState {
  // Ordered list of assignments determining who picks up the phone 1st, 2nd, etc.
  turnOrder: { playerId: string; word: string; role: 'Civilian' | 'Undercover' }[];
  currentRevealerIndex: number;
  isRevealing: boolean; // true if the card is flipped to show word
}

// Robust Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const Undercover: React.FC<UndercoverProps> = ({ players, setPlayers }) => {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [category, setCategory] = useState('Général');
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [words, setWords] = useState<UndercoverWordPair | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    turnOrder: [],
    currentRevealerIndex: 0,
    isRevealing: false,
  });

  const MIN_PLAYERS = 3;

  // Reset numUndercovers if it becomes invalid regarding player count
  useEffect(() => {
    const maxPossible = Math.max(1, players.length - 2);
    if (numUndercovers > maxPossible) {
        setNumUndercovers(1);
    }
  }, [players.length, numUndercovers]);

  const startGame = async () => {
    try {
      setPhase('LOADING');
      const pair = await generateUndercoverWords(category);
      
      // On vérifie que la paire existe pour éviter de crasher la suite
      if (!pair) throw new Error("Aucun mot n'a été généré");

      setWords(pair);
      
      const safeNumUndercovers = Math.min(numUndercovers, Math.max(1, players.length - 2));
      const numCivilians = players.length - safeNumUndercovers;

      const rolesList = [
          ...Array(safeNumUndercovers).fill({ role: 'Undercover', word: pair.undercover }),
          ...Array(numCivilians).fill({ role: 'Civilian', word: pair.civilian })
      ];
      
      const shuffledRoles = shuffleArray(shuffleArray(rolesList));
      const shuffledPlayers = shuffleArray([...players]);

      const assignments = shuffledPlayers.map((player, index) => ({
        playerId: player.id,
        role: shuffledRoles[index].role as 'Civilian' | 'Undercover',
        word: shuffledRoles[index].word as string
      }));

      setGameState({
        turnOrder: assignments,
        currentRevealerIndex: 0,
        isRevealing: false
      });
      
      setShowResults(false);
      setPhase('REVEAL'); // Transition vers le jeu

    } catch (error) {
      console.error("Erreur lors du lancement de la partie:", error);
      alert("Erreur de connexion avec l'IA. Retour au menu.");
      setPhase('SETUP'); // On renvoie l'utilisateur au début au lieu de le laisser bloqué
    }
  };

  const handleNextReveal = () => {
    if (gameState.isRevealing) {
      // User clicked "Cacher et Suivant"
      if (gameState.currentRevealerIndex < players.length - 1) {
        setGameState(prev => ({ 
          ...prev, 
          currentRevealerIndex: prev.currentRevealerIndex + 1,
          isRevealing: false
        }));
      } else {
        setPhase('PLAYING');
      }
    } else {
      // User clicked "Révéler"
      setGameState(prev => ({ ...prev, isRevealing: true }));
    }
  };

  const handleReset = () => {
    setPhase('SETUP');
    setWords(null);
    setShowResults(false);
  };

  if (phase === 'SETUP') {
    const maxUndercovers = Math.max(1, players.length - 2);
    
    return (
      <div className="w-full pb-32 pt-6">
        <PlayerManager 
          players={players} 
          setPlayers={setPlayers} 
          minPlayers={MIN_PLAYERS} 
          onStart={startGame} 
          gameName="Undercover"
        />
        
        <div className="mt-2 px-6 max-w-md mx-auto grid grid-cols-3 gap-3">
             <div className="col-span-2">
                <label className="text-sm font-medium text-slate-500 ml-1">Catégorie</label>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                >
                    <option value="Général">Général</option>
                    <option value="Nourriture">Nourriture</option>
                    <option value="Animaux">Animaux</option>
                    <option value="Lieux">Lieux</option>
                    <option value="Célébrités">Célébrités</option>
                    <option value="Objets">Objets</option>
                    <option value="Adultes (18+)">Adultes (18+)</option>
                </select>
             </div>

             <div className="col-span-1">
                <label className="text-sm font-medium text-slate-500 ml-1">Imposteurs</label>
                <select 
                    value={numUndercovers}
                    onChange={(e) => setNumUndercovers(Number(e.target.value))}
                    className="w-full mt-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                >
                    {Array.from({ length: maxUndercovers }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
             </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4 px-6">
            L'Undercover est attribué aléatoirement. L'ordre de passage est également mélangé.
        </p>
      </div>
    );
  }

  if (phase === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-ios-blue mb-4" size={48} />
        <p className="text-lg font-medium">Génération de mots...</p>
      </div>
    );
  }

  if (phase === 'REVEAL') {
    const currentTurn = gameState.turnOrder[gameState.currentRevealerIndex];
    const currentPlayer = players.find(p => p.id === currentTurn.playerId);

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 animate-fade-in pb-8 pt-5">
        <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold uppercase tracking-wide text-slate-500">
                Tour {gameState.currentRevealerIndex + 1} / {players.length}
            </span>
            <h2 className="text-4xl font-bold mt-4">{currentPlayer?.name}</h2>
            <p className="text-slate-500 mt-2">
                {gameState.isRevealing ? "Mémorisez votre mot secret" : "Passez le téléphone à ce joueur"}
            </p>
        </div>

        <Card 
            className={`w-full max-w-sm aspect-[4/5] flex flex-col items-center justify-center mb-8 transition-all duration-500 transform ${gameState.isRevealing ? 'rotate-y-0 bg-white dark:bg-slate-900' : 'bg-ios-blue dark:bg-blue-900'}`}
            onClick={() => !gameState.isRevealing && setGameState(prev => ({ ...prev, isRevealing: true }))}
            interactive={!gameState.isRevealing}
        >
            {gameState.isRevealing ? (
                <div className="text-center animate-fade-in">
                    <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">Votre mot</p>
                    <h3 className="text-5xl font-black text-slate-900 dark:text-white break-words">
                        {currentTurn.word}
                    </h3>
                </div>
            ) : (
                <div className="text-center text-white/80">
                    <Eye size={48} className="mx-auto mb-4" />
                    <p className="font-bold text-xl">Appuyez pour révéler</p>
                </div>
            )}
        </Card>

        <Button 
            size="lg" 
            fullWidth 
            className="max-w-sm"
            onClick={handleNextReveal}
        >
            {gameState.isRevealing ? (gameState.currentRevealerIndex === players.length - 1 ? "Commencer la partie" : "Cacher et Suivant") : "Révéler"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 pt-4 animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">{showResults ? "Résultats" : "En jeu !"}</h2>
            <p className="text-slate-500">
              {showResults ? "Voici les identités de chacun." : "Débattez et éliminez les intrus."}
            </p>
        </div>

        {showResults ? (
           <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in">
               <Card className="flex flex-col items-center justify-center p-4 border-slate-200 dark:border-slate-700">
                   <span className="text-xs uppercase text-slate-400 mb-1">Mot Civil</span>
                   <span className="text-xl font-bold text-center">{words?.civilian}</span>
               </Card>
               <Card className="flex flex-col items-center justify-center p-4 border-purple-500/50 bg-purple-500/10">
                   <span className="text-xs uppercase text-purple-400 mb-1">Mot Undercover</span>
                   <span className="text-xl font-bold text-center text-purple-600 dark:text-purple-300">{words?.undercover}</span>
               </Card>
           </div>
        ) : (
            <Card className="mb-8 p-6 flex flex-col items-center justify-center text-center bg-slate-100 dark:bg-slate-800 border-none">
                <VenetianMask className="text-slate-400 mb-2" size={32} />
                <p className="text-slate-500 text-sm">Les mots sont secrets.</p>
            </Card>
        )}

        <Card className="flex-1 mb-24 overflow-hidden flex flex-col">
            <h3 className="font-bold mb-4 text-lg px-2">Joueurs</h3>
            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[40vh] pr-2">
                {players.map(p => {
                    const assignment = gameState.turnOrder.find(a => a.playerId === p.id);
                    const isUndercover = assignment?.role === 'Undercover';
                    
                    return (
                        <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${showResults && isUndercover ? 'bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${showResults && isUndercover ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    {p.name.charAt(0)}
                                </div>
                                <span className={showResults && isUndercover ? 'font-bold text-purple-700 dark:text-purple-300' : ''}>
                                    {p.name}
                                </span>
                            </div>
                            {showResults && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isUndercover ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                    {isUndercover ? 'Undercover' : 'Civil'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>

        <div className="fixed bottom-8 left-0 right-0 px-6 max-w-md mx-auto space-y-3">
            {!showResults ? (
                <Button onClick={() => setShowResults(true)} variant="primary" fullWidth size="lg" className="bg-purple-600 hover:bg-purple-700 shadow-purple-500/20">
                    <VenetianMask className="mr-2" size={20}/>
                    Révéler les identités
                </Button>
            ) : (
                <Button onClick={handleReset} variant="secondary" fullWidth size="lg">
                    <RefreshCw className="mr-2" size={20}/>
                    Nouvelle Partie
                </Button>
            )}
        </div>
    </div>
  );
};